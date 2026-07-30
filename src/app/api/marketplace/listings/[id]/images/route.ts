import { NextResponse } from "next/server";
import { z } from "zod";
import { isSameOriginRequest } from "@/lib/http/security";
import { getListingManagerAccess } from "@/lib/marketplace/access-server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireMarketplaceActor } from "@/lib/supabase/auth";

const imageInputSchema = z.object({
  images: z
    .array(
      z.object({
        storagePath: z.string().min(40).max(1000),
        alt: z.string().trim().min(1).max(240),
        width: z.number().int().min(1).max(20000).nullable().optional(),
        height: z.number().int().min(1).max(20000).nullable().optional(),
        sortOrder: z.number().int().min(0).max(99),
      }),
    )
    .min(1)
    .max(8),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  try {
    const auth = await requireMarketplaceActor(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { id } = await context.params;
    const parsed = imageInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid image details." }, { status: 400 });
    }
    const access = await getListingManagerAccess(auth.user.id, id);
    if (!access) {
      return NextResponse.json({ error: "Bike listing not found." }, { status: 404 });
    }
    const supabase = getSupabaseAdmin();
    const expectedPrefix = `${auth.user.id}/${id}/`;
    if (
      parsed.data.images.some(
        (image) =>
          !image.storagePath.startsWith(expectedPrefix) ||
          image.storagePath.includes(".."),
      )
    ) {
      return NextResponse.json({ error: "Invalid image path." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("bike_listing_images")
      .insert(
        parsed.data.images.map((image) => ({
          listing_id: id,
          owner_id: auth.user.id,
          storage_path: image.storagePath,
          alt_text: image.alt,
          width: image.width ?? null,
          height: image.height ?? null,
          sort_order: image.sortOrder,
        })),
      )
      .select("id,storage_path,sort_order");
    if (error) throw error;
    return NextResponse.json({ images: data }, { status: 201 });
  } catch (error) {
    console.error("Listing image metadata failed", error);
    return NextResponse.json(
      { error: "Could not attach the uploaded photos." },
      { status: 500 },
    );
  }
}
