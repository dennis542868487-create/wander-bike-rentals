import { describe, expect, it } from "vitest";
import { fieldErrorPayload } from "@/lib/marketplace/field-errors";
import {
  listingInputSchema,
  marketplaceAccessInputSchema,
  profileInputSchema,
} from "@/lib/marketplace/schemas";

const validListing = {
  title: "Medium hybrid bike",
  description: "A comfortable hybrid bike that suits most riders in the city.",
  bikeType: "hybrid",
  offerMode: "rent",
  rentalDailyCents: 4500,
  pickupArea: "Steveston Village",
  pickupAddress: "12040 4th Ave, Richmond BC",
};

function parseListing(overrides: Record<string, unknown>) {
  const result = listingInputSchema.safeParse({ ...validListing, ...overrides });
  if (result.success) throw new Error("expected the listing to be rejected");
  return fieldErrorPayload(result.error);
}

describe("fieldErrorPayload", () => {
  it("names the field a too-short value came from", () => {
    // The reported bug: this used to surface Zod's raw
    // "Too small: expected string to have >=5 characters" with no field.
    const payload = parseListing({ pickupAddress: "12 A" });

    expect(payload.fieldErrors.pickupAddress).toBe(
      "Exact pickup address needs at least 5 characters.",
    );
    expect(payload.error).toContain("Exact pickup address");
    expect(payload.error).not.toContain("Too small");
  });

  it("reports every failing field, not just the first", () => {
    const payload = parseListing({ title: "ab", pickupArea: "x" });

    expect(payload.fieldErrors.title).toBe(
      "Listing title needs at least 3 characters.",
    );
    expect(payload.fieldErrors.pickupArea).toBe(
      "Public pickup area needs at least 2 characters.",
    );
    expect(payload.error).toMatch(/1 more field to fix/);
  });

  it("describes a too-long value with its limit", () => {
    const payload = parseListing({ brand: "b".repeat(81) });

    expect(payload.fieldErrors.brand).toBe("Brand can be at most 80 characters.");
  });

  it("describes a number out of range", () => {
    const payload = parseListing({ minimumRentalHours: 200 });

    expect(payload.fieldErrors.minimumRentalHours).toBe(
      "Minimum rental (hours) must be 168 or less.",
    );
  });

  it("reports a missing required field as required", () => {
    const payload = parseListing({ description: undefined });

    expect(payload.fieldErrors.description).toBe("Full description is required.");
  });

  it("names the field for an invalid option", () => {
    const payload = parseListing({ bikeType: "spaceship" });

    expect(payload.fieldErrors.bikeType).toBe(
      "Bike type is not one of the allowed options.",
    );
  });

  it("keeps a superRefine message and attaches it to its path", () => {
    const payload = parseListing({
      offerMode: "rent",
      rentalDailyCents: undefined,
      rentalHourlyCents: undefined,
    });

    expect(payload.fieldErrors.rentalDailyCents).toBe(
      "Daily price: Add an hourly or daily rental price.",
    );
  });

  it("works for the admin access schema", () => {
    const result = marketplaceAccessInputSchema.safeParse({
      status: "suspended",
    });
    if (result.success) throw new Error("expected rejection");
    const payload = fieldErrorPayload(result.error);

    expect(payload.fieldErrors.reason).toBe(
      "Reason: Add a reason before suspending marketplace access.",
    );
  });

  it("works for the profile schema", () => {
    const result = profileInputSchema.safeParse({ fullName: "" });
    if (result.success) throw new Error("expected rejection");
    const payload = fieldErrorPayload(result.error);

    expect(payload.fieldErrors.fullName).toBe("Full name is required.");
  });
});
