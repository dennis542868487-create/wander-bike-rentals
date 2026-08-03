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
  tireSize: "700C",
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

  it("accepts one character in the full description and optional summary/items", () => {
    const parsed = listingInputSchema.parse({
      ...listing,
      shortDescription: "",
      description: "x",
      includedItems: undefined,
    });

    expect(parsed.shortDescription).toBeUndefined();
    expect(parsed.description).toBe("x");
    expect(parsed.includedItems).toEqual([]);
  });

  it("does not cap short summaries or full descriptions", () => {
    const parsed = listingInputSchema.parse({
      ...listing,
      shortDescription: "s".repeat(500),
      description: "d".repeat(6_000),
    });

    expect(parsed.shortDescription).toHaveLength(500);
    expect(parsed.description).toHaveLength(6_000);
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
