import "server-only";

import { z } from "zod";
import {
  canadianProvinceCodes,
  storeDayKeys,
  type CommerceStoreSettings,
} from "@/lib/commerce/settings-types";
import { normalizeCanadianPostalCode } from "@/lib/commerce/schemas";
import { defaultCommerceStoreSettings as defaults } from "@/lib/commerce/settings-defaults";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const provinceSchema = z.enum(canadianProvinceCodes);
const postalCodeSchema = z
  .string()
  .transform(normalizeCanadianPostalCode)
  .pipe(z.string().regex(/^[A-Z]\d[A-Z]\d[A-Z]\d$/));
const fsaSchema = z
  .string()
  .transform(normalizeCanadianPostalCode)
  .pipe(z.string().regex(/^[ABCEGHJ-NPRSTVXY]\d[A-Z]$/));
const timeSchema = z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/);

const profileSchema = z.object({
  display_name: z.string().trim().min(1).max(160),
  phone: z.string().trim().min(7).max(40),
  customer_email: z.string().trim().max(320),
  address_line_1: z.string().trim().min(2).max(160),
  address_line_2: z.string().trim().max(160),
  city: z.string().trim().min(2).max(100),
  province: provinceSchema,
  postal_code: postalCodeSchema,
  country: z.literal("CA"),
});

const shippingOriginSchema = z.object({
  company: z.string().trim().min(1).max(160),
  contact: z.string().trim().min(1).max(160),
  phone: z.string().trim().min(7).max(40),
  address_line_1: z.string().trim().min(2).max(160),
  address_line_2: z.string().trim().max(160),
  city: z.string().trim().min(2).max(100),
  province: provinceSchema,
  postal_code: postalCodeSchema,
  country: z.literal("CA"),
});

const hoursSchema = z.object({
  timezone: z.literal("America/Vancouver"),
  note: z.string().trim().max(500),
  days: z
    .array(
      z.object({
        day: z.enum(storeDayKeys),
        closed: z.boolean(),
        open: timeSchema,
        close: timeSchema,
      }),
    )
    .length(7),
});

const pickupInstructionsSchema = z.object({
  instructions: z.string().trim().max(2000),
});

const salesRegionsSchema = z.object({
  countries: z.tuple([z.literal("CA")]),
  provinces: z.array(provinceSchema).min(1).max(canadianProvinceCodes.length),
});

const localDeliverySchema = z.object({
  enabled: z.boolean(),
  fee_cents: z.number().int().min(0).max(10_000_000),
  postal_code_prefixes: z.array(fsaSchema).max(200),
});

const shippingRulesSchema = z.object({
  free_shipping_threshold_cents: z.number().int().min(0).max(100_000_000).nullable(),
  fixed_canada_post_fee_cents: z.number().int().min(0).max(10_000_000).nullable(),
});

const taxSchema = z.object({
  provider: z.literal("manual"),
  enabled: z.boolean(),
  registration_number: z.string().trim().max(100),
  rates: z
    .array(
      z.object({
        province: provinceSchema,
        label: z.string().trim().min(1).max(80),
        rate_bps: z.number().int().min(0).max(5000),
        applies_to_shipping: z.boolean(),
      }),
    )
    .max(canadianProvinceCodes.length),
});

const notificationSchema = z.object({
  email: z.string().trim().max(320),
});

const policySchema = z.object({
  text: z.string().trim().max(20_000),
});

function parsedOr<T>(schema: z.ZodType<T>, value: unknown, fallback: T): T {
  const result = schema.safeParse(value);
  return result.success ? result.data : fallback;
}

function booleanValue(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

export async function getCommerceStoreSettings(): Promise<CommerceStoreSettings> {
  const result = await getSupabaseAdmin()
    .from("store_settings")
    .select("key, value")
    .in("key", [
      "commerce.sandbox_mode",
      "commerce.checkout_enabled",
      "store.profile",
      "store.hours",
      "fulfillment.pickup_enabled",
      "fulfillment.pickup_instructions",
      "fulfillment.sales_regions",
      "fulfillment.local_delivery",
      "fulfillment.canada_post_enabled",
      "fulfillment.shipping_origin",
      "fulfillment.shipping_rules",
      "tax.mode",
      "notifications.order_email",
      "policy.shipping",
      "policy.refund",
      "policy.return",
    ]);

  if (result.error) {
    throw new Error("Commerce settings are unavailable.");
  }

  const values = new Map(
    (result.data ?? []).map((row) => [String(row.key), row.value]),
  );
  const profile = parsedOr(
    profileSchema,
    values.get("store.profile"),
    {
      display_name: defaults.profile.displayName,
      phone: defaults.profile.phone,
      customer_email: defaults.profile.customerEmail,
      address_line_1: defaults.profile.addressLine1,
      address_line_2: defaults.profile.addressLine2,
      city: defaults.profile.city,
      province: defaults.profile.province,
      postal_code: defaults.profile.postalCode,
      country: "CA" as const,
    },
  );
  const origin = parsedOr(
    shippingOriginSchema,
    values.get("fulfillment.shipping_origin"),
    {
      company: defaults.shippingOrigin.company,
      contact: defaults.shippingOrigin.contact,
      phone: defaults.shippingOrigin.phone,
      address_line_1: defaults.shippingOrigin.addressLine1,
      address_line_2: defaults.shippingOrigin.addressLine2,
      city: defaults.shippingOrigin.city,
      province: defaults.shippingOrigin.province,
      postal_code: defaults.shippingOrigin.postalCode,
      country: "CA" as const,
    },
  );
  const hours = parsedOr(hoursSchema, values.get("store.hours"), defaults.hours);
  const pickup = parsedOr(
    pickupInstructionsSchema,
    values.get("fulfillment.pickup_instructions"),
    { instructions: defaults.pickupInstructions },
  );
  const regions = parsedOr(
    salesRegionsSchema,
    values.get("fulfillment.sales_regions"),
    { countries: ["CA"] as ["CA"], provinces: defaults.salesProvinces },
  );
  const localDelivery = parsedOr(
    localDeliverySchema,
    values.get("fulfillment.local_delivery"),
    {
      enabled: defaults.localDelivery.enabled,
      fee_cents: defaults.localDelivery.feeCents,
      postal_code_prefixes: defaults.localDelivery.postalCodePrefixes,
    },
  );
  const shippingRules = parsedOr(
    shippingRulesSchema,
    values.get("fulfillment.shipping_rules"),
    {
      free_shipping_threshold_cents:
        defaults.shippingRules.freeShippingThresholdCents,
      fixed_canada_post_fee_cents:
        defaults.shippingRules.fixedCanadaPostFeeCents,
    },
  );
  const tax = parsedOr(taxSchema, values.get("tax.mode"), {
    provider: "manual" as const,
    enabled: defaults.tax.enabled,
    registration_number: defaults.tax.registrationNumber,
    rates: [],
  });
  const notification = parsedOr(
    notificationSchema,
    values.get("notifications.order_email"),
    { email: defaults.notificationEmail },
  );

  return {
    sandboxMode: booleanValue(
      values.get("commerce.sandbox_mode"),
      defaults.sandboxMode,
    ),
    checkoutEnabled: booleanValue(
      values.get("commerce.checkout_enabled"),
      defaults.checkoutEnabled,
    ),
    profile: {
      displayName: profile.display_name,
      phone: profile.phone,
      customerEmail: profile.customer_email,
      addressLine1: profile.address_line_1,
      addressLine2: profile.address_line_2,
      city: profile.city,
      province: profile.province,
      postalCode: profile.postal_code,
      country: "CA",
    },
    hours,
    pickupEnabled: booleanValue(
      values.get("fulfillment.pickup_enabled"),
      defaults.pickupEnabled,
    ),
    pickupInstructions: pickup.instructions,
    salesProvinces: regions.provinces,
    localDelivery: {
      enabled: localDelivery.enabled,
      feeCents: localDelivery.fee_cents,
      postalCodePrefixes: localDelivery.postal_code_prefixes,
    },
    canadaPostEnabled: booleanValue(
      values.get("fulfillment.canada_post_enabled"),
      defaults.canadaPostEnabled,
    ),
    shippingOrigin: {
      company: origin.company,
      contact: origin.contact,
      phone: origin.phone,
      addressLine1: origin.address_line_1,
      addressLine2: origin.address_line_2,
      city: origin.city,
      province: origin.province,
      postalCode: origin.postal_code,
      country: "CA",
    },
    shippingRules: {
      freeShippingThresholdCents:
        shippingRules.free_shipping_threshold_cents,
      fixedCanadaPostFeeCents:
        shippingRules.fixed_canada_post_fee_cents,
    },
    tax: {
      provider: "manual",
      enabled: tax.enabled,
      registrationNumber: tax.registration_number,
      rates: tax.rates.map((rate) => ({
        province: rate.province,
        label: rate.label,
        rateBps: rate.rate_bps,
        appliesToShipping: rate.applies_to_shipping,
      })),
    },
    notificationEmail: notification.email,
    policies: {
      shipping: parsedOr(
        policySchema,
        values.get("policy.shipping"),
        { text: defaults.policies.shipping },
      ).text,
      refund: parsedOr(
        policySchema,
        values.get("policy.refund"),
        { text: defaults.policies.refund },
      ).text,
      returns: parsedOr(
        policySchema,
        values.get("policy.return"),
        { text: defaults.policies.returns },
      ).text,
    },
  };
}
