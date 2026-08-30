import {
  ArrowRight,
  Bike,
  CirclePause,
  MapPin,
  Store,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import {
  listingPriceLines,
  offerModeLabel,
  sourceLabel,
} from "@/lib/marketplace/format";
import { RENTAL_REQUEST_STATUS } from "@/lib/marketplace/rental-request-status";
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
  const supportsRent =
    listing.offerMode === "rent" || listing.offerMode === "rent_sale";
  const rentalPaused = supportsRent && !RENTAL_REQUEST_STATUS.enabled;
  const visiblePrices = rentalPaused
    ? prices.filter((price) => price.label === "buy")
    : prices;
  const rentalPrices = visiblePrices.filter((price) => price.label !== "buy");
  const salePrice = prices.find((price) => price.label === "buy");
  const displayOfferMode = rentalPaused
    ? listing.offerMode === "rent_sale"
      ? "Buy available · rental paused"
      : "Rental paused"
    : offerModeLabel(listing.offerMode);

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
          imageClassName="object-contain sm:object-cover"
        />
        <span className="absolute left-2 top-2 rounded-full bg-white/95 px-2 py-1 text-[0.65rem] font-extrabold text-[var(--navy)] shadow-sm backdrop-blur sm:left-3 sm:top-3 sm:px-3 sm:py-1.5 sm:text-xs">
          {listing.availableQuantity} available
        </span>
        {rentalPaused ? (
          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-amber-600 px-2 py-1 text-[0.62rem] font-extrabold text-white shadow-sm sm:right-3 sm:top-3 sm:px-3 sm:py-1.5 sm:text-xs">
            <CirclePause className="h-3 w-3" aria-hidden="true" />
            Rental paused
          </span>
        ) : null}
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
            {displayOfferMode}
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
        {listing.tireSize ? (
          <p className="mt-1 flex min-w-0 items-center gap-1 text-xs text-slate-500 sm:mt-1.5 sm:gap-1.5 sm:text-sm">
            <Bike className="h-3 w-3 shrink-0 text-teal-700 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
            <span className="truncate">Tire size {listing.tireSize}</span>
          </p>
        ) : null}
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 sm:mt-4 sm:items-end sm:gap-4 sm:pt-4">
          {prices.length > 0 || rentalPaused ? (
            <div className="grid min-w-0 gap-0.5 sm:hidden">
              {rentalPaused ? (
                <span className="inline-flex items-center gap-1 text-[0.62rem] font-bold text-amber-700">
                  <CirclePause className="h-3 w-3" aria-hidden="true" />
                  Rental paused
                </span>
              ) : null}
              {rentalPrices.length > 0 ? (
                <span className="flex min-w-0 items-baseline gap-x-1 whitespace-nowrap text-[0.58rem] text-slate-500">
                  {rentalPrices.map((price) => (
                    <span key={price.label} className="shrink-0">
                      <strong className="text-[0.72rem] text-[var(--teal)]">
                        {price.value}
                      </strong>
                      /{price.label === "hour" ? "hr" : price.label}
                    </span>
                  ))}
                </span>
              ) : null}
              {salePrice ? (
                <span className="whitespace-nowrap text-[0.58rem] text-slate-500">
                  <strong className="text-[0.72rem] text-[var(--green)]">
                    {salePrice.value}
                  </strong>
                  /buy
                </span>
              ) : null}
            </div>
          ) : null}
          <div className="hidden flex-wrap gap-x-4 gap-y-2 sm:flex">
            {rentalPaused ? (
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-700">
                <CirclePause className="h-4 w-4" aria-hidden="true" />
                Rental paused
              </span>
            ) : null}
            {visiblePrices.map((price) => (
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
