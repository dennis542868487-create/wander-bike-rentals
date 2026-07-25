import "server-only";

import { after } from "next/server";
import {
  emailDeliveryIsConfigured,
  processNotificationOutbox,
} from "@/lib/email/process-outbox";

export function scheduleNotificationDelivery(limit = 10) {
  if (!emailDeliveryIsConfigured()) return;

  after(async () => {
    try {
      await processNotificationOutbox(limit);
    } catch {
      // The durable outbox remains pending for the next request or cron retry.
    }
  });
}
