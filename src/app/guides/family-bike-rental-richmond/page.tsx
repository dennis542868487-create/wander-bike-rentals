import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Things to Do in Richmond",
  description:
    "Easy rides, family-friendly stops, and relaxed ways to spend time around Richmond before or after your bike rental.",
};

const guidePoints = [
  {
    title: "Keep the ride easy and flexible",
    text: "Richmond works well when you leave room for short stops, slower riding, and small detours instead of trying to do too much in one trip.",
  },
  {
    title: "Mix biking with simple local stops",
    text: "A better outing often includes a mix of riding, a snack break, a waterfront stop, or a quick walk somewhere pleasant.",
  },
  {
    title: "Choose what fits your group",
    text: "Families, couples, and casual riders can all shape the afternoon differently, so it helps to start with a flexible plan instead of a packed route.",
  },
];

export default function FamilyBikeRentalRichmondPage() {
  return (
    <main className="pb-20 text-slate-900">
      <section className="relative overflow-hidden border-b border-white/70">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.16),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_30%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-22">
          <div className="space-y-6">
            <div className="inline-flex rounded-full border border-teal-200 bg-white/90 px-4 py-2 text-sm font-semibold text-teal-700 shadow-sm">
              Richmond visitor guide
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
                Things to do in Richmond before or after your bike rental.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                Easy Richmond ideas for anyone who wants a more enjoyable outing, with a mix of riding and a few good ways to spend time off the bike too.
              </p>
            </div>
            <p className="max-w-2xl text-base leading-8 text-slate-600">
              If you are planning time in Richmond, this guide can help you keep the day simple. Ride a little, stop somewhere worthwhile, and build an outing that feels relaxed instead of overplanned.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/kids-bike-rental-richmond"
                className="btn-primary px-6 py-3.5 text-sm shadow-[0_14px_30px_rgba(15,23,42,0.16)]"
              >
                View Kids Bikes
              </Link>
              <Link
                href="/bike-trailer-rental-richmond"
                className="btn-secondary px-6 py-3.5 text-sm"
              >
                View Trailers
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/80 bg-white/95 p-7 shadow-[0_24px_60px_rgba(15,23,42,0.10)]">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">Guide overview</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">A better Richmond outing starts with a simple plan</h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
              <p>
                Richmond is easier to enjoy when you plan a route that leaves space for small stops, food, and a slower pace instead of trying to cover everything at once.
              </p>
              <p>
                Start here if you want a few useful ideas before you rent and head out.
              </p>
            </div>
            <div className="mt-6 rounded-2xl bg-teal-50 p-4 text-sm leading-7 text-teal-900">
              The best Richmond plans usually keep things simple: one easy ride, one or two worthwhile stops, and enough time to enjoy the area without rushing.
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">What you can do here</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Simple ways to enjoy more of Richmond</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-600">
            Use this guide if you want the ride to be part of a better afternoon out, not the only thing you do.
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
              <h2 className="mt-2 text-3xl font-bold tracking-tight">Plan the Richmond outing first, then choose the rental that fits</h2>
              <p className="mt-4 text-base leading-8 text-slate-300">
                Once you know what kind of afternoon you want, you can compare kids bikes and trailer rentals before visiting the shop.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/kids-bike-rental-richmond"
                className="inline-flex items-center justify-center rounded-full border border-white/30 bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Kids Bikes
              </Link>
              <Link
                href="/bike-trailer-rental-richmond"
                className="inline-flex items-center justify-center rounded-full border border-white/30 bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Trailer Rentals
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
