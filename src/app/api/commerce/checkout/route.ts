import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import type Stripe from "stripe";
import { hashGuestAccessToken } from "@/lib/commerce/guest-access";
import {
  assertFulfillmentAllowed,
  buildCanadaPostPackage,
  databaseCartItems,
  resolveDatabaseCart,
  shippingRequestFingerprint,
} from "@/lib/commerce/cart-server";
import {
  CommerceError,
  publicCommerceError,
} from "@/lib/commerce/errors";
import {
  checkoutRequestSchema,
  formatCanadianPostalCode,
  normalizeCanadianPostalCode,
  type StoreAddress,
} from "@/lib/commerce/schemas";
import { getServerEnvironment } from "@/lib/env";
import { isSameOriginRequest } from "@/lib/http/security";
import { getStripeClient } from "@/lib/stripe/client";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/supabase/auth";
import {
  getCommerceStoreSettings,
} from "@/lib/commerce/settings";
import { localDeliveryEligibility } from "@/lib/commerce/fulfillment";
import {
  applyShippingRules,
  calculateManualTax,
  cartSubtotalCents,
} from "@/lib/commerce/pricing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CreatedOrder = {
  order_id: number;
  public_id: string;
  order_number: string;
  subtotal_cents: number;
  shipping_total_cents: number;
  tax_total_cents: number;
  total_cents: number;
  currency: string;
  checkout_expires_at: string;
};

type OrderItem = {
  sku: string;
  product_name: string;
  variant_title: string;
  quantity: number;
  unit_price_cents: number;
};

function stripeAddress(address: StoreAddress): Stripe.ShippingAddressParam {
  return {
    line1: address.addressLine1,
    line2: address.addressLine2 || undefined,
    city: address.city,
    state: address.province,
    postal_code: formatCanadianPostalCode(address.postalCode),
    country: address.country,
  };
}

async function cancelDatabaseOrder(orderId: number, reason: string) {
  const { error } = await getSupabaseAdmin().rpc("commerce_cancel_checkout_order", {
    p_order_id: orderId,
    p_reason: reason,
  });
  if (error) {
    console.error("Failed to release checkout inventory", { orderId });
    return false;
  }
  return true;
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      { error: "This request did not originate from Wander Bike.", code: "INVALID_ORIGIN" },
      { status: 403 },
    );
  }

  let createdOrder: CreatedOrder | null = null;
  let stripeSessionId: string | null = null;
  let stripeSessionCreateStarted = false;

  try {
    const body: unknown = await request.json();
    const parsed = checkoutRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message ?? "Checkout details are invalid.",
          code: "INVALID_CHECKOUT_REQUEST",
        },
        { status: 400 },
      );
    }

    const environment = getServerEnvironment();
    if (!environment.COMMERCE_SANDBOX_MODE) {
      throw new CommerceError(
        "Live payments are disabled until the customer approves production setup.",
        "LIVE_PAYMENTS_DISABLED",
        503,
      );
    }
    const settings = await getCommerceStoreSettings();
    if (
      !environment.COMMERCE_CHECKOUT_ENABLED ||
      !settings.sandboxMode ||
      !settings.checkoutEnabled
    ) {
      throw new CommerceError(
        "Test checkout is not enabled for this deployment yet.",
        "CHECKOUT_DISABLED",
        503,
      );
    }
    if (
      parsed.data.fulfillmentMethod === "pickup" &&
      !settings.pickupEnabled
    ) {
      throw new CommerceError(
        "Store pickup is not currently enabled.",
        "PICKUP_NOT_ENABLED",
        422,
      );
    }
    if (
      parsed.data.fulfillmentMethod === "canada_post" &&
      !settings.canadaPostEnabled
    ) {
      throw new CommerceError(
        "Canada Post shipping is not currently enabled.",
        "CANADA_POST_NOT_ENABLED",
        422,
      );
    }

    const cart = await resolveDatabaseCart(parsed.data.items);
    assertFulfillmentAllowed(cart, parsed.data.fulfillmentMethod);

    const auth = await requireUser(request);
    const userId = auth.ok ? auth.user.id : null;
    const guestAccess = {
      token: parsed.data.checkoutRequestId,
      hash: hashGuestAccessToken(parsed.data.checkoutRequestId),
    };
    const checkoutExpiresAt = new Date(Date.now() + 40 * 60 * 1000);
    const shippingAddress = parsed.data.shippingAddress
      ? {
          ...parsed.data.shippingAddress,
          postalCode: formatCanadianPostalCode(
            parsed.data.shippingAddress.postalCode,
          ),
        }
      : null;
    const supabase = getSupabaseAdmin();
    const deliveryProvince =
      parsed.data.fulfillmentMethod === "pickup"
        ? settings.profile.province
        : shippingAddress?.province;
    if (
      !deliveryProvince ||
      !settings.salesProvinces.includes(
        deliveryProvince as (typeof settings.salesProvinces)[number],
      )
    ) {
      throw new CommerceError(
        "This province is outside the configured sales region.",
        "SALES_REGION_UNAVAILABLE",
        422,
      );
    }

    const subtotalCents = cartSubtotalCents(cart.items);
    let shippingCents = 0;
    if (parsed.data.fulfillmentMethod === "local_delivery") {
      const eligibility = localDeliveryEligibility(
        shippingAddress?.postalCode ?? "",
        settings.localDelivery,
      );
      if (!eligibility.eligible) {
        throw new CommerceError(
          "This address is outside the configured local delivery area.",
          "LOCAL_DELIVERY_UNAVAILABLE",
          422,
        );
      }
      shippingCents = applyShippingRules({
        providerAmountCents: settings.localDelivery.feeCents,
        subtotalCents,
        provider: "local_delivery",
        rules: settings.shippingRules,
      });
    } else if (parsed.data.fulfillmentMethod === "canada_post") {
      const destinationPostalCode = normalizeCanadianPostalCode(
        shippingAddress?.postalCode ?? "",
      );
      const expectedQuoteFingerprint = shippingRequestFingerprint({
        provider: "canada_post",
        originPostalCode: normalizeCanadianPostalCode(
          settings.shippingOrigin.postalCode,
        ),
        destinationPostalCode,
        cartItems: databaseCartItems(parsed.data.items),
        packageDetails: buildCanadaPostPackage(cart),
        shippingRules: settings.shippingRules,
      });
      const quote = await supabase
        .from("shipping_quotes")
        .select("amount_cents, request_fingerprint")
        .eq("id", parsed.data.shippingQuoteId ?? "")
        .eq("provider", "canada_post")
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();
      if (
        quote.error ||
        !quote.data ||
        quote.data.request_fingerprint !== expectedQuoteFingerprint
      ) {
        throw new CommerceError(
          "The Canada Post rate is missing, expired, or no longer matches this cart.",
          "SHIPPING_QUOTE_EXPIRED",
          409,
        );
      }
      shippingCents = Number(quote.data.amount_cents);
    }

    if (
      settings.tax.enabled &&
      !settings.tax.rates.some((rate) => rate.province === deliveryProvince)
    ) {
      throw new CommerceError(
        "Tax rules are not configured for this province.",
        "TAX_RULE_MISSING",
        422,
      );
    }
    const taxCents = calculateManualTax({
      subtotalCents,
      shippingCents,
      province: deliveryProvince,
      rates: settings.tax.rates,
      enabled: settings.tax.enabled,
    });
    const normalizedItems = databaseCartItems(parsed.data.items);
    const checkoutRequestFingerprint = createHash("sha256")
      .update(
        JSON.stringify({
          userId,
          email: parsed.data.email.toLowerCase(),
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName,
          phone: parsed.data.phone || null,
          fulfillmentMethod: parsed.data.fulfillmentMethod,
          items: normalizedItems,
          shippingAddress,
          shippingQuoteId: parsed.data.shippingQuoteId ?? null,
          shippingCents,
          taxCents,
          customerNote: parsed.data.customerNote || null,
          locationCode: "steveston",
        }),
      )
      .digest("hex");
    const orderResult = await supabase.rpc("commerce_create_checkout_order", {
      p_checkout_request_id: parsed.data.checkoutRequestId,
      p_checkout_request_fingerprint: checkoutRequestFingerprint,
      p_customer_email: parsed.data.email,
      p_customer_first_name: parsed.data.firstName,
      p_customer_last_name: parsed.data.lastName,
      p_fulfillment_method: parsed.data.fulfillmentMethod,
      p_items: normalizedItems,
      p_guest_access_token_hash: guestAccess.hash,
      p_user_id: userId,
      p_phone: parsed.data.phone || null,
      p_shipping_address: shippingAddress,
      p_billing_address: null,
      p_shipping_quote_id: parsed.data.shippingQuoteId ?? null,
      p_local_delivery_fee_cents: shippingCents,
      p_tax_total_cents: taxCents,
      p_customer_note: parsed.data.customerNote || null,
      p_checkout_expires_at: checkoutExpiresAt.toISOString(),
      p_location_code: "steveston",
    });

    if (orderResult.error || !Array.isArray(orderResult.data) || !orderResult.data[0]) {
      throw new CommerceError(
        "The order could not be created. Prices, inventory, or shipping may have changed.",
        "ORDER_CREATION_FAILED",
        409,
      );
    }

    createdOrder = orderResult.data[0] as CreatedOrder;
    const orderItemsResult = await supabase
      .from("order_items")
      .select("sku, product_name, variant_title, quantity, unit_price_cents")
      .eq("order_id", createdOrder.order_id)
      .order("id", { ascending: true });

    if (orderItemsResult.error || !orderItemsResult.data?.length) {
      throw new CommerceError(
        "The order items could not be prepared for payment.",
        "ORDER_ITEMS_UNAVAILABLE",
        503,
      );
    }

    const orderItems = orderItemsResult.data as OrderItem[];
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = orderItems.map(
      (item) => ({
        quantity: Number(item.quantity),
        price_data: {
          currency: "cad",
          unit_amount: Number(item.unit_price_cents),
          product_data: {
            name:
              item.variant_title === "Default"
                ? item.product_name
                : `${item.product_name} — ${item.variant_title}`,
            metadata: { sku: item.sku },
          },
        },
      }),
    );

    if (Number(createdOrder.shipping_total_cents) > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: "cad",
          unit_amount: Number(createdOrder.shipping_total_cents),
          product_data: {
            name:
              parsed.data.fulfillmentMethod === "local_delivery"
                ? "Local delivery"
                : "Canada Post shipping",
          },
        },
      });
    }
    if (Number(createdOrder.tax_total_cents) > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: "cad",
          unit_amount: Number(createdOrder.tax_total_cents),
          product_data: {
            name: "Sales tax",
          },
        },
      });
    }

    const siteUrl = environment.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
    const orderMetadata = {
      order_id: String(createdOrder.order_id),
      order_number: createdOrder.order_number,
      order_public_id: createdOrder.public_id,
      environment: "sandbox",
    };
    const paymentShipping =
      shippingAddress && parsed.data.fulfillmentMethod !== "pickup"
        ? {
            name: `${parsed.data.firstName} ${parsed.data.lastName}`,
            address: stripeAddress(shippingAddress),
            phone: parsed.data.phone || undefined,
          }
        : undefined;
    const stripe = getStripeClient();
    stripeSessionCreateStarted = true;
    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        customer_email: parsed.data.email,
        client_reference_id: String(createdOrder.order_id),
        line_items: lineItems,
        billing_address_collection: "required",
        automatic_tax: { enabled: false },
        expires_at: Math.floor(
          new Date(createdOrder.checkout_expires_at).getTime() / 1000,
        ),
        success_url: `${siteUrl}/orders/${createdOrder.public_id}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl}/checkout?cancelled=1`,
        metadata: orderMetadata,
        payment_intent_data: {
          metadata: orderMetadata,
          shipping: paymentShipping,
        },
        custom_text: {
          submit: {
            message:
              "TEST MODE — no real product will be sold or shipped during this verification.",
          },
        },
      },
      { idempotencyKey: `wander-bike-order-${createdOrder.order_id}` },
    );
    stripeSessionId = session.id;

    if (!session.url) {
      throw new CommerceError(
        "Stripe did not return a checkout URL.",
        "STRIPE_CHECKOUT_URL_MISSING",
        502,
      );
    }

    const attached = await supabase.rpc("commerce_attach_stripe_checkout", {
      p_order_id: createdOrder.order_id,
      p_checkout_session_id: session.id,
      p_checkout_expires_at: new Date(session.expires_at * 1000).toISOString(),
    });

    if (attached.error || attached.data !== true) {
      throw new CommerceError(
        "The payment session could not be attached to the order and must be reconciled before inventory is released.",
        "STRIPE_SESSION_RECONCILIATION_REQUIRED",
        503,
      );
    }

    const response = NextResponse.json(
      {
        url: session.url,
        orderPublicId: createdOrder.public_id,
        testMode: true,
      },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
    response.cookies.set(
      "wb_guest_order_access",
      `${createdOrder.public_id}.${guestAccess.token}`,
      {
        httpOnly: true,
        sameSite: "lax",
        secure: new URL(siteUrl).protocol === "https:",
        path: `/orders/${createdOrder.public_id}`,
        maxAge: 60 * 60 * 24 * 30,
      },
    );
    return response;
  } catch (error) {
    let responseError = error;
    if (createdOrder) {
      let stripeSessionIsClosed =
        stripeSessionId === null && !stripeSessionCreateStarted;
      if (stripeSessionId) {
        stripeSessionIsClosed = await getStripeClient()
          .checkout.sessions.expire(stripeSessionId)
          .then((session) => session.status === "expired")
          .catch(() => false);
      }
      if (stripeSessionIsClosed) {
        const cancelled = await cancelDatabaseOrder(
          createdOrder.order_id,
          "Stripe Checkout setup failed",
        );
        if (
          !cancelled ||
          (responseError instanceof CommerceError &&
            responseError.code === "STRIPE_SESSION_RECONCILIATION_REQUIRED")
        ) {
          responseError = cancelled
            ? new CommerceError(
                "The Stripe payment session was closed safely. Retry checkout to create a new session.",
                "CHECKOUT_SETUP_FAILED",
                503,
              )
            : new CommerceError(
                "The payment session is closed, but the order still requires database reconciliation.",
                "STRIPE_SESSION_RECONCILIATION_REQUIRED",
                503,
              );
        }
      } else {
        console.error("Checkout inventory retained for Stripe reconciliation", {
          orderId: createdOrder.order_id,
          checkoutSessionId: stripeSessionId,
        });
        responseError = new CommerceError(
          "Stripe did not confirm whether the payment session is open. Retry this checkout without changing its details so it can be reconciled safely.",
          "STRIPE_SESSION_RECONCILIATION_REQUIRED",
          503,
        );
      }
    }

    if (!(responseError instanceof CommerceError)) {
      const stripeError = responseError as { type?: string; code?: string };
      console.error("Checkout request failed", {
        type: stripeError?.type,
        code: stripeError?.code,
      });
    }
    const response = publicCommerceError(responseError);
    return NextResponse.json(response.body, { status: response.status });
  }
}
