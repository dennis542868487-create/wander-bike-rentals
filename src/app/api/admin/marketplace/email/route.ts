import { NextResponse } from "next/server";
import { isSameOriginRequest } from "@/lib/http/security";
import { processNotificationOutbox } from "@/lib/email/process-outbox";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/auth";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const body = (await request.json()) as { notificationId?: number };
    if (body.notificationId) {
      const { error } = await getSupabaseAdmin()
        .from("marketplace_notification_outbox")
        .update({
          status: "pending",
          available_at: new Date().toISOString(),
          last_error: null,
        })
        .eq("id", body.notificationId)
        .in("status", ["failed", "cancelled"]);
      if (error) throw error;
    }
    const result = await processNotificationOutbox(25);
    return NextResponse.json({ result });
  } catch (error) {
    console.error("Manual email processing failed", error);
    return NextResponse.json(
      { error: "Could not process the email queue. Check Resend configuration." },
      { status: 503 },
    );
  }
}
