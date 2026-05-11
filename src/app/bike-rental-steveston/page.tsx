import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Bike Rental Steveston",
  description:
    "Bike rental in Steveston from Wander Bike Rentals. Rent adult bikes, kids bikes, and trailer rentals in Steveston, Richmond.",
  alternates: {
    canonical: "/bike-rental-steveston",
  },
  openGraph: {
    title: "Bike Rental Steveston | Wander Bike Rentals",
    description:
      "Rent adult bikes, kids bikes, and trailer rentals in Steveston, Richmond from Wander Bike Rentals.",
    url: "https://wanderbike.ca/bike-rental-steveston",
  },
};

const quickFacts = [
  { label: "Area", value: "Steveston Village, Richmond" },
  { label: "Ride style", value: "Village and waterfront rides" },
  { label: "Included", value: "Helmet and lock" },
];

const reasons = [
  {
    title: "Ride to Garry Point Park",
    text: "Take a relaxed ride to one of Steveston’s best waterfront stops for open views, fresh air, and photo breaks.",
  },
  {
    title: "Visit Fisherman’s Wharf",
    text: "Ride through the village, lock up the bike, and walk toward the boats, seafood spots, and waterfront restaurants.",
  },
  {
    title: "Follow the South Dyke Trail",
    text: "For a longer ride, continue east toward Britannia Shipyards, Imperial Landing, and Fraser River views.",
  },
];

export default function BikeRentalStevestonPage() {
  return (
    <main className="pb-20 text-slate-900">
      <section className="relative overflow-hidden border-b border-white/70">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.16),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_30%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8 lg:py-22">
          <div className="space-y-6">
            <div className="inline-flex rounded-full border border-teal-200 bg-white/90 px-4 py-2 text-sm font-semibold text-teal-700 shadow-sm">
              Steveston rentals
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
                Bike Rental Steveston
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                Explore Steveston Village by bike. Ride from the historic fishing village to Garry Point Park, Fisherman’s Wharf, Imperial Landing, and the South Dyke Trail with an easy local bike rental.
              </p>
            </div>
            <p className="max-w-2xl text-base leading-8 text-slate-600">
              Adult bikes, kids bikes, and trailers are available, with helmet and lock included for a smoother Steveston ride.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="tel:+17789521389"
                className="btn-primary px-6 py-3.5 text-sm shadow-[0_14px_30px_rgba(15,23,42,0.16)]"
              >
                Call Now
              </a>
              <Link
                href="/location"
                className="btn-secondary px-6 py-3.5 text-sm"
              >
                View Location
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {quickFacts.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{item.label}</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/80 bg-white/95 p-7 shadow-[0_24px_60px_rgba(15,23,42,0.10)]">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">Steveston overview</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">Explore more of Steveston by bike</h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
              <p>
                Steveston is one of Richmond’s easiest places to slow down, ride by the water, and turn a rental into a more complete day outside.
              </p>
              <p>
                Start in the village, stop at Garry Point Park, pass Fisherman’s Wharf, then continue toward Imperial Landing or Britannia Shipyards if you want a longer route.
              </p>
            </div>
            <div className="mt-6 rounded-[1.5rem] border border-teal-100 bg-[linear-gradient(180deg,#f0fdfa_0%,#ecfeff_100%)] p-5 text-sm leading-7 text-teal-950 shadow-sm">
              Recommended Steveston ride: start in the village, ride to Garry Point Park, then continue east along the waterfront toward Britannia Shipyards and the South Dyke Trail.
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Steveston ride highlights</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Turn a Steveston rental into a better village and waterfront ride</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-600">
            Picture the stops first, then choose the rental that fits the ride.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {reasons.map((item) => (
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
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-300">Next step</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight">Call now, check the location, or plan the rest of the Steveston ride</h2>
              <p className="mt-4 text-base leading-8 text-slate-300">
                If you already know the kind of Steveston ride you want, call the shop, confirm the details, and head over.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="tel:+17789521389"
                className="btn-secondary px-6 py-3 text-sm"
              >
                Call Now
              </a>
              <Link
                href="/guides/steveston-bike-ride-guide"
                className="inline-flex items-center justify-center rounded-full border border-white/30 bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Steveston Ride Guide
              </Link>
              <Link
                href="/location"
                className="inline-flex items-center justify-center rounded-full border border-white/30 bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                View Location
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
