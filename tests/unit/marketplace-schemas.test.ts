import { describe, expect, it } from "vitest";
import {
  listingInputSchema,
  requestInputSchema,
} from "@/lib/marketplace/schemas";

const listing = {
  source: "community",
  title: "Medium city bike",
  shortDescription: "A comfortable city bike.",
  description:
    "A comfortable city bike in good condition with a rear rack and lock.",
  bikeType: "hybrid",
  condition: "good",
  offerMode: "rent_sale",
  rentalDailyCents: 4200,
  salePriceCents: 37500,
  minimumRentalHours: 2,
  pickupArea: "Steveston Village",
  pickupAddress: "12071 First Ave",
  city: "Richmond",
  province: "BC",
  includedItems: ["Helmet", "Lock"],
};

describe("bike listing input", () => {
  it("accepts independent rental and sale prices on one bike", () => {
    const parsed = listingInputSchema.parse(listing);
    expect(parsed.rentalDailyCents).toBe(4200);
    expect(parsed.salePriceCents).toBe(37500);
  });

  it("requires a rental price when the bike is offered for rent", () => {
    expect(
      listingInputSchema.safeParse({
        ...listing,
        offerMode: "rent",
        rentalDailyCents: undefined,
        salePriceCents: undefined,
      }).success,
    ).toBe(false);
  });

  it("requires a sale price when the bike can be bought", () => {
    expect(
      listingInputSchema.safeParse({
        ...listing,
        salePriceCents: undefined,
      }).success,
    ).toBe(false);
  });

  it("rejects availability dates in reverse order", () => {
    expect(
      listingInputSchema.safeParse({
        ...listing,
        availableFrom: "2026-08-20",
        availableUntil: "2026-08-10",
      }).success,
    ).toBe(false);
  });
});

describe("marketplace requests", () => {
  it("accepts a purchase inquiry without rental dates", () => {
    expect(
      requestInputSchema.safeParse({
        listingId: "10000000-0000-4000-8000-000000000001",
        intent: "buy",
        renterName: "River Chen",
      }).success,
    ).toBe(true);
  });

  it("requires ordered pickup and return times for a rental", () => {
    expect(
      requestInputSchema.safeParse({
        listingId: "10000000-0000-4000-8000-000000000001",
        intent: "rent",
        startsAt: "2027-08-20T18:00:00.000Z",
        endsAt: "2027-08-20T17:00:00.000Z",
        renterName: "River Chen",
      }).success,
    ).toBe(false);
  });
});
