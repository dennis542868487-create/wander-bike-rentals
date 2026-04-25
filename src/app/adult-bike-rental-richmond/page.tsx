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
    url: "https://wander-bike-rentals.vercel.app/adult-bike-rental-richmond",
  },
};

export default function AdultBikeRentalRichmondPage() {
  return (
    <main className="pb-20 text-slate-900">
      <section className="relative overflow-hidden border-b border-white/70">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.16),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_30%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-22">
          <div className="space-y-6">
            <div className="inline-flex rounded-full border border-teal-200 bg-white/90 px-4 py-2 text-sm font-semibold text-teal-700 shadow-sm">
              Adult bikes
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
                Adult Bike Rental Richmond
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                Adult bike rentals for visitors, couples, and casual rides around Richmond and Steveston.
              </p>
            </div>
            <p className="max-w-2xl text-base leading-8 text-slate-600">
              If you are looking for an easy adult bike rental in Richmond, Wander Bike Rentals offers a simple local option with clear pricing, convenient contact, and a helpful starting point near Steveston.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="tel:+17789521389"
                className="inline-flex items-center justify-center rounded-full bg-teal-700 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(15,118,110,0.22)] transition hover:-translate-y-0.5 hover:bg-teal-800"
              >
                Call About Adult Bikes
              </a>
              <Link
                href="/location"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50"
              >
                View Location
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/80 bg-white/95 p-7 shadow-[0_24px_60px_rgba(15,23,42,0.10)]">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">Adult bikes overview</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">A simple rental option for everyday rides</h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
              <p>
                Adult bike rentals are a good fit for relaxed rides, casual exploring, and simple day trips around the area.
              </p>
              <p>
                Whether you are riding solo or with company, this option gives you an easy place to get started.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
