import { describe, expect, it } from "vitest";
import { demoListings } from "@/lib/marketplace/demo-data";
import {
  formatCad,
  listingPriceLines,
  offerModeLabel,
} from "@/lib/marketplace/format";

describe("per-bike prices", () => {
  it("keeps different bikes at different prices", () => {
    const [first, second] = demoListings;
    expect(first.rentalDailyCents).not.toBe(second.rentalDailyCents);
    expect(listingPriceLines(first)).toEqual(
      expect.arrayContaining([
        { label: "day", value: "$45" },
        { label: "buy", value: "$485" },
      ]),
    );
  });

  it("formats CAD without invented platform fees", () => {
    expect(formatCad(4250)).toBe("$42.50");
    expect(offerModeLabel("rent_sale")).toBe("Rent or buy");
  });
});
