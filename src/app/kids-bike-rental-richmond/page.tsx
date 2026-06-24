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
    url: "https://wanderbike.ca/kids-bike-rental-richmond",
  },
};

const quickFacts = [
  { label: "Best for", value: "Family rides and younger riders" },
  { label: "Area", value: "Steveston and Richmond" },
  { label: "Hours", value: "9:00 AM to 10:00 PM" },
];

const reasons = [
  {
    title: "Family-friendly options",
    text: "Parents can start here if they want a ride that feels easier to organize and more comfortable for children.",
  },
  {
    title: "Simple planning",
    text: "It is easier to plan the day when you can check the basics first, then call or head over with fewer questions.",
  },
  {
    title: "Works well with family rides",
    text: "Kids bikes help families plan a slower outing that feels more manageable around Steveston and nearby Richmond routes.",
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
              Kids bikes
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
                Kids bike rentals for easier family rides around Richmond and Steveston.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                A helpful option for parents who want to keep a family outing simple, comfortable, and easier to plan before arriving.
              </p>
            </div>
            <p className="max-w-2xl text-base leading-8 text-slate-600">
              Plan a more comfortable family ride with kids bikes for shorter loops around Steveston Village, Garry Point Park, and nearby waterfront paths.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="tel:+17789521389"
                className="btn-primary px-6 py-3.5 text-sm shadow-[0_14px_30px_rgba(15,23,42,0.16)]"
              >
                Call Now
              </a>
              <Link
                href="/location"
                className="btn-secondary px-6 py-3.5 text-sm"
              >
                View Location
              </Link>
              <Link
                href="/guides/family-bike-rental-richmond"
                className="btn-secondary px-6 py-3.5 text-sm"
              >
                Family Ride Guide
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
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">A better fit for easy family outings near Steveston</h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
              <p>
                Kids bikes work best when the goal is a relaxed ride, simple stops, and enough flexibility for photos, snacks, or a quick break by the water.
              </p>
              <p>
                For many families, the easiest plan is to start around Steveston, keep the route flat, and choose a ride that feels fun instead of rushed.
              </p>
            </div>
            <div className="mt-6 rounded-[1.5rem] border border-teal-100 bg-[linear-gradient(180deg,#f0fdfa_0%,#ecfeff_100%)] p-5 text-sm leading-7 text-teal-950 shadow-sm">
              Pair kids bikes with a short Steveston Village ride, Garry Point Park, or nearby waterfront paths for an easier family day out.
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Why families choose Wander Bike</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">A simpler way to plan a ride with kids</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-600">
            If you are trying to keep the day easy, this page gives you the key details before you call or visit.
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
              <h2 className="mt-2 text-3xl font-bold tracking-tight">Call now, plan the family ride, or check the shop details</h2>
              <p className="mt-4 text-base leading-8 text-slate-300">
                Choose the next step that helps your family most, whether that means calling first, checking the route ideas, or confirming the location.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="tel:+17789521389"
                className="btn-secondary px-6 py-3 text-sm"
              >
                Call Now
              </a>
              <Link
                href="/guides/family-bike-rental-richmond"
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Family Ride Guide
              </Link>
              <Link
                href="/faq"
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
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
