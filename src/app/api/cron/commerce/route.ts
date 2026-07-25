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
    const expired = await getSupabaseAdmin().rpc("commerce_expire_stale_orders", {
      p_limit: 200,
    });
    if (expired.error) throw new Error("Order expiry failed.");
    const notifications = await processNotificationOutbox(50);

    return NextResponse.json(
      {
        expiredOrders: Number(expired.data ?? 0),
        notifications,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Commerce maintenance failed." },
      { status: 500 },
    );
  }
}
