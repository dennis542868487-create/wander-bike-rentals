import type { ShippingProfile } from "@/lib/commerce/types";

export type FulfillmentAvailabilityLine = {
  quantity: number;
  requiresShipping: boolean;
  pickupEligible: boolean;
  localDeliveryEligible: boolean;
  canadaPostEligible: boolean;
  shippingProfile: ShippingProfile;
};

export type FulfillmentRestriction =
  | "no_shippable_items"
  | "item_not_pickup_eligible"
  | "item_not_local_delivery_eligible"
  | "item_not_canada_post_eligible"
  | "special_handling_required"
  | "large_item_separate_shipment";

type MethodAvailability = {
  available: boolean;
  restriction: FulfillmentRestriction | null;
};

export type CartFulfillmentAvailability = {
  pickup: MethodAvailability;
  localDelivery: MethodAvailability;
  canadaPost: MethodAvailability;
};

export function getCartFulfillmentAvailability(
  lines: FulfillmentAvailabilityLine[],
): CartFulfillmentAvailability {
  const shippable = lines.filter((line) => line.requiresShipping);
  const shippableUnitCount = shippable.reduce(
    (total, line) => total + line.quantity,
    0,
  );

  const pickupRestricted = lines.some((line) => !line.pickupEligible);
  const localDeliveryRestricted = lines.some(
    (line) => !line.localDeliveryEligible,
  );
  const canadaPostRestricted = shippable.some(
    (line) => !line.canadaPostEligible,
  );
  const specialHandlingRequired = shippable.some(
    (line) => line.shippingProfile === "special",
  );
  const largeItemConflict =
    shippable.some((line) => line.shippingProfile === "large") &&
    shippableUnitCount > 1;

  let canadaPostRestriction: FulfillmentRestriction | null = null;
  if (shippable.length === 0) {
    canadaPostRestriction = "no_shippable_items";
  } else if (specialHandlingRequired) {
    canadaPostRestriction = "special_handling_required";
  } else if (largeItemConflict) {
    canadaPostRestriction = "large_item_separate_shipment";
  } else if (canadaPostRestricted) {
    canadaPostRestriction = "item_not_canada_post_eligible";
  }

  return {
    pickup: {
      available: !pickupRestricted,
      restriction: pickupRestricted ? "item_not_pickup_eligible" : null,
    },
    localDelivery: {
      available: !localDeliveryRestricted,
      restriction: localDeliveryRestricted
        ? "item_not_local_delivery_eligible"
        : null,
    },
    canadaPost: {
      available: canadaPostRestriction === null,
      restriction: canadaPostRestriction,
    },
  };
}
