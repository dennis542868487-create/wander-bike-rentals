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
      },
      siteUrl: "https://example.test",
    });
    expect(email.text).toContain("Payment happens in person");
    expect(email.text).not.toContain("payment method");
  });
});
