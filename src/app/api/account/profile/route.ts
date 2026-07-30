import { NextResponse } from "next/server";
import { isSameOriginRequest } from "@/lib/http/security";
import { profileInputSchema } from "@/lib/marketplace/schemas";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/supabase/auth";

export async function PATCH(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  try {
    const auth = await requireUser(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const parsed = profileInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Check your profile." },
        { status: 400 },
      );
    }
    const { data, error } = await getSupabaseAdmin()
      .from("profiles")
      .update({
        full_name: parsed.data.fullName,
        phone: parsed.data.phone ?? null,
        bio: parsed.data.bio ?? null,
      })
      .eq("id", auth.user.id)
      .select("id,email,full_name,phone,bio,role")
      .single();
    if (error) throw error;
    return NextResponse.json({ profile: data });
  } catch (error) {
    console.error("Profile update failed", error);
    return NextResponse.json(
      { error: "Could not update your profile." },
      { status: 500 },
    );
  }
}
