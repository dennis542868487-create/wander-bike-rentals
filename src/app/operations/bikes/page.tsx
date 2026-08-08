import { ExternalLink, Pencil, Plus, Search, X } from "lucide-react";
import Link from "next/link";
import { ListingManagementActions } from "@/components/marketplace/listing-management-actions";
import { ListingPhoto } from "@/components/marketplace/listing-photo";
import { ListingStatusBadge } from "@/components/marketplace/status-badge";
import { formatDateTime, offerModeLabel } from "@/lib/marketplace/format";
import { getAdminListings } from "@/lib/marketplace/server-data";
import { listingStatuses } from "@/lib/marketplace/types";
import { getCurrentStaff } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export default async function OperationsBikesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    saved?: string;
    photos?: string;
  }>;
}) {
  const staff = await getCurrentStaff();
  if (!staff) return null;
  const filters = await searchParams;
  const listings = await getAdminListings({
    query: filters.q,
    source: "wander",
    status: filters.status,
  });
  const hasFilters = Boolean(
    filters.q || (filters.status && filters.status !== "all"),
  );

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Wander Bikes
          </h1>
          <p className="mt-2 text-slate-600">
            Every Wander-owned bike keeps its own photos and rent/sale prices.
          </p>
        </div>
        <Link href="/operations/bikes/new" className="btn-primary">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Wander Bike
        </Link>
      </div>

      {filters.saved ? (
        <div
          className={`mt-6 rounded-xl p-4 text-sm ${
            filters.photos === "failed"
              ? "bg-amber-50 text-amber-900"
              : "bg-emerald-50 text-emerald-800"
          }`}
        >
          {filters.photos === "failed"
            ? "The bike was saved, but one or more photos did not upload. Open Edit to try again."
            : "Wander Bike saved successfully."}
        </div>
      ) : null}

      <form className="mt-7 grid gap-3 rounded-[0.9rem] border border-slate-200 bg-white p-4 sm:grid-cols-[minmax(12rem,1fr)_12rem_auto]">
        <label className="sr-only" htmlFor="operations-bike-search">
          Search Wander Bikes
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            id="operations-bike-search"
            name="q"
            defaultValue={filters.q}
            className="market-input market-input-icon mt-0"
            placeholder="Search title, brand, or area"
          />
        </div>
        <select
          name="status"
          defaultValue={filters.status ?? "all"}
          className="market-select mt-0"
          aria-label="Listing status"
        >
          <option value="all">All statuses</option>
          {listingStatuses.map((status) => (
            <option key={status} value={status}>
              {status.replaceAll("_", " ")}
            </option>
          ))}
        </select>
        <button className="btn-primary min-h-11 px-4">Filter</button>
        {hasFilters ? (
          <Link
            href="/operations/bikes"
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 sm:col-span-full"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            Clear filters
          </Link>
        ) : null}
      </form>

      <p className="mt-5 text-sm font-semibold text-slate-600">
        {listings.length} {listings.length === 1 ? "bike" : "bikes"}
      </p>
      <div className="mt-4 space-y-4">
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
                    {listing.images.length}{" "}
                    {listing.images.length === 1 ? "photo" : "photos"}
                  </span>
                ) : null}
              </div>
              <div className="min-w-0 p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase text-teal-800">
                      {offerModeLabel(listing.offerMode)}
                    </p>
                    <h2 className="mt-1 text-xl font-bold text-slate-950">
                      {listing.title}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {listing.pickupArea} · Updated{" "}
                      {formatDateTime(listing.updatedAt)}
                    </p>
                    <p className="mt-2 text-sm font-bold text-teal-800">
                      Available: {listing.availableQuantity}
                    </p>
                  </div>
                  <ListingStatusBadge status={listing.status} />
                </div>
                {listing.managementNote ? (
                  <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
                    <strong>Management note:</strong> {listing.managementNote}
                  </p>
                ) : null}
                <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                  <Link
                    href={`/operations/bikes/${listing.id}/edit`}
                    className="btn-secondary min-h-9 px-3 py-1.5 text-xs"
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    Edit
                  </Link>
                  {listing.status === "active" ? (
                    <Link
                      href={`/bikes/${listing.slug}`}
                      className="btn-quiet min-h-9 px-3 py-1.5 text-xs"
                    >
                      <ExternalLink
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                      View live
                    </Link>
                  ) : null}
                  <ListingManagementActions
                    listingId={listing.id}
                    listingTitle={listing.title}
                    status={listing.status}
                    featured={listing.featured}
                    endpointBase="/api/operations/marketplace/listings"
                  />
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
      {listings.length === 0 ? (
        <div className="mt-4 rounded-[0.9rem] border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-600">
          No Wander Bikes match these filters.
        </div>
      ) : null}
    </div>
  );
}
