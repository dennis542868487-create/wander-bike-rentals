import type Stripe from "stripe";
import { beforeEach, describe, expect, it, vi } from "vitest";

const stripeReconciliationMocks = vi.hoisted(() => ({
  orders: [] as Array<{
    id: number;
    stripe_checkout_session_id: string;
  }>,
  retrieve: vi.fn(),
  expire: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/stripe/client", () => ({
  getStripeClient: () => ({
    checkout: {
      sessions: {
        retrieve: stripeReconciliationMocks.retrieve,
        expire: stripeReconciliationMocks.expire,
      },
    },
  }),
}));
vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdmin: () => {
    const query: Record<string, unknown> = {};
    query.select = vi.fn(() => query);
    query.eq = vi.fn(() => query);
    query.not = vi.fn(() => query);
    query.lt = vi.fn(() => query);
    query.order = vi.fn(() => query);
    query.limit = vi.fn(async () => ({
      data: stripeReconciliationMocks.orders,
      error: null,
    }));
    return {
      from: vi.fn(() => query),
      rpc: stripeReconciliationMocks.rpc,
    };
  },
}));

import {
  getStripeCheckoutOrderId,
  getStripePaymentIntentId,
} from "@/lib/stripe/checkout-session";
import { reconcileStaleStripeCheckouts } from "@/lib/stripe/reconcile-checkouts";

function checkoutSession(
  overrides: Partial<Stripe.Checkout.Session> = {},
): Stripe.Checkout.Session {
  return {
    id: "cs_test_wander_bike",
    client_reference_id: "42",
    metadata: { order_id: "42" },
    livemode: false,
    status: "complete",
    payment_status: "paid",
    payment_intent: "pi_test_wander_bike",
    amount_total: 12_345,
    currency: "cad",
    ...overrides,
  } as Stripe.Checkout.Session;
}

describe("Stripe Checkout reconciliation", () => {
  beforeEach(() => {
    stripeReconciliationMocks.orders.splice(
      0,
      stripeReconciliationMocks.orders.length,
      { id: 42, stripe_checkout_session_id: "cs_test_wander_bike" },
    );
    stripeReconciliationMocks.retrieve.mockReset();
    stripeReconciliationMocks.expire.mockReset();
    stripeReconciliationMocks.rpc.mockReset();
    stripeReconciliationMocks.rpc.mockResolvedValue({
      data: { status: "processed" },
      error: null,
    });
  });

  it("accepts an order reference only when Stripe metadata and client reference agree", () => {
    expect(getStripeCheckoutOrderId(checkoutSession())).toBe(42);
    expect(
      getStripeCheckoutOrderId(
        checkoutSession({ client_reference_id: "43" }),
      ),
    ).toBeNull();
    expect(
      getStripeCheckoutOrderId(checkoutSession({ metadata: {} })),
    ).toBeNull();
  });

  it("reads both expanded and unexpanded PaymentIntent references", () => {
    expect(getStripePaymentIntentId(checkoutSession())).toBe(
      "pi_test_wander_bike",
    );
    expect(
      getStripePaymentIntentId(
        checkoutSession({
          payment_intent: { id: "pi_expanded" } as Stripe.PaymentIntent,
        }),
      ),
    ).toBe("pi_expanded");
  });

  it("reconciles a completed paid session through the atomic paid-order RPC", async () => {
    stripeReconciliationMocks.retrieve.mockResolvedValue(checkoutSession());

    const result = await reconcileStaleStripeCheckouts();

    expect(result).toEqual({
      checked: 1,
      reconciled: 1,
      deferred: 0,
      failed: 0,
    });
    expect(stripeReconciliationMocks.rpc).toHaveBeenCalledWith(
      "commerce_mark_stripe_checkout_paid",
      expect.objectContaining({
        p_checkout_session_id: "cs_test_wander_bike",
        p_order_id: 42,
        p_payment_intent_id: "pi_test_wander_bike",
        p_amount_total_cents: 12_345,
        p_currency: "cad",
      }),
    );
  });

  it("expires an open stale session at Stripe before releasing inventory", async () => {
    stripeReconciliationMocks.retrieve.mockResolvedValue(
      checkoutSession({
        status: "open",
        payment_status: "unpaid",
        payment_intent: null,
      }),
    );
    stripeReconciliationMocks.expire.mockResolvedValue(
      checkoutSession({
        status: "expired",
        payment_status: "unpaid",
        payment_intent: null,
      }),
    );

    const result = await reconcileStaleStripeCheckouts();

    expect(result.reconciled).toBe(1);
    expect(stripeReconciliationMocks.expire).toHaveBeenCalledWith(
      "cs_test_wander_bike",
    );
    expect(stripeReconciliationMocks.rpc).toHaveBeenCalledWith(
      "commerce_expire_stripe_checkout",
      expect.objectContaining({
        p_checkout_session_id: "cs_test_wander_bike",
        p_order_id: 42,
      }),
    );
  });

  it("does not mutate an order when the signed Stripe references disagree", async () => {
    stripeReconciliationMocks.retrieve.mockResolvedValue(
      checkoutSession({ client_reference_id: "999" }),
    );

    const result = await reconcileStaleStripeCheckouts();

    expect(result).toEqual({
      checked: 1,
      reconciled: 0,
      deferred: 0,
      failed: 1,
    });
    expect(stripeReconciliationMocks.expire).not.toHaveBeenCalled();
    expect(stripeReconciliationMocks.rpc).not.toHaveBeenCalled();
  });
});
