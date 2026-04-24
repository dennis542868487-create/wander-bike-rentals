import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Best Places to Bike in Steveston",
  description:
    "Guide page for biking around Steveston, Richmond, connected to Wander Bike Rentals.",
};

const guidePoints = [
  {
    title: "Future route ideas",
    text: "This page is meant to become a useful local guide with real ride suggestions around Steveston.",
  },
  {
    title: "SEO support",
    text: "Guide pages like this help the site cover broader local-intent and activity-based searches.",
  },
  {
    title: "Internal linking value",
    text: "It also gives the site a natural way to connect visitors back to the main rental pages.",
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
              Guide page
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
                Best Places to Bike in Steveston
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                A future local guide page designed to support Steveston ride planning and broader SEO visibility.
              </p>
            </div>
            <p className="max-w-2xl text-base leading-8 text-slate-600">
              This page is still a placeholder, but the design is now aligned with the rest of the site.
              Later it can hold real route ideas, local recommendations, family-friendly suggestions,
              and stronger internal links back to rental pages.
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
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">Why this page exists</h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
              <p>
                Useful guide pages help local service websites feel more complete and more relevant to real search behavior.
              </p>
              <p>
                They also give visitors a softer entry point when they are still researching, not just ready to rent immediately.
              </p>
            </div>
            <div className="mt-6 rounded-2xl bg-teal-50 p-4 text-sm leading-7 text-teal-900">
              Once real content is added here, this page can become one of the stronger local long-tail SEO assets on the site.
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">What will go here</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">A cleaner content structure for future guide writing</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-600">
            The visual structure is ready now, so later content can drop into a page that already matches the rest of the site.
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
              <h2 className="mt-2 text-3xl font-bold tracking-tight">Use this guide page, then jump back into the rental flow</h2>
              <p className="mt-4 text-base leading-8 text-slate-300">
                Guide pages should help users research first, then move naturally toward service pages and contact details.
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
