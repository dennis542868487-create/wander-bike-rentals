import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const canadaPostTestState = vi.hoisted(() => ({
  credentialVersion: 0,
  environment: {
    COMMERCE_SANDBOX_MODE: true,
    CANADA_POST_API_KEY: "sandbox-key-0",
    CANADA_POST_API_SECRET: "sandbox-secret",
    CANADA_POST_ENVIRONMENT: "test" as const,
    CANADA_POST_ACCOUNT_TYPE: "non_contract" as "contract" | "non_contract",
    CANADA_POST_CUSTOMER_NUMBER: "0001289996",
    CANADA_POST_MOBO_CUSTOMER_NUMBER: undefined as string | undefined,
    CANADA_POST_CONTRACT_ID: undefined as string | undefined,
    CANADA_POST_GROUP_ID: undefined as string | undefined,
    CANADA_POST_API_BASE:
      "https://api.canadapost-postescanada.ca/prod/devportal-portaildesdeveloppeurs",
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
  getCanadaPostLabelCost,
  getCanadaPostRates,
} from "@/lib/canada-post/client";

const apiBase =
  "https://api.canadapost-postescanada.ca/prod/devportal-portaildesdeveloppeurs";
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

function tokenResponse(token = "test-access-token") {
  return new Response(
    JSON.stringify({
      token_type: "Bearer",
      access_token: token,
      scope: "merchant",
      expires_in: 3600,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
}

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function ratePayload() {
  return [
    {
      serviceCode: "DOM.XP",
      serviceName: "Xpresspost",
      priceDetails: { due: 18.75 },
      serviceStandard: {
        expectedTransitTime: 2,
        expectedDeliveryDate: "2026-07-29T00:00:00.000Z",
      },
    },
    {
      serviceCode: "DOM.EP",
      serviceName: "Expedited Parcel",
      priceDetails: { due: 12.34 },
      serviceStandard: {
        expectedTransitTime: 4,
      },
    },
  ];
}

function shipmentPayload(
  labelHref = `${apiBase}/shipping/v1/artifacts/12746/shipping/7634654/0`,
) {
  return {
    customerRequestId: "WB-TEST-REQUEST-1001",
    shipmentId: "123456789",
    shipmentStatus: "created",
    trackingPin: "1234567890123456",
    links: [
      {
        rel: "self",
        href: `${apiBase}/shipping/v1/0001289996/0001289996/shipments/123456789`,
        mediaType: "application/json",
      },
      {
        rel: "price",
        href: `${apiBase}/shipping/v1/0001289996/0001289996/shipments/123456789/price`,
        mediaType: "application/json",
      },
      {
        rel: "label",
        href: labelHref,
        mediaType: "application/pdf",
      },
    ],
  };
}

describe("Canada Post test-app client", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    canadaPostTestState.credentialVersion += 1;
    canadaPostTestState.environment.CANADA_POST_API_KEY = `sandbox-key-${canadaPostTestState.credentialVersion}`;
    canadaPostTestState.environment.CANADA_POST_API_SECRET = "sandbox-secret";
    canadaPostTestState.environment.CANADA_POST_ENVIRONMENT = "test";
    canadaPostTestState.environment.CANADA_POST_ACCOUNT_TYPE = "non_contract";
    canadaPostTestState.environment.CANADA_POST_CUSTOMER_NUMBER = "0001289996";
    canadaPostTestState.environment.CANADA_POST_MOBO_CUSTOMER_NUMBER =
      undefined;
    canadaPostTestState.environment.CANADA_POST_CONTRACT_ID = undefined;
    canadaPostTestState.environment.CANADA_POST_GROUP_ID = undefined;
    canadaPostTestState.environment.CANADA_POST_API_BASE = apiBase;
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("gets an OAuth token, normalizes postal codes, and sorts JSON rates", async () => {
    fetchMock
      .mockResolvedValueOnce(tokenResponse())
      .mockResolvedValueOnce(jsonResponse(ratePayload()));

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
    expect(result.rates[1].expectedDeliveryDate).toBe("2026-07-29");

    const [tokenUrl, tokenRequest] = fetchMock.mock.calls[0] as [
      string,
      RequestInit,
    ];
    expect(tokenUrl).toBe(
      `${apiBase}/cpc-api-native-oauth-provider/oauth2/token`,
    );
    expect(String(tokenRequest.body)).toContain(
      "grant_type=client_credentials",
    );
    expect(tokenRequest.headers).toMatchObject({
      "X-IBM-Client-Id": canadaPostTestState.environment.CANADA_POST_API_KEY,
      "X-IBM-Client-Secret": "sandbox-secret",
    });

    const [rateUrl, rateRequest] = fetchMock.mock.calls[1] as [
      string,
      RequestInit,
    ];
    expect(rateUrl).toBe(`${apiBase}/rating/v1/prices`);
    expect(rateRequest.headers).toMatchObject({
      Authorization: "Bearer test-access-token",
    });
    expect(JSON.parse(String(rateRequest.body))).toMatchObject({
      customerNumber: "0001289996",
      quoteType: "commercial",
      originPostalCode: "V7E3M1",
      destination: { domestic: { postalCode: "V6B1A1" } },
    });
  });

  it("reuses an unexpired OAuth token across sequential requests", async () => {
    fetchMock
      .mockResolvedValueOnce(tokenResponse())
      .mockResolvedValueOnce(jsonResponse(ratePayload()))
      .mockResolvedValueOnce(jsonResponse(ratePayload()));

    const input = {
      originPostalCode: "V7E 3M1",
      destinationPostalCode: "V6B 1A1",
      package: {
        weightKg: 1.25,
        lengthCm: 30,
        widthCm: 20,
        heightCm: 10,
        packagingAllowanceGrams: 250,
      },
    };
    await getCanadaPostRates(input);
    await getCanadaPostRates(input);

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[1]?.[0]).toBe(`${apiBase}/rating/v1/prices`);
    expect(fetchMock.mock.calls[2]?.[0]).toBe(`${apiBase}/rating/v1/prices`);
  });

  it("retries one transient OAuth network failure before calling the API", async () => {
    fetchMock
      .mockRejectedValueOnce(new Error("temporary network failure"))
      .mockResolvedValueOnce(tokenResponse())
      .mockResolvedValueOnce(jsonResponse(ratePayload()));

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
    ).resolves.toMatchObject({ rates: expect.any(Array) });

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      `${apiBase}/cpc-api-native-oauth-provider/oauth2/token`,
    );
    expect(fetchMock.mock.calls[1]?.[0]).toBe(
      `${apiBase}/cpc-api-native-oauth-provider/oauth2/token`,
    );
    expect(fetchMock.mock.calls[2]?.[0]).toBe(`${apiBase}/rating/v1/prices`);
  });

  it("refreshes the token once after an authenticated request returns 401", async () => {
    fetchMock
      .mockResolvedValueOnce(tokenResponse("expired-token"))
      .mockResolvedValueOnce(jsonResponse({ httpMessage: "Unauthorized" }, 401))
      .mockResolvedValueOnce(tokenResponse("fresh-token"))
      .mockResolvedValueOnce(jsonResponse(ratePayload()));

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
    ).resolves.toMatchObject({ rates: expect.any(Array) });

    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(fetchMock.mock.calls[3]?.[1]?.headers).toMatchObject({
      Authorization: "Bearer fresh-token",
    });
  });

  it("normalizes the longest parcel side as length", async () => {
    fetchMock
      .mockResolvedValueOnce(tokenResponse())
      .mockResolvedValueOnce(jsonResponse(ratePayload()));

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

    const request = fetchMock.mock.calls[1]?.[1] as RequestInit;
    expect(JSON.parse(String(request.body))).toMatchObject({
      parcelCharacteristics: {
        dimensions: {
          length: 30,
          width: 20,
          height: 10,
        },
      },
    });
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

  it("refuses a Canada Post host outside the exact test-app API root", async () => {
    canadaPostTestState.environment.CANADA_POST_API_BASE =
      "https://api.canadapost-postescanada.ca/prod/other";

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

  it("builds a non-contract JSON shipment and derives its refund link", async () => {
    fetchMock
      .mockResolvedValueOnce(tokenResponse())
      .mockResolvedValueOnce(jsonResponse(shipmentPayload()));

    const result = await createCanadaPostShipment(shipmentInput());

    expect(result).toMatchObject({
      shipmentId: "123456789",
      trackingPin: "1234567890123456",
      labelLink: {
        rel: "label",
        mediaType: "application/pdf",
      },
      refundLink: {
        rel: "refund",
        href: `${apiBase}/shipping/v1/0001289996/0001289996/shipments/123456789/refund`,
      },
    });

    const [url, request] = fetchMock.mock.calls[1] as [string, RequestInit];
    expect(url).toBe(`${apiBase}/shipping/v1/0001289996/0001289996/shipments`);
    expect(JSON.parse(String(request.body))).toMatchObject({
      customerRequestId: "WB-TEST-REQUEST-1001",
      transmitShipment: true,
      requestedShippingPoint: "V7E3M1",
      deliverySpec: {
        serviceCode: "DOM.EP",
        sender: {
          addressDetails: { postalZipCode: "V7E3M1" },
        },
        destination: {
          addressDetails: { postalZipCode: "V6B1A1" },
        },
        settlementInfo: {
          paidByCustomer: "0001289996",
          intendedMethodOfPayment: "CreditCard",
        },
      },
    });
    expect(JSON.parse(String(request.body))).not.toHaveProperty(
      "providePricingInfo",
    );
  });

  it("uses group and account settlement fields for a contract shipment", async () => {
    canadaPostTestState.environment.CANADA_POST_ACCOUNT_TYPE = "contract";
    canadaPostTestState.environment.CANADA_POST_CONTRACT_ID = "0041596528";
    canadaPostTestState.environment.CANADA_POST_GROUP_ID = "WANDER-BIKE";
    fetchMock
      .mockResolvedValueOnce(tokenResponse())
      .mockResolvedValueOnce(jsonResponse(shipmentPayload()));

    await createCanadaPostShipment(shipmentInput());

    const request = fetchMock.mock.calls[1]?.[1] as RequestInit;
    const body = JSON.parse(String(request.body));
    expect(body).toMatchObject({
      groupId: "WANDER-BIKE",
      deliverySpec: {
        settlementInfo: {
          paidByCustomer: "0001289996",
          contractId: "0041596528",
          intendedMethodOfPayment: "Account",
        },
      },
    });
    expect(body).not.toHaveProperty("transmitShipment");
  });

  it("blocks a provider resource link that leaves the allowed API host", async () => {
    fetchMock
      .mockResolvedValueOnce(tokenResponse())
      .mockResolvedValueOnce(
        jsonResponse(shipmentPayload("https://attacker.example/label.pdf")),
      );

    await expect(
      createCanadaPostShipment(shipmentInput()),
    ).rejects.toMatchObject({
      code: "CANADA_POST_INVALID_RESPONSE",
      status: 502,
    });
  });

  it("blocks a provider resource link on a different port", async () => {
    fetchMock
      .mockResolvedValueOnce(tokenResponse())
      .mockResolvedValueOnce(
        jsonResponse(
          shipmentPayload(
            "https://api.canadapost-postescanada.ca:444/prod/devportal-portaildesdeveloppeurs/shipping/v1/artifacts/1/shipping/2/0",
          ),
        ),
      );

    await expect(
      createCanadaPostShipment(shipmentInput()),
    ).rejects.toMatchObject({
      code: "CANADA_POST_INVALID_RESPONSE",
      status: 502,
    });
  });

  it("treats a shipment network failure as uncertain", async () => {
    fetchMock
      .mockResolvedValueOnce(tokenResponse())
      .mockRejectedValueOnce(new Error("network unavailable"));

    await expect(
      createCanadaPostShipment(shipmentInput()),
    ).rejects.toMatchObject({
      code: "CANADA_POST_SHIPMENT_UNCERTAIN",
      status: 503,
    });
  });

  it("rejects address fields that cannot fit on a label before fetching", async () => {
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

  it("validates downloaded label bytes instead of trusting a 200", async () => {
    fetchMock.mockResolvedValueOnce(tokenResponse()).mockResolvedValueOnce(
      new Response("not a pdf", {
        status: 200,
        headers: { "Content-Type": "application/pdf" },
      }),
    );

    await expect(
      getCanadaPostLabelArtifact({
        rel: "label",
        href: `${apiBase}/shipping/v1/artifacts/1/shipping/2/0`,
        mediaType: "application/pdf",
      }),
    ).rejects.toMatchObject({
      code: "CANADA_POST_INVALID_LABEL",
      status: 502,
    });
  });

  it("rejects a label that exceeds the private bucket size limit", async () => {
    fetchMock.mockResolvedValueOnce(tokenResponse()).mockResolvedValueOnce(
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
        href: `${apiBase}/shipping/v1/artifacts/1/shipping/2/0`,
        mediaType: "application/pdf",
      }),
    ).rejects.toMatchObject({
      code: "CANADA_POST_INVALID_LABEL",
      status: 502,
    });
  });

  it("reads the JSON shipment due amount in cents", async () => {
    fetchMock
      .mockResolvedValueOnce(tokenResponse())
      .mockResolvedValueOnce(jsonResponse({ dueAmount: 35.7 }));

    await expect(
      getCanadaPostLabelCost({
        rel: "price",
        href: `${apiBase}/shipping/v1/0001289996/0001289996/shipments/123/price`,
        mediaType: "application/json",
      }),
    ).resolves.toBe(3570);
  });

  it("falls back from void to the JSON refund workflow", async () => {
    fetchMock
      .mockResolvedValueOnce(tokenResponse())
      .mockResolvedValueOnce(
        jsonResponse(
          {
            title: "Validation failed",
            errors: [
              {
                errorCode: "8064",
                message: "The shipment is already processed.",
              },
            ],
          },
          400,
        ),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          serviceTicketDate: "2026-07-25",
          serviceTicketId: "TICKET-123",
        }),
      );

    await expect(
      cancelCanadaPostShipment({
        selfUrl: `${apiBase}/shipping/v1/0001289996/0001289996/shipments/123`,
        refundUrl: `${apiBase}/shipping/v1/0001289996/0001289996/shipments/123/refund`,
        email: "merchant@example.com",
      }),
    ).resolves.toEqual({
      status: "refund_pending",
      serviceTicketId: "TICKET-123",
    });

    expect(fetchMock.mock.calls[1]?.[1]?.method).toBe("DELETE");
    expect(JSON.parse(String(fetchMock.mock.calls[2]?.[1]?.body))).toEqual({
      email: "merchant@example.com",
    });
  });
});
