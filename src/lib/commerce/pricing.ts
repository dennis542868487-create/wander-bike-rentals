import type {
  ManualTaxRate,
  ShippingRuleSettings,
} from "@/lib/commerce/settings-types";

export function applyShippingRules(input: {
  providerAmountCents: number;
  subtotalCents: number;
  provider: "canada_post" | "local_delivery";
  rules: ShippingRuleSettings;
}) {
  if (
    input.rules.freeShippingThresholdCents !== null &&
    input.subtotalCents >= input.rules.freeShippingThresholdCents
  ) {
    return 0;
  }
  if (
    input.provider === "canada_post" &&
    input.rules.fixedCanadaPostFeeCents !== null
  ) {
    return input.rules.fixedCanadaPostFeeCents;
  }
  return input.providerAmountCents;
}

export function calculateManualTax(input: {
  subtotalCents: number;
  shippingCents: number;
  province: string;
  rates: ManualTaxRate[];
  enabled: boolean;
}) {
  if (!input.enabled) return 0;
  return input.rates
    .filter((rate) => rate.province === input.province)
    .reduce(
      (total, rate) =>
        total +
        Math.round(
          (input.subtotalCents +
            (rate.appliesToShipping ? input.shippingCents : 0)) *
            (rate.rateBps / 10_000),
        ),
      0,
    );
}

export function cartSubtotalCents(
  items: Array<{ unitPriceCents: number; quantity: number }>,
) {
  return items.reduce(
    (total, item) => total + item.unitPriceCents * item.quantity,
    0,
  );
}
