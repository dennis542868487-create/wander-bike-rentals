import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const templateKeys = [
  "order_confirmation",
  "payment_failed",
  "order_preparing",
  "order_ready_for_pickup",
  "order_ready_to_ship",
  "tracking_created",
  "order_shipped",
  "order_delivered",
  "order_picked_up",
  "order_cancelled",
  "refund_partial",
  "refund_full",
  "return_status_updated",
] as const;

describe("transactional email templates", () => {
  let renderTransactionalEmail: typeof import("@/lib/email/templates").renderTransactionalEmail;

  beforeAll(async () => {
    ({ renderTransactionalEmail } = await import("@/lib/email/templates"));
  });

  it.each(templateKeys)("renders %s in HTML and plain text", (templateKey) => {
    const email = renderTransactionalEmail({
      templateKey,
      payload: {
        order_number: "WB-TEST-1001",
        public_id: "public-order-1001",
        refund_amount_cents: 4567,
        return_number: "RET-1001",
        return_status: "inspection_complete",
        tracking_pin: "1234567890123456",
        tracking_url: "https://www.canadapost-postescanada.ca/track/123",
      },
      siteUrl: "https://preview.wanderbike.example",
    });

    expect(email.subject).toContain("WB-TEST-1001");
    expect(email.html).toContain("<!doctype html>");
    expect(email.html).toContain("Wander Bike");
    expect(email.text).toContain("Wander Bike");
    expect(email.text).toContain("WB-TEST-1001");
  });

  it("escapes customer-controlled values before inserting them into HTML", () => {
    const email = renderTransactionalEmail({
      templateKey: "return_status_updated",
      payload: {
        order_number: "<img src=x onerror=alert(1)>",
        public_id: "safe-id",
        return_number: "<script>alert(1)</script>",
        return_status: "<b>received</b>",
        resolution: "\"quoted\" & <unsafe>",
      },
      siteUrl: "https://preview.wanderbike.example",
    });

    expect(email.html).not.toContain("<script>");
    expect(email.html).not.toContain("<img");
    expect(email.html).not.toContain("<b>");
    expect(email.html).toContain("&lt;script&gt;");
    expect(email.html).toContain("&quot;quoted&quot; &amp; &lt;unsafe&gt;");
  });

  it("uses only HTTPS tracking links and otherwise falls back to the order page", () => {
    const safe = renderTransactionalEmail({
      templateKey: "order_shipped",
      payload: {
        order_number: "WB-TEST-1002",
        public_id: "safe-order",
        tracking_url: "https://carrier.example/track/1002",
      },
      siteUrl: "https://preview.wanderbike.example",
    });
    const unsafe = renderTransactionalEmail({
      templateKey: "order_shipped",
      payload: {
        order_number: "WB-TEST-1002",
        public_id: "safe-order",
        tracking_url: "javascript:alert(1)",
      },
      siteUrl: "https://preview.wanderbike.example",
    });

    expect(safe.html).toContain("https://carrier.example/track/1002");
    expect(safe.text).toContain("Track shipment:");
    expect(unsafe.html).not.toContain("javascript:");
    expect(unsafe.html).toContain(
      "https://preview.wanderbike.example/orders/safe-order",
    );
    expect(unsafe.text).toContain("View order:");
  });

  it("rejects unknown template keys instead of sending generic mail", () => {
    expect(() =>
      renderTransactionalEmail({
        templateKey: "unknown_template",
        payload: {},
        siteUrl: "https://preview.wanderbike.example",
      }),
    ).toThrow("Unsupported email template");
  });
});
