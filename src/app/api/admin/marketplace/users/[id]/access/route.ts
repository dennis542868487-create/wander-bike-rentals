import { NextResponse } from "next/server";
import { isSameOriginRequest } from "@/lib/http/security";
import { marketplaceAccessInputSchema } from "@/lib/marketplace/schemas";
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
        { error: "You cannot suspend your own Site Admin account." },
        { status: 409 },
      );
    }
    const parsed = marketplaceAccessInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ?? "Invalid marketplace access update.",
        },
        { status: 400 },
      );
    }
    const supabase = getSupabaseAdmin();
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id,email,role,marketplace_access_status")
      .eq("id", id)
      .maybeSingle();
    if (profileError || !profile) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }
    if (parsed.data.status === "suspended" && profile.role !== "customer") {
      return NextResponse.json(
        {
          error:
            "Staff roles must be removed before marketplace access can be suspended.",
        },
        { status: 409 },
      );
    }

    const result = await supabase.rpc("marketplace_set_user_access", {
      p_user_id: id,
      p_status: parsed.data.status,
      p_reason: parsed.data.reason ?? "",
      p_actor_id: auth.user.id,
    });
    if (result.error) throw result.error;
    return NextResponse.json({
      user: {
        id: profile.id,
        email: profile.email,
        marketplaceAccessStatus: parsed.data.status,
      },
    });
  } catch (error) {
    console.error("Marketplace access update failed", error);
    return NextResponse.json(
      { error: "Could not update marketplace access." },
      { status: 500 },
    );
  }
}
