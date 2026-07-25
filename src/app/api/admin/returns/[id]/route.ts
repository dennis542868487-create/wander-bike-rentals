import { NextResponse } from "next/server";
import { returnUpdateSchema } from "@/lib/admin/schemas";
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
  const returnId = Number(id);
  if (!Number.isSafeInteger(returnId) || returnId <= 0) {
    return NextResponse.json({ error: "Invalid return." }, { status: 400 });
  }

  try {
    const body: unknown = await request.json();
    const parsed = returnUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid return update." },
        { status: 400 },
      );
    }

    const result = await getSupabaseAdmin().rpc("commerce_update_return", {
      p_return_id: returnId,
      p_status: parsed.data.status,
      p_resolution: parsed.data.resolution || null,
      p_actor_user_id: auth.user.id,
    });
    if (result.error) {
      return NextResponse.json(
        { error: "That return status transition is not allowed." },
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
      { error: "The return could not be updated." },
      { status: 500 },
    );
  }
}
