import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Bike Trailer Rental Richmond Guide",
  description:
    "Guide page about bike trailer rental in Richmond for families and casual riders.",
};

const guidePoints = [
  {
    title: "Family logistics content",
    text: "This page is meant to explain when trailer rentals make sense and how families might use them.",
  },
  {
    title: "Specific long-tail support",
    text: "It helps the site support more specific local search intent around trailer rentals.",
  },
  {
    title: "Research-to-service bridge",
    text: "It also creates a softer transition from research-oriented content back into the service page.",
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
              Guide page
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
                Bike Trailer Rental Richmond Guide
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                A future guide page for families and riders researching bike trailer rental in Richmond.
              </p>
            </div>
            <p className="max-w-2xl text-base leading-8 text-slate-600">
              This page is still placeholder content, but it is already set up to become a useful guide for
              trailer-related questions. Later it can explain when trailers make sense, who they are best for,
              and how they fit into local family ride planning near Steveston and Richmond.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/bike-trailer-rental-richmond"
                className="inline-flex items-center justify-center rounded-full bg-teal-700 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(15,118,110,0.22)] transition hover:-translate-y-0.5 hover:bg-teal-800"
              >
                Bike Trailer Rental Richmond
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
                Some visitors do not search for a general bike rental. They search for a very specific setup, like trailer rental, especially when planning around younger kids.
              </p>
              <p>
                This guide page gives the website a better way to serve that research intent while still connecting back to the main trailer rental page.
              </p>
            </div>
            <div className="mt-6 rounded-2xl bg-teal-50 p-4 text-sm leading-7 text-teal-900">
              Once real content is added, this page can become one of the site’s more targeted long-tail content pages.
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">What will go here</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">A future trailer guide structure</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-600">
            The layout is ready now, so future trailer guide content can be added into a page that already matches the rest of the site.
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
              <h2 className="mt-2 text-3xl font-bold tracking-tight">Use the guide, then move back into the trailer rental flow</h2>
              <p className="mt-4 text-base leading-8 text-slate-300">
                Trailer guide pages work best when they support research first and then point naturally back to the core service and location pages.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/bike-trailer-rental-richmond"
                className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Bike Trailer Rental Richmond
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
