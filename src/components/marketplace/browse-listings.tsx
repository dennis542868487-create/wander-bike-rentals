import {
  ArrowRight,
  Bike,
  Check,
  MapPin,
  PackageCheck,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Store,
  UsersRound,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CompactListingCard } from "@/components/marketplace/compact-listing-card";
import { bikeTypeLabel } from "@/lib/marketplace/format";
import {
  bikeTypes,
  type BikeListing,
  type ListingSource,
} from "@/lib/marketplace/types";

type BrowseFilters = {
  q?: string;
  type?: string;
  intent?: string;
  sort?: string;
};

function ListingFilters({
  basePath,
  filters,
  hasFilters,
  mobile = false,
}: {
  basePath: string;
  filters: BrowseFilters;
  hasFilters: boolean;
  mobile?: boolean;
}) {
  return (
    <form
      action={basePath}
      className={
        mobile
          ? "mt-4 grid gap-4 border-t border-slate-100 pt-4"
          : "mt-7 hidden gap-3 border-y border-slate-200 bg-white px-4 py-4 xl:grid xl:grid-cols-[1.65fr_1fr_1fr_1fr_auto]"
      }
    >
      <label className="field-label">
        Search
        <span className="relative mt-2 block">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            name="q"
            defaultValue={filters.q}
            className="market-input market-input-icon mt-0"
            placeholder="Name, brand, area"
          />
        </span>
      </label>
      <label className="field-label">
        Rent or buy
        <select
          name="intent"
          defaultValue={filters.intent ?? "all"}
          className="market-select"
        >
          <option value="all">All offers</option>
          <option value="rent">Rent a bike</option>
          <option value="sale">Buy a bike</option>
        </select>
      </label>
      <label className="field-label">
        Bike type
        <select
          name="type"
          defaultValue={filters.type ?? "all"}
          className="market-select"
        >
          <option value="all">All types</option>
          {bikeTypes.map((type) => (
            <option key={type} value={type}>
              {bikeTypeLabel(type)}
            </option>
          ))}
        </select>
      </label>
      <label className="field-label">
        Sort
        <select
          name="sort"
          defaultValue={filters.sort ?? "newest"}
          className="market-select"
        >
          <option value="newest">Recommended</option>
          <option value="price_low">Price: low to high</option>
          <option value="price_high">Price: high to low</option>
        </select>
      </label>
      <div className="flex items-end gap-2">
        <button type="submit" className="btn-primary flex-1 px-5">
          Show bikes
        </button>
        {hasFilters ? (
          <Link
            href={basePath}
            aria-label="Clear filters"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 hover:border-[var(--teal)] hover:text-[var(--teal)]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Link>
        ) : null}
      </div>
    </form>
  );
}

export function BrowseListings({
  source,
  listings,
  filters,
}: {
  source: ListingSource;
  listings: BikeListing[];
  filters: BrowseFilters;
}) {
  const isWander = source === "wander";
  const basePath = isWander ? "/bikes/wander" : "/bikes/community";
  const hasFilters = Boolean(
    filters.q ||
      (filters.type && filters.type !== "all") ||
      (filters.intent && filters.intent !== "all") ||
      (filters.sort && filters.sort !== "newest"),
  );

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <section
        className={`marketplace-browse-hero marketplace-browse-hero--${
          isWander ? "wander" : "community"
        } route-wash overflow-hidden border-b border-slate-200 bg-white`}
      >
        <div className="marketplace-browse-grid mx-auto grid max-w-7xl items-center gap-7 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-9 lg:px-8 lg:py-14">
          <div className="marketplace-browse-copy motion-rise max-w-2xl">
            <p className="mb-5 hidden items-center gap-3 text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--teal)] xl:flex">
              <span className="h-px w-9 bg-current" aria-hidden="true" />
              {isWander
                ? "Wander collection · Steveston shop"
                : "Community collection · local owners"}
            </p>
            <h1 className="display-heading text-[2.65rem] leading-[0.98] sm:text-6xl lg:text-7xl">
              Find a bike
              <span className="marketplace-browse-title-accent block">
                that fits the ride.
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 sm:mt-6 sm:text-lg sm:leading-8">
              Choose Wander Bikes from our Steveston shop or browse Community
              Bikes listed separately by local owners.
            </p>
          </div>
          <div className="marketplace-browse-media photo-arch-right motion-rise motion-rise-delay-1 relative min-h-[11.5rem] overflow-hidden bg-slate-100 sm:min-h-[17rem] lg:min-h-[23rem]">
            <Image
              src={
                isWander
                  ? "/assets/west-dyke-ride.webp"
                  : "/assets/steveston-ride-idea.jpg"
              }
              alt={
                isWander
                  ? "Cyclists on a Richmond waterfront route"
                  : "A local bicycle near the Steveston waterfront"
              }
              fill
              priority
              sizes="(min-width: 1024px) 52vw, 100vw"
              className="object-cover"
            />
            <div className="marketplace-hero-note absolute bottom-5 left-5 hidden max-w-xs rounded-[1.35rem] border border-white/75 bg-white/88 px-5 py-4 shadow-xl backdrop-blur-xl xl:block">
              <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[var(--teal)]">
                {isWander ? "Managed by Wander" : "Listed by the owner"}
              </p>
              <p className="mt-1.5 text-sm font-bold leading-6 text-[var(--navy)]">
                {isWander
                  ? "Pick up at our Steveston shop after your request is confirmed."
                  : "Request first, then arrange a safe local meetup directly."}
              </p>
            </div>
            <div
              className="absolute right-0 top-0 h-20 w-20 bg-[var(--orange)] [clip-path:polygon(100%_0,100%_100%,0_0)]"
              aria-hidden="true"
            />
          </div>
        </div>
      </section>

      <section className="marketplace-source-switcher border-b border-slate-200 bg-[#f0fdf9]">
        <div
          className={`marketplace-source-switcher-grid mx-auto grid max-w-7xl grid-cols-1 gap-2 px-4 py-4 sm:grid-cols-2 sm:gap-3 sm:px-6 sm:py-6 lg:px-8 ${
            isWander
              ? "xl:grid-cols-[1.24fr_0.76fr]"
              : "xl:grid-cols-[0.76fr_1.24fr]"
          }`}
        >
          <Link
            href="/bikes/wander"
            aria-current={isWander ? "page" : undefined}
            className={`group relative flex min-h-[5.5rem] flex-col rounded-2xl border p-4 transition sm:min-h-24 sm:p-5 xl:p-6 ${
              isWander
                ? "border-[var(--green)] bg-[var(--navy)] text-white shadow-lg"
                : "justify-center border-slate-300 bg-white text-[var(--navy)] hover:border-[var(--teal)]"
            }`}
          >
            <span className="flex w-full items-center gap-3 pr-9 sm:gap-4 sm:pr-11">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border sm:h-12 sm:w-12 ${
                  isWander
                    ? "border-white/40 text-white"
                    : "border-slate-300 text-[var(--teal)]"
                }`}
              >
                <Store className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span
                  className={`block text-lg font-extrabold leading-tight sm:text-xl ${
                    isWander ? "text-white" : "text-[var(--navy)]"
                  }`}
                >
                  Wander Bikes
                </span>
                <span
                  className={`mt-1 block text-sm leading-5 ${
                    isWander ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  {isWander
                    ? "Shop-managed, checked daily, and rental-ready."
                    : "Managed directly by our Steveston shop."}
                </span>
              </span>
            </span>
            {isWander ? (
              <>
                <span className="absolute right-3 top-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--green)] text-white sm:right-5 sm:top-5 sm:h-9 sm:w-9">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                </span>
                <span className="mt-5 grid w-full gap-3 border-t border-white/15 pt-4 xl:grid-cols-2">
                  <span className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-teal-200">
                      <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-teal-300">
                        Safety-checked daily
                      </span>
                      <span className="mt-1 block text-sm font-semibold leading-5 text-white">
                        Kickstand, bell, white front reflector &amp; red rear
                        reflector.
                      </span>
                    </span>
                  </span>
                  <span className="flex items-start gap-3 border-t border-white/15 pt-3 xl:border-l xl:border-t-0 xl:pl-4 xl:pt-0">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-teal-200">
                      <PackageCheck className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-teal-300">
                        Included with every rental
                      </span>
                      <span className="mt-1 block text-sm font-semibold leading-5 text-white">
                        Helmet, basket &amp; lock.
                      </span>
                    </span>
                  </span>
                </span>
              </>
            ) : (
              <span className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--navy)] text-white shadow-sm transition group-hover:translate-x-0.5 group-hover:bg-[var(--teal)] sm:right-5 sm:h-9 sm:w-9">
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
              </span>
            )}
          </Link>
          <Link
            href="/bikes/community"
            aria-current={!isWander ? "page" : undefined}
            className={`group relative flex min-h-[5.5rem] flex-col justify-center rounded-2xl border p-4 transition sm:min-h-24 sm:p-5 xl:p-6 ${
              !isWander
                ? "border-[var(--green)] bg-[var(--navy)] text-white shadow-lg"
                : "border-slate-300 bg-white text-[var(--navy)] hover:border-[var(--teal)]"
            }`}
          >
            <span className="flex w-full items-center gap-3 pr-9 sm:gap-4 sm:pr-11">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border sm:h-12 sm:w-12 ${
                  !isWander
                    ? "border-white/40 text-white"
                    : "border-slate-300 text-[var(--teal)]"
                }`}
              >
                <UsersRound
                  className="h-5 w-5 sm:h-6 sm:w-6"
                  aria-hidden="true"
                />
              </span>
              <span className="min-w-0">
                <span
                  className={`block text-lg font-extrabold leading-tight sm:text-xl ${
                    !isWander ? "text-white" : "text-[var(--navy)]"
                  }`}
                >
                  Community Bikes
                </span>
                <span
                  className={`mt-1 block text-sm leading-5 ${
                    !isWander ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  Listed separately by local owners.
                </span>
              </span>
            </span>
            {!isWander ? (
              <span className="absolute right-3 top-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--green)] text-white sm:right-5 sm:top-5 sm:h-9 sm:w-9">
                <Check className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
              </span>
            ) : (
              <span className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--navy)] text-white shadow-sm transition group-hover:translate-x-0.5 group-hover:bg-[var(--teal)] sm:right-5 sm:h-9 sm:w-9">
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
              </span>
            )}
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <h2 className="display-heading text-3xl sm:text-4xl">
              {isWander ? "Wander Bikes" : "Community Bikes"}
            </h2>
            <p className="mt-2 text-base text-slate-600">
              {isWander
                ? "Managed directly by the Wander team at our Steveston shop."
                : "Published by local owners and exchanged directly after a request."}
            </p>
          </div>
          <p className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            <MapPin className="h-4 w-4 text-[var(--teal)]" aria-hidden="true" />
            {isWander
              ? "12071 First Ave #101 · Open 9:00 AM–10:00 PM"
              : "General pickup areas are shown before a request"}
          </p>
        </div>

        <details
          open={hasFilters || undefined}
          className="mt-6 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm xl:hidden"
        >
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 rounded-xl text-sm font-bold text-slate-950 [&::-webkit-details-marker]:hidden">
            <span className="flex items-center gap-2">
              <SlidersHorizontal
                className="h-5 w-5 text-[var(--teal)]"
                aria-hidden="true"
              />
              Search & filters
            </span>
            <span className="rounded-full bg-[var(--brand-soft)] px-3 py-1 text-xs text-[var(--brand-strong)]">
              {hasFilters ? "Active" : "Open"}
            </span>
          </summary>
          <ListingFilters
            basePath={basePath}
            filters={filters}
            hasFilters={hasFilters}
            mobile
          />
        </details>

        <ListingFilters
          basePath={basePath}
          filters={filters}
          hasFilters={hasFilters}
        />

        <div className="mb-5 mt-8 flex items-center justify-between gap-4">
          <h2 className="text-sm font-semibold text-slate-600">
            {listings.length} {listings.length === 1 ? "bike" : "bikes"} available
          </h2>
          <p className="hidden text-xs text-slate-500 sm:block">
            Prices belong to each individual bike
          </p>
        </div>

        {listings.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
            {listings.map((listing, index) => (
              <CompactListingCard
                key={listing.id}
                listing={listing}
                priority={index < 3}
              />
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <Bike className="mx-auto h-9 w-9 text-[var(--teal)]" aria-hidden="true" />
            <h2 className="mt-4 text-xl font-bold text-[var(--navy)]">
              No bikes match these filters
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Clear the filters or browse the other collection.
            </p>
            <Link href={basePath} className="btn-secondary mt-5">
              Clear filters
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
