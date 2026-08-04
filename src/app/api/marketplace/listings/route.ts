import { NextResponse } from "next/server";
import { isSameOriginRequest } from "@/lib/http/security";
import { listingInputSchema } from "@/lib/marketplace/schemas";
import { queueMarketplaceNotifications } from "@/lib/marketplace/notifications";
import { refreshListingTextSignals } from "@/lib/marketplace/safety-server";
import { uniqueListingSlug } from "@/lib/marketplace/slug";
import { applyWanderShopListingDefaults } from "@/lib/marketplace/wander-shop";
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
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Check the listing details." },
        { status: 400 },
      );
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
    const listingData =
      source === "wander"
        ? applyWanderShopListingDefaults(parsed.data)
        : parsed.data;
    const status = "active";
    const publishedAt = new Date().toISOString();
    const rents =
      listingData.offerMode === "rent" ||
      listingData.offerMode === "rent_sale";
    const sells =
      listingData.offerMode === "sale" ||
      listingData.offerMode === "rent_sale";

    const { data: listing, error: listingError } = await supabase
      .from("bike_listings")
      .insert({
        owner_id: auth.user.id,
        source,
        slug: uniqueListingSlug(listingData.title),
        title: listingData.title,
        short_description: listingData.shortDescription ?? null,
        description: listingData.description,
        bike_type: listingData.bikeType,
        brand: listingData.brand ?? null,
        model: listingData.model ?? null,
        frame_size: source === "wander" ? null : listingData.frameSize ?? null,
        tire_size: listingData.tireSize ?? null,
        condition: listingData.condition,
        offer_mode: listingData.offerMode,
        rental_hourly_cents: rents
          ? listingData.rentalHourlyCents ?? null
          : null,
        rental_daily_cents: rents
          ? listingData.rentalDailyCents ?? null
          : null,
        sale_price_cents: sells ? listingData.salePriceCents ?? null : null,
        minimum_rental_hours: listingData.minimumRentalHours,
        available_quantity:
          source === "wander" ? listingData.availableQuantity : 1,
        pickup_area: listingData.pickupArea,
        city: listingData.city,
        province: listingData.province,
        approximate_latitude: listingData.approximateLatitude ?? null,
        approximate_longitude: listingData.approximateLongitude ?? null,
        available_from: listingData.availableFrom ?? null,
        available_until: listingData.availableUntil ?? null,
        availability_summary: listingData.availabilitySummary ?? null,
        rental_rules: listingData.rentalRules ?? null,
        included_items: listingData.includedItems,
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
        pickup_address: listingData.pickupAddress,
        postal_code: listingData.postalCode ?? null,
        pickup_instructions: listingData.pickupInstructions ?? null,
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
        text: listingData,
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
