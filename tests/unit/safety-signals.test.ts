import { describe, expect, it } from "vitest";
import {
  imageNeedsAdminAttention,
  scanListingText,
  type ListingTextForSafety,
} from "@/lib/marketplace/safety-signals";

const cleanListing: ListingTextForSafety = {
  title: "Medium city bike",
  shortDescription: "Comfortable bike for Richmond paths.",
  description:
    "Well-maintained hybrid bike with a rear rack, fenders, and fresh brakes.",
  brand: "Giant",
  model: "Escape",
  frameSize: "Medium",
  pickupArea: "Steveston Village",
  availabilitySummary: "Weekends and weekday evenings",
  rentalRules: "Bring photo ID and inspect the bike at pickup.",
  includedItems: ["Helmet", "Lock"],
};

describe("listing text safety signals", () => {
  it("does not flag normal bike content", () => {
    expect(scanListingText(cleanListing)).toEqual([]);
  });

  it("creates an advisory signal without changing listing status", () => {
    const signals = scanListingText({
      ...cleanListing,
      description:
        "Message me on Telegram and pay deposit first before pickup.",
    });
    expect(signals.map((signal) => signal.category).sort()).toEqual([
      "contact_details",
      "external_payment",
    ]);
    expect(signals.every((signal) => signal.details.includes("remains live"))).toBe(
      true,
    );
  });

  it("flags public contact details but has no private address input", () => {
    const signals = scanListingText({
      ...cleanListing,
      rentalRules: "Email rider@example.com before requesting.",
    });
    expect(signals[0]?.matchedTerms).toContain("email address");
    expect(Object.keys(cleanListing)).not.toContain("pickupAddress");
  });
});

describe("image safety threshold", () => {
  it("sends a high-risk score to admin attention", () => {
    const result = imageNeedsAdminAttention([
      { className: "Drawing", probability: 0.02 },
      { className: "Hentai", probability: 0.02 },
      { className: "Neutral", probability: 0.2 },
      { className: "Porn", probability: 0.7 },
      { className: "Sexy", probability: 0.06 },
    ]);
    expect(result.attention).toBe(true);
  });

  it("does not flag a neutral image", () => {
    const result = imageNeedsAdminAttention([
      { className: "Drawing", probability: 0.02 },
      { className: "Hentai", probability: 0.01 },
      { className: "Neutral", probability: 0.94 },
      { className: "Porn", probability: 0.01 },
      { className: "Sexy", probability: 0.02 },
    ]);
    expect(result.attention).toBe(false);
  });
});
