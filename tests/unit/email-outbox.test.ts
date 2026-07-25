import { beforeEach, describe, expect, it, vi } from "vitest";

const outboxMocks = vi.hoisted(() => ({
  environment: {
    RESEND_API_KEY: "configured-test-value",
    EMAIL_FROM: "Wander Bike <sandbox@example.test>",
    ORDER_NOTIFICATION_EMAIL: "merchant@example.test",
    NEXT_PUBLIC_SITE_URL: "https://preview.wanderbike.example",
  } as Record<string, string | undefined>,
  rpc: vi.fn(),
  send: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("resend", () => ({
  Resend: class {
    emails = { send: outboxMocks.send };
  },
}));
vi.mock("@/lib/env", () => ({
  getServerEnvironment: () => outboxMocks.environment,
  requireServerEnvironment: (...keys: string[]) => {
    const missing = keys.filter((key) => !outboxMocks.environment[key]);
    if (missing.length > 0) throw new Error(`Missing: ${missing.join(", ")}`);
    return outboxMocks.environment;
  },
}));
vi.mock("@/lib/commerce/settings", () => ({
  getCommerceStoreSettings: async () => ({
    notificationEmail: "merchant@example.test",
  }),
}));
vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdmin: () => ({ rpc: outboxMocks.rpc }),
}));

import {
  emailDeliveryIsConfigured,
  processNotificationOutbox,
} from "@/lib/email/process-outbox";

const notification = {
  id: 77,
  order_id: 1001,
  booking_id: null,
  template_key: "order_confirmation",
  recipient: "customer@example.test",
  payload: {
    order_number: "WB-TEST-1001",
    public_id: "public-order-1001",
  },
  attempt_count: 2,
};

describe("notification outbox delivery", () => {
  beforeEach(() => {
    outboxMocks.environment.RESEND_API_KEY = "configured-test-value";
    outboxMocks.environment.EMAIL_FROM =
      "Wander Bike <sandbox@example.test>";
    outboxMocks.rpc.mockReset();
    outboxMocks.send.mockReset();
  });

  it("sends a claimed notification with a stable provider idempotency key", async () => {
    outboxMocks.rpc
      .mockResolvedValueOnce({ data: [notification], error: null })
      .mockResolvedValueOnce({ data: null, error: null });
    outboxMocks.send.mockResolvedValue({
      data: { id: "provider-message-77" },
      error: null,
    });

    await expect(processNotificationOutbox(50)).resolves.toEqual({
      claimed: 1,
      sent: 1,
      failed: 0,
    });

    expect(outboxMocks.rpc).toHaveBeenNthCalledWith(
      1,
      "commerce_claim_notifications",
      { p_limit: 50 },
    );
    expect(outboxMocks.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "customer@example.test",
        bcc: "merchant@example.test",
        replyTo: "merchant@example.test",
        subject: expect.stringContaining("WB-TEST-1001"),
      }),
      { idempotencyKey: "wander-bike-outbox-77" },
    );
    expect(outboxMocks.rpc).toHaveBeenNthCalledWith(
      2,
      "commerce_finish_notification",
      {
        p_notification_id: 77,
        p_status: "sent",
        p_provider_message_id: "provider-message-77",
        p_error: null,
      },
    );
  });

  it("returns a provider failure to the durable queue for retry", async () => {
    outboxMocks.rpc
      .mockResolvedValueOnce({ data: [notification], error: null })
      .mockResolvedValueOnce({ data: null, error: null });
    outboxMocks.send.mockRejectedValue(new Error("provider unavailable"));

    await expect(processNotificationOutbox(20)).resolves.toEqual({
      claimed: 1,
      sent: 0,
      failed: 1,
    });

    expect(outboxMocks.rpc).toHaveBeenNthCalledWith(
      2,
      "commerce_finish_notification",
      {
        p_notification_id: 77,
        p_status: "failed",
        p_provider_message_id: null,
        p_error: "provider unavailable",
      },
    );
  });

  it("fails before claiming queue rows when email credentials are absent", async () => {
    outboxMocks.environment.RESEND_API_KEY = undefined;

    expect(emailDeliveryIsConfigured()).toBe(false);
    await expect(processNotificationOutbox()).rejects.toThrow(
      "Missing: RESEND_API_KEY",
    );
    expect(outboxMocks.rpc).not.toHaveBeenCalled();
    expect(outboxMocks.send).not.toHaveBeenCalled();
  });
});
