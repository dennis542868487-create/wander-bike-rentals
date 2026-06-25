import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Adult Bikes Richmond",
  description:
    "Adult bike rental in Richmond from Wander Bike Rentals. Simple local rentals near Steveston for visitors and casual riders.",
  alternates: {
    canonical: "/adult-bike-rental-richmond",
  },
  openGraph: {
    title: "Adult Bikes Richmond | Wander Bike Rentals",
    description:
      "Adult bike rental in Richmond near Steveston for visitors, couples, and casual riders.",
    url: "https://wanderbike.ca/adult-bike-rental-richmond",
  },
};

const quickFacts = [
  { label: "Best for", value: "Visitors, couples & casual riders" },
  { label: "Area", value: "Steveston & Richmond" },
  { label: "Included", value: "Helmet & lock" },
];

const reasons = [
  {
    title: "Comfortable adult bikes",
    text: "Easy-to-ride bikes for relaxed waterfront cruising — no special gear or experience needed.",
  },
  {
    title: "Helmet and lock included",
    text: "Every rental comes with a helmet and lock, so you can stop, explore, and lock up anywhere.",
  },
  {
    title: "Flat, scenic routes",
    text: "Steveston Village, Garry Point Park, and the West Dyke Trail are all flat and easy to follow.",
  },
];

const pricing = [
  { label: "Per hour", value: "$12.38" },
  { label: "Half day · 4 hr", value: "$40" },
  { label: "Full day · 24 hr", value: "$64.76" },
];

export default function AdultBikeRentalRichmondPage() {
  return (
    <main className="pb-20 text-slate-900">
      <section className="hero relative isolate overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_16%_14%,rgba(20,184,166,0.34),transparent_44%),radial-gradient(circle_at_84%_80%,rgba(14,165,233,0.22),transparent_48%),linear-gradient(135deg,#0f172a_0%,#052e2b_52%,#0b3b39_100%)]" />
        <div className="hero-grad-anim absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:46px_46px] [mask-image:radial-gradient(circle_at_50%_40%,#000,transparent_75%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-28">
          <div className="space-y-6">
            <div className="hero-anim hero-d1 inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-teal-100 shadow-sm backdrop-blur">
              Adult bikes
            </div>
            <div className="space-y-4">
              <h1 className="hero-anim hero-d2 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
                Adult bike rentals for easy rides around Richmond and Steveston.
              </h1>
              <p className="hero-anim hero-d3 max-w-2xl text-lg leading-8 text-slate-100/90">
                Comfortable bikes for visitors, couples, and casual riders. Pick one up and start riding the waterfront in minutes.
              </p>
            </div>
            <p className="hero-anim hero-d3 max-w-2xl text-base leading-8 text-slate-200/85">
              Ride flat, scenic routes near the waterfront and around Richmond. Helmet and lock are included with every rental.
            </p>
            <div className="hero-anim hero-d4 flex flex-col gap-3 sm:flex-row">
              <a
                href="tel:+17789521389"
                className="btn-brand px-6 py-3.5 text-sm"
              >
                Call About Adult Bikes
              </a>
              <Link href="/pricing" className="btn-secondary px-6 py-3.5 text-sm">
                See Pricing
              </Link>
              <Link href="/location" className="btn-secondary px-6 py-3.5 text-sm">
                View Location
              </Link>
            </div>
            <div className="hero-anim hero-d5 grid gap-4 sm:grid-cols-3">
              {quickFacts.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/20 bg-white/10 p-4 shadow-sm backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-100/80">{item.label}</p>
                  <p className="mt-2 text-sm font-medium text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-anim hero-d4 rounded-[2rem] border border-white/55 bg-white/95 p-7 shadow-[0_24px_60px_rgba(15,23,42,0.28)]">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">Adult bikes overview</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">A comfortable choice for a simple day out</h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
              <p>
                Adult bikes are ideal for easy waterfront rides, casual exploring around Steveston, or a slower day taking in the area.
              </p>
              <p>
                Heading out solo, with a partner, or meeting friends? Pick up here and you’re minutes from Garry Point Park and the dyke trails.
              </p>
            </div>
            <div className="mt-6 rounded-[1.5rem] border border-teal-100 bg-[linear-gradient(180deg,#f0fdfa_0%,#ecfeff_100%)] p-5 text-sm leading-7 text-teal-950 shadow-sm">
              Not sure where to ride? The West Dyke Trail from the shop toward the airport and back is about a 2-hour round trip at an easy pace.
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Why rent here</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Everything you need for an easy ride</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-600">
            Rent the bike here, then use our{" "}
            <Link href="/bike-rental-richmond" className="font-semibold text-teal-700 hover:underline">Richmond</Link>{" "}
            and{" "}
            <Link href="/bike-rental-steveston" className="font-semibold text-teal-700 hover:underline">Steveston</Link>{" "}
            ride ideas to plan where to go.
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
        <div className="rounded-[2.25rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Adult bike rates</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Simple, clear pricing</h2>
            </div>
            <Link href="/pricing" className="text-sm font-semibold text-teal-700 hover:underline">
              See all pricing →
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {pricing.map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{item.label}</p>
                <p className="mt-3 text-[2rem] font-bold tracking-tight text-teal-700 sm:text-3xl">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <div className="rounded-[2rem] border border-slate-200 bg-slate-950 px-8 py-10 text-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-300">Ready to ride?</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight">Call the shop or head over when you’re ready</h2>
              <p className="mt-4 text-base leading-8 text-slate-300">
                Confirm availability, check the location, or read a few quick answers before you go.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href="tel:+17789521389" className="btn-secondary px-6 py-3 text-sm">
                Call Now
              </a>
              <Link
                href="/location"
                className="btn-outline-light px-6 py-3 text-sm"
              >
                View Location
              </Link>
              <Link
                href="/faq"
                className="btn-outline-light px-6 py-3 text-sm"
              >
                Read FAQ
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
