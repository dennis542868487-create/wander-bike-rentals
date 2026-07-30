import { NextResponse } from "next/server";
import { fieldErrorPayload } from "@/lib/marketplace/field-errors";
import { isSameOriginRequest } from "@/lib/http/security";
import { listingInputSchema } from "@/lib/marketplace/schemas";
import { queueMarketplaceNotifications } from "@/lib/marketplace/notifications";
import { refreshListingTextSignals } from "@/lib/marketplace/safety-server";
import { uniqueListingSlug } from "@/lib/marketplace/slug";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireMarketplaceActor } from "@/lib/supabase/auth";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  try {
    const auth = await requireMarketplaceActor(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const parsed = listingInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(fieldErrorPayload(parsed.error), { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role,email")
      .eq("id", auth.user.id)
      .single();
    if (profileError || !profile) throw new Error("Profile could not be loaded.");

    const isStaff = profile.role === "staff" || profile.role === "admin";
    const source =
      parsed.data.source === "wander" && isStaff ? "wander" : "community";
    const status = "active";
    const publishedAt = new Date().toISOString();
    const rents =
      parsed.data.offerMode === "rent" ||
      parsed.data.offerMode === "rent_sale";
    const sells =
      parsed.data.offerMode === "sale" ||
      parsed.data.offerMode === "rent_sale";

    const { data: listing, error: listingError } = await supabase
      .from("bike_listings")
      .insert({
        owner_id: auth.user.id,
        source,
        slug: uniqueListingSlug(parsed.data.title),
        title: parsed.data.title,
        short_description: parsed.data.shortDescription ?? null,
        description: parsed.data.description,
        bike_type: parsed.data.bikeType,
        brand: parsed.data.brand ?? null,
        model: parsed.data.model ?? null,
        frame_size: parsed.data.frameSize ?? null,
        condition: parsed.data.condition,
        offer_mode: parsed.data.offerMode,
        rental_hourly_cents: rents
          ? parsed.data.rentalHourlyCents ?? null
          : null,
        rental_daily_cents: rents
          ? parsed.data.rentalDailyCents ?? null
          : null,
        sale_price_cents: sells ? parsed.data.salePriceCents ?? null : null,
        minimum_rental_hours: parsed.data.minimumRentalHours,
        pickup_area: parsed.data.pickupArea,
        city: parsed.data.city,
        province: parsed.data.province,
        approximate_latitude: parsed.data.approximateLatitude ?? null,
        approximate_longitude: parsed.data.approximateLongitude ?? null,
        available_from: parsed.data.availableFrom ?? null,
        available_until: parsed.data.availableUntil ?? null,
        availability_summary: parsed.data.availabilitySummary ?? null,
        rental_rules: parsed.data.rentalRules ?? null,
        included_items: parsed.data.includedItems,
        status,
        published_at: publishedAt,
      })
      .select("id,owner_id,slug,title,status,source,updated_at")
      .single();
    if (listingError || !listing) throw new Error("Bike listing could not be saved.");

    const { error: privateError } = await supabase
      .from("bike_listing_private_details")
      .insert({
        listing_id: listing.id,
        owner_id: auth.user.id,
        pickup_address: parsed.data.pickupAddress,
        postal_code: parsed.data.postalCode ?? null,
        pickup_instructions: parsed.data.pickupInstructions ?? null,
      });
    if (privateError) {
      await supabase.from("bike_listings").delete().eq("id", listing.id);
      throw new Error("Private pickup details could not be saved.");
    }

    try {
      await refreshListingTextSignals({
        listingId: listing.id,
        ownerId: listing.owner_id,
        listingTitle: listing.title,
        listingSlug: listing.slug,
        listingUpdatedAt: listing.updated_at,
        text: parsed.data,
      });
    } catch (safetyError) {
      console.error("Listing text signals could not be refreshed", safetyError);
    }

    try {
      await queueMarketplaceNotifications([
        {
          listingId: listing.id,
          templateKey: "listing_published",
          dedupeKey: `listing-published:${listing.id}`,
          recipient: profile.email,
          payload: {
            bike_title: listing.title,
            listing_slug: listing.slug,
          },
        },
      ]);
    } catch (notificationError) {
      console.error("Listing notification queue failed", notificationError);
    }

    return NextResponse.json({ listing }, { status: 201 });
  } catch (error) {
    console.error("Marketplace listing creation failed", error);
    return NextResponse.json(
      { error: "Could not save this bike listing. Please try again." },
      { status: 500 },
    );
  }
}
