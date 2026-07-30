import "server-only";

import { getServerEnvironment } from "@/lib/env";
import { scheduleNotificationDelivery } from "@/lib/email/schedule";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type MarketplaceTemplateKey =
  | "listing_published"
  | "safety_flag_created"
  | "request_received"
  | "request_sent"
  | "request_accepted"
  | "request_declined"
  | "request_cancelled"
  | "pickup_reminder";

type NotificationInput = {
  requestId?: string;
  listingId?: string;
  templateKey: MarketplaceTemplateKey;
  dedupeKey: string;
  recipient: string | null | undefined;
  payload: Record<string, unknown>;
};

export async function queueMarketplaceNotifications(
  notifications: NotificationInput[],
) {
  const rows = notifications
    .filter(
      (notification) =>
        notification.recipient &&
        (notification.requestId || notification.listingId),
    )
    .map((notification) => ({
      request_id: notification.requestId ?? null,
      listing_id: notification.listingId ?? null,
      template_key: notification.templateKey,
      dedupe_key: notification.dedupeKey,
      recipient: notification.recipient as string,
      payload: notification.payload,
    }));

  if (rows.length === 0) return;
  const { error } = await getSupabaseAdmin()
    .from("marketplace_notification_outbox")
    .upsert(rows, { onConflict: "dedupe_key", ignoreDuplicates: true });
  if (error) throw new Error("Marketplace notification could not be queued.");
  scheduleNotificationDelivery();
}

export function marketplaceTeamEmail() {
  return (
    getServerEnvironment().MARKETPLACE_NOTIFICATION_EMAIL ??
    "zyz18922182165@gmail.com"
  );
}
