import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Best Places to Bike in Steveston",
  description:
    "Guide page for biking around Steveston, Richmond, connected to Wander Bike Rentals.",
};

const guidePoints = [
  {
    title: "Easy local ride ideas",
    text: "A simple guide can help visitors choose a route that matches the kind of ride they want.",
  },
  {
    title: "Good for relaxed outings",
    text: "Steveston is well suited for casual rides, short exploring, and easy time outside.",
  },
  {
    title: "Helpful before your visit",
    text: "A few local suggestions can make it easier to plan your ride before choosing a rental.",
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
              Steveston ride guide
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
                Best Places to Bike in Steveston
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                A simple guide for visitors looking for easy and enjoyable places to bike around Steveston.
              </p>
            </div>
            <p className="max-w-2xl text-base leading-8 text-slate-600">
              This page is here to help riders find local route ideas, family-friendly spots, and simple planning tips before heading out.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/bike-rental-steveston"
                className="inline-flex items-center justify-center rounded-full bg-teal-700 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(15,118,110,0.22)] transition hover:-translate-y-0.5 hover:bg-teal-800"
              >
                Bike Rental Steveston
              </Link>
              <Link
                href="/location"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50"
              >
                View Location
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/80 bg-white/95 p-7 shadow-[0_24px_60px_rgba(15,23,42,0.10)]">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">Guide overview</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">Find an easy ride that fits your day</h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
              <p>
                Some riders want a short outing, while others want more time to explore the area at an easy pace.
              </p>
              <p>
                This guide is meant to help you choose a ride that feels simple, local, and enjoyable.
              </p>
            </div>
            <div className="mt-6 rounded-2xl bg-teal-50 p-4 text-sm leading-7 text-teal-900">
              Local ride ideas and simple planning notes can help you feel ready before renting a bike.
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">What you can find here</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Simple ideas for local rides</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-600">
            This guide is meant to help visitors feel more confident about where to ride before choosing a rental.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
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
              <h2 className="mt-2 text-3xl font-bold tracking-tight">Check local ride ideas, then choose your rental</h2>
              <p className="mt-4 text-base leading-8 text-slate-300">
                If you are ready to ride, head back to the rental page or check the shop location before you visit.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/bike-rental-steveston"
                className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Bike Rental Steveston
              </Link>
              <Link
                href="/location"
                className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
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
