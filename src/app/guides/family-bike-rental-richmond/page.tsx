import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Family Bike Rentals in Richmond, BC",
  description:
    "Plan an easy family bike ride in Richmond, BC. Rent kids bikes or bike trailers near Steveston and explore Garry Point Park, waterfront paths, and flat dyke trails.",
};

const guidePoints = [
  {
    title: "Kids Bikes",
    text: "A good option for children who are comfortable riding on their own for short, relaxed rides around Steveston, Garry Point Park, and nearby waterfront paths.",
  },
  {
    title: "Bike Trailers",
    text: "A helpful choice for younger children or kids who may get tired quickly, so the ride stays easier for the whole family.",
  },
  {
    title: "Steveston Village + Garry Point Park",
    text: "One of the easiest family-friendly ride ideas because the route can stay short, scenic, and flexible from start to finish.",
  },
  {
    title: "West Dyke Trail",
    text: "A flat and scenic option for families who want a longer ride with more open space, marshland, and photo stops.",
  },
  {
    title: "Terra Nova",
    text: "A stronger option when the family wants a ride that includes a destination children can look forward to beyond the bike itself.",
  },
  {
    title: "Railway Greenway",
    text: "Useful for families who want a more connected Richmond route instead of staying only around Steveston Village.",
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
              Family ride guide
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
                Family Bike Rentals in Richmond, BC
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                A simple guide for families looking for kids bikes, bike trailers, and easy places to ride around Steveston and Richmond.
              </p>
            </div>
            <p className="max-w-2xl text-base leading-8 text-slate-600">
              Planning a family ride in Richmond? Wander Bike Rentals offers adult bikes, kids bikes, and bike trailers for an easy day out near Steveston, Garry Point Park, the waterfront, and Richmond’s flat dyke trails.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/kids-bike-rental-richmond"
                className="btn-primary px-6 py-3.5 text-sm shadow-[0_14px_30px_rgba(15,23,42,0.16)]"
              >
                Kids Bikes
              </Link>
              <Link
                href="/bike-trailer-rental-richmond"
                className="btn-secondary px-6 py-3.5 text-sm"
              >
                Bike Trailers
              </Link>
              <a
                href="tel:+17789521389"
                className="btn-secondary px-6 py-3.5 text-sm"
              >
                Call Now
              </a>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/80 bg-white/95 p-7 shadow-[0_24px_60px_rgba(15,23,42,0.10)]">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">Guide overview</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">Why Richmond works well for family bike rides</h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
              <p>
                Richmond is a good place for a family ride because many routes are flat, scenic, and easy to keep flexible without overplanning the day.
              </p>
              <p>
                The best family plan is usually simple: choose one easy route, add one or two fun stops, and leave enough time for snacks, photos, and breaks.
              </p>
            </div>
            <div className="mt-6 rounded-[1.5rem] border border-teal-100 bg-[linear-gradient(180deg,#f0fdfa_0%,#ecfeff_100%)] p-5 text-sm leading-7 text-teal-950 shadow-sm">
              Whether your child is ready for their own bike or you prefer a trailer for a younger rider, this page helps you choose the better fit before you head out.
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Easy family ride ideas</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Plan the ride around your family, not the longest route</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-600">
            Use this page to decide whether kids bikes or trailers fit better, then choose one easy Richmond route that keeps the outing relaxed.
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
              <h2 className="mt-2 text-3xl font-bold tracking-tight">Choose the family setup first, then plan the ride around it</h2>
              <p className="mt-4 text-base leading-8 text-slate-300">
                Once you know whether kids bikes or a trailer make more sense, it gets much easier to plan a simple Richmond family ride.
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
                Bike Trailers
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
