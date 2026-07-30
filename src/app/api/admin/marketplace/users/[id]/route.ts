import { NextResponse } from "next/server";
import { isSameOriginRequest } from "@/lib/http/security";
import { roleInputSchema } from "@/lib/marketplace/schemas";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/auth";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { id } = await context.params;
    if (id === auth.user.id) {
      return NextResponse.json(
        { error: "You cannot change your own admin role here." },
        { status: 409 },
      );
    }
    const parsed = roleInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid account role." }, { status: 400 });
    }
    const supabase = getSupabaseAdmin();
    const { data: current } = await supabase
      .from("profiles")
      .select("marketplace_access_status")
      .eq("id", id)
      .maybeSingle();
    if (!current) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }
    if (
      current.marketplace_access_status === "suspended" &&
      parsed.data.role !== "customer"
    ) {
      return NextResponse.json(
        { error: "Restore marketplace access before assigning a staff role." },
        { status: 409 },
      );
    }
    const { data, error } = await supabase
      .from("profiles")
      .update({ role: parsed.data.role })
      .eq("id", id)
      .select("id,email,role")
      .single();
    if (error) throw error;
    return NextResponse.json({ user: data });
  } catch (error) {
    console.error("User role update failed", error);
    return NextResponse.json(
      { error: "Could not update this account role." },
      { status: 500 },
    );
  }
}
