import { describe, expect, it } from "vitest";
import {
  applyWanderShopListingDefaults,
  WANDER_SHOP_DIRECTIONS_URL,
  WANDER_SHOP_LISTING_DEFAULTS,
} from "@/lib/marketplace/wander-shop";

describe("Wander shop listing defaults", () => {
  it("overrides submitted pickup details with the fixed shop values", () => {
    const listing = applyWanderShopListingDefaults({
      title: "Shop bike",
      pickupArea: "Wrong area",
      pickupAddress: "Wrong address",
      city: "Wrong city",
      province: "Wrong province",
      availableFrom: "2030-01-01",
      availableUntil: "2030-01-02",
      availabilitySummary: "Wrong hours",
    });

    expect(listing.title).toBe("Shop bike");
    expect(listing.pickupArea).toBe(
      WANDER_SHOP_LISTING_DEFAULTS.pickupArea,
    );
    expect(listing.pickupAddress).toBe(
      "12071 First Ave #101, Richmond, BC V7E 3M1",
    );
    expect(listing.availableFrom).toBeUndefined();
    expect(listing.availableUntil).toBeUndefined();
    expect(listing.availabilitySummary).toBe(
      "Open daily 9:00 AM–10:00 PM",
    );
  });

  it("links directly to Google Maps directions for the shop", () => {
    expect(WANDER_SHOP_DIRECTIONS_URL).toContain("google.com/maps/dir");
    expect(WANDER_SHOP_DIRECTIONS_URL).toContain("12071+First+Ave");
  });
});
