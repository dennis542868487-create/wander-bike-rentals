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
  const primaryPrice = prices[0];

  return (
    <Link
      href={`/bikes/${listing.slug}`}
      className="group block h-full min-w-0 overflow-hidden rounded-[1.25rem] border border-[var(--card-border)] bg-white shadow-[0_8px_22px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:border-teal-200 hover:shadow-[0_18px_38px_rgba(15,23,42,0.13)] sm:rounded-[2rem]"
    >
      <div className="relative aspect-square overflow-hidden bg-slate-100 sm:aspect-[4/3]">
        <ListingPhoto
          image={listing.images[0]}
          title={listing.title}
          priority={priority}
          sizes="(min-width: 1280px) 28vw, (min-width: 640px) 45vw, 46vw"
        />
        <div
          className={`absolute bottom-0 right-0 h-6 w-16 sm:h-8 sm:w-24 ${
            listing.source === "wander"
              ? "bg-[var(--green)]"
              : "bg-[var(--coral)]"
          } [clip-path:polygon(24%_100%,100%_0,100%_100%)]`}
          aria-hidden="true"
        />
      </div>
      <div className="p-3 sm:p-5">
        <div className="flex min-w-0 items-center justify-between gap-2 text-[0.64rem] font-bold sm:gap-3 sm:text-xs">
          <span className="flex min-w-0 items-center gap-1 text-[var(--teal)] sm:gap-1.5">
            {listing.source === "wander" ? (
              <Store className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
            ) : (
              <UsersRound className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
            )}
            <span className="truncate">{sourceLabel(listing.source)}</span>
          </span>
          <span className="hidden shrink-0 text-slate-500 sm:inline">
            {offerModeLabel(listing.offerMode)}
          </span>
        </div>
        <div className="mt-2 flex items-start justify-between gap-2 sm:gap-3">
          <h3 className="line-clamp-2 text-base font-extrabold leading-[1.15] tracking-tight text-[var(--navy)] sm:text-xl">
            {listing.title}
          </h3>
        </div>
        <p className="mt-1.5 flex min-w-0 items-center gap-1 text-xs text-slate-500 sm:mt-2 sm:gap-1.5 sm:text-sm">
          <MapPin className="h-3 w-3 shrink-0 text-teal-700 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
          <span className="truncate">{listing.pickupArea}</span>
        </p>
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 sm:mt-4 sm:items-end sm:gap-4 sm:pt-4">
          {primaryPrice ? (
            <span className="min-w-0 text-xs sm:hidden">
              <strong className="text-sm text-[var(--teal)]">
                {primaryPrice.value}
              </strong>{" "}
              <span className="text-slate-500">/{primaryPrice.label}</span>
              {prices.length > 1 ? (
                <span className="ml-1 text-[0.62rem] font-bold text-slate-400">
                  +{prices.length - 1}
                </span>
              ) : null}
            </span>
          ) : null}
          <div className="hidden flex-wrap gap-x-4 gap-y-2 sm:flex">
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
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--navy)] text-white transition group-hover:translate-x-0.5 group-hover:bg-[var(--teal)] sm:h-9 sm:w-9">
            <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}
