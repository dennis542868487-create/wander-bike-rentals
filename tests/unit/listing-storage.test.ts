import { describe, expect, it } from "vitest";
import {
  prepareListingStorage,
  readListingStorage,
} from "../../src/lib/marketplace/listing-storage";

describe("listing storage compatibility", () => {
  it("round-trips a one-character description through the legacy constraint", () => {
    const stored = prepareListingStorage({
      shortDescription: "A",
      description: "B",
      tireSize: undefined,
      includedItems: [],
    });

    expect(stored.description).toHaveLength(20);
    expect(
      readListingStorage({
        shortDescription: stored.shortDescription,
        description: stored.description,
        includedItems: stored.includedItems,
      }),
    ).toMatchObject({
      shortDescription: "A",
      description: "B",
    });
  });

  it("preserves unlimited copy and tire size without exposing metadata", () => {
    const shortDescription = "S".repeat(320);
    const description = "D".repeat(6_200);
    const stored = prepareListingStorage({
      shortDescription,
      description,
      tireSize: '26 × 1.95"',
      includedItems: ["Helmet", "Lock"],
    });

    expect(stored.shortDescription).toHaveLength(240);
    expect(stored.description).toHaveLength(5_000);
    expect(stored.includedItems).toHaveLength(3);
    expect(
      readListingStorage({
        shortDescription: stored.shortDescription,
        description: stored.description,
        includedItems: stored.includedItems,
      }),
    ).toEqual({
      shortDescription,
      description,
      tireSize: '26 × 1.95"',
      includedItems: ["Helmet", "Lock"],
    });
  });

  it("continues to read the native tire-size column when available", () => {
    expect(
      readListingStorage({
        shortDescription: null,
        description: "A regular description",
        tireSize: '700 × 35C',
        includedItems: [],
      }).tireSize,
    ).toBe('700 × 35C');
  });
});
