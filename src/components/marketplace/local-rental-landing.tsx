import {
  ArrowRight,
  Bike,
  CalendarCheck,
  ClipboardCheck,
  HandCoins,
  MapPin,
  Route,
  Store,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CompactListingCard } from "@/components/marketplace/compact-listing-card";
import { RentalPauseNotice } from "@/components/marketplace/rental-pause-notice";
import { getPublicListings } from "@/lib/marketplace/data";
import type { BikeType } from "@/lib/marketplace/types";

type LocalRentalLandingProps = {
  title: string;
  introduction: string;
  heroImage: string;
  heroImageAlt: string;
  facts: readonly {
    label: string;
    value: string;
  }[];
  reasons: readonly {
    title: string;
    description: string;
  }[];
  inventoryHeading: string;
  inventoryIntroduction: string;
  bikeTypes?: readonly BikeType[];
};

export async function LocalRentalLanding({
  title,
  introduction,
  heroImage,
  heroImageAlt,
  facts,
  reasons,
  inventoryHeading,
  inventoryIntroduction,
  bikeTypes,
}: LocalRentalLandingProps) {
  const wanderRentals = await getPublicListings("wander", { intent: "rent" });
  const matchingRentals = (
    bikeTypes
      ? wanderRentals.filter((listing) => bikeTypes.includes(listing.bikeType))
      : wanderRentals
  ).slice(0, 3);
  const factItems = [
    ...facts,
    { label: "Wander shop", value: "12071 First Ave #101" },
  ];

  return (
    <main className="bg-[var(--background)] text-slate-900">
      <section className="route-wash overflow-hidden border-b border-slate-200 bg-white">
        <div className="mx-auto grid min-h-[38rem] max-w-7xl items-center gap-10 px-6 py-12 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:py-14">
          <div className="motion-rise max-w-2xl">
            <h1 className="display-heading text-4xl leading-[1.02] sm:text-5xl lg:text-[4.25rem]">
              {title}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              {introduction}
            </p>
            <div className="motion-rise motion-rise-delay-1 mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/bikes/wander" className="btn-primary px-6 py-3.5">
                Browse Wander Bikes
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a href="tel:+17789521389" className="btn-secondary px-6 py-3.5">
                Call the Wander Shop
              </a>
            </div>
            <p className="motion-rise motion-rise-delay-2 mt-4 text-sm text-slate-500">
              Looking for an owner-listed bike instead?{" "}
              <Link href="/bikes/community" className="font-bold text-teal-800">
                View Community Bikes
              </Link>
              .
            </p>
            <RentalPauseNotice
              className="motion-rise motion-rise-delay-2 mt-6"
              detail="Bike browsing remains available while new rental requests are unavailable."
            />
          </div>

          <div className="photo-arch-right motion-rise motion-rise-delay-1 relative min-h-[26rem] overflow-hidden bg-slate-100 lg:min-h-[34rem]">
            <Image
              src={heroImage}
              alt={heroImageAlt}
              fill
              priority
              sizes="(min-width: 1024px) 48vw, 100vw"
              className="object-cover"
            />
            <div
              className="absolute bottom-0 right-0 h-24 w-24 bg-[var(--teal)] [clip-path:polygon(100%_0,100%_100%,0_100%)]"
              aria-hidden="true"
            />
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-[#f0fdf9]">
        <dl className="mx-auto grid max-w-7xl gap-0 px-6 py-5 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
          {factItems.map((fact, index) => {
            const icons = [MapPin, Bike, HandCoins, Store];
            const Icon = icons[index] ?? MapPin;
            return (
              <div
                key={fact.label}
                className="flex items-center gap-3 border-b border-slate-200 py-4 sm:border-b-0 sm:border-r sm:px-5 sm:first:pl-0 sm:last:border-r-0"
              >
                <Icon className="h-5 w-5 shrink-0 text-[var(--teal)]" aria-hidden="true" />
                <div>
                  <dt className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                    {fact.label}
                  </dt>
                  <dd className="mt-1 text-sm font-bold text-[var(--navy)]">
                    {fact.value}
                  </dd>
                </div>
              </div>
            );
          })}
        </dl>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
              <h2 className="display-heading text-3xl sm:text-4xl">
                Wander rents specific bikes from its Steveston shop.
              </h2>
              <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-600">
                The Wander team manages this collection directly. Each shop
                bike has its own photos, fit, availability, rental rate, and
                sale price.
              </p>
          </div>
          <div className="mt-10 grid gap-0 sm:grid-cols-3">
              {reasons.map((reason, index) => {
                const icons = [Bike, ClipboardCheck, Route];
                const Icon = icons[index] ?? Bike;
                return (
                <article
                  key={reason.title}
                  className="border-b border-slate-200 px-6 py-7 text-center sm:border-b-0 sm:border-r sm:last:border-r-0"
                >
                  <Icon className="mx-auto h-8 w-8 text-[var(--teal)]" aria-hidden="true" />
                  <h3 className="mt-5 font-bold text-[var(--navy)]">{reason.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {reason.description}
                  </p>
                </article>
                );
              })}
          </div>
        </div>
      </section>

      <section className="bg-[#f1f7fb]">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tight text-slate-950">
                {inventoryHeading}
              </h2>
              <p className="mt-3 leading-7 text-slate-600">
                {inventoryIntroduction}
              </p>
            </div>
            <Link
              href="/bikes/wander"
              className="text-sm font-bold text-teal-800 hover:text-teal-950"
            >
              View all Wander Bikes →
            </Link>
          </div>

          {matchingRentals.length > 0 ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {matchingRentals.map((listing) => (
                <CompactListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="mt-8 border border-slate-200 bg-white px-6 py-8">
              <p className="font-bold text-slate-950">
                No matching Wander listing is live right now.
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Availability changes bike by bike. Browse the complete Wander
                collection or check Community Bikes for current local options.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/bikes/wander" className="btn-primary px-5 py-2.5 text-sm">
                  Browse Wander Bikes
                </Link>
                <Link href="/bikes/community" className="btn-secondary px-5 py-2.5 text-sm">
                  Browse Community Bikes
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="overflow-hidden border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 lg:grid-cols-[0.78fr_1.22fr] lg:px-8">
          <div>
            <h2 className="display-heading text-4xl">
              Plan the ride from{" "}
              <span className="text-[var(--teal)]">Steveston.</span>
            </h2>
            <p className="mt-4 max-w-md leading-7 text-slate-600">
              Use the local guides to choose a route, check family options, and
              confirm the Wander shop location before pickup.
            </p>
            <nav aria-label="Local ride planning" className="mt-7 border-y border-slate-200">
              {[
                ["Steveston Bike Routes", "/guides/best-places-to-bike-in-steveston"],
                ["Family Riding Guide", "/guides/family-bike-rental-richmond"],
                ["Location & Hours", "/location"],
              ].map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex items-center justify-between border-b border-slate-200 py-4 text-sm font-bold text-[var(--navy)] last:border-b-0 hover:text-[var(--teal)]"
                >
                  {label}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              ))}
            </nav>
          </div>
          <div className="photo-arch-left relative min-h-[26rem] overflow-hidden bg-slate-100">
            <Image
              src="/assets/west-dyke-trail.jpg"
              alt="Cycling route near Steveston and the Richmond waterfront"
              fill
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="object-cover"
            />
            <div
              className="absolute bottom-0 left-0 h-20 w-20 bg-[var(--green)] [clip-path:polygon(0_0,100%_100%,0_100%)]"
              aria-hidden="true"
            />
          </div>
        </div>
      </section>

      <section className="border-t border-slate-800 bg-[var(--navy)] text-white">
        <div className="mx-auto grid max-w-7xl gap-9 px-6 py-14 lg:grid-cols-[0.75fr_1.25fr] lg:px-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Reserve online. Pick up locally.
            </h2>
            <p className="mt-4 max-w-md leading-7 text-slate-300">
              Wander Bikes are handled by the Steveston shop. Community Bikes
              are handled by their owners. Neither flow uses shipping or online
              platform payment.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: CalendarCheck,
                title: "Send a request",
                text: "Choose a specific bike and request to rent or buy it.",
              },
              {
                icon: MapPin,
                title: "Confirm pickup",
                text: "The Wander team or community owner confirms timing and local pickup details.",
              },
              {
                icon: HandCoins,
                title: "Pay in person",
                text: "Inspect the bike and complete payment directly at pickup.",
              },
            ].map(({ icon: Icon, title: stepTitle, text }) => (
              <div key={stepTitle}>
                <Icon className="h-5 w-5 text-teal-300" aria-hidden="true" />
                <h3 className="mt-4 font-bold">{stepTitle}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
