import "server-only";

import { Resend } from "resend";
import { getServerEnvironment, requireServerEnvironment } from "@/lib/env";
import { renderTransactionalEmail } from "@/lib/email/templates";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

type ClaimedNotification = {
  id: number;
  request_id: string | null;
  listing_id: string | null;
  template_key: string;
  recipient: string;
  payload: Record<string, unknown>;
  attempt_count: number;
};

export async function processNotificationOutbox(limit = 20) {
  const environment = requireServerEnvironment("RESEND_API_KEY", "EMAIL_FROM");
  const supabase = getSupabaseAdmin();
  const claimed = await supabase.rpc("marketplace_claim_notifications", {
    p_limit: Math.max(1, Math.min(limit, 100)),
  });
  if (claimed.error) throw new Error("Notification queue could not be claimed.");

  const rows = (claimed.data ?? []) as ClaimedNotification[];
  const resend = new Resend(environment.RESEND_API_KEY);
  const siteUrl = environment.NEXT_PUBLIC_SITE_URL ?? "https://www.wanderbike.ca";
  const replyTo =
    environment.EMAIL_REPLY_TO ?? environment.MARKETPLACE_NOTIFICATION_EMAIL;
  let sent = 0;
  let failed = 0;

  for (const row of rows) {
    try {
      const email = renderTransactionalEmail({
        templateKey: row.template_key,
        payload: row.payload ?? {},
        siteUrl,
      });
      const response = await resend.emails.send(
        {
          from: environment.EMAIL_FROM,
          to: row.recipient,
          ...(replyTo ? { replyTo } : {}),
          subject: email.subject,
          html: email.html,
          text: email.text,
          tags: [
            { name: "template", value: row.template_key },
            {
              name: "source",
              value: row.request_id ? "marketplace-request" : "bike-listing",
            },
          ],
        },
        { idempotencyKey: `wander-marketplace-outbox-${row.id}` },
      );

      if (response.error || !response.data?.id) {
        throw new Error(
          response.error?.message ?? "Email provider rejected request.",
        );
      }
      const finished = await supabase.rpc("marketplace_finish_notification", {
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
      await supabase.rpc("marketplace_finish_notification", {
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
