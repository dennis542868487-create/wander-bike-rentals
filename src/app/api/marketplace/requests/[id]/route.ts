import { NextResponse } from "next/server";
import { isSameOriginRequest } from "@/lib/http/security";
import { queueMarketplaceNotifications } from "@/lib/marketplace/notifications";
import { requestStatusInputSchema } from "@/lib/marketplace/schemas";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/supabase/auth";

const ownerTransitions: Record<string, string[]> = {
  pending: ["accepted", "declined"],
  accepted: ["completed", "no_show"],
};

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  try {
    const auth = await requireUser(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const parsed = requestStatusInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request status." }, { status: 400 });
    }
    const { id } = await context.params;
    const supabase = getSupabaseAdmin();
    const [{ data: profile }, { data: current }] = await Promise.all([
      supabase.from("profiles").select("role").eq("id", auth.user.id).single(),
      supabase
        .from("marketplace_requests")
        .select(
          "id,listing_id,renter_id,owner_id,intent,status,renter_email,starts_at,ends_at,bike_listings(title,slug,pickup_area,source)",
        )
        .eq("id", id)
        .maybeSingle(),
    ]);
    if (!current) {
      return NextResponse.json({ error: "Request not found." }, { status: 404 });
    }
    const listingValue = current.bike_listings;
    const listing = Array.isArray(listingValue)
      ? listingValue[0]
      : listingValue;
    const canOperateForWander =
      profile?.role === "staff" && listing?.source === "wander";
    const hasPlatformOverride =
      profile?.role === "admin" || canOperateForWander;
    const isOwner = current.owner_id === auth.user.id;
    const isRenter = current.renter_id === auth.user.id;
    if (!isOwner && !isRenter && !hasPlatformOverride) {
      return NextResponse.json({ error: "Request not found." }, { status: 404 });
    }

    const nextStatus = parsed.data.status;
    const allowed =
      hasPlatformOverride ||
      (isOwner && ownerTransitions[current.status]?.includes(nextStatus)) ||
      (isRenter &&
        nextStatus === "cancelled" &&
        ["pending", "accepted"].includes(current.status));
    if (!allowed) {
      return NextResponse.json(
        { error: "This status change is not allowed." },
        { status: 409 },
      );
    }

    const now = new Date().toISOString();
    const isResponse = ["accepted", "declined"].includes(nextStatus);
    const { data: updated, error } = await supabase
      .from("marketplace_requests")
      .update({
        status: nextStatus,
        ...(isResponse
          ? {
              response_note: parsed.data.responseNote ?? null,
              responded_at: now,
            }
          : {}),
        ...(nextStatus === "cancelled" ? { cancelled_at: now } : {}),
        ...(nextStatus === "completed" ? { completed_at: now } : {}),
      })
      .eq("id", id)
      .select("id,status")
      .single();
    if (error) {
      const message =
        error.code === "23P01" || error.code === "23505"
          ? "This bike already has another accepted request."
          : "Could not update this request.";
      return NextResponse.json({ error: message }, { status: 409 });
    }

    if (current.intent === "buy") {
      if (nextStatus === "accepted") {
        await supabase
          .from("bike_listings")
          .update({ status: "reserved" })
          .eq("id", current.listing_id)
          .eq("status", "active");
      } else if (nextStatus === "completed") {
        await supabase
          .from("bike_listings")
          .update({ status: "sold" })
          .eq("id", current.listing_id);
      } else if (nextStatus === "cancelled" && current.status === "accepted") {
        await supabase
          .from("bike_listings")
          .update({ status: "active" })
          .eq("id", current.listing_id)
          .eq("status", "reserved");
      }
    }

    if (nextStatus === "accepted" || nextStatus === "declined") {
      try {
        await queueMarketplaceNotifications([
          {
            requestId: current.id,
            listingId: current.listing_id,
            templateKey:
              nextStatus === "accepted"
                ? "request_accepted"
                : "request_declined",
            dedupeKey: `request-${nextStatus}:${current.id}`,
            recipient: current.renter_email,
            payload: {
              bike_title: listing?.title,
              listing_slug: listing?.slug,
              pickup_area: listing?.pickup_area,
              starts_at: current.starts_at,
              ends_at: current.ends_at,
              response_note: parsed.data.responseNote,
            },
          },
        ]);
      } catch (notificationError) {
        console.error("Request status notification failed", notificationError);
      }
    } else if (nextStatus === "cancelled") {
      const { data: owner } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", current.owner_id)
        .maybeSingle();
      try {
        await queueMarketplaceNotifications([
          {
            requestId: current.id,
            listingId: current.listing_id,
            templateKey: "request_cancelled",
            dedupeKey: `request-cancelled:${current.id}`,
            recipient: owner?.email,
            payload: {
              bike_title: listing?.title,
              listing_slug: listing?.slug,
            },
          },
        ]);
      } catch (notificationError) {
        console.error("Cancellation notification failed", notificationError);
      }
    }

    return NextResponse.json({ request: updated });
  } catch (error) {
    console.error("Marketplace request status update failed", error);
    return NextResponse.json(
      { error: "Could not update this request." },
      { status: 500 },
    );
  }
}
