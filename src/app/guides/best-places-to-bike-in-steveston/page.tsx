import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Best Places to Bike in Steveston",
  description:
    "A local guide to easy waterfront rides, village stops, parks, dyke trails, and scenic places to visit by bike around Steveston, Richmond.",
};

const guidePoints = [
  {
    title: "Garry Point Park",
    text: "An easy first stop for open waterfront views, photos, grass areas, and a slower feel before continuing onto the dyke trails.",
  },
  {
    title: "Fisherman’s Wharf",
    text: "A simple bike stop where you can lock up, walk toward the boats, and enjoy seafood spots, shops, and the Steveston waterfront atmosphere.",
  },
  {
    title: "Britannia Shipyards",
    text: "A stronger stop if you want more history, a boardwalk setting, and a ride that feels more memorable than a quick loop.",
  },
  {
    title: "South Dyke Trail",
    text: "A better choice for riders who want a longer route, more Fraser River views, and a quieter ride away from the busiest village streets.",
  },
  {
    title: "London Farm and Finn Slough",
    text: "Good for riders who want to go farther and add a quieter, more local side to the Steveston ride.",
  },
  {
    title: "West Dyke Trail toward Terra Nova",
    text: "One of the most scenic nearby options for open sky, marshland, flat riding, and big Richmond views.",
  },
];

export default function BestPlacesToBikeInStevestonPage() {
  return (
    <main className="pb-20 text-slate-900">
      <section className="relative overflow-hidden border-b border-white/70">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.16),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_30%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-22">
          <div className="space-y-6">
            <div className="inline-flex rounded-full border border-teal-200 bg-white/90 px-4 py-2 text-sm font-semibold text-teal-700 shadow-sm">
              Steveston places guide
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
                Best Places to Bike in Steveston
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                A local guide to easy waterfront rides, village stops, parks, dyke trails, and scenic places to visit by bike around Steveston, Richmond.
              </p>
            </div>
            <p className="max-w-2xl text-base leading-8 text-slate-600">
              Steveston is one of the easier places in Richmond to explore by bike. From Garry Point Park and Fisherman’s Wharf to Britannia Shipyards, the South Dyke Trail, and the West Dyke Trail, many of the best local stops are close enough to enjoy in one relaxed ride.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/bike-rental-steveston"
                className="btn-primary px-6 py-3.5 text-sm shadow-[0_14px_30px_rgba(15,23,42,0.16)]"
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

          <div className="rounded-[2rem] border border-white/80 bg-white/95 p-7 shadow-[0_24px_60px_rgba(15,23,42,0.10)]">
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
              <h2 className="mt-2 text-3xl font-bold tracking-tight">Pick the stops first, then choose the rental that fits</h2>
              <p className="mt-4 text-base leading-8 text-slate-300">
                Once you know which places you want to include, head back to the Steveston rental page or check the shop location before you go.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/bike-rental-steveston"
                className="inline-flex items-center justify-center rounded-full border border-white/30 bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Steveston Rentals
              </Link>
              <Link
                href="/location"
                className="inline-flex items-center justify-center rounded-full border border-white/30 bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
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
