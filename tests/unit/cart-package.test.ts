import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdmin: vi.fn(),
}));

import {
  buildCanadaPostPackage,
  type ResolvedCart,
  type ResolvedCartLine,
} from "@/lib/commerce/cart-server";

function cartLine(
  overrides: Partial<ResolvedCartLine> = {},
): ResolvedCartLine {
  return {
    variantId: 1001,
    productId: 1001,
    productName: "Sandbox parcel",
    variantTitle: "Default",
    sku: "TEST-PARCEL",
    quantity: 1,
    unitPriceCents: 1000,
    weightGrams: 1000,
    lengthCm: 30,
    widthCm: 20,
    heightCm: 10,
    pickupEligible: true,
    localDeliveryEligible: true,
    canadaPostEligible: true,
    shippingProfile: "standard",
    requiresShipping: true,
    available: 10,
    allowBackorder: false,
    trackInventory: true,
    ...overrides,
  };
}

function cart(items: ResolvedCartLine[]): ResolvedCart {
  return {
    locationId: 1,
    locationCode: "steveston",
    items,
  };
}

describe("Canada Post cart packaging", () => {
  it("normalizes the longest packed side as length", () => {
    expect(
      buildCanadaPostPackage(
        cart([
          cartLine({
            lengthCm: 10,
            widthCm: 30,
            heightCm: 20,
          }),
        ]),
      ),
    ).toMatchObject({
      weightKg: 1.15,
      lengthCm: 30,
      widthCm: 20,
      heightCm: 10,
    });
  });

  it("fails closed when combined items exceed length plus girth", () => {
    expect(() =>
      buildCanadaPostPackage(
        cart([
          cartLine({
            quantity: 2,
            lengthCm: 100,
            widthCm: 50,
            heightCm: 50,
          }),
        ]),
      ),
    ).toThrowError(
      expect.objectContaining({
        code: "CANADA_POST_PACKAGE_LIMIT_EXCEEDED",
        status: 422,
      }),
    );
  });

  it("includes packaging weight in the maximum parcel weight", () => {
    expect(() =>
      buildCanadaPostPackage(
        cart([
          cartLine({
            weightGrams: 29_900,
          }),
        ]),
      ),
    ).toThrowError(
      expect.objectContaining({
        code: "CANADA_POST_PACKAGE_LIMIT_EXCEEDED",
        status: 422,
      }),
    );
  });
});
