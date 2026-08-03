export const WANDER_SHOP_LISTING_DEFAULTS = {
  pickupArea: "Wander Bike Rentals · Steveston",
  pickupAddress: "12071 First Ave #101, Richmond, BC V7E 3M1",
  postalCode: "V7E 3M1",
  pickupInstructions:
    "Pick up at Wander Bike Rentals after your request is confirmed.",
  city: "Richmond",
  province: "BC",
  availableFrom: undefined,
  availableUntil: undefined,
  availabilitySummary: "Open daily 9:00 AM–10:00 PM",
} as const;

export const WANDER_SHOP_DIRECTIONS_URL =
  "https://www.google.com/maps/dir/?api=1&destination=12071+First+Ave+%23101%2C+Richmond%2C+BC+V7E+3M1";

export function applyWanderShopListingDefaults<
  T extends Record<string, unknown>,
>(listing: T) {
  return {
    ...listing,
    ...WANDER_SHOP_LISTING_DEFAULTS,
  };
}
