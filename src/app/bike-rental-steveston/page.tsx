import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Bike Rental Steveston",
  description:
    "Bike rental in Steveston from Wander Bike Rentals. Rent adult bikes, kids bikes, and trailer rentals in Steveston, Richmond.",
  alternates: {
    canonical: "/bike-rental-steveston",
  },
  openGraph: {
    title: "Bike Rental Steveston | Wander Bike Rentals",
    description:
      "Rent adult bikes, kids bikes, and trailer rentals in Steveston, Richmond from Wander Bike Rentals.",
    url: "https://wander-bike-rentals.vercel.app/bike-rental-steveston",
  },
};

const quickFacts = [
  { label: "Area", value: "Steveston, Richmond" },
  { label: "Style", value: "Simple local rentals" },
  { label: "Included", value: "Helmet and lock" },
];

const reasons = [
  {
    title: "Easy local starting point",
    text: "A convenient option for visitors and casual riders who want to get rolling around Steveston.",
  },
  {
    title: "Visitor-friendly",
    text: "A good fit for relaxed rides, waterfront exploring, and simple local outings.",
  },
  {
    title: "Family options",
    text: "Adult bikes, kids bikes, and trailer rentals make it easier to plan different kinds of rides.",
  },
];

export default function BikeRentalStevestonPage() {
  return (
    <main className="pb-20 text-slate-900">
      <section className="relative overflow-hidden border-b border-white/70">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.16),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_30%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8 lg:py-22">
          <div className="space-y-6">
            <div className="inline-flex rounded-full border border-teal-200 bg-white/90 px-4 py-2 text-sm font-semibold text-teal-700 shadow-sm">
              Steveston rentals
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
                Bike Rental Steveston
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                Bike rentals for visitors and casual riders looking to explore Steveston and nearby Richmond.
              </p>
            </div>
            <p className="max-w-2xl text-base leading-8 text-slate-600">
              Wander Bike Rentals is a simple local option for people who want an easy rental experience in the Steveston area, with clear details, quick contact, and family-friendly choices.
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
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">Steveston overview</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">A relaxed way to explore the area</h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
              <p>
                Steveston is a good place for a casual ride, whether you are visiting the area or planning a simple outing.
              </p>
              <p>
                Adult bikes, kids bikes, and trailer rentals make it easier to choose something that fits your plan.
              </p>
            </div>
            <div className="mt-6 rounded-2xl bg-teal-50 p-4 text-sm leading-7 text-teal-900">
              Adult bikes, kids bikes, and trailer rentals are all available, with helmet and lock included.
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Why choose us</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">A simple option for Steveston rides</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-600">
            If you want something local, clear, and easy to contact, this page gives you the basics before you visit.
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
              <h2 className="mt-2 text-3xl font-bold tracking-tight">Call, view the Steveston guide, or check the shop location</h2>
              <p className="mt-4 text-base leading-8 text-slate-300">
                If you are planning a ride in Steveston, call the shop, view the guide, or check the location before you head over.
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
                href="/guides/steveston-bike-ride-guide"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                View Steveston Guide
              </Link>
              <Link
                href="/location"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                View Location
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
