import { NextResponse } from "next/server";
import { orderDetailsUpdateSchema } from "@/lib/admin/schemas";
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
    const parsed = orderDetailsUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ?? "Invalid customer or address details.",
        },
        { status: 400 },
      );
    }

    const details = parsed.data;
    const result = await getSupabaseAdmin().rpc(
      "commerce_update_unfulfilled_order_details",
      {
        p_order_id: orderId,
        p_details: {
          email: details.email,
          first_name: details.firstName,
          last_name: details.lastName,
          phone: details.phone || null,
          customer_note: details.customerNote || null,
          shipping_address: details.shippingAddress,
        },
        p_actor_user_id: auth.user.id,
      },
    );

    if (result.error) {
      return NextResponse.json(
        {
          error:
            "The details could not be changed. The order may already be fulfilled or have a shipment in progress.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { result: result.data },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "The order details could not be updated." },
      { status: 500 },
    );
  }
}
