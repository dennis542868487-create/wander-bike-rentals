import type { Metadata } from "next";
import {
  ArrowRight,
  Clock3,
  MapPin,
  PhoneCall,
  ShieldCheck,
  Store,
  UsersRound,
  Wrench,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CompactListingCard } from "@/components/marketplace/compact-listing-card";
import ReviewsSection from "@/components/reviews-section";
import { getFeaturedListings } from "@/lib/marketplace/data";
import { WANDER_SHOP_DIRECTIONS_URL } from "@/lib/marketplace/wander-shop";
import { wanderWebsiteSchema } from "@/lib/seo/wander-business";

export const metadata: Metadata = {
  title: "Bike Rentals in Steveston & Local Bike Marketplace",
  description:
    "Wander Bike Rentals is a physical bike rental, sale, and quick repair shop in Steveston, Richmond, plus a local marketplace for owner-listed bikes.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Wander Bike Rentals | Steveston, Richmond",
    description:
      "Rent or buy from the Wander shop, or browse bikes listed separately by local owners.",
    url: "https://www.wanderbike.ca/",
  },
};

export default async function HomePage() {
  const [wanderListings, communityListings] = await Promise.all([
    getFeaturedListings("wander", 3),
    getFeaturedListings("community", 3),
  ]);

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(wanderWebsiteSchema) }}
      />
      <section className="hero relative isolate overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/assets/bikes-row.jpg"
            alt="Rows of rental bikes inside Wander Bike Rentals"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-950/76 to-emerald-950/68" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.28),transparent_46%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.16),transparent_40%)]" />
        </div>

        <div className="relative mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:min-h-[46rem] lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-10 lg:px-8 lg:py-20">
          <div className="motion-rise max-w-3xl">
            <div className="inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-2 text-xs font-semibold text-teal-100 shadow-sm backdrop-blur sm:px-4 sm:text-sm">
              Wander Bike Rentals • Steveston, Richmond
            </div>
            <h1 className="mt-5 text-[2.65rem] font-bold leading-[1.02] tracking-[-0.05em] text-white sm:mt-7 sm:text-6xl lg:text-[4.4rem]">
              Easy local bike rentals,
              <span className="block text-teal-200">
                now with a community marketplace.
              </span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-100/90 sm:mt-6 sm:text-xl sm:leading-8">
              Rent or buy a bike managed by our Steveston shop, or browse a
              separate collection listed by local owners. Every bike has its
              own photos, price, and request page.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/bikes" className="btn-brand w-full px-7 py-3.5 text-sm sm:w-auto">
                Find a Bike
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/list-your-bike"
                className="btn-outline-light w-full px-7 py-3.5 text-sm sm:w-auto"
              >
                List Your Bike
              </Link>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-white">
              <a
                href="tel:+17789521389"
                className="underline decoration-white/50 underline-offset-4 transition hover:decoration-white"
              >
                Call (778) 952-1389
              </a>
              <a
                href={WANDER_SHOP_DIRECTIONS_URL}
                target="_blank"
                rel="noreferrer"
                className="underline decoration-white/50 underline-offset-4 transition hover:decoration-white"
              >
                Get Directions
              </a>
            </div>
            <div className="mt-9 hidden gap-4 sm:grid sm:grid-cols-3">
              {[
                ["Location", "Steveston, Richmond"],
                ["Collections", "Wander + Community"],
                ["Exchange", "Pickup and pay locally"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/20 bg-white/10 p-4 shadow-sm backdrop-blur"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-100/80">
                    {label}
                  </p>
                  <p className="mt-2 text-sm font-medium text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="motion-rise motion-rise-delay-1 lg:pl-5">
            <div className="relative border-y border-r border-white/20 border-l-2 border-l-teal-300/70 bg-slate-950/72 p-5 text-white shadow-[0_24px_70px_rgba(2,6,23,0.34)] backdrop-blur-2xl sm:p-7">
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <Store className="h-6 w-6 shrink-0 text-teal-200" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-200/80">
                      Local bike snapshot
                    </p>
                    <p className="mt-1 truncate text-sm text-slate-300">
                      Steveston, Richmond
                    </p>
                  </div>
                </div>
                <span className="inline-flex shrink-0 items-center gap-2 border-l border-white/20 py-1 pl-3 text-xs font-bold text-emerald-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" aria-hidden="true" />
                  Open today
                </span>
              </div>

              <h2 className="mt-6 max-w-md text-2xl font-semibold leading-tight tracking-[-0.025em] sm:text-[2rem]">
                The shop stays.
                <span className="block text-teal-200">The marketplace is new.</span>
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-6 text-slate-300 sm:text-base sm:leading-7">
                Choose an exact bike online, then confirm pickup and payment
                directly with Wander or the community owner.
              </p>

              <div className="mt-6 border-y border-white/15 bg-white/[0.06]">
                <a
                  href={WANDER_SHOP_DIRECTIONS_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-3 px-4 py-4 transition hover:bg-white/10"
                >
                  <MapPin className="h-5 w-5 shrink-0 text-teal-200" aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-white">
                      Wander Bike Rentals
                    </span>
                    <span className="mt-1 block text-sm leading-5 text-slate-300">
                      12071 First Ave #101, Richmond, BC V7E 3M1
                    </span>
                  </span>
                  <ArrowRight
                    className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-white"
                    aria-hidden="true"
                  />
                </a>

                <div className="grid grid-cols-2 border-t border-white/15">
                  <a
                    href="tel:+17789521389"
                    className="flex items-center gap-3 border-r border-white/15 px-4 py-4 transition hover:bg-white/10"
                  >
                    <PhoneCall className="h-4 w-4 shrink-0 text-teal-200" aria-hidden="true" />
                    <span>
                      <span className="block text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-400">
                        Call
                      </span>
                      <span className="mt-1 block text-sm font-semibold text-white">
                        (778) 952-1389
                      </span>
                    </span>
                  </a>
                  <div className="flex items-center gap-3 px-4 py-4">
                    <Clock3 className="h-4 w-4 shrink-0 text-teal-200" aria-hidden="true" />
                    <span>
                      <span className="block text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-400">
                        Hours
                      </span>
                      <span className="mt-1 block text-sm font-semibold text-white">
                        9 AM–10 PM
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <dl className="mt-5 grid grid-cols-3 divide-x divide-white/15 border-y border-white/15 py-4">
                {[
                  ["Wander bikes", "Shop managed"],
                  ["Community", "Owner listed"],
                  ["Payment", "In person"],
                ].map(([label, value]) => (
                  <div key={label} className="min-w-0 px-2 first:pl-0 last:pr-0 sm:px-4">
                    <dt className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-slate-400">
                      {label}
                    </dt>
                    <dd className="mt-1.5 text-xs font-semibold text-teal-100 sm:text-sm">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>

              <a
                href={WANDER_SHOP_DIRECTIONS_URL}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary group mt-5 min-h-12 w-full px-5 py-3 text-sm shadow-[0_12px_28px_rgba(2,6,23,0.24)] hover:-translate-y-0.5 hover:bg-teal-50"
                style={{ borderRadius: 0 }}
              >
                <MapPin className="h-4 w-4" aria-hidden="true" />
                Go to Store
                <ArrowRight
                  className="h-4 w-4 transition group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </a>
            </div>
          </div>
        </div>
      </section>

      <ReviewsSection />

      <section className="route-wash border-y border-[var(--card-border)] bg-[#ecfdf5]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
              Find a bike
            </p>
            <h2 className="display-heading mt-2 text-4xl sm:text-5xl">
              Two collections, clearly separated.
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              The physical shop’s Wander Bikes and owner-listed Community Bikes
              have separate pages and request flows, so the source is always clear.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <Link
              href="/bikes/wander"
              className="group overflow-hidden rounded-[2rem] border border-[var(--card-border)] bg-white shadow-[0_14px_30px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_20px_42px_rgba(15,23,42,0.14)]"
            >
              <div className="relative aspect-[16/8] overflow-hidden">
                <Image
                  src="/assets/bikes-row.jpg"
                  alt="Wander Bikes inside the Steveston shop"
                  fill
                  sizes="(min-width: 1024px) 46vw, 100vw"
                  className="object-cover transition duration-500 group-hover:scale-[1.025]"
                />
                <div
                  className="absolute left-0 top-0 h-16 w-16 bg-[var(--green)] [clip-path:polygon(0_0,100%_0,0_100%)]"
                  aria-hidden="true"
                />
              </div>
              <div className="p-5 sm:p-8">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--teal-soft)] text-[var(--teal)]">
                    <Store className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-2xl font-extrabold tracking-tight text-[var(--navy)] sm:text-3xl">
                      Wander Bikes
                    </h3>
                    <p className="mt-2 max-w-lg leading-7 text-slate-600">
                      Rental and sale listings managed directly by the Wander
                      team at the Steveston shop.
                    </p>
                    <span className="mt-6 inline-flex items-center gap-2 font-bold text-[var(--teal)]">
                      Browse Wander Bikes
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
            <Link
              href="/bikes/community"
              className="group overflow-hidden rounded-[2rem] border border-[var(--card-border)] bg-white shadow-[0_14px_30px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_20px_42px_rgba(15,23,42,0.14)]"
            >
              <div className="relative aspect-[16/8] overflow-hidden">
                <Image
                  src="/assets/steveston-ride-idea.jpg"
                  alt="A locally listed bicycle near the Richmond waterfront"
                  fill
                  sizes="(min-width: 1024px) 46vw, 100vw"
                  className="object-cover transition duration-500 group-hover:scale-[1.025]"
                />
                <div
                  className="absolute right-0 top-0 h-16 w-16 bg-[var(--coral)] [clip-path:polygon(0_0,100%_0,100%_100%)]"
                  aria-hidden="true"
                />
              </div>
              <div className="p-5 sm:p-8">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#eef6df] text-[var(--green)]">
                    <UsersRound className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-2xl font-extrabold tracking-tight text-[var(--navy)] sm:text-3xl">
                      Community Bikes
                    </h3>
                    <p className="mt-2 max-w-lg leading-7 text-slate-600">
                      Bikes listed by local owners, with pickup and offline
                      payment arranged directly after a request.
                    </p>
                    <span className="mt-6 inline-flex items-center gap-2 font-bold text-[var(--green)]">
                      Browse Community Bikes
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-sm font-bold text-teal-800">From Wander Bike</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                Wander Bikes
              </h2>
            </div>
            <Link href="/bikes/wander" className="text-sm font-bold text-teal-800 hover:text-teal-950">
              View all Wander Bikes →
            </Link>
          </div>
          <div className="mobile-card-rail -mx-4 mt-7 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
            {wanderListings.map((listing) => (
              <div
                key={listing.id}
                className="min-w-[84vw] snap-center sm:min-w-0"
              >
                <CompactListingCard listing={listing} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f0fdf9]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-sm font-bold text-teal-800">From local owners</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                Community Bikes
              </h2>
            </div>
            <Link href="/bikes/community" className="text-sm font-bold text-teal-800 hover:text-teal-950">
              View all Community Bikes →
            </Link>
          </div>
          <div className="mobile-card-rail -mx-4 mt-7 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
            {communityListings.map((listing) => (
              <div
                key={listing.id}
                className="min-w-[84vw] snap-center sm:min-w-0"
              >
                <CompactListingCard listing={listing} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="overflow-hidden border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <h2 className="display-heading text-4xl sm:text-5xl">
              A real bike shop in{" "}
              <span className="text-[var(--teal)]">Steveston.</span>
            </h2>
            <p className="mt-4 max-w-md leading-7 text-slate-600">
              Wander continues to provide its own rentals, bike sales, and
              quick repair services. The community marketplace is an additional
              service, not a replacement for the shop.
            </p>
            <div className="mt-8 space-y-6">
            {[
              {
                icon: Store,
                title: "Wander rentals & sales",
                text: "Our team lists each store bike with its own photos, rental rate, sale price, and availability.",
                href: "/bikes/wander",
                label: "See Wander Bikes",
              },
              {
                icon: Wrench,
                title: "Quick bike repair",
                text: "Visit the shop for common issues such as flats, brake adjustment, gear tuning, and basic safety checks.",
                href: "/quick-bike-repair-richmond",
                label: "Repair information",
              },
              {
                icon: MapPin,
                title: "Visit in Steveston",
                text: "Find the address, hours, phone number, directions, and map before you head over.",
                href: "/location",
                label: "Location and hours",
              },
            ].map(({ icon: Icon, title, text, href, label }) => (
              <article key={title} className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--teal-soft)] text-[var(--teal)]">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-bold text-[var(--navy)]">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
                  <Link
                    href={href}
                    className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-[var(--teal)]"
                  >
                    {label}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/location" className="btn-primary px-5 py-2.5 text-sm">
                Visit the Shop
              </Link>
              <a href="tel:+17789521389" className="btn-secondary px-5 py-2.5 text-sm">
                Call (778) 952-1389
              </a>
            </div>
          </div>
          <div className="photo-arch-left relative min-h-[20rem] overflow-hidden bg-slate-100 sm:min-h-[26rem] lg:min-h-[32rem]">
            <Image
              src="/assets/bikes-row.jpg"
              alt="Wander Bike Rentals shop inventory in Steveston"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
            <div
              className="absolute bottom-0 left-0 h-24 w-24 bg-[var(--teal)] [clip-path:polygon(0_0,100%_100%,0_100%)]"
              aria-hidden="true"
            />
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:px-8">
          <div className="relative min-h-[18rem] overflow-hidden rounded-[1.5rem] bg-slate-100 sm:min-h-[24rem]">
            <Image
              src="/assets/west-dyke-trail.jpg"
              alt="A waterfront bike route in Richmond, British Columbia"
              fill
              sizes="(min-width: 1024px) 44vw, 100vw"
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Explore Richmond and Steveston by bike.
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-8 text-slate-600">
              Start with the area or bike type you have in mind, then move into
              the live Wander and Community collections to see the exact bike.
            </p>
            <nav aria-label="Local bike rental information" className="mt-8 border-y border-slate-200">
              {[
                ["Bike Rental Richmond", "/bike-rental-richmond"],
                ["Bike Rental Steveston", "/bike-rental-steveston"],
                ["Adult Bike Rentals", "/adult-bike-rental-richmond"],
                ["Kids Bike Rentals", "/kids-bike-rental-richmond"],
                ["Bike Trailer Rentals", "/bike-trailer-rental-richmond"],
              ].map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex items-center justify-between gap-4 border-b border-slate-200 py-4 text-sm font-bold text-slate-950 transition last:border-b-0 hover:text-teal-800"
                >
                  {label}
                  <ArrowRight
                    className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-teal-700"
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--card-border)] bg-[#f0fdf9]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-18">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
                Gallery
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                See our shop bikes and gear
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-slate-600">
              These are photos from the physical Wander Bike shop. Community
              owners upload separate photos for each bike they list.
            </p>
          </div>
          <div className="mobile-card-rail -mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0 md:pb-0">
            {[
              {
                src: "/assets/bikes-row.jpg",
                alt: "Rows of Wander rental bikes ready for riders",
                label: "Wander bike lineup",
              },
              {
                src: "/assets/trailer-bike.jpg",
                alt: "Bike with a family trailer inside Wander Bike Rentals",
                label: "Trailer and family setup",
              },
              {
                src: "/assets/helmets.jpg",
                alt: "Helmet selection at Wander Bike Rentals",
                label: "Rental helmets and gear",
              },
            ].map((item) => (
              <figure
                key={item.src}
                className="min-w-[82vw] snap-center overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm md:min-w-0"
              >
                <div className="relative aspect-[4/5]">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes="(min-width: 768px) 31vw, 100vw"
                    className="object-cover transition duration-500 hover:scale-[1.025]"
                  />
                </div>
                <figcaption className="p-5 text-sm font-semibold text-slate-700">
                  {item.label}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-18">
          <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
                FAQ preview
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                What changed—and what stayed the same
              </h2>
              <p className="mt-4 leading-7 text-slate-600">
                Wander still operates its Steveston shop. The new marketplace
                adds individually priced bikes from Wander and local owners,
                without online payment or shipping.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/faq" className="btn-primary px-5 text-sm">
                  Read all questions
                </Link>
                <a href="tel:+17789521389" className="btn-secondary px-5 text-sm">
                  Call the shop
                </a>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                [
                  "Is the physical shop still open?",
                  "Yes. Wander rentals, local bike sales, and quick repair continue at the Steveston location.",
                ],
                [
                  "Are Wander and Community Bikes mixed?",
                  "No. They stay in two separate collections so you always know who manages the bike.",
                ],
                [
                  "Does every bike have its own price?",
                  "Yes. Open the exact listing to see that bike’s photos, rental rate, sale price, and availability.",
                ],
                [
                  "Do I pay or arrange shipping online?",
                  "No. Send a request online, then inspect, pick up, and pay locally after the owner accepts.",
                ],
              ].map(([question, answer]) => (
                <article
                  key={question}
                  className="rounded-[2rem] border border-[var(--card-border)] bg-[#f0fdf9] p-6"
                >
                  <h3 className="font-semibold text-slate-950">{question}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{answer}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-800 bg-[var(--navy)] text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              No cart. No shipping. No platform payment.
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              ["1", "Choose a bike", "See that bike’s exact price, offer type, and pickup area."],
              ["2", "Send a request", "Ask to rent or buy. The owner confirms availability."],
              ["3", "Meet locally", "Inspect the bike, pick it up, and pay the owner in person."],
            ].map(([step, title, text]) => (
              <div key={step}>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--teal)] text-sm font-bold text-white">
                  {step}
                </span>
                <h3 className="mt-4 font-bold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
              </div>
            ))}
          </div>
          <div className="lg:col-start-2">
            <Link href="/how-it-works" className="inline-flex items-center gap-2 text-sm font-bold text-teal-300">
              Read how the marketplace works
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
