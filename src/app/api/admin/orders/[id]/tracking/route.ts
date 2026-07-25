import { NextResponse } from "next/server";
import { manualTrackingSchema } from "@/lib/admin/schemas";
import { scheduleNotificationDelivery } from "@/lib/email/schedule";
import { isSameOriginRequest } from "@/lib/http/security";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/supabase/auth";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const auth = await requireStaff(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await context.params;
  const orderId = Number(id);
  if (!Number.isSafeInteger(orderId) || orderId <= 0) {
    return NextResponse.json({ error: "Invalid order." }, { status: 400 });
  }

  try {
    const body: unknown = await request.json();
    const parsed = manualTrackingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid tracking details." },
        { status: 400 },
      );
    }

    const result = await getSupabaseAdmin().rpc(
      "commerce_add_manual_tracking",
      {
        p_order_id: orderId,
        p_provider: parsed.data.provider,
        p_service_name: parsed.data.serviceName,
        p_tracking_pin: parsed.data.trackingPin,
        p_tracking_url: parsed.data.trackingUrl || null,
        p_idempotency_key: parsed.data.idempotencyKey,
        p_actor_user_id: auth.user.id,
      },
    );

    if (result.error) {
      return NextResponse.json(
        { error: "Tracking could not be saved for this order." },
        { status: 409 },
      );
    }

    scheduleNotificationDelivery();

    return NextResponse.json(
      { result: result.data },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Tracking could not be saved." },
      { status: 500 },
    );
  }
}
