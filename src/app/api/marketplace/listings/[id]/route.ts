import { NextResponse } from "next/server";
import { isSameOriginRequest } from "@/lib/http/security";
import { getListingManagerAccess } from "@/lib/marketplace/access-server";
import { listingInputSchema } from "@/lib/marketplace/schemas";
import { refreshListingTextSignals } from "@/lib/marketplace/safety-server";
import { applyWanderShopListingDefaults } from "@/lib/marketplace/wander-shop";
import {
  requireMarketplaceActor,
  requireUser,
} from "@/lib/supabase/auth";

async function listingAccess(
  request: Request,
  id: string,
  requireActiveMarketplaceAccess = false,
) {
  const auth = requireActiveMarketplaceAccess
    ? await requireMarketplaceActor(request)
    : await requireUser(request);
  if (!auth.ok) {
    return {
      response: NextResponse.json(
        { error: auth.error },
        { status: auth.status },
      ),
    };
  }
  const access = await getListingManagerAccess(auth.user.id, id);
  if (!access) {
    return {
      response: NextResponse.json(
        { error: "Bike listing not found." },
        { status: 404 },
      ),
    };
  }
  return { auth, ...access };
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  try {
    const { id } = await context.params;
    const access = await listingAccess(request, id, true);
    if ("response" in access) return access.response;
    const parsed = listingInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Check the listing details." },
        { status: 400 },
      );
    }
    const source =
      parsed.data.source === "wander" && access.isStaff
        ? "wander"
        : access.listing.source;
    const listingData =
      source === "wander"
        ? applyWanderShopListingDefaults(parsed.data)
        : parsed.data;
    const rents =
      listingData.offerMode === "rent" ||
      listingData.offerMode === "rent_sale";
    const sells =
      listingData.offerMode === "sale" ||
      listingData.offerMode === "rent_sale";
    const { data: listing, error } = await access.supabase
      .from("bike_listings")
      .update({
        source,
        slug: access.listing.slug,
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
      })
      .eq("id", id)
      .select("id,owner_id,slug,title,status,source,updated_at")
      .single();
    if (error || !listing) throw new Error("Bike listing could not be updated.");

    const { error: privateError } = await access.supabase
      .from("bike_listing_private_details")
      .upsert({
        listing_id: id,
        owner_id: access.listing.owner_id,
        pickup_address: listingData.pickupAddress,
        postal_code: listingData.postalCode ?? null,
        pickup_instructions: listingData.pickupInstructions ?? null,
    });
    if (privateError) throw new Error("Pickup details could not be updated.");

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
    return NextResponse.json({ listing });
  } catch (error) {
    console.error("Marketplace listing update failed", error);
    return NextResponse.json(
      { error: "Could not update this bike listing." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  try {
    const { id } = await context.params;
    const access = await listingAccess(request, id);
    if ("response" in access) return access.response;
    const { error } = await access.supabase
      .from("bike_listings")
      .update({ status: "archived" })
      .eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Marketplace listing archive failed", error);
    return NextResponse.json(
      { error: "Could not archive this bike listing." },
      { status: 500 },
    );
  }
}
