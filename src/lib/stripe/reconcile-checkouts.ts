import "server-only";

import type Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getStripeClient } from "@/lib/stripe/client";
import {
  getStripeCheckoutOrderId,
  getStripePaymentIntentId,
  stripeCheckoutSnapshot,
} from "@/lib/stripe/checkout-session";

type PendingOrder = {
  id: number;
  stripe_checkout_session_id: string;
};

type ReconciliationResult = {
  status?: string;
  reason?: string;
};

function reconciliationPayload(session: Stripe.Checkout.Session) {
  return {
    source: "commerce_cron",
    reconciledAt: new Date().toISOString(),
    checkoutSession: stripeCheckoutSnapshot(session),
  };
}

async function runReconciliationRpc(
  functionName:
    | "commerce_expire_stripe_checkout"
    | "commerce_mark_stripe_checkout_paid"
    | "commerce_mark_stripe_checkout_pending",
  parameters: Record<string, unknown>,
) {
  const result = await getSupabaseAdmin().rpc(functionName, parameters);
  if (result.error) throw result.error;
  return (result.data ?? {}) as ReconciliationResult;
}

async function reconcileSession(order: PendingOrder) {
  let session = await getStripeClient().checkout.sessions.retrieve(
    order.stripe_checkout_session_id,
  );
  const orderId = getStripeCheckoutOrderId(session);
  if (session.livemode || orderId !== order.id) {
    return { status: "failed", reason: "order_reference_mismatch" };
  }

  if (session.status === "open") {
    session = await getStripeClient().checkout.sessions.expire(session.id);
  }

  const payload = reconciliationPayload(session);
  const eventKey = `commerce-reconcile:${session.id}:${session.status}:${session.payment_status}`;

  if (session.status === "expired") {
    return runReconciliationRpc("commerce_expire_stripe_checkout", {
      p_external_event_id: eventKey,
      p_event_type: "checkout.session.expired",
      p_payload: payload,
      p_checkout_session_id: session.id,
      p_order_id: order.id,
    });
  }

  const paymentIntentId = getStripePaymentIntentId(session);
  if (
    session.status === "complete" &&
    session.amount_total != null &&
    session.currency &&
    paymentIntentId
  ) {
    return runReconciliationRpc(
      session.payment_status === "paid"
        ? "commerce_mark_stripe_checkout_paid"
        : "commerce_mark_stripe_checkout_pending",
      {
        p_external_event_id: eventKey,
        p_event_type: "checkout.session.completed",
        p_payload: payload,
        p_checkout_session_id: session.id,
        p_order_id: order.id,
        p_payment_intent_id: paymentIntentId,
        p_amount_total_cents: session.amount_total,
        p_currency: session.currency,
      },
    );
  }

  return { status: "deferred", reason: "provider_state_not_final" };
}

export async function reconcileStaleStripeCheckouts(limit = 25) {
  const orders = await getSupabaseAdmin()
    .from("orders")
    .select("id, stripe_checkout_session_id")
    .eq("status", "pending_payment")
    .not("stripe_checkout_session_id", "is", null)
    .lt("checkout_expires_at", new Date().toISOString())
    .order("checkout_expires_at", { ascending: true })
    .limit(limit);

  if (orders.error) throw orders.error;

  const rows = (orders.data ?? []).filter(
    (order): order is PendingOrder =>
      Number.isSafeInteger(Number(order.id)) &&
      typeof order.stripe_checkout_session_id === "string" &&
      order.stripe_checkout_session_id.length > 0,
  );
  const results = await Promise.all(
    rows.map(async (order) => {
      try {
        return await reconcileSession({
          id: Number(order.id),
          stripe_checkout_session_id: order.stripe_checkout_session_id,
        });
      } catch (error) {
        console.error("Stripe Checkout reconciliation failed", {
          orderId: order.id,
          error: error instanceof Error ? error.name : "UnknownError",
        });
        return { status: "failed", reason: "provider_request_failed" };
      }
    }),
  );

  return {
    checked: rows.length,
    reconciled: results.filter((result) =>
      ["processed", "already_paid", "duplicate"].includes(result.status ?? ""),
    ).length,
    deferred: results.filter((result) => result.status === "deferred").length,
    failed: results.filter((result) => result.status === "failed").length,
  };
}
