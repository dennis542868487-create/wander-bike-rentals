import { NextResponse } from "next/server";
import { fieldErrorPayload } from "@/lib/marketplace/field-errors";
import { isSameOriginRequest } from "@/lib/http/security";
import { getListingManagerAccess } from "@/lib/marketplace/access-server";
import { listingInputSchema } from "@/lib/marketplace/schemas";
import { refreshListingTextSignals } from "@/lib/marketplace/safety-server";
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
      return NextResponse.json(fieldErrorPayload(parsed.error), { status: 400 });
    }
    const rents =
      parsed.data.offerMode === "rent" ||
      parsed.data.offerMode === "rent_sale";
    const sells =
      parsed.data.offerMode === "sale" ||
      parsed.data.offerMode === "rent_sale";
    const source =
      parsed.data.source === "wander" && access.isStaff
        ? "wander"
        : access.listing.source;
    const { data: listing, error } = await access.supabase
      .from("bike_listings")
      .update({
        source,
        slug: access.listing.slug,
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
        pickup_address: parsed.data.pickupAddress,
        postal_code: parsed.data.postalCode ?? null,
        pickup_instructions: parsed.data.pickupInstructions ?? null,
    });
    if (privateError) throw new Error("Pickup details could not be updated.");

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
