import { notFound, redirect } from "next/navigation";
import { ListingForm } from "@/components/account/listing-form";
import { ListingPhotoManager } from "@/components/account/listing-photo-manager";
import { getEditableListing, getProfile } from "@/lib/marketplace/server-data";
import { getCurrentUser } from "@/lib/supabase/auth";

export default async function EditBikeListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/account/bikes");
  const { id } = await params;
  const profile = await getProfile(user.id);
  const isStaff = profile?.role === "staff" || profile?.role === "admin";
  const editable = await getEditableListing(id, user.id);
  if (!editable) notFound();

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-slate-950">
        Edit Listing
      </h1>
      <p className="mt-2 text-slate-600">{editable.listing.title}</p>
      <div className="mt-7">
        {editable.listing.ownerId === user.id ? (
          <ListingPhotoManager
            listingId={editable.listing.id}
            images={editable.listing.images}
          />
        ) : null}
        <ListingForm
          userId={user.id}
          isStaff={isStaff}
          initial={editable}
          requestedSource={editable.listing.source}
        />
      </div>
    </div>
  );
}
