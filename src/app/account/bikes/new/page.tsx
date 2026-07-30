import { redirect } from "next/navigation";
import { ListingForm } from "@/components/account/listing-form";
import { getProfile } from "@/lib/marketplace/server-data";
import { getCurrentUser } from "@/lib/supabase/auth";

export default async function NewBikeListingPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/account/bikes/new");
  const [profile, query] = await Promise.all([
    getProfile(user.id),
    searchParams,
  ]);
  const isStaff = profile?.role === "staff" || profile?.role === "admin";
  const requestedSource =
    isStaff && query.source === "wander" ? "wander" : "community";

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-slate-950">
        {requestedSource === "wander" ? "Add a Wander Bike" : "List Your Bike"}
      </h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Add one bike at a time so its prices, photos, and requests stay clear.
      </p>
      <div className="mt-7">
        <ListingForm
          userId={user.id}
          isStaff={isStaff}
          requestedSource={requestedSource}
        />
      </div>
    </div>
  );
}
