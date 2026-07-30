import { NextResponse } from "next/server";
import { isSameOriginRequest } from "@/lib/http/security";
import { getListingManagerAccess } from "@/lib/marketplace/access-server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/supabase/auth";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string; imageId: string }> },
) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  try {
    const auth = await requireUser(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { id, imageId } = await context.params;
    const access = await getListingManagerAccess(auth.user.id, id);
    if (!access) {
      return NextResponse.json({ error: "Photo not found." }, { status: 404 });
    }
    const supabase = getSupabaseAdmin();
    const { data: image } = await supabase
      .from("bike_listing_images")
      .select("id,storage_path")
      .eq("id", imageId)
      .eq("listing_id", id)
      .maybeSingle();
    if (!image) {
      return NextResponse.json({ error: "Photo not found." }, { status: 404 });
    }
    const { error: storageError } = await supabase.storage
      .from("bike-listing-images")
      .remove([image.storage_path]);
    if (storageError) throw storageError;
    const { error } = await supabase
      .from("bike_listing_images")
      .delete()
      .eq("id", imageId)
      .eq("listing_id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Listing photo deletion failed", error);
    return NextResponse.json(
      { error: "Could not remove this photo." },
      { status: 500 },
    );
  }
}
