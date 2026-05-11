import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Best Bike Routes",
  description:
    "Easy bike routes around Steveston and Richmond, with ideas for relaxed rides, waterfront stops, and casual afternoons out.",
};

const guidePoints = [
  {
    title: "Choose the pace that fits your day",
    text: "Some routes are better for a short easy ride, while others work better if you want more time outside with a few stops along the way.",
  },
  {
    title: "Waterfront rides are the easiest starting point",
    text: "If you are visiting for the first time, the best route is usually the one that feels simple, scenic, and easy to follow without overthinking it.",
  },
  {
    title: "Leave room for stops",
    text: "The best bike route is often the one that gives you time to stop for photos, snacks, coffee, or a quick walk instead of trying to rush through everything.",
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
              Route guide
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
                Best bike routes for a relaxed ride around Steveston and Richmond.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                Route ideas for anyone who wants something scenic, easy to follow, and worth the time before or after a bike rental.
              </p>
            </div>
            <p className="max-w-2xl text-base leading-8 text-slate-600">
              If you are not sure where to ride first, start here. This guide helps you choose a route that fits your pace, your group, and the kind of afternoon you want to have.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/bike-rental-steveston"
                className="btn-primary px-6 py-3.5 text-sm shadow-[0_14px_30px_rgba(15,23,42,0.16)]"
              >
                View Steveston Rentals
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
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">Start with the route, then make the day around it</h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
              <p>
                Some people want a quick waterfront ride, while others want to turn the rental into a longer afternoon with food, stops, and more time outside.
              </p>
              <p>
                Start with a route that feels right instead of guessing after you pick up the bike.
              </p>
            </div>
            <div className="mt-6 rounded-2xl bg-teal-50 p-4 text-sm leading-7 text-teal-900">
              The best route is usually the one that feels easy to enjoy, not the one that tries to cover the most ground.
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">What you can find here</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Simple route ideas that feel worth your time</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-600">
            Use this guide if you want a route that feels pleasant, manageable, and easy to pair with the rest of your afternoon.
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
              <h2 className="mt-2 text-3xl font-bold tracking-tight">Pick the route first, then choose the rental that fits</h2>
              <p className="mt-4 text-base leading-8 text-slate-300">
                Once you know the kind of ride you want, head back to the rental page or check the shop location before you go.
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
