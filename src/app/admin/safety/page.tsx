import { AlertTriangle, ExternalLink, ImageIcon, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  SafetyFlagActions,
  SensitiveTermManager,
} from "@/components/admin/safety-actions";
import { ListingStatusBadge } from "@/components/marketplace/status-badge";
import { formatDateTime } from "@/lib/marketplace/format";
import {
  getSafetyFlags,
  getSensitiveTerms,
} from "@/lib/marketplace/server-data";
import { getCurrentAdmin } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export default async function AdminSafetyPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) return null;
  const filters = await searchParams;
  const status = ["open", "dismissed", "actioned", "all"].includes(
    filters.status ?? "",
  )
    ? filters.status ?? "open"
    : "open";
  const [flags, terms] = await Promise.all([
    getSafetyFlags(status),
    getSensitiveTerms(),
  ]);

  return (
    <div>
      <div>
        <p className="text-sm font-bold text-teal-800">Site Admin only</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Safety signals
        </h1>
        <p className="mt-2 max-w-3xl text-slate-600">
          Automatic checks create signals only. Listings publish immediately,
          and no listing or account is paused until Site Admin takes action.
        </p>
      </div>

      <section className="mt-7 flex gap-3 rounded-[0.9rem] border border-amber-200 bg-amber-50 p-5">
        <AlertTriangle
          className="mt-0.5 h-5 w-5 shrink-0 text-amber-800"
          aria-hidden="true"
        />
        <div>
          <h2 className="font-bold text-amber-950">
            Image checks are advisory
          </h2>
          <p className="mt-1 text-sm leading-6 text-amber-900">
            The current open-source NSFWJS model runs locally in the uploader’s
            browser and sends only high-risk scores here. It never removes a
            photo automatically and can be bypassed, so it is a low-cost early
            signal rather than a security boundary.
          </p>
        </div>
      </section>

      <form className="mt-6 flex flex-wrap gap-3 rounded-[0.9rem] border border-slate-200 bg-white p-4">
        <select
          name="status"
          defaultValue={status}
          className="market-select mt-0 w-full sm:w-52"
          aria-label="Safety signal status"
        >
          <option value="open">Open signals</option>
          <option value="actioned">Actioned</option>
          <option value="dismissed">Dismissed</option>
          <option value="all">All signals</option>
        </select>
        <button className="btn-primary">Filter</button>
        {status !== "open" ? (
          <Link href="/admin/safety" className="btn-quiet text-sm">
            <X className="h-4 w-4" aria-hidden="true" />
            Open only
          </Link>
        ) : null}
      </form>

      <p className="mt-5 text-sm font-semibold text-slate-600">
        {flags.length} {flags.length === 1 ? "signal" : "signals"}
      </p>
      <div className="mt-4 space-y-4">
        {flags.map((flag) => (
          <article
            key={flag.id}
            className="overflow-hidden rounded-[0.9rem] border border-slate-200 bg-white"
          >
            <div className="grid md:grid-cols-[11rem_minmax(0,1fr)]">
              <div className="relative min-h-44 bg-slate-100">
                {flag.imageSrc ? (
                  <Image
                    src={flag.imageSrc}
                    alt={`Flagged photo for ${flag.listing.title}`}
                    fill
                    sizes="(min-width: 768px) 11rem, 100vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full min-h-44 items-center justify-center text-slate-400">
                    <ImageIcon className="h-8 w-8" aria-hidden="true" />
                  </div>
                )}
              </div>
              <div className="min-w-0 p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-teal-800">
                      {flag.signalSource.replaceAll("_", " ")} ·{" "}
                      {flag.category.replaceAll("_", " ")}
                    </p>
                    <h2 className="mt-1 text-xl font-bold text-slate-950">
                      {flag.listing.title}
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      {flag.ownerEmail || flag.ownerId} ·{" "}
                      {formatDateTime(flag.createdAt)}
                    </p>
                  </div>
                  <ListingStatusBadge status={flag.listing.status} />
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-700">
                  {flag.details}
                </p>
                {flag.matchedTerms.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {flag.matchedTerms.map((term) => (
                      <span
                        key={term}
                        className="rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-900"
                      >
                        {term}
                      </span>
                    ))}
                  </div>
                ) : null}
                {flag.resolutionNote ? (
                  <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                    {flag.resolutionNote}
                  </p>
                ) : null}
                <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
                  <Link
                    href={
                      flag.listing.status === "active"
                        ? `/bikes/${flag.listing.slug}`
                        : `/admin/listings?q=${encodeURIComponent(flag.listing.title)}`
                    }
                    className="btn-quiet min-h-9 px-3 py-1.5 text-xs"
                  >
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    {flag.listing.status === "active"
                      ? "Open listing"
                      : "View in listings"}
                  </Link>
                  <SafetyFlagActions
                    flagId={flag.id}
                    flagStatus={flag.status}
                    listingStatus={flag.listing.status}
                  />
                </div>
              </div>
            </div>
          </article>
        ))}
        {flags.length === 0 ? (
          <div className="rounded-[0.9rem] border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-600">
            No safety signals match this filter.
          </div>
        ) : null}
      </div>

      <section className="mt-10 rounded-[0.9rem] border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-xl font-bold text-slate-950">Sensitive terms</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Matches create an admin signal but do not block publishing. Exact
          pickup addresses and other private fields are never scanned here.
        </p>
        <div className="mt-5">
          <SensitiveTermManager terms={terms} />
        </div>
      </section>
    </div>
  );
}
