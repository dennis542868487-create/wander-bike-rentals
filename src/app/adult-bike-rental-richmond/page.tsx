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
                Adult bike rentals for easy rides around Richmond and Steveston.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                A simple option for visitors, couples, and anyone who wants to get out for a relaxed ride without overthinking the details.
              </p>
            </div>
            <p className="max-w-2xl text-base leading-8 text-slate-600">
              If you want to pick up a bike and start riding with less hassle, this is a good place to begin. You can check the location, call ahead, and choose an adult bike for a casual ride near the waterfront or around Richmond.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="tel:+17789521389"
                className="btn-primary px-6 py-3.5 text-sm shadow-[0_14px_30px_rgba(15,23,42,0.16)]"
              >
                Call About Adult Bikes
              </a>
              <Link
                href="/location"
                className="btn-secondary px-6 py-3.5 text-sm"
              >
                View Location
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/80 bg-white/95 p-7 shadow-[0_24px_60px_rgba(15,23,42,0.10)]">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">Adult bikes overview</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">A comfortable choice for a simple day out</h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
              <p>
                Adult bikes work well for easy rides along the waterfront, casual exploring around Steveston, or a slower ride when you just want to enjoy the area.
              </p>
              <p>
                Whether you are heading out on your own, riding with a partner, or meeting friends, this page helps you start with the basics before you visit.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
