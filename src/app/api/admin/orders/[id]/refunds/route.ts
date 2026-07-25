import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { refundRequestSchema } from "@/lib/admin/schemas";
import { CommerceError } from "@/lib/commerce/errors";
import { scheduleNotificationDelivery } from "@/lib/email/schedule";
import { getServerEnvironment } from "@/lib/env";
import { isSameOriginRequest } from "@/lib/http/security";
import { getStripeClient } from "@/lib/stripe/client";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/supabase/auth";

export const runtime = "nodejs";

type PreparedRefund = {
  refund_id: number;
  payment_intent_id: string;
  amount_cents: number;
  order_number: string;
  current_status: string;
};

function internalRefundStatus(status: Stripe.Refund["status"]) {
  if (status === "succeeded") return "succeeded";
  if (status === "failed") return "failed";
  if (status === "canceled") return "cancelled";
  return "pending";
}

function refundSummary(refund: Stripe.Refund) {
  return {
    id: refund.id,
    status: refund.status,
    amount: refund.amount,
    currency: refund.currency,
    paymentIntent:
      typeof refund.payment_intent === "string"
        ? refund.payment_intent
        : refund.payment_intent?.id ?? null,
    failureReason: refund.failure_reason,
    created: refund.created,
  };
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const auth = await requireStaff(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  if (auth.role !== "admin") {
    return NextResponse.json(
      { error: "Only an admin can issue Stripe refunds." },
      { status: 403 },
    );
  }

  const { id } = await context.params;
  const orderId = Number(id);
  if (!Number.isSafeInteger(orderId) || orderId <= 0) {
    return NextResponse.json({ error: "Invalid order." }, { status: 400 });
  }

  let prepared: PreparedRefund | null = null;
  let providerRefund: Stripe.Refund | null = null;
  try {
    const environment = getServerEnvironment();
    if (!environment.COMMERCE_SANDBOX_MODE) {
      throw new CommerceError(
        "Live refunds are disabled.",
        "LIVE_REFUNDS_DISABLED",
        503,
      );
    }

    const body: unknown = await request.json();
    const parsed = refundRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid refund request." },
        { status: 400 },
      );
    }

    const supabase = getSupabaseAdmin();
    const prepareResult = await supabase.rpc(
      "commerce_prepare_stripe_refund",
      {
        p_order_id: orderId,
        p_amount_cents: parsed.data.amountCents,
        p_reason: parsed.data.reason,
        p_restock_items: parsed.data.restockItems,
        p_items: parsed.data.items.map((item) => ({
          variant_id: item.variantId,
          quantity: item.quantity,
        })),
        p_idempotency_key: parsed.data.idempotencyKey,
        p_actor_user_id: auth.user.id,
      },
    );

    if (
      prepareResult.error ||
      !Array.isArray(prepareResult.data) ||
      !prepareResult.data[0]
    ) {
      return NextResponse.json(
        { error: "The refund exceeds the available balance or is not allowed." },
        { status: 409 },
      );
    }
    prepared = prepareResult.data[0] as PreparedRefund;

    if (prepared.current_status === "succeeded") {
      return NextResponse.json({
        result: {
          status: "duplicate",
          refundId: prepared.refund_id,
        },
      });
    }

    const stripe = getStripeClient();
    const refund = await stripe.refunds.create(
      {
        payment_intent: prepared.payment_intent_id,
        amount: Number(prepared.amount_cents),
        reason: "requested_by_customer",
        metadata: {
          wander_bike_refund_id: String(prepared.refund_id),
          order_number: prepared.order_number,
          environment: "sandbox",
        },
      },
      {
        idempotencyKey: `wander-bike-refund-${parsed.data.idempotencyKey}`,
      },
    );
    providerRefund = refund;
    const status = internalRefundStatus(refund.status);
    const finalized = await supabase.rpc("commerce_finalize_stripe_refund", {
      p_refund_id: prepared.refund_id,
      p_provider_refund_id: refund.id,
      p_status: status,
      p_provider_response: refundSummary(refund),
      p_failure_message: refund.failure_reason ?? null,
    });

    if (finalized.error) {
      throw new Error("Refund reconciliation failed.");
    }

    scheduleNotificationDelivery();

    return NextResponse.json(
      { result: finalized.data },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (prepared) {
      try {
        await getSupabaseAdmin().rpc("commerce_finalize_stripe_refund", {
          p_refund_id: prepared.refund_id,
          p_provider_refund_id: providerRefund?.id ?? null,
          p_status: providerRefund
            ? internalRefundStatus(providerRefund.status)
            : "failed",
          p_provider_response: providerRefund
            ? refundSummary(providerRefund)
            : {},
          p_failure_message:
            providerRefund?.failure_reason ??
            (providerRefund ? null : "Stripe test refund request failed."),
        });
      } catch {
        // A signed Stripe refund webhook can reconcile a provider refund if
        // this best-effort database update also encounters a transient error.
      }
    }

    console.error("Stripe test refund failed", {
      orderId,
      error: error instanceof Error ? error.name : "UnknownError",
    });
    return NextResponse.json(
      { error: "The Stripe test refund could not be completed." },
      { status: error instanceof CommerceError ? error.status : 502 },
    );
  }
}
