import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Things to Do in Steveston Village",
  description:
    "A simple visitor guide to riding, walking, and spending time around Steveston Village before or after your bike rental.",
};

const guidePoints = [
  {
    title: "Ride the village at an easy pace",
    text: "Steveston works well for a slower ride where you can stop often, look around, and enjoy the waterfront without rushing.",
  },
  {
    title: "Mix biking with food and small stops",
    text: "A village ride is more enjoyable when you leave time for coffee, snacks, ice cream, or a short walk by the boardwalk.",
  },
  {
    title: "Keep the plan simple",
    text: "If you are visiting for the first time, the easiest plan is to rent, ride the village and waterfront, then stop somewhere casual before heading back.",
  },
];

export default function StevestonBikeRideGuidePage() {
  return (
    <main className="pb-20 text-slate-900">
      <section className="relative overflow-hidden border-b border-white/70">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.16),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_30%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-22">
          <div className="space-y-6">
            <div className="inline-flex rounded-full border border-teal-200 bg-white/90 px-4 py-2 text-sm font-semibold text-teal-700 shadow-sm">
              Steveston Village guide
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
                Things to do in Steveston Village before or after your ride.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                A local guide for turning your bike rental into a more enjoyable afternoon around the village and waterfront.
              </p>
            </div>
            <p className="max-w-2xl text-base leading-8 text-slate-600">
              If you are planning time in Steveston Village, this guide gives you a simple starting point. You can ride through the area, stop along the waterfront, and make the outing feel more relaxed instead of treating it like a straight in-and-out rental.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/bike-rental-steveston"
                className="btn-primary px-6 py-3.5 text-sm shadow-[0_14px_30px_rgba(15,23,42,0.16)]"
              >
                View Steveston Rentals
              </Link>
              <Link
                href="/faq"
                className="btn-secondary px-6 py-3.5 text-sm"
              >
                Visit FAQ
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/80 bg-white/95 p-7 shadow-[0_24px_60px_rgba(15,23,42,0.10)]">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">Guide overview</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">A relaxed way to enjoy more than just the ride</h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
              <p>
                Steveston Village is one of those places where the best plan is often a simple one: rent the bike, ride a little, stop when something looks interesting, and keep the afternoon easy.
              </p>
              <p>
                You do not need a packed plan here. A few good stops and a little extra time usually make the afternoon better.
              </p>
            </div>
            <div className="mt-6 rounded-2xl bg-teal-50 p-4 text-sm leading-7 text-teal-900">
              The easiest outing is usually a short village ride, a few waterfront stops, and enough time left over to enjoy the area without rushing.
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">What you can do here</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Simple ways to enjoy more of Steveston Village</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-600">
            Use this guide if you want your rental to feel like part of a good afternoon out, not just transportation from one point to another.
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
              <h2 className="mt-2 text-3xl font-bold tracking-tight">Plan the village first, then choose the rental that fits</h2>
              <p className="mt-4 text-base leading-8 text-slate-300">
                Once you have a rough idea of how you want to spend the afternoon, head back to the rental page or check the FAQ before you go.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/bike-rental-steveston"
                className="inline-flex items-center justify-center rounded-full border border-white/30 bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Steveston Rentals
              </Link>
              <Link
                href="/faq"
                className="inline-flex items-center justify-center rounded-full border border-white/30 bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                FAQ
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
