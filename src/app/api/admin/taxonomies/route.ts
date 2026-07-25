import { NextResponse } from "next/server";
import { catalogTaxonomySchema } from "@/lib/admin/schemas";
import { isSameOriginRequest } from "@/lib/http/security";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/supabase/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const auth = await requireStaff(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  if (auth.role !== "admin") {
    return NextResponse.json(
      { error: "Only administrators can change categories and brands." },
      { status: 403 },
    );
  }

  try {
    const body: unknown = await request.json();
    const parsed = catalogTaxonomySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message ?? "Invalid catalog taxonomy.",
        },
        { status: 400 },
      );
    }

    const value =
      parsed.data.kind === "category"
        ? {
            parent_id: parsed.data.parentId,
            slug: parsed.data.slug,
            name: parsed.data.name,
            description: parsed.data.description,
            sort_order: parsed.data.sortOrder,
            is_active: parsed.data.isActive,
          }
        : {
            slug: parsed.data.slug,
            name: parsed.data.name,
            description: parsed.data.description,
            website_url: parsed.data.websiteUrl,
            is_active: parsed.data.isActive,
          };
    const result = await getSupabaseAdmin().rpc(
      "commerce_upsert_catalog_taxonomy",
      {
        p_kind: parsed.data.kind,
        p_taxonomy_id: parsed.data.id,
        p_value: value,
        p_actor_user_id: auth.user.id,
      },
    );
    if (result.error) {
      const conflict = result.error.code === "23505";
      return NextResponse.json(
        {
          error: conflict
            ? "That name or slug is already in use."
            : "The category or brand could not be saved.",
        },
        { status: conflict ? 409 : 400 },
      );
    }

    return NextResponse.json(
      { taxonomy: result.data },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "The category or brand could not be saved." },
      { status: 500 },
    );
  }
}
