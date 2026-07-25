import { NextResponse } from "next/server";
import { inventoryAdjustmentSchema } from "@/lib/admin/schemas";
import { isSameOriginRequest } from "@/lib/http/security";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/supabase/auth";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ variantId: string }> },
) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const auth = await requireStaff(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { variantId: rawVariantId } = await context.params;
  const variantId = Number(rawVariantId);
  if (!Number.isSafeInteger(variantId) || variantId <= 0) {
    return NextResponse.json({ error: "Invalid product variant." }, { status: 400 });
  }

  try {
    const body: unknown = await request.json();
    const parsed = inventoryAdjustmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid inventory adjustment." },
        { status: 400 },
      );
    }

    const result = await getSupabaseAdmin().rpc("commerce_adjust_inventory", {
      p_variant_id: variantId,
      p_location_id: parsed.data.locationId,
      p_delta_on_hand: parsed.data.deltaOnHand,
      p_reason: parsed.data.reason,
      p_actor_user_id: auth.user.id,
    });
    if (result.error) {
      if (result.error.code === "23514") {
        return NextResponse.json(
          { error: "The inventory adjustment would conflict with active reservations." },
          { status: 409 },
        );
      }

      if (result.error.code === "22023") {
        return NextResponse.json(
          { error: "The inventory adjustment is invalid." },
          { status: 400 },
        );
      }

      if (result.error.code === "42501") {
        return NextResponse.json(
          { error: "A staff account is required." },
          { status: 403 },
        );
      }

      console.error("Inventory adjustment RPC failed", {
        code: result.error.code,
      });
      return NextResponse.json(
        { error: "Inventory could not be adjusted." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { inventory: Array.isArray(result.data) ? result.data[0] : result.data },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Inventory could not be adjusted." },
      { status: 500 },
    );
  }
}
