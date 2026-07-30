import { notFound, redirect } from "next/navigation";
import { ListingForm } from "@/components/account/listing-form";
import { ListingPhotoManager } from "@/components/account/listing-photo-manager";
import { getEditableListing } from "@/lib/marketplace/server-data";
import { getCurrentStaff, getCurrentUser } from "@/lib/supabase/auth";

export default async function EditWanderBikePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [user, staff] = await Promise.all([getCurrentUser(), getCurrentStaff()]);
  if (!user) redirect("/auth?next=/operations/bikes");
  if (!staff) redirect("/account");
  const { id } = await params;
  const editable = await getEditableListing(id, user.id);
  if (!editable || editable.listing.source !== "wander") notFound();

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-slate-950">
        Edit Wander Bike
      </h1>
      <p className="mt-2 text-slate-600">{editable.listing.title}</p>
      <div className="mt-7">
        <ListingPhotoManager
          listingId={editable.listing.id}
          images={editable.listing.images}
        />
        <ListingForm
          userId={user.id}
          isStaff
          initial={editable}
          requestedSource="wander"
          returnTo="/operations/bikes"
          lockSource
        />
      </div>
    </div>
  );
}
