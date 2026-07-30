import { NextResponse } from "next/server";
import { fieldErrorPayload } from "@/lib/marketplace/field-errors";
import { isSameOriginRequest } from "@/lib/http/security";
import { queueMarketplaceNotifications } from "@/lib/marketplace/notifications";
import { requestInputSchema } from "@/lib/marketplace/schemas";
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
    const parsed = requestInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(fieldErrorPayload(parsed.error), { status: 400 });
    }
    if (parsed.data.website) {
      return NextResponse.json({ ok: true }, { status: 201 });
    }

    const supabase = getSupabaseAdmin();
    const { data: listing, error: listingError } = await supabase
      .from("bike_listings")
      .select("id,owner_id,title,slug,pickup_area,status")
      .eq("id", parsed.data.listingId)
      .eq("status", "active")
      .maybeSingle();
    if (listingError || !listing) {
      return NextResponse.json(
        { error: "This bike is no longer available." },
        { status: 404 },
      );
    }

    const { data: duplicate } = await supabase
      .from("marketplace_requests")
      .select("id")
      .eq("listing_id", listing.id)
      .eq("renter_id", auth.user.id)
      .eq("intent", parsed.data.intent)
      .in("status", ["pending", "accepted"])
      .limit(1)
      .maybeSingle();
    if (duplicate) {
      return NextResponse.json(
        { error: "You already have an open request for this bike." },
        { status: 409 },
      );
    }

    const { data: inserted, error } = await supabase
      .from("marketplace_requests")
      .insert({
        listing_id: listing.id,
        renter_id: auth.user.id,
        owner_id: listing.owner_id,
        intent: parsed.data.intent,
        starts_at: parsed.data.intent === "rent" ? parsed.data.startsAt : null,
        ends_at: parsed.data.intent === "rent" ? parsed.data.endsAt : null,
        message: parsed.data.message ?? null,
        renter_name: parsed.data.renterName,
        renter_email: auth.user.email ?? "",
        renter_phone: parsed.data.renterPhone ?? null,
      })
      .select("id,intent,starts_at,ends_at,status")
      .single();
    if (error || !inserted) {
      const message =
        error?.code === "23514"
          ? "These dates do not match the bike’s rental rules."
          : "Could not save this request.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { data: ownerProfile } = await supabase
      .from("profiles")
      .select("email,full_name")
      .eq("id", listing.owner_id)
      .maybeSingle();
    try {
      await queueMarketplaceNotifications([
        {
          requestId: inserted.id,
          listingId: listing.id,
          templateKey: "request_received",
          dedupeKey: `request-received:${inserted.id}`,
          recipient: ownerProfile?.email,
          payload: {
            bike_title: listing.title,
            listing_slug: listing.slug,
            renter_name: parsed.data.renterName,
            intent: inserted.intent,
            starts_at: inserted.starts_at,
            ends_at: inserted.ends_at,
          },
        },
        {
          requestId: inserted.id,
          listingId: listing.id,
          templateKey: "request_sent",
          dedupeKey: `request-sent:${inserted.id}`,
          recipient: auth.user.email,
          payload: {
            bike_title: listing.title,
            listing_slug: listing.slug,
            owner_name: ownerProfile?.full_name,
            intent: inserted.intent,
            starts_at: inserted.starts_at,
            ends_at: inserted.ends_at,
          },
        },
      ]);
    } catch (notificationError) {
      console.error("Request notification queue failed", notificationError);
    }
    return NextResponse.json({ request: inserted }, { status: 201 });
  } catch (error) {
    console.error("Marketplace request creation failed", error);
    return NextResponse.json(
      { error: "Could not send this request. Please try again." },
      { status: 500 },
    );
  }
}
