import { NextResponse } from "next/server";
import { returnCreateSchema } from "@/lib/admin/schemas";
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
    const parsed = returnCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid return request." },
        { status: 400 },
      );
    }

    const result = await getSupabaseAdmin().rpc("commerce_create_return", {
      p_order_id: orderId,
      p_reason: parsed.data.reason,
      p_items: parsed.data.items.map((item) => ({
        order_item_id: item.orderItemId,
        quantity: item.quantity,
      })),
      p_actor_user_id: auth.user.id,
    });
    if (result.error) {
      return NextResponse.json(
        { error: "The return could not be created for these items." },
        { status: 409 },
      );
    }

    scheduleNotificationDelivery();

    return NextResponse.json(
      { return: result.data },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "The return could not be created." },
      { status: 500 },
    );
  }
}
