import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Steveston Bike Ride Guide",
  description:
    "Plan an easy Steveston bike ride from Steveston Village to Garry Point Park, Fisherman’s Wharf, Britannia Shipyards, and the South Dyke Trail.",
  alternates: {
    canonical: "/guides/steveston-bike-ride-guide",
  },
  openGraph: {
    title: "Steveston Bike Ride Guide",
    description:
      "Plan an easy Steveston bike ride from Steveston Village to Garry Point Park, Fisherman’s Wharf, Britannia Shipyards, and the South Dyke Trail.",
    url: "https://www.wanderbike.ca/guides/steveston-bike-ride-guide",
    siteName: "Wander Bike Rentals",
    locale: "en_CA",
    type: "article",
  },
};

const guidePoints = [
  {
    title: "1. Start in Steveston Village",
    text: "Begin at the waterfront where the shops, restaurants, and harbour sit close together. Easy parking and an easy start.",
  },
  {
    title: "2. Ride to Garry Point Park",
    text: "A short, flat waterfront stretch to Steveston’s best viewpoint — open water, grass fields, and driftwood beaches.",
  },
  {
    title: "3. Stop at Fisherman’s Wharf",
    text: "Loop back toward the village, lock up, and grab fresh seafood off the boats at Steveston’s most recognizable spot.",
  },
  {
    title: "4. Imperial Landing & Britannia Shipyards",
    text: "Roll east along the boardwalk past river views and heritage buildings for the most scenic stretch of the ride.",
  },
  {
    title: "5. Optional: South Dyke Trail",
    text: "Keep going east along the Fraser River for a quieter, more open ride away from the busy village streets.",
  },
];

export default function StevestonBikeRideGuidePage() {
  return (
    <main className="pb-20 text-slate-900">
      <section className="hero relative isolate overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/assets/fishermans-wharf.webp"
            alt="Steveston’s Fisherman’s Wharf with fishing boats, docks, and waterfront restaurants"
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
              Route guide
            </div>
            <div className="space-y-4">
              <h1 className="hero-anim hero-d2 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
                Steveston Bike Ride Guide
              </h1>
              <p className="hero-anim hero-d3 max-w-2xl text-lg leading-8 text-slate-100/90">
                A simple local route for riding from Steveston Village to Garry Point Park, Fisherman’s Wharf, Imperial Landing, Britannia Shipyards, and the South Dyke Trail.
              </p>
            </div>
            <p className="hero-anim hero-d3 max-w-2xl text-base leading-8 text-slate-200/85">
              Planning a bike ride in Steveston? This route can stay short and relaxed, or you can extend it into a longer waterfront ride toward London Farm and Finn Slough if you want more time outside.
            </p>
            <div className="hero-anim hero-d4 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/bike-rental-steveston"
                className="btn-brand px-6 py-3.5 text-sm"
              >
                Steveston Rentals
              </Link>
              <Link
                href="/#pricing"
                className="btn-secondary px-6 py-3.5 text-sm"
              >
                See Pricing
              </Link>
            </div>
          </div>

          <div className="hero-anim hero-d4 rounded-[2rem] border border-white/55 bg-white/90 p-7 shadow-[0_24px_60px_rgba(15,23,42,0.28)] backdrop-blur-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">Guide overview</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">A simple Steveston route you can actually follow</h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
              <p>
                This route works well because you can keep it short around the village and Garry Point Park, or stretch it farther toward Britannia Shipyards and the South Dyke Trail.
              </p>
              <p>
                It is a good fit for visitors, couples, families, and anyone who wants a relaxed Steveston ride instead of a fast workout.
              </p>
            </div>
            <div className="mt-6 rounded-[1.5rem] border border-teal-100 bg-[linear-gradient(180deg,#f0fdfa_0%,#ecfeff_100%)] p-5 text-sm leading-7 text-teal-950 shadow-sm">
              For a short ride, keep it around Steveston Village, Garry Point Park, and Fisherman’s Wharf. For more time out, add Britannia Shipyards and part of the South Dyke Trail.
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">A simple Steveston route</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Follow this route for an easier Steveston ride</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-600">
            Use this page when you want one route that can stay casual, scenic, and easy to adjust based on time, energy, and who is riding with you.
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
              <h2 className="mt-2 text-3xl font-bold tracking-tight">Use the route, then choose the rental and shop details you need</h2>
              <p className="mt-4 text-base leading-8 text-slate-300">
                Once you know how far you want to ride, head back to the Steveston rental page or check the location before you go.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/guides/best-places-to-bike-in-steveston"
                className="btn-outline-light px-4 py-2 text-sm"
              >
                Best Places to Bike
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
