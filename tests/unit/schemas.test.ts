import { describe, expect, it } from "vitest";
import {
  adminStoreSettingsSchema,
  catalogTaxonomySchema,
  orderDetailsUpdateSchema,
  shippingLabelRequestSchema,
} from "@/lib/admin/schemas";
import {
  checkoutRequestSchema,
  formatCanadianPostalCode,
  normalizeCanadianPostalCode,
  shippingRateRequestSchema,
} from "@/lib/commerce/schemas";
import {
  getDefaultCommerceStoreSettings,
} from "@/lib/commerce/settings-defaults";
import { localDeliveryEligibility } from "@/lib/commerce/fulfillment";

describe("commerce input schemas", () => {
  it("normalizes and formats Canadian postal codes", () => {
    expect(normalizeCanadianPostalCode("v7e 3m1")).toBe("V7E3M1");
    expect(formatCanadianPostalCode("v7e-3m1")).toBe("V7E 3M1");
  });

  it("requires province, postal code, and bounded cart items for a rate", () => {
    expect(
      shippingRateRequestSchema.safeParse({
        postalCode: "V7E 3M1",
        province: "BC",
        items: [{ variantId: 1003, quantity: 2 }],
      }).success,
    ).toBe(true);
    expect(
      shippingRateRequestSchema.safeParse({
        postalCode: "90210",
        province: "BC",
        items: [{ variantId: 1003, quantity: 2 }],
      }).success,
    ).toBe(false);
  });

  it("requires a current quote for Canada Post checkout", () => {
    const base = {
      email: "rider@example.com",
      firstName: "River",
      lastName: "Chen",
      fulfillmentMethod: "canada_post",
      shippingAddress: {
        addressLine1: "1 Main Street",
        addressLine2: "",
        city: "Richmond",
        province: "BC",
        postalCode: "V7E 3M1",
        country: "CA",
      },
      items: [{ variantId: 1003, quantity: 1 }],
    };
    expect(checkoutRequestSchema.safeParse(base).success).toBe(false);
    expect(
      checkoutRequestSchema.safeParse({
        ...base,
        shippingQuoteId: "b31a3554-a682-43bf-bd68-4ee550f89db0",
      }).success,
    ).toBe(true);
  });

  it("validates package numbering for multi-parcel labels", () => {
    expect(
      shippingLabelRequestSchema.safeParse({
        idempotencyKey: "f76adf9f-a593-4d3d-833a-58bafba67ab2",
        package: {
          packageNumber: 2,
          packageCount: 1,
          weightKg: 1,
          lengthCm: 20,
          widthCm: 20,
          heightCm: 20,
        },
      }).success,
    ).toBe(false);
  });

  it("accepts a corrected Canadian delivery address for an unfulfilled order", () => {
    expect(
      orderDetailsUpdateSchema.safeParse({
        email: "rider@example.com",
        firstName: "River",
        lastName: "Chen",
        phone: "604-555-0123",
        customerNote: "Use the side entrance.",
        shippingAddress: {
          addressLine1: "12071 First Ave",
          addressLine2: "#101",
          city: "Richmond",
          province: "BC",
          postalCode: "V7E 3M1",
          country: "CA",
        },
      }).success,
    ).toBe(true);
  });

  it("rejects a non-Canadian order address", () => {
    expect(
      orderDetailsUpdateSchema.safeParse({
        email: "rider@example.com",
        firstName: "River",
        lastName: "Chen",
        phone: "",
        customerNote: "",
        shippingAddress: {
          addressLine1: "1 Main Street",
          addressLine2: "",
          city: "Seattle",
          province: "WA",
          postalCode: "98101",
          country: "US",
        },
      }).success,
    ).toBe(false);
  });
});

describe("operational settings", () => {
  it("keeps local delivery disabled by default", () => {
    const settings = getDefaultCommerceStoreSettings();
    expect(settings.localDelivery.enabled).toBe(false);
    expect(
      localDeliveryEligibility("V7E 3M1", settings.localDelivery).eligible,
    ).toBe(false);
  });

  it("matches local delivery using the configured FSA only", () => {
    const rules = {
      enabled: true,
      feeCents: 900,
      postalCodePrefixes: ["V7E", "V7C"],
    };
    expect(localDeliveryEligibility("V7E 3M1", rules).eligible).toBe(true);
    expect(localDeliveryEligibility("V6X 1A1", rules).eligible).toBe(false);
  });

  it("will not enable local delivery without a postal prefix", () => {
    const settings = getDefaultCommerceStoreSettings();
    expect(
      adminStoreSettingsSchema.safeParse({
        ...settings,
        localDelivery: {
          enabled: true,
          feeCents: 900,
          postalCodePrefixes: [],
        },
      }).success,
    ).toBe(false);
  });

  it("requires HTTPS for a brand website", () => {
    expect(
      catalogTaxonomySchema.safeParse({
        kind: "brand",
        id: null,
        slug: "safe-brand",
        name: "Safe Brand",
        description: "",
        websiteUrl: "http://example.com",
        isActive: true,
      }).success,
    ).toBe(false);
  });
});
