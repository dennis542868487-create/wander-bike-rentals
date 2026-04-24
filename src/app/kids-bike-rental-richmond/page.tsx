import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kids Bike Rental Richmond",
  description:
    "Kids bike rental in Richmond from Wander Bike Rentals. Family-friendly rentals in Steveston with helmet and lock included.",
  alternates: {
    canonical: "/kids-bike-rental-richmond",
  },
  openGraph: {
    title: "Kids Bike Rental Richmond | Wander Bike Rentals",
    description:
      "Family-friendly kids bike rental in Richmond near Steveston with helmet and lock included.",
    url: "https://wander-bike-rentals.vercel.app/kids-bike-rental-richmond",
  },
};

const quickFacts = [
  { label: "Best for", value: "Families and kids" },
  { label: "Area", value: "Richmond near Steveston" },
  { label: "Included", value: "Helmet and lock" },
];

const reasons = [
  {
    title: "Family-friendly intent",
    text: "This page is aimed at parents and group planners looking for child-friendly bike rental options.",
  },
  {
    title: "Simple planning",
    text: "It helps families confirm the basics quickly before calling or heading to the shop.",
  },
  {
    title: "Good SEO fit",
    text: "It supports search terms around kids bike rental Richmond and related family ride intent.",
  },
];

export default function KidsBikeRentalRichmondPage() {
  return (
    <main className="pb-20 text-slate-900">
      <section className="relative overflow-hidden border-b border-white/70">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.16),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_30%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8 lg:py-22">
          <div className="space-y-6">
            <div className="inline-flex rounded-full border border-teal-200 bg-white/90 px-4 py-2 text-sm font-semibold text-teal-700 shadow-sm">
              Family service page
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
                Kids Bike Rental Richmond
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                A more family-friendly landing page for parents looking for kids bike rental in Richmond.
              </p>
            </div>
            <p className="max-w-2xl text-base leading-8 text-slate-600">
              Wander Bike Rentals supports family outings by making the basics easy to understand.
              This page is aimed at parents and group planners who want child-friendly rental options,
              clear contact details, and a local starting point near Steveston.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="tel:+17789521389"
                className="inline-flex items-center justify-center rounded-full bg-teal-700 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(15,118,110,0.22)] transition hover:-translate-y-0.5 hover:bg-teal-800"
              >
                Call About Kids Bikes
              </a>
              <Link
                href="/location"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50"
              >
                View Location
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {quickFacts.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{item.label}</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/80 bg-white/95 p-7 shadow-[0_24px_60px_rgba(15,23,42,0.10)]">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">Family overview</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">Why this page helps families</h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
              <p>
                Family ride planning usually depends on small details being simple. This page helps make those details clearer.
              </p>
              <p>
                It also helps the website show stronger relevance for family-related searches instead of only broad bike rental terms.
              </p>
            </div>
            <div className="mt-6 rounded-2xl bg-teal-50 p-4 text-sm leading-7 text-teal-900">
              This page works especially well alongside trailer rentals and family-focused guide content.
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Why families land here</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Built for family-focused searches</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-600">
            This page gives parents a cleaner path from search intent to contact, especially when they are comparing kid-friendly rental options.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {reasons.map((item) => (
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
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-300">Next step</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight">Call about kids bikes, view the family guide, or read the FAQ</h2>
              <p className="mt-4 text-base leading-8 text-slate-300">
                This page now matches the homepage more closely and gives family-oriented searches a more polished landing page.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="tel:+17789521389"
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
              >
                Call About Kids Bikes
              </a>
              <Link
                href="/guides/family-bike-rental-richmond"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                View Family Guide
              </Link>
              <Link
                href="/faq"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Read FAQ
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
