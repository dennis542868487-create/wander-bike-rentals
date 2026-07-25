import { NextResponse } from "next/server";
import {
  buildCanadaPostPackage,
  databaseCartItems,
  resolveDatabaseCart,
  shippingRequestFingerprint,
} from "@/lib/commerce/cart-server";
import {
  normalizeCanadianPostalCode,
  shippingRateRequestSchema,
} from "@/lib/commerce/schemas";
import {
  publicCommerceError,
  CommerceError,
} from "@/lib/commerce/errors";
import { getCanadaPostRates } from "@/lib/canada-post/client";
import { getServerEnvironment } from "@/lib/env";
import { isSameOriginRequest } from "@/lib/http/security";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  getCommerceStoreSettings,
} from "@/lib/commerce/settings";
import {
  applyShippingRules,
  cartSubtotalCents,
} from "@/lib/commerce/pricing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type QuoteRow = {
  id: string;
  service_code: string;
  service_name: string;
  amount_cents: number;
  currency: string;
  estimated_transit_days: number | null;
  expected_delivery_date: string | null;
  expires_at: string;
};

function responseRate(quote: QuoteRow) {
  return {
    id: quote.id,
    serviceCode: quote.service_code,
    serviceName: quote.service_name,
    amountCents: Number(quote.amount_cents),
    currency: quote.currency,
    estimatedTransitDays: quote.estimated_transit_days,
    expectedDeliveryDate: quote.expected_delivery_date,
    expiresAt: quote.expires_at,
  };
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      { error: "This request did not originate from Wander Bike.", code: "INVALID_ORIGIN" },
      { status: 403 },
    );
  }

  try {
    const body: unknown = await request.json();
    const parsed = shippingRateRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message ?? "Shipping details are invalid.",
          code: "INVALID_SHIPPING_REQUEST",
        },
        { status: 400 },
      );
    }

    const environment = getServerEnvironment();
    if (!environment.COMMERCE_SANDBOX_MODE) {
      throw new CommerceError(
        "Production shipping is not enabled.",
        "LIVE_SHIPPING_DISABLED",
        503,
      );
    }

    const settings = await getCommerceStoreSettings();
    if (!settings.canadaPostEnabled) {
      throw new CommerceError(
        "Canada Post shipping is not enabled.",
        "CANADA_POST_NOT_ENABLED",
        422,
      );
    }
    if (!settings.salesProvinces.includes(parsed.data.province)) {
      throw new CommerceError(
        "This province is outside the configured sales region.",
        "SHIPPING_REGION_UNAVAILABLE",
        422,
      );
    }

    const cart = await resolveDatabaseCart(parsed.data.items);
    const packageDetails = buildCanadaPostPackage(cart);
    const destinationPostalCode = normalizeCanadianPostalCode(
      parsed.data.postalCode,
    );
    const originPostalCode = normalizeCanadianPostalCode(
      settings.shippingOrigin.postalCode,
    );
    const subtotalCents = cartSubtotalCents(cart.items);
    const cartItems = databaseCartItems(parsed.data.items);
    const requestFingerprint = shippingRequestFingerprint({
      provider: "canada_post",
      originPostalCode,
      destinationPostalCode,
      cartItems,
      packageDetails,
      shippingRules: settings.shippingRules,
    });
    const supabase = getSupabaseAdmin();
    const nowIso = new Date().toISOString();

    const cached = await supabase
      .from("shipping_quotes")
      .select(
        "id, service_code, service_name, amount_cents, currency, estimated_transit_days, expected_delivery_date, expires_at",
      )
      .eq("provider", "canada_post")
      .eq("request_fingerprint", requestFingerprint)
      .gt("expires_at", nowIso)
      .order("amount_cents", { ascending: true });

    if (cached.error) {
      throw new CommerceError(
        "Shipping quote storage is temporarily unavailable.",
        "SHIPPING_STORAGE_UNAVAILABLE",
        503,
      );
    }

    if ((cached.data ?? []).length > 0) {
      return NextResponse.json(
        {
          postalCode: destinationPostalCode,
          package: packageDetails,
          rates: (cached.data as QuoteRow[]).map(responseRate),
          cached: true,
        },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    const providerResult = await getCanadaPostRates({
      originPostalCode,
      destinationPostalCode,
      package: packageDetails,
    });
    const expiresAt = new Date(Date.now() + 20 * 60 * 1000).toISOString();
    const rows = providerResult.rates.map((rate) => {
      const customerAmountCents = applyShippingRules({
        providerAmountCents: rate.amountCents,
        subtotalCents,
        provider: "canada_post",
        rules: settings.shippingRules,
      });
      return {
        provider: "canada_post",
        location_id: cart.locationId,
        service_code: rate.serviceCode,
        service_name: rate.serviceName,
        origin_postal_code: originPostalCode,
        destination_postal_code: destinationPostalCode,
        amount_cents: customerAmountCents,
        currency: "CAD",
        estimated_transit_days: rate.estimatedTransitDays,
        expected_delivery_date: rate.expectedDeliveryDate,
        is_sandbox: true,
        cart_items: cartItems,
        package_details: packageDetails,
        request_fingerprint: requestFingerprint,
        raw_response: {
          provider: providerResult.providerResponse,
          provider_amount_cents: rate.amountCents,
          customer_amount_cents: customerAmountCents,
          shipping_rules: settings.shippingRules,
        },
        expires_at: expiresAt,
      };
    });
    const inserted = await supabase
      .from("shipping_quotes")
      .insert(rows)
      .select(
        "id, service_code, service_name, amount_cents, currency, estimated_transit_days, expected_delivery_date, expires_at",
      );

    if (inserted.error || !inserted.data) {
      throw new CommerceError(
        "Shipping rates were received but could not be saved.",
        "SHIPPING_QUOTE_SAVE_FAILED",
        503,
      );
    }

    return NextResponse.json(
      {
        postalCode: destinationPostalCode,
        package: packageDetails,
        rates: (inserted.data as QuoteRow[]).map(responseRate),
        cached: false,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (!(error instanceof CommerceError)) {
      console.error("Canada Post rate request failed", error);
    }
    const response = publicCommerceError(error);
    return NextResponse.json(response.body, { status: response.status });
  }
}
