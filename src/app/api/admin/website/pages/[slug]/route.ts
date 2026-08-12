import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isSameOriginRequest } from "@/lib/http/security";
import { getWebsitePageDefinition } from "@/lib/website-cms/config";
import { getGenericWebsitePageDefinition } from "@/lib/website-cms/generic-pages";
import {
  validateWebsiteContent,
  websiteDraftInputSchema,
} from "@/lib/website-cms/schemas";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/auth";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { slug } = await context.params;
    const definition =
      getWebsitePageDefinition(slug) ?? getGenericWebsitePageDefinition(slug);
    if (!definition || !definition.editable) {
      return NextResponse.json(
        { error: "This website page is not editable." },
        { status: 404 },
      );
    }

    const parsed = websiteDraftInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Check the page content and try again." },
        { status: 400 },
      );
    }

    const validated = validateWebsiteContent(
      slug,
      parsed.data.content,
      definition,
    );
    if (!validated.success) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const savedAt = new Date().toISOString();
    const { data, error } = await getSupabaseAdmin()
      .from("website_pages")
      .upsert(
        {
          slug: definition.slug,
          path: definition.path,
          title: definition.label,
          draft_content: validated.content,
          draft_updated_at: savedAt,
          updated_at: savedAt,
          updated_by: auth.user.id,
        },
        { onConflict: "slug" },
      )
      .select("slug,draft_content,draft_updated_at,published_at")
      .single();

    if (error || !data) throw error ?? new Error("Draft could not be loaded.");
    revalidatePath("/admin/website");

    return NextResponse.json({
      page: {
        slug: data.slug,
        draftContent: data.draft_content,
        draftUpdatedAt: data.draft_updated_at,
        publishedAt: data.published_at,
      },
    });
  } catch (error) {
    console.error("Website draft save failed", error);
    return NextResponse.json(
      {
        error:
          "Could not save this draft. Make sure the Website CMS migration has been applied.",
      },
      { status: 503 },
    );
  }
}
