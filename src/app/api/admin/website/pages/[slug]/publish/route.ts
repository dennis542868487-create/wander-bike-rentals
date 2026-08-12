import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isSameOriginRequest } from "@/lib/http/security";
import { getWebsitePageDefinition } from "@/lib/website-cms/config";
import { getGenericWebsitePageDefinition } from "@/lib/website-cms/generic-pages";
import { validateWebsiteContent } from "@/lib/website-cms/schemas";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/auth";

export async function POST(
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

    const supabase = getSupabaseAdmin();
    const { data: draft, error: draftError } = await supabase
      .from("website_pages")
      .select("draft_content")
      .eq("slug", slug)
      .single();
    if (draftError || !draft) throw draftError ?? new Error("Draft not found.");

    const validated = validateWebsiteContent(
      slug,
      draft.draft_content,
      definition,
    );
    if (!validated.success) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const { data, error } = await supabase.rpc("publish_website_page", {
      p_slug: slug,
      p_actor_id: auth.user.id,
    });
    if (error || !data) throw error ?? new Error("Page could not be published.");

    revalidatePath(definition.path);
    revalidatePath("/admin/website");

    return NextResponse.json({
      page: {
        slug,
        publishedContent: validated.content,
        publishedAt: data.published_at,
      },
    });
  } catch (error) {
    console.error("Website publish failed", error);
    return NextResponse.json(
      {
        error:
          "Could not publish this page. Save the draft and check the CMS database setup.",
      },
      { status: 503 },
    );
  }
}
