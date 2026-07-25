import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { scheduleNotificationDelivery } from "@/lib/email/schedule";
import { requireServerEnvironment } from "@/lib/env";
import { getStripeClient } from "@/lib/stripe/client";
import {
  getStripeCheckoutOrderId,
  getStripePaymentIntentId,
  stripeCheckoutSnapshot,
} from "@/lib/stripe/checkout-session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RpcResult = {
  status?: string;
  reason?: string;
  order_id?: number;
  order_number?: string;
};

function eventPayload(event: Stripe.Event, session: Stripe.Checkout.Session) {
  return {
    eventId: event.id,
    eventType: event.type,
    created: event.created,
    livemode: event.livemode,
    checkoutSession: stripeCheckoutSnapshot(session),
  };
}

function billingAddress(session: Stripe.Checkout.Session) {
  const address = session.customer_details?.address;
  if (!address) return null;

  return {
    addressLine1: address.line1,
    addressLine2: address.line2,
    city: address.city,
    province: address.state,
    postalCode: address.postal_code,
    country: address.country,
  };
}

async function markCheckout(
  functionName:
    | "commerce_mark_stripe_checkout_paid"
    | "commerce_mark_stripe_checkout_pending",
  event: Stripe.Event,
  session: Stripe.Checkout.Session,
) {
  if (
    session.amount_total == null ||
    !session.currency ||
    !getStripePaymentIntentId(session) ||
    !getStripeCheckoutOrderId(session)
  ) {
    return { status: "ignored", reason: "incomplete_payment_details" };
  }

  const supabase = getSupabaseAdmin();
  const result = await supabase.rpc(functionName, {
    p_external_event_id: event.id,
    p_event_type: event.type,
    p_payload: eventPayload(event, session),
    p_checkout_session_id: session.id,
    p_order_id: getStripeCheckoutOrderId(session),
    p_payment_intent_id: getStripePaymentIntentId(session),
    p_amount_total_cents: session.amount_total,
    p_currency: session.currency,
  });

  if (result.error) throw result.error;
  const rpcResult = (result.data ?? {}) as RpcResult;

  if (rpcResult.order_id && functionName === "commerce_mark_stripe_checkout_paid") {
    const address = billingAddress(session);
    const updates: Record<string, unknown> = {};
    if (address) updates.billing_address = address;
    if (session.customer_details?.phone) {
      updates.phone = session.customer_details.phone;
    }

    if (Object.keys(updates).length > 0) {
      const updated = await supabase
        .from("orders")
        .update(updates)
        .eq("id", rpcResult.order_id);
      if (updated.error) {
        console.error("Paid order contact enrichment failed", {
          orderId: rpcResult.order_id,
        });
      }
    }
  }

  return rpcResult;
}

async function releaseCheckout(
  event: Stripe.Event,
  session: Stripe.Checkout.Session,
) {
  const orderId = getStripeCheckoutOrderId(session);
  if (!orderId) {
    return { status: "ignored", reason: "invalid_order_reference" };
  }
  const result = await getSupabaseAdmin().rpc(
    "commerce_expire_stripe_checkout",
    {
      p_external_event_id: event.id,
      p_event_type: event.type,
      p_payload: eventPayload(event, session),
      p_checkout_session_id: session.id,
      p_order_id: orderId,
    },
  );
  if (result.error) throw result.error;
  return (result.data ?? {}) as RpcResult;
}

function refundStatus(status: Stripe.Refund["status"]) {
  if (status === "succeeded") return "succeeded";
  if (status === "failed") return "failed";
  if (status === "canceled") return "cancelled";
  return "pending";
}

async function reconcileRefund(event: Stripe.Event, refund: Stripe.Refund) {
  const refundId = Number(refund.metadata?.wander_bike_refund_id);
  if (!Number.isSafeInteger(refundId) || refundId <= 0) {
    return { status: "ignored", reason: "unknown_refund" };
  }

  const payload = {
    eventId: event.id,
    eventType: event.type,
    livemode: event.livemode,
    refund: {
      id: refund.id,
      status: refund.status,
      amount: refund.amount,
      currency: refund.currency,
      paymentIntent:
        typeof refund.payment_intent === "string"
          ? refund.payment_intent
          : refund.payment_intent?.id ?? null,
      failureReason: refund.failure_reason,
      metadata: refund.metadata ?? {},
    },
  };
  const result = await getSupabaseAdmin().rpc(
    "commerce_reconcile_stripe_refund_event",
    {
      p_external_event_id: event.id,
      p_event_type: event.type,
      p_payload: payload,
      p_refund_id: refundId,
      p_provider_refund_id: refund.id,
      p_status: refundStatus(refund.status),
      p_failure_message: refund.failure_reason ?? null,
    },
  );
  if (result.error) throw result.error;
  return (result.data ?? {}) as RpcResult;
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature." },
      { status: 400 },
    );
  }

  let event: Stripe.Event;
  try {
    const environment = requireServerEnvironment("STRIPE_WEBHOOK_SECRET");
    const payload = await request.text();
    event = getStripeClient().webhooks.constructEvent(
      payload,
      signature,
      environment.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid Stripe webhook signature." },
      { status: 400 },
    );
  }

  if (event.livemode) {
    return NextResponse.json(
      { error: "Live Stripe events are disabled." },
      { status: 400 },
    );
  }

  try {
    let result: RpcResult = { status: "ignored" };

    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const session = event.data.object as Stripe.Checkout.Session;
      result =
        session.payment_status === "paid"
          ? await markCheckout(
              "commerce_mark_stripe_checkout_paid",
              event,
              session,
            )
          : await markCheckout(
              "commerce_mark_stripe_checkout_pending",
              event,
              session,
            );
    } else if (
      event.type === "checkout.session.expired" ||
      event.type === "checkout.session.async_payment_failed"
    ) {
      result = await releaseCheckout(
        event,
        event.data.object as Stripe.Checkout.Session,
      );
    } else if (
      event.type === "refund.created" ||
      event.type === "refund.updated" ||
      event.type === "refund.failed"
    ) {
      result = await reconcileRefund(
        event,
        event.data.object as Stripe.Refund,
      );
    }

    if (result.status === "failed") {
      console.error("Verified Stripe event failed a commerce invariant", {
        eventId: event.id,
        reason: result.reason,
      });
    }

    scheduleNotificationDelivery();

    return NextResponse.json(
      { received: true, status: result.status ?? "processed" },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Verified Stripe event processing failed", {
      eventId: event.id,
      type: event.type,
      error: error instanceof Error ? error.name : "UnknownError",
    });
    return NextResponse.json(
      { error: "Webhook processing failed." },
      { status: 500 },
    );
  }
}
