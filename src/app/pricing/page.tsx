import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Check adult bike, kids bike, and trailer pricing for Wander Bike Rentals in Steveston, Richmond.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "Pricing | Wander Bike Rentals",
    description:
      "Adult bike, kids bike, and trailer pricing for Wander Bike Rentals in Steveston, Richmond.",
    url: "https://wanderbike.ca/pricing",
  },
};

export default function PricingPage() {
  return (
    <main className="pb-20 text-slate-900">
      <section className="relative overflow-hidden border-b border-white/70">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.14),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_30%)]" />
        <div className="relative mx-auto max-w-6xl px-6 py-14 lg:px-8 lg:py-20">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10">
            <div className="inline-flex rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-800">
              Pricing Overview
            </div>
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
              Pricing
            </p>
            <h1 className="mt-3 text-[2.2rem] font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-[3.35rem] lg:leading-[1.06]">
              Bike rental pricing in Richmond.
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-700">
              Check adult bike, kids bike, and trailer pricing before you call or visit Wander Bike Rentals.
            </p>
            <p className="mt-3 max-w-3xl text-base leading-8 text-slate-600">
              This page keeps the main rental rates in one place so it is easier to compare the options before planning the rest of the ride.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href="tel:+17789521389"
                className="btn-primary px-6 py-3.5 text-sm shadow-[0_14px_30px_rgba(15,23,42,0.16)]"
              >
                Call Now
              </a>
              <Link href="/location" className="btn-secondary px-6 py-3.5 text-sm">
                View Location
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14 lg:px-8 lg:py-16">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
            Adult Bike
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Adult bike rental rates
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
            A simple option for solo rides, couples, and relaxed local trips around Steveston and Richmond.
          </p>

          <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Per hour</p>
              <p className="mt-3 text-[2rem] font-bold tracking-tight text-slate-950 sm:text-3xl">$12.38</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Half day</p>
              <p className="mt-3 text-[2rem] font-bold tracking-tight text-slate-950 sm:text-3xl">$40</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Full day · 24 hr</p>
              <p className="mt-3 text-[2rem] font-bold tracking-tight text-slate-950 sm:text-3xl">$64.76</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14 lg:px-8 lg:py-16">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
            Kids Bike
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Kids bike rental rates
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
            A family-friendly option when you want a simpler way to plan a ride with children.
          </p>

          <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Per hour</p>
              <p className="mt-3 text-[2rem] font-bold tracking-tight text-slate-950 sm:text-3xl">$9.52</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Half day</p>
              <p className="mt-3 text-[2rem] font-bold tracking-tight text-slate-950 sm:text-3xl">$30</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Full day · 24 hr</p>
              <p className="mt-3 text-[2rem] font-bold tracking-tight text-slate-950 sm:text-3xl">$50</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14 lg:px-8 lg:py-16">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
            Trailer
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Trailer rental rates
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
            A practical family option when you want a smoother ride setup for younger children.
          </p>

          <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Per hour</p>
              <p className="mt-3 text-[2rem] font-bold tracking-tight text-slate-950 sm:text-3xl">$9.52</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Half day</p>
              <p className="mt-3 text-[2rem] font-bold tracking-tight text-slate-950 sm:text-3xl">$30</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Full day · 24 hr</p>
              <p className="mt-3 text-[2rem] font-bold tracking-tight text-slate-950 sm:text-3xl">$50</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14 lg:px-8 lg:py-16">
        <div className="rounded-[2rem] border border-slate-200 bg-slate-950 px-6 py-8 text-white shadow-[0_24px_60px_rgba(15,23,42,0.18)] sm:px-8 sm:py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-300">
                Ready to choose?
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">
                Check the rates, then call or visit when you are ready
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-300">
                If you already know which rental fits the day, use the links below to call the shop or check the location before heading over.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="tel:+17789521389"
                className="inline-flex min-w-[140px] items-center justify-center rounded-full border border-slate-700 bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(15,23,42,0.28)] transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                Call Now
              </a>
              <Link
                href="/location"
                className="inline-flex min-w-[124px] items-center justify-center rounded-full border border-slate-600 bg-slate-800 px-5 py-2.5 text-sm font-semibold text-slate-100 transition hover:-translate-y-0.5 hover:bg-slate-700"
              >
                Location
              </Link>
              <Link
                href="/"
                className="inline-flex min-w-[104px] items-center justify-center rounded-full border border-slate-600 bg-slate-800 px-5 py-2.5 text-sm font-semibold text-slate-100 transition hover:-translate-y-0.5 hover:bg-slate-700"
              >
                Home
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
