import { NextResponse } from "next/server";
import { isSameOriginRequest } from "@/lib/http/security";
import { sensitiveTermInputSchema } from "@/lib/marketplace/schemas";
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
    const parsed = sensitiveTermInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid sensitive term." },
        { status: 400 },
      );
    }
    const { data, error } = await getSupabaseAdmin()
      .from("marketplace_sensitive_terms")
      .insert({
        term: parsed.data.term,
        category: parsed.data.category,
        created_by: auth.user.id,
      })
      .select("id,term,category,active")
      .single();
    if (error?.code === "23505") {
      return NextResponse.json(
        { error: "This sensitive term already exists." },
        { status: 409 },
      );
    }
    if (error || !data) throw error;
    return NextResponse.json({ term: data }, { status: 201 });
  } catch (error) {
    console.error("Sensitive term creation failed", error);
    return NextResponse.json(
      { error: "Could not add this sensitive term." },
      { status: 500 },
    );
  }
}
