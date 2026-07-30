import { ArrowRight, MapPin, Store, UsersRound } from "lucide-react";
import Link from "next/link";
import {
  listingPriceLines,
  offerModeLabel,
  sourceLabel,
} from "@/lib/marketplace/format";
import type { BikeListing } from "@/lib/marketplace/types";
import { ListingPhoto } from "@/components/marketplace/listing-photo";

export function CompactListingCard({
  listing,
  priority = false,
}: {
  listing: BikeListing;
  priority?: boolean;
}) {
  const prices = listingPriceLines(listing);
  return (
    <Link
      href={`/bikes/${listing.slug}`}
      className="group block h-full min-w-0 overflow-hidden rounded-[2rem] border border-[var(--card-border)] bg-white shadow-[0_8px_22px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:border-teal-200 hover:shadow-[0_18px_38px_rgba(15,23,42,0.13)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <ListingPhoto
          image={listing.images[0]}
          title={listing.title}
          priority={priority}
          sizes="(min-width: 1024px) 28vw, (min-width: 640px) 45vw, 92vw"
        />
        <div
          className={`absolute bottom-0 right-0 h-8 w-24 ${
            listing.source === "wander"
              ? "bg-[var(--green)]"
              : "bg-[var(--coral)]"
          } [clip-path:polygon(24%_100%,100%_0,100%_100%)]`}
          aria-hidden="true"
        />
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between gap-3 text-xs font-bold">
          <span className="flex items-center gap-1.5 text-[var(--teal)]">
            {listing.source === "wander" ? (
              <Store className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <UsersRound className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {sourceLabel(listing.source)}
          </span>
          <span className="text-slate-500">{offerModeLabel(listing.offerMode)}</span>
        </div>
        <div className="mt-2 flex items-start justify-between gap-3">
          <h3 className="text-xl font-extrabold tracking-tight text-[var(--navy)]">
            {listing.title}
          </h3>
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
          <MapPin className="h-3.5 w-3.5 text-teal-700" aria-hidden="true" />
          {listing.pickupArea}
        </p>
        <div className="mt-4 flex items-end justify-between gap-4 border-t border-slate-100 pt-4">
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {prices.map((price) => (
              <span key={price.label} className="text-sm">
                <strong
                  className={
                    price.label === "buy"
                      ? "text-[var(--green)]"
                      : "text-[var(--teal)]"
                  }
                >
                  {price.value}
                </strong>{" "}
                <span className="text-slate-500">/{price.label}</span>
              </span>
            ))}
          </div>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--navy)] text-white transition group-hover:translate-x-0.5 group-hover:bg-[var(--teal)]">
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}
