import { Bike, ExternalLink, Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArchiveListingButton } from "@/components/account/listing-actions";
import { ListingPhoto } from "@/components/marketplace/listing-photo";
import { ListingStatusBadge } from "@/components/marketplace/status-badge";
import { listingPriceLines, offerModeLabel } from "@/lib/marketplace/format";
import { getOwnedListings } from "@/lib/marketplace/server-data";
import { getCurrentUser } from "@/lib/supabase/auth";

export default async function MyBikesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; photos?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/account/bikes");
  const [listings, query] = await Promise.all([
    getOwnedListings(user.id),
    searchParams,
  ]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            My Bikes
          </h1>
          <p className="mt-2 text-slate-600">
            Each bike keeps its own prices, photos, and availability.
          </p>
        </div>
        <Link href="/account/bikes/new" className="btn-primary">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add a bike
        </Link>
      </div>

      {query.saved ? (
        <div className={`mt-6 rounded-xl p-4 text-sm ${query.photos === "failed" ? "bg-amber-50 text-amber-900" : "bg-emerald-50 text-emerald-800"}`}>
          {query.photos === "failed"
            ? "The listing was saved, but one or more photos did not upload. Open Edit Listing to try the photos again."
            : "Listing saved successfully."}
        </div>
      ) : null}

      {listings.length > 0 ? (
        <div className="mt-7 space-y-5">
          {listings.map((listing) => (
            <article
              key={listing.id}
              className="overflow-hidden rounded-[0.9rem] border border-slate-200 bg-white"
            >
              <div className="grid sm:grid-cols-[13rem_minmax(0,1fr)]">
                <div className="relative min-h-48 overflow-hidden bg-slate-100">
                  <ListingPhoto
                    image={listing.images[0]}
                    title={listing.title}
                    sizes="(min-width: 640px) 13rem, 100vw"
                  />
                  {listing.images.length > 0 ? (
                    <span className="absolute bottom-3 left-3 rounded-full bg-slate-950/75 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm">
                      {listing.images.length} {listing.images.length === 1 ? "photo" : "photos"}
                    </span>
                  ) : null}
                </div>
                <div className="min-w-0 p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase text-teal-800">
                        {listing.source} · {offerModeLabel(listing.offerMode)}
                      </p>
                      <h2 className="mt-1 text-xl font-bold text-slate-950">
                        {listing.title}
                      </h2>
                    </div>
                    <ListingStatusBadge status={listing.status} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-4 text-sm">
                    {listingPriceLines(listing).map((price) => (
                      <span key={price.label}>
                        <strong className="text-slate-950">{price.value}</strong>{" "}
                        <span className="text-slate-500">/{price.label}</span>
                      </span>
                    ))}
                  </div>
                  {listing.managementNote ? (
                    <div className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
                      <strong>Site Admin note:</strong>{" "}
                      {listing.managementNote}
                    </div>
                  ) : null}
                  <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                    <Link
                      href={`/account/bikes/${listing.id}/edit`}
                      className="btn-secondary min-h-10 px-3 py-2 text-sm"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                      Edit listing
                    </Link>
                    {listing.status === "active" ? (
                      <Link
                        href={`/bikes/${listing.slug}`}
                        className="btn-quiet min-h-10 px-3 py-2 text-sm"
                      >
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                        View live
                      </Link>
                    ) : null}
                    {listing.status !== "archived" ? (
                      <ArchiveListingButton listingId={listing.id} />
                    ) : null}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-7 rounded-[0.9rem] border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <Bike className="mx-auto h-8 w-8 text-teal-700" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-bold text-slate-950">
            List your first bike
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Choose rent, sale, or both and set this bike’s individual prices.
          </p>
          <Link href="/account/bikes/new" className="btn-primary mt-5">
            Create listing
          </Link>
        </div>
      )}
    </div>
  );
}
