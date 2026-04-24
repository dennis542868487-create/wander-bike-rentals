import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Bike Rental Richmond",
  description:
    "Bike rental in Richmond from Wander Bike Rentals. Adult bikes, kids bikes, and trailer rentals near Steveston with helmet and lock included.",
  alternates: {
    canonical: "/bike-rental-richmond",
  },
  openGraph: {
    title: "Bike Rental Richmond | Wander Bike Rentals",
    description:
      "Adult bikes, kids bikes, and trailer rentals for riders looking for bike rental in Richmond near Steveston.",
    url: "https://wander-bike-rentals.vercel.app/bike-rental-richmond",
  },
};

const quickFacts = [
  { label: "Good for", value: "Visitors, couples, families" },
  { label: "Included", value: "Helmet and lock" },
  { label: "Location", value: "Near Steveston" },
];

const rentalTypes = [
  {
    title: "Adult Bikes",
    text: "A good fit for relaxed rides, local exploring, and simple day outings around Richmond.",
  },
  {
    title: "Kids Bikes",
    text: "Family-friendly options for parents planning a Steveston or Richmond ride.",
  },
  {
    title: "Trailers",
    text: "Helpful for younger children and families who want a smoother local outing.",
  },
];

export default function BikeRentalRichmondPage() {
  return (
    <main className="pb-20 text-slate-900">
      <section className="relative overflow-hidden border-b border-white/70">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.16),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_30%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8 lg:py-22">
          <div className="space-y-6">
            <div className="inline-flex rounded-full border border-teal-200 bg-white/90 px-4 py-2 text-sm font-semibold text-teal-700 shadow-sm">
              Richmond service page
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
                Bike Rental Richmond
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                A simple local option for bike rental in Richmond, with adult bikes,
                kids bikes, and trailer rentals near Steveston.
              </p>
            </div>
            <p className="max-w-2xl text-base leading-8 text-slate-600">
              Wander Bike Rentals is built for visitors, casual riders, couples, and
              families who want a straightforward place to rent a bike. Instead of a
              complicated booking flow, this page focuses on what matters first,
              clear service, local relevance, fast contact, and a simple path to getting started.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="tel:+17789521389"
                className="inline-flex items-center justify-center rounded-full bg-teal-700 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(15,118,110,0.22)] transition hover:-translate-y-0.5 hover:bg-teal-800"
              >
                Call Now
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
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">Richmond overview</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">Built for direct local intent</h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
              <p>
                This page is designed for people already searching for bike rental in Richmond.
                That makes it a high-intent landing page with strong local SEO value.
              </p>
              <p>
                It also helps the site signal that the business serves Richmond riders looking for
                convenience, family options, and a clear next step.
              </p>
            </div>
            <div className="mt-6 rounded-2xl bg-teal-50 p-4 text-sm leading-7 text-teal-900">
              Helmet and lock are included, which keeps the experience easier for first-time visitors and casual riders.
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Rental options</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">What this page helps people find</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-600">
            Richmond riders often want to confirm the core rental types quickly before calling or heading over.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {rentalTypes.map((item) => (
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
              <h2 className="mt-2 text-3xl font-bold tracking-tight">Call, view the shop location, or read common questions</h2>
              <p className="mt-4 text-base leading-8 text-slate-300">
                This page now matches the homepage better visually and continues to support the local bike rental Richmond keyword clearly.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="tel:+17789521389"
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
              >
                Call Now
              </a>
              <Link
                href="/location"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                View Location
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
