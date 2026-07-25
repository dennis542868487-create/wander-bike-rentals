import "server-only";

import { XMLBuilder, XMLParser } from "fast-xml-parser";
import { requireServerEnvironment } from "@/lib/env";
import { CommerceError } from "@/lib/commerce/errors";
import type { CanadaPostPackage } from "@/lib/commerce/cart-server";
import { normalizeCanadianPostalCode } from "@/lib/commerce/schemas";

type UnknownRecord = Record<string, unknown>;

export type CanadaPostRate = {
  serviceCode: string;
  serviceName: string;
  amountCents: number;
  estimatedTransitDays: number | null;
  expectedDeliveryDate: string | null;
};

export type CanadaPostRateResult = {
  rates: CanadaPostRate[];
  providerResponse: UnknownRecord;
};

export type CanadaPostShipmentAddress = {
  name: string;
  company?: string;
  phone?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  province: string;
  postalCode: string;
  country: "CA";
};

export type CanadaPostSenderAddress = {
  company: string;
  contact: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  province: string;
  postalCode: string;
  country: "CA";
};

export type CanadaPostParcel = Pick<
  CanadaPostPackage,
  "weightKg" | "lengthCm" | "widthCm" | "heightCm"
>;

export type CanadaPostLink = {
  rel: string;
  href: string;
  mediaType: string;
};

export type CanadaPostShipmentResult = {
  shipmentId: string;
  trackingPin: string;
  serviceName: string;
  selfLink: CanadaPostLink | null;
  labelLink: CanadaPostLink;
  priceLink: CanadaPostLink | null;
  refundLink: CanadaPostLink | null;
  providerResponse: UnknownRecord;
};

export type CanadaPostCancellationResult =
  | { status: "voided"; serviceTicketId: null }
  | { status: "refund_pending"; serviceTicketId: string };

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" ? (value as UnknownRecord) : {};
}

function asArray(value: unknown) {
  return value == null ? [] : Array.isArray(value) ? value : [value];
}

function textValue(value: unknown) {
  return value == null ? "" : String(value);
}

function dollarsToCents(value: unknown) {
  const amount = Number.parseFloat(textValue(value));
  if (!Number.isFinite(amount) || amount < 0) {
    throw new CommerceError(
      "Canada Post returned an invalid shipping amount.",
      "CANADA_POST_INVALID_RESPONSE",
      502,
    );
  }
  return Math.round(amount * 100);
}

function providerMessages(parsed: UnknownRecord) {
  const root = asRecord(parsed.messages);
  return asArray(root.message)
    .map((message) => asRecord(message))
    .map((message) => textValue(message.description))
    .filter(Boolean)
    .join(" ");
}

function providerMessageCodes(parsed: UnknownRecord) {
  const root = asRecord(parsed.messages);
  return asArray(root.message)
    .map((message) => asRecord(message))
    .map((message) => textValue(message.code))
    .filter(Boolean);
}

function canadaPostAuthorization(username: string, password: string) {
  return Buffer.from(`${username}:${password}`).toString("base64");
}

function parseCanadaPostResponse(responseText: string) {
  return asRecord(
    new XMLParser({
      ignoreAttributes: false,
      removeNSPrefix: true,
      parseTagValue: false,
      trimValues: true,
    }).parse(responseText),
  );
}

function assertSandboxProviderUrl(rawUrl: string, baseUrl: string) {
  let url: URL;
  let base: URL;
  try {
    url = new URL(rawUrl);
    base = new URL(baseUrl);
  } catch {
    throw new CommerceError(
      "Canada Post returned an invalid resource link.",
      "CANADA_POST_INVALID_RESPONSE",
      502,
    );
  }

  if (url.protocol !== "https:" || url.hostname !== base.hostname) {
    throw new CommerceError(
      "Canada Post returned an unexpected resource host.",
      "CANADA_POST_INVALID_RESPONSE",
      502,
    );
  }
  return url.toString();
}

function responseLinks(root: UnknownRecord, baseUrl: string): CanadaPostLink[] {
  const links = asRecord(root.links);
  return asArray(links.link)
    .map((value) => asRecord(value))
    .map((link) => ({
      rel: textValue(link["@_rel"]),
      href: textValue(link["@_href"]),
      mediaType: textValue(link["@_media-type"]),
    }))
    .filter((link) => link.rel && link.href && link.mediaType)
    .map((link) => ({
      ...link,
      href: assertSandboxProviderUrl(link.href, baseUrl),
    }));
}

function optionalElement(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function assertCanadaPostField(
  value: string | undefined,
  maximum: number,
  label: string,
) {
  if ((value?.trim().length ?? 0) > maximum) {
    throw new CommerceError(
      `${label} is too long for a Canada Post label.`,
      "CANADA_POST_ADDRESS_INVALID",
      422,
    );
  }
}

function shipmentDeliverySpec(input: {
  serviceCode: string;
  orderNumber: string;
  sender: CanadaPostSenderAddress;
  destination: CanadaPostShipmentAddress;
  package: CanadaPostParcel;
  contract: boolean;
  environment: ReturnType<typeof requireServerEnvironment>;
}) {
  assertCanadaPostField(input.sender.company, 44, "Sender company");
  assertCanadaPostField(input.sender.contact, 44, "Sender contact");
  assertCanadaPostField(input.sender.phone, 25, "Sender phone");
  assertCanadaPostField(input.sender.addressLine1, 44, "Sender address line 1");
  assertCanadaPostField(input.sender.addressLine2, 44, "Sender address line 2");
  assertCanadaPostField(input.sender.city, 40, "Sender city");
  assertCanadaPostField(input.destination.name, 44, "Recipient name");
  assertCanadaPostField(input.destination.company, 44, "Recipient company");
  assertCanadaPostField(input.destination.phone, 25, "Recipient phone");
  assertCanadaPostField(
    input.destination.addressLine1,
    44,
    "Recipient address line 1",
  );
  assertCanadaPostField(
    input.destination.addressLine2,
    44,
    "Recipient address line 2",
  );
  assertCanadaPostField(input.destination.city, 40, "Recipient city");

  const senderAddress: UnknownRecord = {
    "address-line-1": input.sender.addressLine1,
  };
  const senderLine2 = optionalElement(input.sender.addressLine2);
  if (senderLine2) senderAddress["address-line-2"] = senderLine2;
  senderAddress.city = input.sender.city;
  senderAddress["prov-state"] = input.sender.province;
  senderAddress["country-code"] = input.sender.country;
  senderAddress["postal-zip-code"] = normalizeCanadianPostalCode(
    input.sender.postalCode,
  );

  const destinationAddress: UnknownRecord = {
    "address-line-1": input.destination.addressLine1,
  };
  const destinationLine2 = optionalElement(input.destination.addressLine2);
  if (destinationLine2) {
    destinationAddress["address-line-2"] = destinationLine2;
  }
  destinationAddress.city = input.destination.city;
  destinationAddress["prov-state"] = input.destination.province;
  destinationAddress["country-code"] = input.destination.country;
  destinationAddress["postal-zip-code"] = normalizeCanadianPostalCode(
    input.destination.postalCode,
  );

  const destination: UnknownRecord = {
    name: input.destination.name,
  };
  const destinationCompany = optionalElement(input.destination.company);
  const destinationPhone = optionalElement(input.destination.phone);
  if (destinationCompany) destination.company = destinationCompany;
  if (destinationPhone) destination["client-voice-number"] = destinationPhone;
  destination["address-details"] = destinationAddress;

  const deliverySpec: UnknownRecord = {
    "service-code": input.serviceCode,
    sender: {
      name: input.sender.contact,
      company: input.sender.company,
      "contact-phone": input.sender.phone,
      "address-details": senderAddress,
    },
    destination,
    "parcel-characteristics": {
      weight: input.package.weightKg.toFixed(3),
      dimensions: {
        length: input.package.lengthCm.toFixed(1),
        width: input.package.widthCm.toFixed(1),
        height: input.package.heightCm.toFixed(1),
      },
    },
  };

  if (input.contract) {
    deliverySpec["print-preferences"] = {
      "output-format": "8.5x11",
      encoding: "PDF",
    };
  }

  deliverySpec.preferences = {
    "show-packing-instructions": false,
  };
  deliverySpec.references = {
    "customer-ref-1": input.orderNumber.slice(0, 35),
  };

  if (input.contract) {
    deliverySpec["settlement-info"] = {
      "contract-id": input.environment.CANADA_POST_CONTRACT_ID,
      "intended-method-of-payment": "Account",
    };
  }

  return deliverySpec;
}

export async function createCanadaPostShipment(input: {
  orderNumber: string;
  customerRequestId: string;
  serviceCode: string;
  serviceName: string;
  sender: CanadaPostSenderAddress;
  destination: CanadaPostShipmentAddress;
  package: CanadaPostParcel;
}): Promise<CanadaPostShipmentResult> {
  const environment = requireServerEnvironment(
    "CANADA_POST_USERNAME",
    "CANADA_POST_PASSWORD",
    "CANADA_POST_CUSTOMER_NUMBER",
  );

  if (!environment.COMMERCE_SANDBOX_MODE) {
    throw new CommerceError(
      "Production Canada Post labels are disabled.",
      "LIVE_SHIPPING_DISABLED",
      503,
    );
  }
  if (!environment.CANADA_POST_ACCOUNT_TYPE) {
    throw new CommerceError(
      "Canada Post account type has not been configured.",
      "CANADA_POST_ACCOUNT_TYPE_REQUIRED",
      503,
    );
  }
  if (!input.serviceCode.startsWith("DOM.")) {
    throw new CommerceError(
      "Only domestic Canada Post labels are enabled.",
      "CANADA_POST_DOMESTIC_ONLY",
      422,
    );
  }

  const contract = environment.CANADA_POST_ACCOUNT_TYPE === "contract";
  if (contract && (!environment.CANADA_POST_CONTRACT_ID || !environment.CANADA_POST_GROUP_ID)) {
    throw new CommerceError(
      "Canada Post contract ID and shipment group ID are required.",
      "CANADA_POST_CONTRACT_CONFIGURATION_REQUIRED",
      503,
    );
  }

  const deliverySpec = shipmentDeliverySpec({
    ...input,
    contract,
    environment,
  });
  const customerNumber = environment.CANADA_POST_CUSTOMER_NUMBER;
  const mediaType = contract
    ? "application/vnd.cpc.shipment-v8+xml"
    : "application/vnd.cpc.ncshipment-v4+xml";
  const rootName = contract ? "shipment" : "non-contract-shipment";
  const root: UnknownRecord = {
    "@_xmlns": contract
      ? "http://www.canadapost.ca/ws/shipment-v8"
      : "http://www.canadapost.ca/ws/ncshipment-v4",
  };

  if (contract) {
    root["customer-request-id"] = input.customerRequestId.slice(0, 35);
    root["group-id"] = environment.CANADA_POST_GROUP_ID;
  }
  root["requested-shipping-point"] =
    normalizeCanadianPostalCode(input.sender.postalCode);
  root["delivery-spec"] = deliverySpec;

  const xml = new XMLBuilder({
    ignoreAttributes: false,
    format: false,
    suppressEmptyNode: true,
  }).build({ [rootName]: root });
  const mailedOnBehalfOf =
    environment.CANADA_POST_MOBO_CUSTOMER_NUMBER ?? customerNumber;
  const endpointPath = contract
    ? `/rs/${encodeURIComponent(customerNumber)}/${encodeURIComponent(
        mailedOnBehalfOf,
      )}/shipment`
    : `/rs/${encodeURIComponent(customerNumber)}/ncshipment`;
  const endpoint = new URL(endpointPath, environment.CANADA_POST_API_BASE).toString();

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Accept: mediaType,
        "Content-Type": mediaType,
        "Accept-Language": "en-CA",
        Authorization: `Basic ${canadaPostAuthorization(
          environment.CANADA_POST_USERNAME,
          environment.CANADA_POST_PASSWORD,
        )}`,
        "User-Agent": "WanderBikeCommerce/1.0",
      },
      body: xml,
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
  } catch {
    throw new CommerceError(
      "Canada Post did not confirm whether the label was created. Do not retry with a new request ID.",
      "CANADA_POST_SHIPMENT_UNCERTAIN",
      503,
    );
  }

  const responseText = await response.text();
  const parsed = parseCanadaPostResponse(responseText);
  const message = providerMessages(parsed);
  const responseRoot = asRecord(
    parsed[contract ? "shipment-info" : "non-contract-shipment-info"],
  );
  const shipmentId = textValue(responseRoot["shipment-id"]);
  const trackingPin = textValue(responseRoot["tracking-pin"]);

  if (!response.ok || message || !shipmentId) {
    throw new CommerceError(
      message || "Canada Post rejected the shipment request.",
      "CANADA_POST_SHIPMENT_REJECTED",
      response.status >= 500 ? 503 : 422,
    );
  }

  const links = responseLinks(responseRoot, environment.CANADA_POST_API_BASE);
  const labelLink = links.find((link) => link.rel === "label");
  if (!labelLink || labelLink.mediaType !== "application/pdf") {
    throw new CommerceError(
      "Canada Post did not return a PDF label link.",
      "CANADA_POST_INVALID_RESPONSE",
      502,
    );
  }

  return {
    shipmentId,
    trackingPin,
    serviceName: input.serviceName,
    selfLink: links.find((link) => link.rel === "self") ?? null,
    labelLink,
    priceLink:
      links.find((link) => link.rel === (contract ? "price" : "receipt")) ?? null,
    refundLink: links.find((link) => link.rel === "refund") ?? null,
    providerResponse: parsed,
  };
}

async function fetchCanadaPostResource(link: CanadaPostLink) {
  const environment = requireServerEnvironment(
    "CANADA_POST_USERNAME",
    "CANADA_POST_PASSWORD",
  );
  const href = assertSandboxProviderUrl(
    link.href,
    environment.CANADA_POST_API_BASE,
  );

  return fetch(href, {
    headers: {
      Accept: link.mediaType,
      "Accept-Language": "en-CA",
      Authorization: `Basic ${canadaPostAuthorization(
        environment.CANADA_POST_USERNAME,
        environment.CANADA_POST_PASSWORD,
      )}`,
      "User-Agent": "WanderBikeCommerce/1.0",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
}

export async function getCanadaPostLabelArtifact(link: CanadaPostLink) {
  let response: Response;
  try {
    response = await fetchCanadaPostResource(link);
  } catch {
    throw new CommerceError(
      "The Canada Post label exists, but its PDF could not be downloaded.",
      "CANADA_POST_LABEL_DOWNLOAD_FAILED",
      503,
    );
  }
  if (!response.ok) {
    throw new CommerceError(
      "The Canada Post label exists, but its PDF could not be downloaded.",
      "CANADA_POST_LABEL_DOWNLOAD_FAILED",
      502,
    );
  }

  const bytes = new Uint8Array(await response.arrayBuffer());
  const signature = new TextDecoder().decode(bytes.slice(0, 5));
  if (bytes.byteLength < 100 || signature !== "%PDF-") {
    throw new CommerceError(
      "Canada Post returned an invalid label document.",
      "CANADA_POST_INVALID_LABEL",
      502,
    );
  }
  return bytes;
}

function findNumericField(value: unknown, fields: string[]): number | null {
  if (!value || typeof value !== "object") return null;
  const record = value as UnknownRecord;
  for (const field of fields) {
    if (record[field] !== undefined) {
      const number = Number.parseFloat(textValue(record[field]));
      if (Number.isFinite(number) && number >= 0) return number;
    }
  }
  for (const nested of Object.values(record)) {
    for (const item of asArray(nested)) {
      const found = findNumericField(item, fields);
      if (found !== null) return found;
    }
  }
  return null;
}

export async function getCanadaPostLabelCost(link: CanadaPostLink | null) {
  if (!link) return null;

  try {
    const response = await fetchCanadaPostResource(link);
    if (!response.ok) return null;
    const parsed = parseCanadaPostResponse(await response.text());
    const amount = findNumericField(parsed, ["charge-amount", "due"]);
    return amount === null ? null : Math.round(amount * 100);
  } catch {
    return null;
  }
}

async function requestCanadaPostRefund(input: {
  refundUrl: string;
  email: string;
  contract: boolean;
}): Promise<CanadaPostCancellationResult> {
  const environment = requireServerEnvironment(
    "CANADA_POST_USERNAME",
    "CANADA_POST_PASSWORD",
  );
  const endpoint = assertSandboxProviderUrl(
    input.refundUrl,
    environment.CANADA_POST_API_BASE,
  );
  const mediaType = input.contract
    ? "application/vnd.cpc.shipment-v8+xml"
    : "application/vnd.cpc.ncshipment-v4+xml";
  const rootName = input.contract
    ? "shipment-refund-request"
    : "non-contract-shipment-refund-request";
  const namespace = input.contract
    ? "http://www.canadapost.ca/ws/shipment-v8"
    : "http://www.canadapost.ca/ws/ncshipment-v4";
  const xml = new XMLBuilder({
    ignoreAttributes: false,
    format: false,
    suppressEmptyNode: true,
  }).build({
    [rootName]: {
      "@_xmlns": namespace,
      email: input.email,
    },
  });

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Accept: mediaType,
        "Content-Type": mediaType,
        "Accept-Language": "en-CA",
        Authorization: `Basic ${canadaPostAuthorization(
          environment.CANADA_POST_USERNAME,
          environment.CANADA_POST_PASSWORD,
        )}`,
        "User-Agent": "WanderBikeCommerce/1.0",
      },
      body: xml,
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new CommerceError(
      "Canada Post did not confirm whether the refund request was received.",
      "CANADA_POST_REFUND_UNCERTAIN",
      503,
    );
  }

  const responseText = await response.text();
  const parsed = parseCanadaPostResponse(responseText);
  const message = providerMessages(parsed);
  const resultRoot = asRecord(
    parsed[
      input.contract
        ? "shipment-refund-request-info"
        : "non-contract-shipment-refund-request-info"
    ],
  );
  const serviceTicketId = textValue(resultRoot["service-ticket-id"]);
  if (!response.ok || message || !serviceTicketId) {
    throw new CommerceError(
      message || "Canada Post rejected the label refund request.",
      "CANADA_POST_REFUND_REJECTED",
      response.status >= 500 ? 503 : 422,
    );
  }

  return { status: "refund_pending", serviceTicketId };
}

export async function cancelCanadaPostShipment(input: {
  selfUrl: string;
  refundUrl: string;
  email: string;
}): Promise<CanadaPostCancellationResult> {
  const environment = requireServerEnvironment(
    "CANADA_POST_USERNAME",
    "CANADA_POST_PASSWORD",
  );
  if (!environment.COMMERCE_SANDBOX_MODE) {
    throw new CommerceError(
      "Production Canada Post cancellation is disabled.",
      "LIVE_SHIPPING_DISABLED",
      503,
    );
  }
  if (!environment.CANADA_POST_ACCOUNT_TYPE) {
    throw new CommerceError(
      "Canada Post account type has not been configured.",
      "CANADA_POST_ACCOUNT_TYPE_REQUIRED",
      503,
    );
  }

  const contract = environment.CANADA_POST_ACCOUNT_TYPE === "contract";
  if (!contract) {
    if (!input.refundUrl) {
      throw new CommerceError(
        "Canada Post did not provide a refund link for this label.",
        "CANADA_POST_REFUND_UNAVAILABLE",
        422,
      );
    }
    return requestCanadaPostRefund({
      refundUrl: input.refundUrl,
      email: input.email,
      contract: false,
    });
  }

  if (!input.selfUrl) {
    throw new CommerceError(
      "Canada Post did not provide a void link for this label.",
      "CANADA_POST_VOID_UNAVAILABLE",
      422,
    );
  }
  const endpoint = assertSandboxProviderUrl(
    input.selfUrl,
    environment.CANADA_POST_API_BASE,
  );

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "DELETE",
      headers: {
        Accept: "application/vnd.cpc.shipment-v8+xml",
        "Accept-Language": "en-CA",
        Authorization: `Basic ${canadaPostAuthorization(
          environment.CANADA_POST_USERNAME,
          environment.CANADA_POST_PASSWORD,
        )}`,
        "User-Agent": "WanderBikeCommerce/1.0",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new CommerceError(
      "Canada Post did not confirm whether the label was voided.",
      "CANADA_POST_VOID_UNCERTAIN",
      503,
    );
  }

  if (response.status === 204) {
    return { status: "voided", serviceTicketId: null };
  }
  const parsed = parseCanadaPostResponse(await response.text());
  const message = providerMessages(parsed);
  if (providerMessageCodes(parsed).includes("8064") && input.refundUrl) {
    return requestCanadaPostRefund({
      refundUrl: input.refundUrl,
      email: input.email,
      contract: true,
    });
  }
  throw new CommerceError(
    message || "Canada Post rejected the label void request.",
    "CANADA_POST_VOID_REJECTED",
    response.status >= 500 ? 503 : 422,
  );
}

export async function getCanadaPostRates(input: {
  originPostalCode: string;
  destinationPostalCode: string;
  package: CanadaPostPackage;
}): Promise<CanadaPostRateResult> {
  const environment = requireServerEnvironment(
    "CANADA_POST_USERNAME",
    "CANADA_POST_PASSWORD",
  );

  if (!environment.COMMERCE_SANDBOX_MODE) {
    throw new CommerceError(
      "Production Canada Post requests are disabled.",
      "LIVE_SHIPPING_DISABLED",
      503,
    );
  }

  const scenario: UnknownRecord = {
    "@_xmlns": "http://www.canadapost.ca/ws/ship/rate-v4",
  };

  if (environment.CANADA_POST_CUSTOMER_NUMBER) {
    scenario["customer-number"] = environment.CANADA_POST_CUSTOMER_NUMBER;
  }
  if (environment.CANADA_POST_CONTRACT_ID) {
    scenario["contract-id"] = environment.CANADA_POST_CONTRACT_ID;
  }

  scenario["parcel-characteristics"] = {
    weight: input.package.weightKg.toFixed(3),
    dimensions: {
      length: input.package.lengthCm.toFixed(1),
      width: input.package.widthCm.toFixed(1),
      height: input.package.heightCm.toFixed(1),
    },
  };
  scenario["origin-postal-code"] = input.originPostalCode;
  scenario.destination = {
    domestic: { "postal-code": input.destinationPostalCode },
  };

  const xml = new XMLBuilder({
    ignoreAttributes: false,
    format: false,
    suppressEmptyNode: true,
  }).build({ "mailing-scenario": scenario });
  const endpoint = new URL(
    "/rs/ship/price",
    environment.CANADA_POST_API_BASE,
  ).toString();
  const authorization = Buffer.from(
    `${environment.CANADA_POST_USERNAME}:${environment.CANADA_POST_PASSWORD}`,
  ).toString("base64");

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/vnd.cpc.ship.rate-v4+xml",
        "Content-Type": "application/vnd.cpc.ship.rate-v4+xml",
        Authorization: `Basic ${authorization}`,
        "User-Agent": "WanderBikeCommerce/1.0",
      },
      body: xml,
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });
  } catch {
    throw new CommerceError(
      "Canada Post sandbox did not respond in time.",
      "CANADA_POST_UNAVAILABLE",
      503,
    );
  }

  const responseText = await response.text();
  const parsed = asRecord(
    new XMLParser({
      ignoreAttributes: false,
      removeNSPrefix: true,
      parseTagValue: false,
      trimValues: true,
    }).parse(responseText),
  );

  if (!response.ok) {
    throw new CommerceError(
      providerMessages(parsed) || "Canada Post rejected the rate request.",
      "CANADA_POST_REJECTED",
      response.status >= 500 ? 503 : 422,
    );
  }

  const root = asRecord(parsed["price-quotes"]);
  const quotes = asArray(root["price-quote"]).map((value) => asRecord(value));
  const rates = quotes
    .map<CanadaPostRate>((quote) => {
      const priceDetails = asRecord(quote["price-details"]);
      const standard = asRecord(quote["service-standard"]);
      const transit = Number.parseInt(
        textValue(standard["expected-transit-time"]),
        10,
      );

      return {
        serviceCode: textValue(quote["service-code"]),
        serviceName: textValue(quote["service-name"]),
        amountCents: dollarsToCents(priceDetails.due),
        estimatedTransitDays: Number.isFinite(transit) ? transit : null,
        expectedDeliveryDate:
          textValue(standard["expected-delivery-date"]) || null,
      };
    })
    .filter((rate) => rate.serviceCode && rate.serviceName)
    .sort((left, right) => left.amountCents - right.amountCents);

  if (rates.length === 0) {
    throw new CommerceError(
      "Canada Post did not return a service for this package and postal code.",
      "CANADA_POST_NO_RATES",
      422,
    );
  }

  return { rates, providerResponse: parsed };
}
