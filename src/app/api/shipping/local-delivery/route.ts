import { NextResponse } from "next/server";
import {
  getCommerceStoreSettings,
} from "@/lib/commerce/settings";
import { localDeliveryEligibility } from "@/lib/commerce/fulfillment";
import {
  applyShippingRules,
  cartSubtotalCents,
} from "@/lib/commerce/pricing";
import {
  assertFulfillmentAllowed,
  resolveDatabaseCart,
} from "@/lib/commerce/cart-server";
import { shippingRateRequestSchema } from "@/lib/commerce/schemas";
import { CommerceError, publicCommerceError } from "@/lib/commerce/errors";
import { isSameOriginRequest } from "@/lib/http/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      { error: "This request did not originate from Wander Bike." },
      { status: 403 },
    );
  }

  try {
    const body: unknown = await request.json();
    const parsed = shippingRateRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ?? "Delivery details are invalid.",
        },
        { status: 400 },
      );
    }

    const [settings, cart] = await Promise.all([
      getCommerceStoreSettings(),
      resolveDatabaseCart(parsed.data.items),
    ]);
    assertFulfillmentAllowed(cart, "local_delivery");
    const eligibility = localDeliveryEligibility(
      parsed.data.postalCode,
      settings.localDelivery,
    );
    const regionAllowed = settings.salesProvinces.includes(parsed.data.province);
    const subtotalCents = cartSubtotalCents(cart.items);
    const feeCents =
      eligibility.eligible && regionAllowed
        ? applyShippingRules({
            providerAmountCents: settings.localDelivery.feeCents,
            subtotalCents,
            provider: "local_delivery",
            rules: settings.shippingRules,
          })
        : 0;

    return NextResponse.json(
      {
        eligible: eligibility.eligible && regionAllowed,
        postalCode: eligibility.normalizedPostalCode,
        postalCodePrefix: eligibility.prefix,
        feeCents,
        reason:
          !settings.localDelivery.enabled
            ? "Local delivery is not enabled."
            : !regionAllowed
              ? "This province is outside the configured sales region."
              : !eligibility.eligible
                ? "This postal code is outside the local delivery area."
                : null,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    const response = publicCommerceError(
      error instanceof CommerceError
        ? error
        : new CommerceError(
            "Local delivery could not be checked.",
            "LOCAL_DELIVERY_UNAVAILABLE",
            503,
          ),
    );
    return NextResponse.json(response.body, { status: response.status });
  }
}
