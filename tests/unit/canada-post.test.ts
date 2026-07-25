import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const canadaPostTestState = vi.hoisted(() => ({
  environment: {
    COMMERCE_SANDBOX_MODE: true,
    CANADA_POST_USERNAME: "sandbox-user",
    CANADA_POST_PASSWORD: "sandbox-password",
    CANADA_POST_ACCOUNT_TYPE: "non_contract",
    CANADA_POST_CUSTOMER_NUMBER: "1234567",
    CANADA_POST_MOBO_CUSTOMER_NUMBER: undefined,
    CANADA_POST_CONTRACT_ID: undefined,
    CANADA_POST_GROUP_ID: undefined,
    CANADA_POST_API_BASE: "https://ct.soa-gw.canadapost.ca",
  },
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/env", () => ({
  requireServerEnvironment: () => canadaPostTestState.environment,
}));

import {
  cancelCanadaPostShipment,
  createCanadaPostShipment,
  getCanadaPostLabelArtifact,
  getCanadaPostRates,
} from "@/lib/canada-post/client";

const sender = {
  company: "Wander Bike",
  contact: "Test Merchant",
  phone: "604-555-0100",
  addressLine1: "12071 First Ave",
  addressLine2: "#101",
  city: "Richmond",
  province: "BC",
  postalCode: "V7E 3M1",
  country: "CA" as const,
};

const destination = {
  name: "Test Rider",
  phone: "604-555-0101",
  addressLine1: "100 Main Street",
  city: "Vancouver",
  province: "BC",
  postalCode: "V6B 1A1",
  country: "CA" as const,
};

function shipmentInput() {
  return {
    orderNumber: "WB-TEST-1001",
    customerRequestId: "WB-TEST-REQUEST-1001",
    serviceCode: "DOM.EP",
    serviceName: "Expedited Parcel",
    sender,
    destination,
    package: {
      weightKg: 1.25,
      lengthCm: 30,
      widthCm: 20,
      heightCm: 10,
    },
  };
}

describe("Canada Post sandbox client", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    canadaPostTestState.environment.CANADA_POST_API_BASE =
      "https://ct.soa-gw.canadapost.ca";
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("normalizes postal codes and sorts provider rates by price", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        `<?xml version="1.0" encoding="UTF-8"?>
          <price-quotes>
            <price-quote>
              <service-code>DOM.XP</service-code>
              <service-name>Xpresspost</service-name>
              <price-details><due>18.75</due></price-details>
              <service-standard>
                <expected-transit-time>2</expected-transit-time>
                <expected-delivery-date>2026-07-29</expected-delivery-date>
              </service-standard>
            </price-quote>
            <price-quote>
              <service-code>DOM.EP</service-code>
              <service-name>Expedited Parcel</service-name>
              <price-details><due>12.34</due></price-details>
              <service-standard>
                <expected-transit-time>4</expected-transit-time>
              </service-standard>
            </price-quote>
          </price-quotes>`,
        { status: 200 },
      ),
    );

    const result = await getCanadaPostRates({
      originPostalCode: "V7E 3M1",
      destinationPostalCode: "V6B 1A1",
      package: {
        weightKg: 1.25,
        lengthCm: 30,
        widthCm: 20,
        heightCm: 10,
        packagingAllowanceGrams: 250,
      },
    });

    expect(result.rates.map((rate) => rate.amountCents)).toEqual([1234, 1875]);
    expect(result.rates[0]).toMatchObject({
      serviceCode: "DOM.EP",
      estimatedTransitDays: 4,
      expectedDeliveryDate: null,
    });
    const [url, request] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://ct.soa-gw.canadapost.ca/rs/ship/price");
    expect(String(request.body)).toContain(
      "<origin-postal-code>V7E3M1</origin-postal-code>",
    );
    expect(String(request.body)).toContain("<postal-code>V6B1A1</postal-code>");
  });

  it("normalizes the longest parcel side as length", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        `<price-quotes>
          <price-quote>
            <service-code>DOM.EP</service-code>
            <service-name>Expedited Parcel</service-name>
            <price-details><due>12.34</due></price-details>
          </price-quote>
        </price-quotes>`,
        { status: 200 },
      ),
    );

    await getCanadaPostRates({
      originPostalCode: "V7E 3M1",
      destinationPostalCode: "V6B 1A1",
      package: {
        weightKg: 1.25,
        lengthCm: 10,
        widthCm: 30,
        heightCm: 20,
        packagingAllowanceGrams: 250,
      },
    });

    const [, request] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(String(request.body)).toContain(
      "<dimensions><length>30.0</length><width>20.0</width><height>10.0</height></dimensions>",
    );
  });

  it("rejects an over-limit parcel before contacting Canada Post", async () => {
    await expect(
      getCanadaPostRates({
        originPostalCode: "V7E 3M1",
        destinationPostalCode: "V6B 1A1",
        package: {
          weightKg: 1.25,
          lengthCm: 100,
          widthCm: 60,
          heightCm: 50,
          packagingAllowanceGrams: 250,
        },
      }),
    ).rejects.toMatchObject({
      code: "CANADA_POST_PACKAGE_INVALID",
      status: 422,
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("refuses a production Canada Post API host even in sandbox mode", async () => {
    canadaPostTestState.environment.CANADA_POST_API_BASE =
      "https://soa-gw.canadapost.ca";

    await expect(
      getCanadaPostRates({
        originPostalCode: "V7E 3M1",
        destinationPostalCode: "V6B 1A1",
        package: {
          weightKg: 1.25,
          lengthCm: 30,
          widthCm: 20,
          heightCm: 10,
          packagingAllowanceGrams: 250,
        },
      }),
    ).rejects.toMatchObject({
      code: "LIVE_SHIPPING_DISABLED",
      status: 503,
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("builds a non-contract shipment and accepts only sandbox resource links", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        `<?xml version="1.0" encoding="UTF-8"?>
          <non-contract-shipment-info>
            <shipment-id>123456789</shipment-id>
            <tracking-pin>1234567890123456</tracking-pin>
            <links>
              <link rel="self" href="https://ct.soa-gw.canadapost.ca/rs/1234567/ncshipment/123456789" media-type="application/vnd.cpc.ncshipment-v4+xml"/>
              <link rel="label" href="https://ct.soa-gw.canadapost.ca/rs/artifact/label/123456789" media-type="application/pdf"/>
              <link rel="receipt" href="https://ct.soa-gw.canadapost.ca/rs/artifact/receipt/123456789" media-type="application/vnd.cpc.ncshipment-v4+xml"/>
            </links>
          </non-contract-shipment-info>`,
        { status: 200 },
      ),
    );

    const result = await createCanadaPostShipment(shipmentInput());

    expect(result).toMatchObject({
      shipmentId: "123456789",
      trackingPin: "1234567890123456",
      labelLink: {
        rel: "label",
        mediaType: "application/pdf",
      },
    });
    const [url, request] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(
      "https://ct.soa-gw.canadapost.ca/rs/1234567/ncshipment",
    );
    expect(String(request.body)).toContain(
      "<postal-zip-code>V7E3M1</postal-zip-code>",
    );
    expect(String(request.body)).toContain(
      "<postal-zip-code>V6B1A1</postal-zip-code>",
    );
  });

  it("blocks a provider resource link that leaves the sandbox host", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        `<non-contract-shipment-info>
          <shipment-id>123456789</shipment-id>
          <links>
            <link rel="label" href="https://attacker.example/label.pdf" media-type="application/pdf"/>
          </links>
        </non-contract-shipment-info>`,
        { status: 200 },
      ),
    );

    await expect(
      createCanadaPostShipment(shipmentInput()),
    ).rejects.toMatchObject({
      code: "CANADA_POST_INVALID_RESPONSE",
      status: 502,
    });
  });

  it("blocks a provider resource link on a different port", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        `<non-contract-shipment-info>
          <shipment-id>123456789</shipment-id>
          <links>
            <link rel="label" href="https://ct.soa-gw.canadapost.ca:444/label.pdf" media-type="application/pdf"/>
          </links>
        </non-contract-shipment-info>`,
        { status: 200 },
      ),
    );

    await expect(
      createCanadaPostShipment(shipmentInput()),
    ).rejects.toMatchObject({
      code: "CANADA_POST_INVALID_RESPONSE",
      status: 502,
    });
  });

  it("treats a shipment network failure as uncertain and does not invite a new request", async () => {
    fetchMock.mockRejectedValue(new Error("network unavailable"));

    await expect(
      createCanadaPostShipment(shipmentInput()),
    ).rejects.toMatchObject({
      code: "CANADA_POST_SHIPMENT_UNCERTAIN",
      status: 503,
    });
  });

  it("rejects address fields that cannot fit on a label before calling Canada Post", async () => {
    await expect(
      createCanadaPostShipment({
        ...shipmentInput(),
        destination: {
          ...destination,
          addressLine1: "A".repeat(45),
        },
      }),
    ).rejects.toMatchObject({
      code: "CANADA_POST_ADDRESS_INVALID",
      status: 422,
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("validates downloaded label bytes instead of trusting a successful response", async () => {
    fetchMock.mockResolvedValue(
      new Response("not a pdf", {
        status: 200,
        headers: { "Content-Type": "application/pdf" },
      }),
    );

    await expect(
      getCanadaPostLabelArtifact({
        rel: "label",
        href: "https://ct.soa-gw.canadapost.ca/rs/artifact/label/123",
        mediaType: "application/pdf",
      }),
    ).rejects.toMatchObject({
      code: "CANADA_POST_INVALID_LABEL",
      status: 502,
    });
  });

  it("rejects a label that exceeds the private bucket size limit", async () => {
    fetchMock.mockResolvedValue(
      new Response("%PDF-" + "0".repeat(100), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Length": String(10 * 1024 * 1024 + 1),
        },
      }),
    );

    await expect(
      getCanadaPostLabelArtifact({
        rel: "label",
        href: "https://ct.soa-gw.canadapost.ca/rs/artifact/label/123",
        mediaType: "application/pdf",
      }),
    ).rejects.toMatchObject({
      code: "CANADA_POST_INVALID_LABEL",
      status: 502,
    });
  });

  it("uses the non-contract refund workflow when a label cannot be voided", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        `<non-contract-shipment-refund-request-info>
          <service-ticket-id>TICKET-123</service-ticket-id>
        </non-contract-shipment-refund-request-info>`,
        { status: 200 },
      ),
    );

    await expect(
      cancelCanadaPostShipment({
        selfUrl: "",
        refundUrl:
          "https://ct.soa-gw.canadapost.ca/rs/1234567/ncshipment/123/refund",
        email: "merchant@example.com",
      }),
    ).resolves.toEqual({
      status: "refund_pending",
      serviceTicketId: "TICKET-123",
    });
    const [, request] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(request.method).toBe("POST");
    expect(String(request.body)).toContain("<email>merchant@example.com</email>");
  });
});
