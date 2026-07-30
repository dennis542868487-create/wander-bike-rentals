import { ExternalLink, Pencil, Plus, Search, X } from "lucide-react";
import Link from "next/link";
import { ListingManagementActions } from "@/components/marketplace/listing-management-actions";
import { ListingStatusBadge } from "@/components/marketplace/status-badge";
import { formatDateTime, offerModeLabel } from "@/lib/marketplace/format";
import { listingStatuses } from "@/lib/marketplace/types";
import { getAdminListings } from "@/lib/marketplace/server-data";
import { getCurrentAdmin } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; source?: string; status?: string }>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) return null;
  const filters = await searchParams;
  const listings = await getAdminListings(filters);
  const hasFilters = Boolean(
    filters.q ||
      (filters.source && filters.source !== "all") ||
      (filters.status && filters.status !== "all"),
  );

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Listings
          </h1>
          <p className="mt-2 text-slate-600">
            Monitor all marketplace listings and pause one only after an
            administrator decides action is necessary.
          </p>
        </div>
        <Link href="/operations/bikes/new" className="btn-primary">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Wander Bike
        </Link>
      </div>

      <form className="mt-7 grid gap-3 rounded-[0.9rem] border border-slate-200 bg-white p-4 sm:grid-cols-[minmax(12rem,1fr)_11rem_12rem_auto]">
        <label className="sr-only" htmlFor="listing-search">Search listings</label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            id="listing-search"
            name="q"
            defaultValue={filters.q}
            className="market-input market-input-icon mt-0"
            placeholder="Search title, brand, or area"
          />
        </div>
        <select name="source" defaultValue={filters.source ?? "all"} className="market-select mt-0" aria-label="Listing source">
          <option value="all">All sources</option>
          <option value="wander">Wander</option>
          <option value="community">Community</option>
        </select>
        <select name="status" defaultValue={filters.status ?? "all"} className="market-select mt-0" aria-label="Listing status">
          <option value="all">All statuses</option>
          {listingStatuses.map((status) => (
            <option key={status} value={status}>
              {status.replaceAll("_", " ")}
            </option>
          ))}
        </select>
        <button className="btn-primary min-h-11 px-4">Filter</button>
        {hasFilters ? (
          <Link href="/admin/listings" className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-600 sm:col-span-full sm:justify-start">
            <X className="h-4 w-4" aria-hidden="true" />
            Clear filters
          </Link>
        ) : null}
      </form>

      <p className="mt-5 text-sm font-semibold text-slate-600">
        {listings.length} {listings.length === 1 ? "listing" : "listings"}
      </p>

      <div className="mt-4 hidden overflow-hidden rounded-[0.9rem] border border-slate-200 bg-white md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Bike</th>
              <th className="px-5 py-3">Source / offer</th>
              <th className="px-5 py-3">Updated</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {listings.map((listing) => (
              <tr key={listing.id} className="align-top">
                <td className="px-5 py-4">
                  <p className="font-semibold text-slate-950">{listing.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{listing.pickupArea}</p>
                  <div className="mt-2 flex gap-3">
                    <Link href={listing.source === "wander" ? `/operations/bikes/${listing.id}/edit` : `/account/bikes/${listing.id}/edit`} className="text-xs font-bold text-teal-800">
                      Edit
                    </Link>
                    {listing.status === "active" ? (
                      <Link href={`/bikes/${listing.slug}`} className="text-xs font-bold text-teal-800">
                        Preview
                      </Link>
                    ) : null}
                  </div>
                </td>
                <td className="px-5 py-4 capitalize text-slate-600">
                  {listing.source}
                  <p className="mt-1 text-xs">{offerModeLabel(listing.offerMode)}</p>
                </td>
                <td className="px-5 py-4 text-xs text-slate-500">
                  {formatDateTime(listing.updatedAt)}
                </td>
                <td className="px-5 py-4">
                  <ListingStatusBadge status={listing.status} />
                  {listing.featured ? <p className="mt-2 text-xs font-bold text-teal-800">Featured</p> : null}
                </td>
                <td className="max-w-sm px-5 py-4">
                  <ListingManagementActions
                    listingId={listing.id}
                    status={listing.status}
                    featured={listing.featured}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 space-y-4 md:hidden">
        {listings.map((listing) => (
          <article key={listing.id} className="rounded-[0.9rem] border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase text-teal-800">
                  {listing.source} · {offerModeLabel(listing.offerMode)}
                </p>
                <h2 className="mt-1 text-lg font-bold text-slate-950">
                  {listing.title}
                </h2>
                <p className="mt-1 text-sm text-slate-500">{listing.pickupArea}</p>
              </div>
              <ListingStatusBadge status={listing.status} />
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Updated {formatDateTime(listing.updatedAt)}
            </p>
            <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
              <Link href={listing.source === "wander" ? `/operations/bikes/${listing.id}/edit` : `/account/bikes/${listing.id}/edit`} className="btn-secondary min-h-9 px-3 py-1.5 text-xs">
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                Edit
              </Link>
              {listing.status === "active" ? (
                <Link href={`/bikes/${listing.slug}`} className="btn-quiet min-h-9 px-3 py-1.5 text-xs">
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  Preview
                </Link>
              ) : null}
            </div>
            <div className="mt-4">
              <ListingManagementActions
                listingId={listing.id}
                status={listing.status}
                featured={listing.featured}
              />
            </div>
          </article>
        ))}
      </div>

      {listings.length === 0 ? (
        <div className="mt-4 rounded-[0.9rem] border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-600">
          No listings match these filters.
        </div>
      ) : null}
    </div>
  );
}
