import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { renderTransactionalEmail } from "@/lib/email/templates";

describe("marketplace emails", () => {
  it("renders an advisory safety signal for Site Admin", () => {
    const email = renderTransactionalEmail({
      templateKey: "safety_flag_created",
      payload: {
        bike_title: "Blue city bike",
        signal_count: 1,
        signal_source: "image",
      },
      siteUrl: "https://example.test",
    });
    expect(email.subject).toContain("safety signal");
    expect(email.text).toContain("/admin/safety");
    expect(email.text).toContain("remain active");
    expect(email.text).toContain("No online payment or shipping");
    expect(email.text).not.toContain("tracking number");
  });

  it("tells an accepted rider that payment happens in person", () => {
    const email = renderTransactionalEmail({
      templateKey: "request_accepted",
      payload: {
        bike_title: "Blue city bike",
        pickup_area: "Steveston",
        response_note: "Please bring photo ID and arrive by 2:20 PM.",
      },
      siteUrl: "https://example.test",
    });
    expect(email.text).toContain("Payment happens in person");
    expect(email.text).toContain("Please bring photo ID");
    expect(email.text).not.toContain("payment method");
  });

  it("uses the operational request path supplied for staff notifications", () => {
    const email = renderTransactionalEmail({
      templateKey: "request_received",
      payload: {
        bike_title: "Blue city bike",
        request_path: "/operations/requests",
      },
      siteUrl: "https://example.test",
    });

    expect(email.text).toContain("https://example.test/operations/requests");
  });
});
