import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Best Places to Bike in Steveston",
  description:
    "A local guide to easy waterfront rides, village stops, parks, dyke trails, and scenic places to visit by bike around Steveston, Richmond.",
  alternates: {
    canonical: "/guides/best-places-to-bike-in-steveston",
  },
  openGraph: {
    title: "Best Places to Bike in Steveston",
    description:
      "A local guide to easy waterfront rides, village stops, parks, dyke trails, and scenic places to visit by bike around Steveston, Richmond.",
    url: "https://www.wanderbike.ca/guides/best-places-to-bike-in-steveston",
    siteName: "Wander Bike Rentals",
    locale: "en_CA",
    type: "article",
  },
};

const guidePoints = [
  {
    title: "Garry Point Park",
    text: "Open waterfront, wide grass fields, and driftwood beaches where the Fraser River meets the ocean. The best first stop for photos and fresh air.",
  },
  {
    title: "Fisherman’s Wharf",
    text: "Lock up and walk the docks for fresh seafood off the boats, local shops, and Steveston’s working-harbour atmosphere.",
  },
  {
    title: "Britannia Shipyards",
    text: "A National Historic Site of restored boardwalks and heritage buildings — the most memorable stop on the ride.",
  },
  {
    title: "South Dyke Trail",
    text: "A flat Fraser River route east of the village. Quieter than the busy streets and ideal for stretching the ride longer.",
  },
  {
    title: "London Farm and Finn Slough",
    text: "A heritage farm and a tiny stilt-house fishing community — the quiet, local side of Steveston, farther out along the river.",
  },
  {
    title: "West Dyke Trail toward Terra Nova",
    text: "Wide open sky, marshland, and big Richmond views on flat, easy riding. From the shop, riding north toward the airport and back is about a 2-hour round trip at a sightseeing pace.",
  },
];

export default function BestPlacesToBikeInStevestonPage() {
  return (
    <main className="pb-20 text-slate-900">
      <section className="hero relative isolate overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/assets/garry-point-park.jpg"
            alt="Garry Point Park in Steveston with the fishermen’s memorial, driftwood beach, and Fraser River views"
            fill
            priority
            sizes="100vw"
            className="hero-img-anim object-cover object-center"
          />
          <div className="hero-grad-anim absolute inset-0 bg-gradient-to-br from-slate-950/85 via-slate-950/68 to-slate-900/50" />
          <div className="hero-grad-anim absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.26),transparent_46%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.14),transparent_40%)]" />
        </div>
        <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-28">
          <div className="space-y-6">
            <div className="hero-anim hero-d1 inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-teal-100 shadow-sm backdrop-blur">
              Steveston places guide
            </div>
            <div className="space-y-4">
              <h1 className="hero-anim hero-d2 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
                Best Places to Bike in Steveston
              </h1>
              <p className="hero-anim hero-d3 max-w-2xl text-lg leading-8 text-slate-100/90">
                A local guide to easy waterfront rides, village stops, parks, dyke trails, and scenic places to visit by bike around Steveston, Richmond.
              </p>
            </div>
            <p className="hero-anim hero-d3 max-w-2xl text-base leading-8 text-slate-200/85">
              Steveston is one of the easier places in Richmond to explore by bike. From Garry Point Park and Fisherman’s Wharf to Britannia Shipyards, the South Dyke Trail, and the West Dyke Trail, many of the best local stops are close enough to enjoy in one relaxed ride.
            </p>
            <div className="hero-anim hero-d4 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/bike-rental-steveston"
                className="btn-brand px-6 py-3.5 text-sm"
              >
                Steveston Rentals
              </Link>
              <Link
                href="/location"
                className="btn-secondary px-6 py-3.5 text-sm"
              >
                Location
              </Link>
            </div>
          </div>

          <div className="hero-anim hero-d4 rounded-[2rem] border border-white/55 bg-white/90 p-7 shadow-[0_24px_60px_rgba(15,23,42,0.10)] backdrop-blur-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">Guide overview</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">Use this page to pick the stops that fit your ride</h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
              <p>
                Some riders want a short village loop, while others want a longer afternoon with more open space, food stops, and more time on the dyke trails.
              </p>
              <p>
                Pick the places first so the ride feels more intentional and less like guesswork after pickup.
              </p>
            </div>
            <div className="mt-6 rounded-[1.5rem] border border-teal-100 bg-[linear-gradient(180deg,#f0fdfa_0%,#ecfeff_100%)] p-5 text-sm leading-7 text-teal-950 shadow-sm">
              A good Steveston ride usually includes one easy park stop, one village stop, and enough time left over to keep the day relaxed.
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Best local stops</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Six places that make a Steveston ride feel worth doing</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-600">
            Use these stops to build a short casual ride or a longer half-day route around the village, waterfront, and dyke trails.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {guidePoints.map((item) => (
            <div key={item.title} className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.08)]">
              <h3 className="text-lg font-semibold text-slate-950">{item.title}</h3>
              <p className="mt-4 text-sm leading-7 text-slate-600">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <div className="rounded-[2rem] border border-slate-200 bg-slate-950 px-8 py-10 text-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-300">Related pages</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight">Know the stops? Now plan the route and book a bike</h2>
              <p className="mt-4 text-base leading-8 text-slate-300">
                Follow the step-by-step Steveston route, grab a rental, or check the shop location before you go.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/guides/steveston-bike-ride-guide"
                className="btn-outline-light px-4 py-2 text-sm"
              >
                Steveston Route Guide
              </Link>
              <Link
                href="/bike-rental-steveston"
                className="btn-outline-light px-4 py-2 text-sm"
              >
                Steveston Rentals
              </Link>
              <Link
                href="/location"
                className="btn-outline-light px-4 py-2 text-sm"
              >
                Location
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
