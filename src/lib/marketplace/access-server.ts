import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function getListingManagerAccess(
  userId: string,
  listingId: string,
) {
  const supabase = getSupabaseAdmin();
  const [{ data: profile }, { data: listing }] = await Promise.all([
    supabase.from("profiles").select("role").eq("id", userId).maybeSingle(),
    supabase
      .from("bike_listings")
      .select("id,owner_id,source,status,slug,title")
      .eq("id", listingId)
      .maybeSingle(),
  ]);
  if (!profile || !listing) return null;
  const role =
    profile.role === "admin" || profile.role === "staff"
      ? profile.role
      : "customer";
  const canManage =
    listing.owner_id === userId ||
    role === "admin" ||
    (role === "staff" && listing.source === "wander");
  if (!canManage) return null;
  return {
    listing,
    role,
    isStaff: role === "staff" || role === "admin",
    isAdmin: role === "admin",
    supabase,
  };
}
