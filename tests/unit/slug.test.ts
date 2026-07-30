import { describe, expect, it } from "vitest";
import {
  slugifyListingTitle,
  uniqueListingSlug,
} from "@/lib/marketplace/slug";

describe("listing slugs", () => {
  it("normalizes listing titles to safe URL segments", () => {
    expect(slugifyListingTitle("  Vélo — City / Bike! ")).toBe(
      "velo-city-bike",
    );
  });

  it("adds a collision-resistant suffix", () => {
    expect(uniqueListingSlug("Blue Bike")).toMatch(/^blue-bike-[a-f0-9]{8}$/);
  });
});
