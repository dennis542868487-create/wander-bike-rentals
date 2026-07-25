import "server-only";

import type { CanadaPostPackage } from "@/lib/commerce/cart-server";
import {
  canadaPostParcelLimitViolation,
  normalizeCanadaPostParcelDimensions,
} from "@/lib/commerce/canada-post-limits";
import { CommerceError } from "@/lib/commerce/errors";
import { normalizeCanadianPostalCode } from "@/lib/commerce/schemas";
import { requireServerEnvironment } from "@/lib/env";

type UnknownRecord = Record<string, unknown>;

const canadaPostApiOrigin = "https://api.canadapost-postescanada.ca";
const canadaPostApiRootPath = "/prod/devportal-portaildesdeveloppeurs/";
const canadaPostApiBase = `${canadaPostApiOrigin}${canadaPostApiRootPath.slice(
  0,
  -1,
)}`;
const maximumCanadaPostLabelBytes = 10 * 1024 * 1024;
const tokenExpirySafetyWindowMs = 60_000;

type CanadaPostCredentialEnvironment = ReturnType<
  typeof requireServerEnvironment
> & {
  CANADA_POST_API_KEY: string;
  CANADA_POST_API_SECRET: string;
};

type CanadaPostTokenCache = {
  credentialKey: string;
  accessToken: string;
  expiresAt: number;
};

let accessTokenCache: CanadaPostTokenCache | null = null;
let accessTokenRequest: {
  credentialKey: string;
  promise: Promise<string>;
} | null = null;

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
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : {};
}

function asArray(value: unknown): unknown[] {
  return value == null ? [] : Array.isArray(value) ? value : [value];
}

function textValue(value: unknown) {
  return value == null ? "" : String(value);
}

function optionalElement(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
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

function providerErrors(payload: unknown) {
  const root = asRecord(payload);
  return asArray(root.errors).map((value) => asRecord(value));
}

function providerMessages(payload: unknown) {
  const root = asRecord(payload);
  const errors = providerErrors(payload)
    .map((error) => textValue(error.message))
    .filter(Boolean);
  if (errors.length > 0) return errors.join(" ");

  return (
    textValue(root.httpMessage) ||
    textValue(root.detail) ||
    textValue(root.message)
  );
}

function providerMessageCodes(payload: unknown) {
  return providerErrors(payload)
    .map((error) => textValue(error.errorCode))
    .filter(Boolean);
}

async function parseJsonResponse(response: Response): Promise<unknown> {
  const responseText = await response.text();
  if (!responseText.trim()) return {};

  try {
    return JSON.parse(responseText) as unknown;
  } catch {
    throw new CommerceError(
      "Canada Post returned an invalid JSON response.",
      "CANADA_POST_INVALID_RESPONSE",
      502,
    );
  }
}

function assertCanadaPostTestMode(
  environment: ReturnType<typeof requireServerEnvironment>,
  action: string,
) {
  if (
    !environment.COMMERCE_SANDBOX_MODE ||
    environment.CANADA_POST_ENVIRONMENT !== "test"
  ) {
    throw new CommerceError(
      `Production Canada Post ${action} are disabled.`,
      "LIVE_SHIPPING_DISABLED",
      503,
    );
  }
}

function canadaPostSandboxApiBase(baseUrl: string) {
  let base: URL;
  try {
    base = new URL(baseUrl);
  } catch {
    throw new CommerceError(
      "Canada Post test API configuration is invalid.",
      "LIVE_SHIPPING_DISABLED",
      503,
    );
  }

  const normalizedPath = base.pathname.endsWith("/")
    ? base.pathname
    : `${base.pathname}/`;
  if (
    base.origin !== canadaPostApiOrigin ||
    base.username ||
    base.password ||
    normalizedPath !== canadaPostApiRootPath ||
    base.search ||
    base.hash
  ) {
    throw new CommerceError(
      "Only the Canada Post test application API is enabled.",
      "LIVE_SHIPPING_DISABLED",
      503,
    );
  }
  return canadaPostApiBase;
}

function canadaPostEndpoint(baseUrl: string, path: string) {
  const base = canadaPostSandboxApiBase(baseUrl);
  return `${base}/${path.replace(/^\/+/, "")}`;
}

function assertSandboxProviderUrl(rawUrl: string, baseUrl: string) {
  let url: URL;
  const base = new URL(canadaPostSandboxApiBase(baseUrl));
  try {
    url = new URL(rawUrl);
  } catch {
    throw new CommerceError(
      "Canada Post returned an invalid resource link.",
      "CANADA_POST_INVALID_RESPONSE",
      502,
    );
  }

  if (
    url.protocol !== "https:" ||
    url.origin !== base.origin ||
    !url.pathname.startsWith(canadaPostApiRootPath) ||
    url.username ||
    url.password ||
    url.hash
  ) {
    throw new CommerceError(
      "Canada Post returned an unexpected resource host.",
      "CANADA_POST_INVALID_RESPONSE",
      502,
    );
  }
  return url.toString();
}

function responseLinks(root: UnknownRecord, baseUrl: string): CanadaPostLink[] {
  return asArray(root.links)
    .map((value) => asRecord(value))
    .map((link) => ({
      rel: textValue(link.rel),
      href: textValue(link.href),
      mediaType: textValue(link.mediaType),
    }))
    .filter((link) => link.rel && link.href && link.mediaType)
    .map((link) => ({
      ...link,
      href: assertSandboxProviderUrl(link.href, baseUrl),
    }));
}

function credentialCacheKey(environment: CanadaPostCredentialEnvironment) {
  return [
    canadaPostSandboxApiBase(environment.CANADA_POST_API_BASE),
    environment.CANADA_POST_API_KEY,
    environment.CANADA_POST_API_SECRET,
  ].join("\u0000");
}

async function requestCanadaPostAccessToken(
  environment: CanadaPostCredentialEnvironment,
  credentialKey: string,
) {
  const endpoint = canadaPostEndpoint(
    environment.CANADA_POST_API_BASE,
    "cpc-api-native-oauth-provider/oauth2/token",
  );
  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        "X-IBM-Client-Id": environment.CANADA_POST_API_KEY,
        "X-IBM-Client-Secret": environment.CANADA_POST_API_SECRET,
        "User-Agent": "WanderBikeCommerce/2.0",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        scope: "merchant",
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new CommerceError(
      "Canada Post authentication is temporarily unavailable.",
      "CANADA_POST_AUTH_UNAVAILABLE",
      503,
    );
  }

  const payload = asRecord(await parseJsonResponse(response));
  const accessToken = textValue(payload.access_token);
  const expiresIn = Number(payload.expires_in);
  if (
    !response.ok ||
    !accessToken ||
    !Number.isFinite(expiresIn) ||
    expiresIn <= 0
  ) {
    throw new CommerceError(
      providerMessages(payload) ||
        "Canada Post rejected the test application credentials.",
      "CANADA_POST_AUTH_REJECTED",
      503,
    );
  }

  accessTokenCache = {
    credentialKey,
    accessToken,
    expiresAt:
      Date.now() +
      Math.max(1_000, expiresIn * 1_000 - tokenExpirySafetyWindowMs),
  };
  return accessToken;
}

async function getCanadaPostAccessToken(
  environment: CanadaPostCredentialEnvironment,
) {
  const credentialKey = credentialCacheKey(environment);
  if (
    accessTokenCache?.credentialKey === credentialKey &&
    accessTokenCache.expiresAt > Date.now()
  ) {
    return accessTokenCache.accessToken;
  }
  if (accessTokenRequest?.credentialKey === credentialKey) {
    return accessTokenRequest.promise;
  }

  const promise = requestCanadaPostAccessToken(environment, credentialKey);
  accessTokenRequest = { credentialKey, promise };
  try {
    return await promise;
  } finally {
    if (accessTokenRequest?.promise === promise) accessTokenRequest = null;
  }
}

function clearCanadaPostAccessToken(
  environment: CanadaPostCredentialEnvironment,
) {
  if (accessTokenCache?.credentialKey === credentialCacheKey(environment)) {
    accessTokenCache = null;
  }
}

async function fetchCanadaPostApi(
  environment: CanadaPostCredentialEnvironment,
  endpoint: string,
  init: RequestInit,
  timeoutMs: number,
) {
  const request = async (accessToken: string) =>
    fetch(endpoint, {
      ...init,
      headers: {
        "Accept-Language": "en-CA",
        "User-Agent": "WanderBikeCommerce/2.0",
        ...init.headers,
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs),
    });

  let response = await request(await getCanadaPostAccessToken(environment));
  if (response.status === 401) {
    clearCanadaPostAccessToken(environment);
    response = await request(await getCanadaPostAccessToken(environment));
  }
  return response;
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
  const packageLimitViolation = canadaPostParcelLimitViolation(input.package);
  if (packageLimitViolation) {
    throw new CommerceError(
      packageLimitViolation,
      "CANADA_POST_PACKAGE_INVALID",
      422,
    );
  }
  const parcel = normalizeCanadaPostParcelDimensions(input.package);

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
    addressLine1: input.sender.addressLine1,
    city: input.sender.city,
    provState: input.sender.province,
    countryCode: input.sender.country,
    postalZipCode: normalizeCanadianPostalCode(input.sender.postalCode),
  };
  const senderLine2 = optionalElement(input.sender.addressLine2);
  if (senderLine2) senderAddress.addressLine2 = senderLine2;

  const destinationAddress: UnknownRecord = {
    addressLine1: input.destination.addressLine1,
    city: input.destination.city,
    provState: input.destination.province,
    countryCode: input.destination.country,
    postalZipCode: normalizeCanadianPostalCode(input.destination.postalCode),
  };
  const destinationLine2 = optionalElement(input.destination.addressLine2);
  if (destinationLine2) destinationAddress.addressLine2 = destinationLine2;

  const destination: UnknownRecord = {
    name: input.destination.name,
    addressDetails: destinationAddress,
  };
  const destinationCompany = optionalElement(input.destination.company);
  const destinationPhone = optionalElement(input.destination.phone);
  if (destinationCompany) destination.company = destinationCompany;
  if (destinationPhone) destination.clientVoiceNumber = destinationPhone;

  const settlementInfo: UnknownRecord = {
    paidByCustomer: input.environment.CANADA_POST_CUSTOMER_NUMBER,
    intendedMethodOfPayment: input.contract ? "Account" : "CreditCard",
  };
  if (input.contract) {
    settlementInfo.contractId = input.environment.CANADA_POST_CONTRACT_ID;
  }

  return {
    serviceCode: input.serviceCode,
    sender: {
      name: input.sender.contact,
      company: input.sender.company,
      contactPhone: input.sender.phone,
      addressDetails: senderAddress,
    },
    destination,
    parcelCharacteristics: {
      weight: parcel.weightKg,
      dimensions: {
        length: parcel.lengthCm,
        width: parcel.widthCm,
        height: parcel.heightCm,
      },
    },
    printPreferences: {
      outputFormat: "8.5x11",
      encoding: "PDF",
    },
    preferences: {
      showPackingInstructions: false,
      showPostageRate: false,
      showInsuredValue: false,
    },
    references: {
      customerRef1: input.orderNumber.slice(0, 35),
    },
    settlementInfo,
  };
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
    "CANADA_POST_API_KEY",
    "CANADA_POST_API_SECRET",
    "CANADA_POST_CUSTOMER_NUMBER",
  );
  assertCanadaPostTestMode(environment, "labels");
  const apiBase = canadaPostSandboxApiBase(environment.CANADA_POST_API_BASE);

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
  if (
    contract &&
    (!environment.CANADA_POST_CONTRACT_ID || !environment.CANADA_POST_GROUP_ID)
  ) {
    throw new CommerceError(
      "Canada Post contract ID and shipment group ID are required.",
      "CANADA_POST_CONTRACT_CONFIGURATION_REQUIRED",
      503,
    );
  }

  const requestBody: UnknownRecord = {
    customerRequestId: input.customerRequestId.slice(0, 35),
    requestedShippingPoint: normalizeCanadianPostalCode(
      input.sender.postalCode,
    ),
    deliverySpec: shipmentDeliverySpec({
      ...input,
      contract,
      environment,
    }),
  };
  if (contract) {
    requestBody.groupId = environment.CANADA_POST_GROUP_ID;
  } else {
    requestBody.transmitShipment = true;
  }

  const customerNumber = environment.CANADA_POST_CUSTOMER_NUMBER;
  const mailedOnBehalfOf =
    environment.CANADA_POST_MOBO_CUSTOMER_NUMBER ?? customerNumber;
  const endpoint = canadaPostEndpoint(
    apiBase,
    `shipping/v1/${encodeURIComponent(customerNumber)}/${encodeURIComponent(
      mailedOnBehalfOf,
    )}/shipments`,
  );

  let response: Response;
  try {
    response = await fetchCanadaPostApi(
      environment,
      endpoint,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      },
      20_000,
    );
  } catch (error) {
    if (error instanceof CommerceError) throw error;
    throw new CommerceError(
      "Canada Post did not confirm whether the label was created. Do not retry with a new request ID.",
      "CANADA_POST_SHIPMENT_UNCERTAIN",
      503,
    );
  }

  const payload = await parseJsonResponse(response);
  const responseRoot = asRecord(payload);
  const shipmentId = textValue(responseRoot.shipmentId);
  const trackingPin = textValue(responseRoot.trackingPin);
  if (!response.ok || !shipmentId) {
    throw new CommerceError(
      providerMessages(payload) || "Canada Post rejected the shipment request.",
      "CANADA_POST_SHIPMENT_REJECTED",
      response.status >= 500 ? 503 : 422,
    );
  }

  const links = responseLinks(responseRoot, apiBase);
  const labelLink = links.find((link) => link.rel === "label");
  if (!labelLink || labelLink.mediaType !== "application/pdf") {
    throw new CommerceError(
      "Canada Post did not return a PDF label link.",
      "CANADA_POST_INVALID_RESPONSE",
      502,
    );
  }
  const selfLink = links.find((link) => link.rel === "self") ?? null;
  const explicitRefundLink =
    links.find((link) => link.rel === "refund") ?? null;
  const refundLink =
    explicitRefundLink ??
    (selfLink
      ? {
          rel: "refund",
          href: assertSandboxProviderUrl(
            `${selfLink.href.replace(/\/+$/, "")}/refund`,
            apiBase,
          ),
          mediaType: "application/json",
        }
      : null);

  return {
    shipmentId,
    trackingPin,
    serviceName: input.serviceName,
    selfLink,
    labelLink,
    priceLink: links.find((link) => link.rel === "price") ?? null,
    refundLink,
    providerResponse: responseRoot,
  };
}

async function fetchCanadaPostResource(link: CanadaPostLink) {
  const environment = requireServerEnvironment(
    "CANADA_POST_API_KEY",
    "CANADA_POST_API_SECRET",
  );
  assertCanadaPostTestMode(environment, "resources");
  const href = assertSandboxProviderUrl(
    link.href,
    environment.CANADA_POST_API_BASE,
  );

  return fetchCanadaPostApi(
    environment,
    href,
    {
      headers: {
        Accept: link.mediaType,
      },
    },
    15_000,
  );
}

async function readBoundedLabelBytes(response: Response) {
  const contentLength = Number(response.headers.get("content-length"));
  if (
    Number.isFinite(contentLength) &&
    contentLength > maximumCanadaPostLabelBytes
  ) {
    throw new CommerceError(
      "Canada Post returned a label larger than the storage limit.",
      "CANADA_POST_INVALID_LABEL",
      502,
    );
  }
  if (!response.body) return new Uint8Array();

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > maximumCanadaPostLabelBytes) {
      await reader.cancel();
      throw new CommerceError(
        "Canada Post returned a label larger than the storage limit.",
        "CANADA_POST_INVALID_LABEL",
        502,
      );
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

export async function getCanadaPostLabelArtifact(link: CanadaPostLink) {
  let response: Response;
  try {
    response = await fetchCanadaPostResource(link);
  } catch (error) {
    if (
      error instanceof CommerceError &&
      error.code === "CANADA_POST_INVALID_RESPONSE"
    ) {
      throw error;
    }
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

  const bytes = await readBoundedLabelBytes(response);
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
    const payload = await parseJsonResponse(response);
    const amount = findNumericField(payload, [
      "chargeAmount",
      "dueAmount",
      "due",
    ]);
    return amount === null ? null : Math.round(amount * 100);
  } catch {
    return null;
  }
}

async function requestCanadaPostRefund(input: {
  refundUrl: string;
  email: string;
}): Promise<CanadaPostCancellationResult> {
  const environment = requireServerEnvironment(
    "CANADA_POST_API_KEY",
    "CANADA_POST_API_SECRET",
  );
  assertCanadaPostTestMode(environment, "refunds");
  const endpoint = assertSandboxProviderUrl(
    input.refundUrl,
    environment.CANADA_POST_API_BASE,
  );

  let response: Response;
  try {
    response = await fetchCanadaPostApi(
      environment,
      endpoint,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: input.email }),
      },
      15_000,
    );
  } catch (error) {
    if (error instanceof CommerceError) throw error;
    throw new CommerceError(
      "Canada Post did not confirm whether the refund request was received.",
      "CANADA_POST_REFUND_UNCERTAIN",
      503,
    );
  }

  const payload = await parseJsonResponse(response);
  const serviceTicketId = textValue(asRecord(payload).serviceTicketId);
  if (!response.ok || !serviceTicketId) {
    throw new CommerceError(
      providerMessages(payload) ||
        "Canada Post rejected the label refund request.",
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
    "CANADA_POST_API_KEY",
    "CANADA_POST_API_SECRET",
  );
  assertCanadaPostTestMode(environment, "cancellations");

  if (!input.selfUrl) {
    if (input.refundUrl) {
      return requestCanadaPostRefund({
        refundUrl: input.refundUrl,
        email: input.email,
      });
    }
    throw new CommerceError(
      "Canada Post did not provide a void or refund link for this label.",
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
    response = await fetchCanadaPostApi(
      environment,
      endpoint,
      {
        method: "DELETE",
        headers: { Accept: "application/json" },
      },
      15_000,
    );
  } catch (error) {
    if (error instanceof CommerceError) throw error;
    throw new CommerceError(
      "Canada Post did not confirm whether the label was voided.",
      "CANADA_POST_VOID_UNCERTAIN",
      503,
    );
  }

  if (response.status === 204) {
    return { status: "voided", serviceTicketId: null };
  }
  const payload = await parseJsonResponse(response);
  if (providerMessageCodes(payload).includes("8064") && input.refundUrl) {
    return requestCanadaPostRefund({
      refundUrl: input.refundUrl,
      email: input.email,
    });
  }
  throw new CommerceError(
    providerMessages(payload) || "Canada Post rejected the label void request.",
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
    "CANADA_POST_API_KEY",
    "CANADA_POST_API_SECRET",
  );
  assertCanadaPostTestMode(environment, "requests");
  const apiBase = canadaPostSandboxApiBase(environment.CANADA_POST_API_BASE);

  const packageLimitViolation = canadaPostParcelLimitViolation(input.package);
  if (packageLimitViolation) {
    throw new CommerceError(
      packageLimitViolation,
      "CANADA_POST_PACKAGE_INVALID",
      422,
    );
  }
  const parcel = normalizeCanadaPostParcelDimensions(input.package);
  const scenario: UnknownRecord = {
    parcelCharacteristics: {
      weight: parcel.weightKg,
      dimensions: {
        length: parcel.lengthCm,
        width: parcel.widthCm,
        height: parcel.heightCm,
      },
    },
    originPostalCode: normalizeCanadianPostalCode(input.originPostalCode),
    destination: {
      domestic: {
        postalCode: normalizeCanadianPostalCode(input.destinationPostalCode),
      },
    },
  };
  if (environment.CANADA_POST_CUSTOMER_NUMBER) {
    scenario.customerNumber = environment.CANADA_POST_CUSTOMER_NUMBER;
    scenario.quoteType = "commercial";
  } else {
    scenario.quoteType = "counter";
  }
  if (environment.CANADA_POST_CONTRACT_ID) {
    scenario.contractId = environment.CANADA_POST_CONTRACT_ID;
  }

  const endpoint = canadaPostEndpoint(apiBase, "rating/v1/prices");
  let response: Response;
  try {
    response = await fetchCanadaPostApi(
      environment,
      endpoint,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(scenario),
      },
      12_000,
    );
  } catch (error) {
    if (error instanceof CommerceError) throw error;
    throw new CommerceError(
      "Canada Post test API did not respond in time.",
      "CANADA_POST_UNAVAILABLE",
      503,
    );
  }

  const payload = await parseJsonResponse(response);
  if (!response.ok) {
    throw new CommerceError(
      providerMessages(payload) || "Canada Post rejected the rate request.",
      "CANADA_POST_REJECTED",
      response.status >= 500 ? 503 : 422,
    );
  }
  if (!Array.isArray(payload)) {
    throw new CommerceError(
      "Canada Post returned an invalid rate response.",
      "CANADA_POST_INVALID_RESPONSE",
      502,
    );
  }

  const quotes = payload.map((value) => asRecord(value));
  const rates = quotes
    .map<CanadaPostRate>((quote) => {
      const priceDetails = asRecord(quote.priceDetails);
      const standard = asRecord(quote.serviceStandard);
      const transit = Number.parseInt(
        textValue(standard.expectedTransitTime),
        10,
      );
      const expectedDeliveryDate = textValue(standard.expectedDeliveryDate);

      return {
        serviceCode: textValue(quote.serviceCode),
        serviceName: textValue(quote.serviceName),
        amountCents: dollarsToCents(priceDetails.due),
        estimatedTransitDays: Number.isFinite(transit) ? transit : null,
        expectedDeliveryDate: expectedDeliveryDate
          ? expectedDeliveryDate.slice(0, 10)
          : null,
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

  return {
    rates,
    providerResponse: { quotes },
  };
}
