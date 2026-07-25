import { describe, expect, it } from "vitest";
import { getCartFulfillmentAvailability } from "@/lib/commerce/fulfillment-availability";

const standardLine = {
  quantity: 1,
  requiresShipping: true,
  pickupEligible: true,
  localDeliveryEligible: true,
  canadaPostEligible: true,
  shippingProfile: "standard" as const,
};

describe("cart fulfillment availability", () => {
  it("allows standard accessories to share a Canada Post parcel", () => {
    const result = getCartFulfillmentAvailability([
      standardLine,
      { ...standardLine, quantity: 2 },
    ]);

    expect(result.pickup.available).toBe(true);
    expect(result.localDelivery.available).toBe(true);
    expect(result.canadaPost.available).toBe(true);
  });

  it("requires a large item to ship by itself", () => {
    const result = getCartFulfillmentAvailability([
      { ...standardLine, shippingProfile: "large" },
      standardLine,
    ]);

    expect(result.canadaPost).toEqual({
      available: false,
      restriction: "large_item_separate_shipment",
    });
    expect(result.pickup.available).toBe(true);
    expect(result.localDelivery.available).toBe(true);
  });

  it("blocks automatic carrier checkout for special handling", () => {
    const result = getCartFulfillmentAvailability([
      {
        ...standardLine,
        canadaPostEligible: false,
        shippingProfile: "special",
      },
    ]);

    expect(result.canadaPost.available).toBe(false);
    expect(result.canadaPost.restriction).toBe("special_handling_required");
  });

  it("honours variant-specific pickup and local delivery restrictions", () => {
    const result = getCartFulfillmentAvailability([
      {
        ...standardLine,
        pickupEligible: false,
        localDeliveryEligible: false,
      },
    ]);

    expect(result.pickup.restriction).toBe("item_not_pickup_eligible");
    expect(result.localDelivery.restriction).toBe(
      "item_not_local_delivery_eligible",
    );
  });
});
