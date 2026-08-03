import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type ListingManagementUpdate = {
  status?: "active" | "paused";
  managementNote?: string;
  featured?: boolean;
};

export async function manageListing(input: {
  listingId: string;
  actorId: string;
  update: ListingManagementUpdate;
  allowedSource?: "wander" | "community";
}) {
  const supabase = getSupabaseAdmin();
  let currentQuery = supabase
    .from("bike_listings")
    .select("id,owner_id,title,slug,source,status,featured,management_note")
    .eq("id", input.listingId);
  if (input.allowedSource) {
    currentQuery = currentQuery.eq("source", input.allowedSource);
  }
  const { data: current, error: currentError } =
    await currentQuery.maybeSingle();
  if (currentError || !current) return { ok: false as const, status: 404, error: "Bike listing not found." };

  if (input.update.status) {
    const validTransition =
      (current.status === "active" && input.update.status === "paused") ||
      (current.status === "paused" && input.update.status === "active") ||
      current.status === input.update.status;
    if (!validTransition) {
      return {
        ok: false as const,
        status: 409,
        error: "Only live and paused listings can be changed here.",
      };
    }
    if (
      input.update.status === "paused" &&
      current.status !== "paused" &&
      !input.update.managementNote
    ) {
      return {
        ok: false as const,
        status: 400,
        error: "Add a reason before pausing this listing.",
      };
    }
  }
  if (
    input.update.featured !== undefined &&
    ["archived", "sold"].includes(current.status)
  ) {
    return {
      ok: false as const,
      status: 409,
      error: "Archived and sold listings cannot be featured.",
    };
  }

  const update: Record<string, unknown> = {};
  if (input.update.featured !== undefined) {
    update.featured = input.update.featured;
  }
  if (input.update.status !== undefined) {
    update.status = input.update.status;
    update.management_note =
      input.update.status === "paused"
        ? input.update.managementNote ?? current.management_note
        : null;
    update.managed_by = input.actorId;
    update.managed_at = new Date().toISOString();
  }
  const { data: listing, error } = await supabase
    .from("bike_listings")
    .update(update)
    .eq("id", input.listingId)
    .select("id,owner_id,title,slug,source,status,featured,management_note")
    .single();
  if (error || !listing) {
    return {
      ok: false as const,
      status: 500,
      error: "Could not update this listing.",
    };
  }
  return { ok: true as const, listing };
}

export async function deleteManagedListing(input: {
  listingId: string;
  allowedSource?: "wander" | "community";
}) {
  const supabase = getSupabaseAdmin();
  let listingQuery = supabase
    .from("bike_listings")
    .select("id,title,source")
    .eq("id", input.listingId);
  if (input.allowedSource) {
    listingQuery = listingQuery.eq("source", input.allowedSource);
  }
  const { data: current, error: listingError } =
    await listingQuery.maybeSingle();
  if (listingError || !current) {
    return {
      ok: false as const,
      status: 404,
      error: "Bike listing not found.",
    };
  }

  const { count: requestCount, error: requestError } = await supabase
    .from("marketplace_requests")
    .select("id", { count: "exact", head: true })
    .eq("listing_id", input.listingId);
  if (requestError) {
    return {
      ok: false as const,
      status: 500,
      error: "Could not verify this bike’s request history.",
    };
  }
  if ((requestCount ?? 0) > 0) {
    return {
      ok: false as const,
      status: 409,
      error:
        "This bike has request history and cannot be permanently deleted. Pause it instead.",
    };
  }

  const { data: images, error: imageError } = await supabase
    .from("bike_listing_images")
    .select("storage_path")
    .eq("listing_id", input.listingId);
  if (imageError) {
    return {
      ok: false as const,
      status: 500,
      error: "Could not prepare this bike for deletion.",
    };
  }

  // Listing-only notification rows must be removed first because their
  // integrity constraint does not allow both source references to become null.
  const { error: notificationError } = await supabase
    .from("marketplace_notification_outbox")
    .delete()
    .eq("listing_id", input.listingId);
  if (notificationError) {
    return {
      ok: false as const,
      status: 500,
      error: "Could not remove this bike’s notification history.",
    };
  }

  let deleteQuery = supabase
    .from("bike_listings")
    .delete()
    .eq("id", input.listingId);
  if (input.allowedSource) {
    deleteQuery = deleteQuery.eq("source", input.allowedSource);
  }
  const { data: deleted, error: deleteError } = await deleteQuery
    .select("id")
    .maybeSingle();
  if (deleteError || !deleted) {
    return {
      ok: false as const,
      status: 500,
      error: "Could not permanently delete this bike.",
    };
  }

  const storagePaths = (images ?? []).map((image) => image.storage_path);
  if (storagePaths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from("bike-listing-images")
      .remove(storagePaths);
    if (storageError) {
      console.error(
        "Deleted listing image files could not be cleaned up",
        storageError,
      );
    }
  }

  return {
    ok: true as const,
    deletedListing: {
      id: current.id,
      title: current.title,
    },
  };
}
