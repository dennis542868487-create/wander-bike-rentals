import { describe, expect, it } from "vitest";
import {
  applyShippingRules,
  calculateManualTax,
  cartSubtotalCents,
} from "@/lib/commerce/pricing";

describe("commerce pricing", () => {
  it("calculates a cart subtotal from server-resolved lines", () => {
    expect(
      cartSubtotalCents([
        { unitPriceCents: 8900, quantity: 2 },
        { unitPriceCents: 4900, quantity: 1 },
      ]),
    ).toBe(22_700);
  });

  it("uses a free-shipping threshold before a fixed carrier fee", () => {
    expect(
      applyShippingRules({
        providerAmountCents: 2200,
        subtotalCents: 15_000,
        provider: "canada_post",
        rules: {
          freeShippingThresholdCents: 10_000,
          fixedCanadaPostFeeCents: 1200,
        },
      }),
    ).toBe(0);
  });

  it("uses a fixed Canada Post customer fee below the threshold", () => {
    expect(
      applyShippingRules({
        providerAmountCents: 2200,
        subtotalCents: 9000,
        provider: "canada_post",
        rules: {
          freeShippingThresholdCents: 10_000,
          fixedCanadaPostFeeCents: 1200,
        },
      }),
    ).toBe(1200);
  });

  it("does not apply a Canada Post fixed fee to local delivery", () => {
    expect(
      applyShippingRules({
        providerAmountCents: 900,
        subtotalCents: 5000,
        provider: "local_delivery",
        rules: {
          freeShippingThresholdCents: null,
          fixedCanadaPostFeeCents: 1200,
        },
      }),
    ).toBe(900);
  });

  it("calculates and rounds configured manual tax components", () => {
    expect(
      calculateManualTax({
        subtotalCents: 10_001,
        shippingCents: 999,
        province: "BC",
        enabled: true,
        rates: [
          {
            province: "BC",
            label: "GST",
            rateBps: 500,
            appliesToShipping: true,
          },
          {
            province: "BC",
            label: "PST",
            rateBps: 700,
            appliesToShipping: false,
          },
          {
            province: "ON",
            label: "HST",
            rateBps: 1300,
            appliesToShipping: true,
          },
        ],
      }),
    ).toBe(1250);
  });

  it("returns zero tax while the merchant tax switch is disabled", () => {
    expect(
      calculateManualTax({
        subtotalCents: 100_000,
        shippingCents: 2000,
        province: "BC",
        enabled: false,
        rates: [
          {
            province: "BC",
            label: "GST + PST",
            rateBps: 1200,
            appliesToShipping: true,
          },
        ],
      }),
    ).toBe(0);
  });
});
