import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Bike Trailer Rental Guide",
  description:
    "A practical guide for families deciding whether a bike trailer is the right fit for their Richmond or Steveston ride.",
};

const guidePoints = [
  {
    title: "A better fit for younger children",
    text: "A trailer can make more sense when younger children are not ready for the full ride on their own but you still want the outing to feel easy.",
  },
  {
    title: "Helpful when you want a slower pace",
    text: "If the goal is a relaxed family ride instead of covering a lot of distance, a trailer can make the day feel easier to manage.",
  },
  {
    title: "Best when you confirm first",
    text: "If your plan depends on a trailer, it is worth calling ahead so you know what to expect before heading to the shop.",
  },
];

export default function BikeTrailerRentalRichmondGuidePage() {
  return (
    <main className="pb-20 text-slate-900">
      <section className="relative overflow-hidden border-b border-white/70">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.16),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_30%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-22">
          <div className="space-y-6">
            <div className="inline-flex rounded-full border border-teal-200 bg-white/90 px-4 py-2 text-sm font-semibold text-teal-700 shadow-sm">
              Family trailer guide
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
                A simple bike trailer guide for easier family rides.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                A practical guide for parents deciding whether a trailer will make the ride smoother, easier, and more comfortable for the whole group.
              </p>
            </div>
            <p className="max-w-2xl text-base leading-8 text-slate-600">
              If you are trying to plan a ride with younger children, this guide helps you think through whether a trailer is the better choice before you call, visit, or build the rest of the outing around it.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/bike-trailer-rental-richmond"
                className="btn-primary px-6 py-3.5 text-sm shadow-[0_14px_30px_rgba(15,23,42,0.16)]"
              >
                View Trailer Rentals
              </Link>
              <Link
                href="/location"
                className="btn-secondary px-6 py-3.5 text-sm"
              >
                View Location
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/80 bg-white/95 p-7 shadow-[0_24px_60px_rgba(15,23,42,0.10)]">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">Guide overview</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">Choose the setup that makes the day easier</h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
              <p>
                Some family rides feel much easier with a trailer, especially when the day is built around comfort, shorter stops, and younger children who are not ready for the full route.
              </p>
              <p>
                It helps to make that call before you arrive, so the plan feels clearer from the start.
              </p>
            </div>
            <div className="mt-6 rounded-2xl bg-teal-50 p-4 text-sm leading-7 text-teal-900">
              If the outing depends on having a trailer, calling ahead is still the best way to confirm the details first.
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">What you can find here</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Simple tips for deciding if a trailer fits your plan</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-600">
            Use this guide if you want the family ride to feel easier to organize before you commit to the setup.
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
              <h2 className="mt-2 text-3xl font-bold tracking-tight">Read the guide first, then confirm the trailer details</h2>
              <p className="mt-4 text-base leading-8 text-slate-300">
                If a trailer is important for the outing, review the guide first and then contact the shop to confirm what you need.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/bike-trailer-rental-richmond"
                className="inline-flex items-center justify-center rounded-full border border-white/30 bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Trailer Rentals
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
