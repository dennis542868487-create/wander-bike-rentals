import { NextResponse } from "next/server";
import { adminStoreSettingsSchema } from "@/lib/admin/schemas";
import { normalizeCanadianPostalCode } from "@/lib/commerce/schemas";
import { getServerEnvironment } from "@/lib/env";
import { isSameOriginRequest } from "@/lib/http/security";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/supabase/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 },
    );
  }

  const auth = await requireStaff(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  if (auth.role !== "admin") {
    return NextResponse.json(
      { error: "Only administrators can change store settings." },
      { status: 403 },
    );
  }

  try {
    const body: unknown = await request.json();
    const parsed = adminStoreSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message ?? "Invalid store settings.",
          issues: parsed.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 },
      );
    }

    const settings = parsed.data;
    const environment = getServerEnvironment();
    if (
      settings.canadaPostEnabled &&
      (!environment.COMMERCE_SANDBOX_MODE ||
        environment.CANADA_POST_ENVIRONMENT !== "test" ||
        !environment.CANADA_POST_API_KEY ||
        !environment.CANADA_POST_API_SECRET)
    ) {
      return NextResponse.json(
        {
          error:
            "Canada Post sandbox credentials must be installed before carrier rates can be enabled.",
        },
        { status: 422 },
      );
    }

    const updates = {
      "commerce.checkout_enabled": settings.checkoutEnabled,
      "store.profile": {
        display_name: settings.profile.displayName,
        phone: settings.profile.phone,
        customer_email: settings.profile.customerEmail,
        address_line_1: settings.profile.addressLine1,
        address_line_2: settings.profile.addressLine2,
        city: settings.profile.city,
        province: settings.profile.province,
        postal_code: normalizeCanadianPostalCode(settings.profile.postalCode),
        country: "CA",
      },
      "store.hours": {
        timezone: "America/Vancouver",
        note: settings.hours.note,
        days: settings.hours.days,
      },
      "fulfillment.pickup_enabled": settings.pickupEnabled,
      "fulfillment.pickup_instructions": {
        instructions: settings.pickupInstructions,
      },
      "fulfillment.sales_regions": {
        countries: ["CA"],
        provinces: settings.salesProvinces,
      },
      "fulfillment.local_delivery": {
        enabled: settings.localDelivery.enabled,
        fee_cents: settings.localDelivery.feeCents,
        postal_code_prefixes: [
          ...new Set(
            settings.localDelivery.postalCodePrefixes.map((prefix) =>
              normalizeCanadianPostalCode(prefix).slice(0, 3),
            ),
          ),
        ].sort(),
      },
      "fulfillment.canada_post_enabled": settings.canadaPostEnabled,
      "fulfillment.shipping_origin": {
        company: settings.shippingOrigin.company,
        contact: settings.shippingOrigin.contact,
        phone: settings.shippingOrigin.phone,
        address_line_1: settings.shippingOrigin.addressLine1,
        address_line_2: settings.shippingOrigin.addressLine2,
        city: settings.shippingOrigin.city,
        province: settings.shippingOrigin.province,
        postal_code: normalizeCanadianPostalCode(
          settings.shippingOrigin.postalCode,
        ),
        country: "CA",
      },
      "fulfillment.shipping_rules": {
        free_shipping_threshold_cents:
          settings.shippingRules.freeShippingThresholdCents,
        fixed_canada_post_fee_cents:
          settings.shippingRules.fixedCanadaPostFeeCents,
      },
      "tax.mode": {
        provider: "manual",
        enabled: settings.tax.enabled,
        registration_number: settings.tax.registrationNumber,
        rates: settings.tax.rates.map((rate) => ({
          province: rate.province,
          label: rate.label,
          rate_bps: rate.rateBps,
          applies_to_shipping: rate.appliesToShipping,
        })),
      },
      "notifications.order_email": {
        email: settings.notificationEmail,
      },
      "policy.shipping": { text: settings.policies.shipping },
      "policy.refund": { text: settings.policies.refund },
      "policy.return": { text: settings.policies.returns },
    };

    const result = await getSupabaseAdmin().rpc(
      "commerce_update_store_settings",
      {
        p_updates: updates,
        p_actor_user_id: auth.user.id,
      },
    );
    if (result.error) {
      return NextResponse.json(
        { error: "Store settings could not be saved." },
        { status: result.error.code === "42501" ? 403 : 400 },
      );
    }

    return NextResponse.json(
      { settings: result.data },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Store settings could not be saved." },
      { status: 500 },
    );
  }
}
