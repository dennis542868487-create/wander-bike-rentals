import "server-only";

import { Resend } from "resend";
import { getServerEnvironment, requireServerEnvironment } from "@/lib/env";
import { renderTransactionalEmail } from "@/lib/email/templates";
import { getCommerceStoreSettings } from "@/lib/commerce/settings";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

type UnknownRecord = Record<string, unknown>;

type ClaimedNotification = {
  id: number;
  order_id: number | null;
  booking_id: string | null;
  template_key: string;
  recipient: string;
  payload: UnknownRecord;
  attempt_count: number;
};

export async function processNotificationOutbox(limit = 20) {
  const environment = requireServerEnvironment("RESEND_API_KEY", "EMAIL_FROM");
  const supabase = getSupabaseAdmin();
  const storeSettings = await getCommerceStoreSettings();
  const merchantEmail =
    storeSettings.notificationEmail || environment.ORDER_NOTIFICATION_EMAIL;
  const claimed = await supabase.rpc("commerce_claim_notifications", {
    p_limit: Math.max(1, Math.min(limit, 100)),
  });
  if (claimed.error) throw new Error("Notification queue could not be claimed.");

  const rows = (claimed.data ?? []) as ClaimedNotification[];
  const resend = new Resend(environment.RESEND_API_KEY);
  const siteUrl = environment.NEXT_PUBLIC_SITE_URL ?? "https://www.wanderbike.ca";
  let sent = 0;
  let failed = 0;

  for (const row of rows) {
    try {
      const email = renderTransactionalEmail({
        templateKey: row.template_key,
        payload: row.payload ?? {},
        siteUrl,
      });
      const bcc =
        row.template_key === "order_confirmation" &&
        merchantEmail &&
        merchantEmail.toLowerCase() !== row.recipient.toLowerCase()
          ? merchantEmail
          : undefined;
      const response = await resend.emails.send(
        {
          from: environment.EMAIL_FROM,
          to: row.recipient,
          ...(bcc ? { bcc } : {}),
          ...(merchantEmail ? { replyTo: merchantEmail } : {}),
          subject: email.subject,
          html: email.html,
          text: email.text,
          tags: [
            { name: "template", value: row.template_key },
            { name: "source", value: row.order_id ? "order" : "booking" },
          ],
        },
        { idempotencyKey: `wander-bike-outbox-${row.id}` },
      );

      if (response.error || !response.data?.id) {
        throw new Error(response.error?.message ?? "Email provider rejected request.");
      }
      const finished = await supabase.rpc("commerce_finish_notification", {
        p_notification_id: row.id,
        p_status: "sent",
        p_provider_message_id: response.data.id,
        p_error: null,
      });
      if (finished.error) {
        throw new Error("Email sent but queue acknowledgement failed.");
      }
      sent += 1;
    } catch (error) {
      failed += 1;
      await supabase.rpc("commerce_finish_notification", {
        p_notification_id: row.id,
        p_status: "failed",
        p_provider_message_id: null,
        p_error:
          error instanceof Error
            ? error.message.slice(0, 1000)
            : "Email delivery failed.",
      });
    }
  }

  return { claimed: rows.length, sent, failed };
}

export function emailDeliveryIsConfigured() {
  const environment = getServerEnvironment();
  return Boolean(environment.RESEND_API_KEY && environment.EMAIL_FROM);
}
