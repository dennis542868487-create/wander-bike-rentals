import { NextResponse } from "next/server";
import { fieldErrorPayload } from "@/lib/marketplace/field-errors";
import { z } from "zod";
import { isSameOriginRequest } from "@/lib/http/security";
import { getListingManagerAccess } from "@/lib/marketplace/access-server";
import { recordImageSafetySignal } from "@/lib/marketplace/safety-server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireMarketplaceActor } from "@/lib/supabase/auth";

const predictionSchema = z.object({
  predictions: z
    .array(
      z.object({
        className: z.enum(["Drawing", "Hentai", "Neutral", "Porn", "Sexy"]),
        probability: z.number().min(0).max(1),
      }),
    )
    .length(5),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string; imageId: string }> },
) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  try {
    const auth = await requireMarketplaceActor(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const parsed = predictionSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(fieldErrorPayload(parsed.error), { status: 400 });
    }
    const { id, imageId } = await context.params;
    const access = await getListingManagerAccess(auth.user.id, id);
    if (!access) {
      return NextResponse.json({ error: "Photo not found." }, { status: 404 });
    }
    const supabase = getSupabaseAdmin();
    const { data: image, error } = await supabase
      .from("bike_listing_images")
      .select("id,owner_id,bike_listings(id,title,slug,owner_id)")
      .eq("id", imageId)
      .eq("listing_id", id)
      .maybeSingle();
    if (error || !image) {
      return NextResponse.json({ error: "Photo not found." }, { status: 404 });
    }
    const listingValue = image.bike_listings;
    const listing = Array.isArray(listingValue)
      ? listingValue[0]
      : listingValue;
    if (!listing) {
      return NextResponse.json({ error: "Bike listing not found." }, { status: 404 });
    }

    const flag = await recordImageSafetySignal({
      listingId: listing.id,
      listingTitle: listing.title,
      listingSlug: listing.slug,
      ownerId: listing.owner_id,
      imageId: image.id,
      predictions: parsed.data.predictions,
    });
    return NextResponse.json({ flaggedForAdmin: Boolean(flag) });
  } catch (error) {
    console.error("Image safety signal failed", error);
    return NextResponse.json(
      { error: "Could not record the image scan result." },
      { status: 500 },
    );
  }
}
