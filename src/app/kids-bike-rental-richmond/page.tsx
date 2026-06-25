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
    title: "Sized for younger riders",
    text: "Kids bikes built for comfort and control, so children can ride at their own pace.",
  },
  {
    title: "Helmet and lock included",
    text: "Every rental comes with a helmet and lock — no extra gear to pack.",
  },
  {
    title: "Easy, flat family routes",
    text: "Pair them with short Steveston Village loops, Garry Point Park, and the waterfront paths.",
  },
];

export default function KidsBikeRentalRichmondPage() {
  return (
    <main className="pb-20 text-slate-900">
      <section className="hero relative isolate overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_16%_14%,rgba(20,184,166,0.34),transparent_44%),radial-gradient(circle_at_84%_80%,rgba(14,165,233,0.22),transparent_48%),linear-gradient(135deg,#0f172a_0%,#052e2b_52%,#0b3b39_100%)]" />
        <div className="hero-grad-anim absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:46px_46px] [mask-image:radial-gradient(circle_at_50%_40%,#000,transparent_75%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8 lg:py-28">
          <div className="space-y-6">
            <div className="hero-anim hero-d1 inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-teal-100 shadow-sm backdrop-blur">
              Kids bikes
            </div>
            <div className="space-y-4">
              <h1 className="hero-anim hero-d2 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
                Kids bike rentals for easier family rides around Richmond and Steveston.
              </h1>
              <p className="hero-anim hero-d3 max-w-2xl text-lg leading-8 text-slate-100/90">
                Right-sized bikes for younger riders, so the whole family can ride Steveston and Richmond together.
              </p>
            </div>
            <p className="hero-anim hero-d3 max-w-2xl text-base leading-8 text-slate-200/85">
              Great for shorter loops around Steveston Village, Garry Point Park, and the flat waterfront paths. Helmet and lock included.
            </p>
            <div className="hero-anim hero-d4 flex flex-col gap-3 sm:flex-row">
              <a
                href="tel:+17789521389"
                className="btn-brand px-6 py-3.5 text-sm"
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
            <div className="hero-anim hero-d5 grid gap-4 sm:grid-cols-3">
              {quickFacts.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/20 bg-white/10 p-4 shadow-sm backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-100/80">{item.label}</p>
                  <p className="mt-2 text-sm font-medium text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-anim hero-d4 rounded-[2rem] border border-white/55 bg-white/95 p-7 shadow-[0_24px_60px_rgba(15,23,42,0.28)]">
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
                className="btn-outline-light px-6 py-3 text-sm"
              >
                Family Ride Guide
              </Link>
              <Link
                href="/faq"
                className="btn-outline-light px-6 py-3 text-sm"
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
