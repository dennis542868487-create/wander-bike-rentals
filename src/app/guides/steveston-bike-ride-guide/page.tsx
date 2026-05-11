import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Steveston Bike Ride Guide",
  description:
    "Plan an easy Steveston bike ride from Steveston Village to Garry Point Park, Fisherman’s Wharf, Britannia Shipyards, and the South Dyke Trail.",
};

const guidePoints = [
  {
    title: "Start in Steveston Village",
    text: "Begin where the waterfront, shops, restaurants, and harbour atmosphere are close together so the route can stay flexible from the start.",
  },
  {
    title: "Ride to Garry Point Park",
    text: "Make Garry Point Park the first stop for open views, fresh air, and an easy waterfront section that does not need a complicated route.",
  },
  {
    title: "Stop at Fisherman’s Wharf",
    text: "Return toward the village, lock up the bike, and enjoy the boats, seafood spots, and one of the most recognizable parts of Steveston.",
  },
  {
    title: "Continue to Imperial Landing and Britannia Shipyards",
    text: "Add more variety with village streets, river views, boardwalk sections, and a more historic waterfront feeling.",
  },
  {
    title: "Optional longer ride: South Dyke Trail",
    text: "If you want to keep going, follow the Fraser River for a quieter and more open ride away from the busiest village streets.",
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
              Route guide
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
                Steveston Bike Ride Guide
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                A simple local route for riding from Steveston Village to Garry Point Park, Fisherman’s Wharf, Imperial Landing, Britannia Shipyards, and the South Dyke Trail.
              </p>
            </div>
            <p className="max-w-2xl text-base leading-8 text-slate-600">
              Planning a bike ride in Steveston? This route can stay short and relaxed, or you can extend it into a longer waterfront ride toward London Farm and Finn Slough if you want more time outside.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/bike-rental-steveston"
                className="btn-primary px-6 py-3.5 text-sm shadow-[0_14px_30px_rgba(15,23,42,0.16)]"
              >
                Steveston Rentals
              </Link>
              <Link
                href="/#pricing"
                className="btn-secondary px-6 py-3.5 text-sm"
              >
                See Pricing
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/80 bg-white/95 p-7 shadow-[0_24px_60px_rgba(15,23,42,0.10)]">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">Guide overview</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">A simple Steveston route you can actually follow</h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
              <p>
                This route works well because you can keep it short around the village and Garry Point Park, or stretch it farther toward Britannia Shipyards and the South Dyke Trail.
              </p>
              <p>
                It is a good fit for visitors, couples, families, and anyone who wants a relaxed Steveston ride instead of a fast workout.
              </p>
            </div>
            <div className="mt-6 rounded-[1.5rem] border border-teal-100 bg-[linear-gradient(180deg,#f0fdfa_0%,#ecfeff_100%)] p-5 text-sm leading-7 text-teal-950 shadow-sm">
              For a short ride, keep it around Steveston Village, Garry Point Park, and Fisherman’s Wharf. For more time out, add Britannia Shipyards and part of the South Dyke Trail.
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">A simple Steveston route</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Follow this route for an easier Steveston ride</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-600">
            Use this page when you want one route that can stay casual, scenic, and easy to adjust based on time, energy, and who is riding with you.
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
              <h2 className="mt-2 text-3xl font-bold tracking-tight">Use the route, then choose the rental and shop details you need</h2>
              <p className="mt-4 text-base leading-8 text-slate-300">
                Once you know how far you want to ride, head back to the Steveston rental page or check the location before you go.
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
