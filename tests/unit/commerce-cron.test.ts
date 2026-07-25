import { beforeEach, describe, expect, it, vi } from "vitest";

const cronMocks = vi.hoisted(() => ({
  configured: true,
  rpc: vi.fn(),
  processNotificationOutbox: vi.fn(),
  reconcileStaleStripeCheckouts: vi.fn(),
}));

vi.mock("@/lib/env", () => ({
  requireServerEnvironment: () => {
    if (!cronMocks.configured) throw new Error("not configured");
    return { CRON_SECRET: "cron-test-value" };
  },
}));
vi.mock("@/lib/email/process-outbox", () => ({
  processNotificationOutbox: cronMocks.processNotificationOutbox,
}));
vi.mock("@/lib/stripe/reconcile-checkouts", () => ({
  reconcileStaleStripeCheckouts: cronMocks.reconcileStaleStripeCheckouts,
}));
vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdmin: () => ({ rpc: cronMocks.rpc }),
}));

import { GET } from "@/app/api/cron/commerce/route";

function cronRequest(authorization?: string) {
  return new Request("https://preview.wanderbike.example/api/cron/commerce", {
    headers: authorization ? { authorization } : undefined,
  });
}

describe("commerce cron authorization and maintenance", () => {
  beforeEach(() => {
    cronMocks.configured = true;
    cronMocks.rpc.mockReset();
    cronMocks.processNotificationOutbox.mockReset();
    cronMocks.reconcileStaleStripeCheckouts.mockReset();
  });

  it("reports an unavailable cron when the secret is not configured", async () => {
    cronMocks.configured = false;

    const response = await GET(cronRequest());

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: "Cron is not configured.",
    });
  });

  it("rejects missing and incorrect bearer credentials before side effects", async () => {
    const missing = await GET(cronRequest());
    const incorrect = await GET(cronRequest("Bearer incorrect"));

    expect(missing.status).toBe(401);
    expect(incorrect.status).toBe(401);
    expect(cronMocks.reconcileStaleStripeCheckouts).not.toHaveBeenCalled();
    expect(cronMocks.rpc).not.toHaveBeenCalled();
    expect(cronMocks.processNotificationOutbox).not.toHaveBeenCalled();
  });

  it("runs Stripe reconciliation, order expiry, and the outbox with valid authorization", async () => {
    cronMocks.reconcileStaleStripeCheckouts.mockResolvedValue({
      inspected: 2,
      expired: 1,
    });
    cronMocks.rpc.mockResolvedValue({ data: 3, error: null });
    cronMocks.processNotificationOutbox.mockResolvedValue({
      claimed: 4,
      sent: 4,
      failed: 0,
    });

    const response = await GET(cronRequest("Bearer cron-test-value"));

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({
      stripeCheckouts: { inspected: 2, expired: 1 },
      expiredOrders: 3,
      notifications: { claimed: 4, sent: 4, failed: 0 },
    });
    expect(cronMocks.reconcileStaleStripeCheckouts).toHaveBeenCalledWith(25);
    expect(cronMocks.rpc).toHaveBeenCalledWith(
      "commerce_expire_stale_orders",
      { p_limit: 200 },
    );
    expect(cronMocks.processNotificationOutbox).toHaveBeenCalledWith(50);
  });

  it("returns a generic error without leaking maintenance details", async () => {
    cronMocks.reconcileStaleStripeCheckouts.mockRejectedValue(
      new Error("provider detail"),
    );

    const response = await GET(cronRequest("Bearer cron-test-value"));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "Commerce maintenance failed.",
    });
  });
});
