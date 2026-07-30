import type { Metadata } from "next";
import { BadgeCheck, CalendarDays, HandCoins, MapPin, PackageCheck, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ListingPhoto } from "@/components/marketplace/listing-photo";
import { RequestPanel } from "@/components/marketplace/request-panel";
import {
  bikeTypeLabel,
  formatCad,
  offerModeLabel,
  sourceLabel,
} from "@/lib/marketplace/format";
import { getPublicListingBySlug } from "@/lib/marketplace/data";
import { getCurrentUser } from "@/lib/supabase/auth";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getPublicListingBySlug(slug);
  if (!listing) return { title: "Bike not found" };
  return {
    title: listing.title,
    description: listing.shortDescription ?? listing.description.slice(0, 155),
    alternates: { canonical: `/bikes/${listing.slug}` },
  };
}

export default async function BikeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [listing, user] = await Promise.all([
    getPublicListingBySlug(slug),
    getCurrentUser(),
  ]);
  if (!listing) notFound();

  const canRent = listing.offerMode === "rent" || listing.offerMode === "rent_sale";
  const canBuy = listing.offerMode === "sale" || listing.offerMode === "rent_sale";

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12">
        <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
          <Link href="/bikes" className="hover:text-teal-800">Find a Bike</Link>
          <span className="mx-2">/</span>
          <Link
            href={listing.source === "wander" ? "/bikes/wander" : "/bikes/community"}
            className="hover:text-teal-800"
          >
            {listing.source === "wander" ? "Wander Bikes" : "Community Bikes"}
          </Link>
        </nav>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="min-w-0">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[1.5rem] bg-slate-100 sm:rounded-[2rem]">
              <ListingPhoto
                image={listing.images[0]}
                title={listing.title}
                priority
                sizes="(min-width: 1024px) 66vw, 100vw"
              />
            </div>
            {listing.images.length > 1 ? (
              <div className="mt-3 grid grid-cols-4 gap-3">
                {listing.images.slice(1, 5).map((image) => (
                  <div
                    key={image.id}
                    className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100"
                  >
                    <ListingPhoto
                      image={image}
                      title={listing.title}
                      sizes="20vw"
                    />
                  </div>
                ))}
              </div>
            ) : null}

            <section className="mt-5 rounded-[1.5rem] border border-slate-200 bg-white p-4 sm:mt-8 sm:rounded-[2rem] sm:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-800">
                  {sourceLabel(listing.source)}
                </span>
                <span className="rounded-md bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-800">
                  {offerModeLabel(listing.offerMode)}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {bikeTypeLabel(listing.bikeType)}
                </span>
              </div>
              <h1 className="mt-4 text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-5xl">
                {listing.title}
              </h1>
              <p className="mt-3 text-slate-500">
                {[listing.brand, listing.model, listing.frameSize]
                  .filter(Boolean)
                  .join(" · ")}
              </p>

              <div className="mt-7 flex flex-wrap gap-x-9 gap-y-4 border-y border-slate-100 py-6">
                {canRent && listing.rentalHourlyCents !== null ? (
                  <div>
                    <p className="text-2xl font-bold text-slate-950">
                      {formatCad(listing.rentalHourlyCents)}
                    </p>
                    <p className="text-sm text-slate-500">per hour</p>
                  </div>
                ) : null}
                {canRent && listing.rentalDailyCents !== null ? (
                  <div>
                    <p className="text-2xl font-bold text-slate-950">
                      {formatCad(listing.rentalDailyCents)}
                    </p>
                    <p className="text-sm text-slate-500">per day</p>
                  </div>
                ) : null}
                {canBuy && listing.salePriceCents !== null ? (
                  <div>
                    <p className="text-2xl font-bold text-slate-950">
                      {formatCad(listing.salePriceCents)}
                    </p>
                    <p className="text-sm text-slate-500">asking price</p>
                  </div>
                ) : null}
              </div>

              <div className="mt-6 lg:hidden">
                <RequestPanel
                  listing={listing}
                  signedIn={Boolean(user)}
                  userEmail={user?.email ?? null}
                  isOwner={user?.id === listing.ownerId}
                />
                <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-500">
                  <HandCoins className="h-3.5 w-3.5" aria-hidden="true" />
                  Payment is arranged offline
                </div>
              </div>

              <p className="mt-7 whitespace-pre-line leading-8 text-slate-700">
                {listing.description}
              </p>

              <dl className="mt-8 grid gap-5 sm:grid-cols-2">
                <div className="flex gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-teal-700" aria-hidden="true" />
                  <div>
                    <dt className="text-sm font-bold text-slate-950">Pickup area</dt>
                    <dd className="mt-1 text-sm text-slate-600">
                      {listing.pickupArea}, {listing.city}
                    </dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-teal-700" aria-hidden="true" />
                  <div>
                    <dt className="text-sm font-bold text-slate-950">Availability</dt>
                    <dd className="mt-1 text-sm text-slate-600">
                      {listing.availabilitySummary ?? "Confirm dates with the owner"}
                    </dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal-700" aria-hidden="true" />
                  <div>
                    <dt className="text-sm font-bold text-slate-950">Condition</dt>
                    <dd className="mt-1 text-sm capitalize text-slate-600">
                      {listing.condition.replace("_", " ")}
                    </dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <PackageCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal-700" aria-hidden="true" />
                  <div>
                    <dt className="text-sm font-bold text-slate-950">Included</dt>
                    <dd className="mt-1 text-sm text-slate-600">
                      {listing.includedItems.length > 0
                        ? listing.includedItems.join(", ")
                        : "Confirm with the owner"}
                    </dd>
                  </div>
                </div>
              </dl>

              {listing.rentalRules ? (
                <div className="mt-8 rounded-xl bg-slate-50 p-5">
                  <h2 className="text-sm font-bold text-slate-950">Owner’s notes</h2>
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                    {listing.rentalRules}
                  </p>
                </div>
              ) : null}
            </section>

            <section className="mt-6 flex gap-4 rounded-[1.5rem] border border-teal-200 bg-teal-50 p-5">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal-800" aria-hidden="true" />
              <div>
                <h2 className="text-sm font-bold text-teal-950">
                  Local exchange only
                </h2>
                <p className="mt-1 text-sm leading-6 text-teal-900">
                  Wander does not process payment or ship this bike. Inspect it
                  at pickup and pay the owner only after you are comfortable proceeding.
                </p>
              </div>
            </section>
          </div>

          <div className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
            <RequestPanel
              listing={listing}
              signedIn={Boolean(user)}
              userEmail={user?.email ?? null}
              isOwner={user?.id === listing.ownerId}
            />
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
              <HandCoins className="h-3.5 w-3.5" aria-hidden="true" />
              Payment is arranged offline
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
