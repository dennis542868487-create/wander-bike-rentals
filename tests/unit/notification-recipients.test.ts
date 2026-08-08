import { describe, expect, it } from "vitest";
import { requestReceivedRecipients } from "@/lib/marketplace/notification-recipients";

describe("marketplace request notification recipients", () => {
  it("includes the owner, every configured operator, and Site Admin", () => {
    const recipients = requestReceivedRecipients("owner@example.com");

    expect(recipients).toEqual(
      expect.arrayContaining([
        { email: "owner@example.com", requestPath: "/account/requests" },
        { email: "zys1389@gmail.com", requestPath: "/operations/requests" },
        {
          email: "dennis18922182165@gmail.com",
          requestPath: "/operations/requests",
        },
        {
          email: "nancyzhuo2586@gmail.com",
          requestPath: "/operations/requests",
        },
        { email: "zyz18922182165@gmail.com", requestPath: "/admin/requests" },
      ]),
    );
  });

  it("adds database-granted staff and de-duplicates addresses case-insensitively", () => {
    const recipients = requestReceivedRecipients(" NancyZhuo2586@gmail.com ", [
      { email: "NANCYZHUO2586@GMAIL.COM", role: "staff" },
      { email: "new-admin@example.com", role: "admin" },
    ]);

    expect(
      recipients.filter(
        (recipient) => recipient.email === "nancyzhuo2586@gmail.com",
      ),
    ).toEqual([
      {
        email: "nancyzhuo2586@gmail.com",
        requestPath: "/operations/requests",
      },
    ]);
    expect(recipients).toContainEqual({
      email: "new-admin@example.com",
      requestPath: "/admin/requests",
    });
  });
});
