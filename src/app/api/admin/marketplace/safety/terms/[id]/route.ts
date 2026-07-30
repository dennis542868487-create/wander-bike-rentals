import { NextResponse } from "next/server";
import { isSameOriginRequest } from "@/lib/http/security";
import { sensitiveTermStatusSchema } from "@/lib/marketplace/schemas";
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
    const parsed = sensitiveTermStatusSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid term update." }, { status: 400 });
    }
    const { id } = await context.params;
    const termId = Number(id);
    if (!Number.isSafeInteger(termId) || termId <= 0) {
      return NextResponse.json({ error: "Sensitive term not found." }, { status: 404 });
    }
    const { data, error } = await getSupabaseAdmin()
      .from("marketplace_sensitive_terms")
      .update({ active: parsed.data.active })
      .eq("id", termId)
      .select("id,term,category,active")
      .maybeSingle();
    if (error || !data) {
      return NextResponse.json({ error: "Sensitive term not found." }, { status: 404 });
    }
    return NextResponse.json({ term: data });
  } catch (error) {
    console.error("Sensitive term update failed", error);
    return NextResponse.json(
      { error: "Could not update this sensitive term." },
      { status: 500 },
    );
  }
}
