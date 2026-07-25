import Stripe from "stripe";
import { beforeEach, describe, expect, it, vi } from "vitest";

const webhookMocks = vi.hoisted(() => ({
  rpc: vi.fn(),
  scheduleNotificationDelivery: vi.fn(),
}));

const webhookSecret = "unit_test_signing_secret";
const signingStripe = new Stripe("unit_test_api_key");

vi.mock("server-only", () => ({}));
vi.mock("@/lib/env", () => ({
  requireServerEnvironment: () => ({
    STRIPE_WEBHOOK_SECRET: webhookSecret,
  }),
}));
vi.mock("@/lib/stripe/client", async () => {
  const stripeModule = await vi.importActual<typeof import("stripe")>("stripe");
  const StripeClient = stripeModule.default;
  const stripe = new StripeClient("unit_test_api_key");

  return {
    getStripeClient: () => stripe,
  };
});
vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdmin: () => ({
    rpc: webhookMocks.rpc,
  }),
}));
vi.mock("@/lib/email/schedule", () => ({
  scheduleNotificationDelivery: webhookMocks.scheduleNotificationDelivery,
}));

import { POST } from "@/app/api/stripe/webhook/route";

function asyncFailureEvent(overrides: Record<string, unknown> = {}) {
  return {
    id: "evt_test_async_payment_failed",
    object: "event",
    api_version: "2025-04-30.basil",
    created: 1_785_020_000,
    data: {
      object: {
        id: "cs_test_async_payment_failed",
        object: "checkout.session",
        client_reference_id: "42",
        livemode: false,
        metadata: {
          order_id: "42",
        },
        mode: "payment",
        payment_intent: "pi_test_async_payment_failed",
        payment_status: "unpaid",
        status: "complete",
      },
    },
    livemode: false,
    pending_webhooks: 1,
    request: {
      id: null,
      idempotency_key: null,
    },
    type: "checkout.session.async_payment_failed",
    ...overrides,
  };
}

function signedRequest(
  event: ReturnType<typeof asyncFailureEvent>,
  secret = webhookSecret,
) {
  const payload = JSON.stringify(event);
  const signature = signingStripe.webhooks.generateTestHeaderString({
    payload,
    secret,
  });

  return new Request("https://example.test/api/stripe/webhook", {
    method: "POST",
    body: payload,
    headers: {
      "content-type": "application/json",
      "stripe-signature": signature,
    },
  });
}

describe("Stripe webhook route", () => {
  beforeEach(() => {
    webhookMocks.rpc.mockReset();
    webhookMocks.scheduleNotificationDelivery.mockReset();
    webhookMocks.rpc.mockResolvedValue({
      data: {
        status: "processed",
        order_id: 42,
        order_number: "WB-TEST-42",
      },
      error: null,
    });
  });

  it("routes a signed asynchronous Checkout failure through atomic release", async () => {
    const response = await POST(signedRequest(asyncFailureEvent()));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      received: true,
      status: "processed",
    });
    expect(webhookMocks.rpc).toHaveBeenCalledTimes(1);
    expect(webhookMocks.rpc).toHaveBeenCalledWith(
      "commerce_expire_stripe_checkout",
      expect.objectContaining({
        p_external_event_id: "evt_test_async_payment_failed",
        p_event_type: "checkout.session.async_payment_failed",
        p_checkout_session_id: "cs_test_async_payment_failed",
        p_order_id: 42,
      }),
    );
    expect(webhookMocks.scheduleNotificationDelivery).toHaveBeenCalledOnce();
  });

  it("rejects an invalid webhook signature before database access", async () => {
    const response = await POST(
      signedRequest(asyncFailureEvent(), "wrong_unit_test_signing_secret"),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "Invalid Stripe webhook signature.",
    });
    expect(webhookMocks.rpc).not.toHaveBeenCalled();
    expect(webhookMocks.scheduleNotificationDelivery).not.toHaveBeenCalled();
  });

  it("rejects signed live-mode events in the sandbox", async () => {
    const event = asyncFailureEvent({
      id: "evt_live_async_payment_failed",
      livemode: true,
    });
    const response = await POST(signedRequest(event));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "Live Stripe events are disabled.",
    });
    expect(webhookMocks.rpc).not.toHaveBeenCalled();
    expect(webhookMocks.scheduleNotificationDelivery).not.toHaveBeenCalled();
  });
});
