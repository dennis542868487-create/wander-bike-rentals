import { NextResponse } from "next/server";
import { fulfillmentUpdateSchema } from "@/lib/admin/schemas";
import { scheduleNotificationDelivery } from "@/lib/email/schedule";
import { isSameOriginRequest } from "@/lib/http/security";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/supabase/auth";

export const runtime = "nodejs";

export async function PATCH(
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
    const parsed = fulfillmentUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid order update." },
        { status: 400 },
      );
    }

    const result = await getSupabaseAdmin().rpc(
      "commerce_update_order_fulfillment",
      {
        p_order_id: orderId,
        p_fulfillment_status: parsed.data.fulfillmentStatus,
        p_internal_note: parsed.data.internalNote || null,
        p_actor_user_id: auth.user.id,
      },
    );
    if (result.error) {
      return NextResponse.json(
        { error: "The order status could not be updated." },
        { status: 409 },
      );
    }

    scheduleNotificationDelivery();

    return NextResponse.json(
      { result: result.data },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "The order status could not be updated." },
      { status: 500 },
    );
  }
}
