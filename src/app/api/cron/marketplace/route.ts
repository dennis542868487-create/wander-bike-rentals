import { NextResponse } from "next/server";
import { processNotificationOutbox } from "@/lib/email/process-outbox";
import { requireServerEnvironment } from "@/lib/env";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  let cronSecret: string;
  try {
    cronSecret = requireServerEnvironment("CRON_SECRET").CRON_SECRET;
  } catch {
    return NextResponse.json({ error: "Cron is not configured." }, { status: 503 });
  }
  if (request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const reminders = await getSupabaseAdmin().rpc(
      "marketplace_queue_pickup_reminders",
    );
    if (reminders.error) throw new Error("Pickup reminders could not be queued.");
    const notifications = await processNotificationOutbox(50);
    return NextResponse.json(
      {
        pickupRemindersQueued: Number(reminders.data ?? 0),
        notifications,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Marketplace maintenance failed", error);
    return NextResponse.json(
      { error: "Marketplace maintenance failed." },
      { status: 500 },
    );
  }
}
