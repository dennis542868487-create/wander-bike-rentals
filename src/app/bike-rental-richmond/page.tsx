import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Bike Rental Richmond",
  description:
    "Bike rental in Richmond from Wander Bike Rentals. Adult bikes, kids bikes, and trailer rentals near Steveston with helmet and lock included.",
  alternates: {
    canonical: "/bike-rental-richmond",
  },
  openGraph: {
    title: "Bike Rental Richmond | Wander Bike Rentals",
    description:
      "Adult bikes, kids bikes, and trailer rentals for riders looking for bike rental in Richmond near Steveston.",
    url: "https://wanderbike.ca/bike-rental-richmond",
  },
};

const quickFacts = [
  { label: "Best for", value: "Visitors, couples, and families" },
  { label: "Ride style", value: "Flat waterfront routes" },
  { label: "Included", value: "Helmet and lock" },
];

const rentalTypes = [
  {
    title: "Ride the West Dyke Trail",
    text: "A flat scenic route with open marshland, waterfront views, and plenty of space for a relaxed Richmond ride.",
  },
  {
    title: "Visit Steveston Village",
    text: "Start near Steveston and turn the ride into a fuller Richmond outing with village stops, food, and harbour views.",
  },
  {
    title: "Family-Friendly Rentals",
    text: "Choose adult bikes, kids bikes, or trailers for an easier local ride with family-friendly flexibility.",
  },
];

export default function BikeRentalRichmondPage() {
  return (
    <main className="pb-20 text-slate-900">
      <section className="relative overflow-hidden border-b border-white/70">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.16),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_30%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8 lg:py-22">
          <div className="space-y-6">
            <div className="inline-flex rounded-full border border-teal-200 bg-white/90 px-4 py-2 text-sm font-semibold text-teal-700 shadow-sm">
              Richmond rentals
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
                Bike Rental Richmond
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                Explore Richmond by bike from Steveston. Ride flat waterfront trails, visit Garry Point Park, enjoy Steveston Village, and take in Richmond’s open dyke views with an easy local bike rental.
              </p>
            </div>
            <p className="max-w-2xl text-base leading-8 text-slate-600">
              Adult bikes, kids bikes, and trailers are available, with helmet and lock included for a simpler ride around Richmond.
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
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">Richmond overview</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">A better way to see Richmond from the water and dyke trails</h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
              <p>
                Richmond is one of the easier places in Metro Vancouver to explore by bike because so many routes are flat, open, and easy to follow.
              </p>
              <p>
                Start near Steveston, ride toward Garry Point Park, continue onto the West Dyke Trail, or stretch the day toward Terra Nova and more waterfront views.
              </p>
            </div>
            <div className="mt-6 rounded-[1.5rem] border border-teal-100 bg-[linear-gradient(180deg,#f0fdfa_0%,#ecfeff_100%)] p-5 text-sm leading-7 text-teal-950 shadow-sm">
              Recommended Richmond ride: start from Steveston, ride to Garry Point Park, then continue along the West Dyke Trail for open views and a relaxed pace.
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Richmond ride ideas</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Plan a Richmond ride with clear destination ideas</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-600">
            Use these ideas to picture where to ride and how to turn the rental into a better Richmond outing.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {rentalTypes.map((item) => (
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
              <h2 className="mt-2 text-3xl font-bold tracking-tight">Call now, check the shop location, or plan the rest of the Richmond ride</h2>
              <p className="mt-4 text-base leading-8 text-slate-300">
                If you already know the kind of Richmond ride you want, the next step is simple: call the shop, confirm the basics, and head over.
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
                href="/location"
                className="inline-flex items-center justify-center rounded-full border border-white/30 bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                View Location
              </Link>
              <Link
                href="/guides/family-bike-rental-richmond"
                className="inline-flex items-center justify-center rounded-full border border-white/30 bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                View Richmond Guide
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
