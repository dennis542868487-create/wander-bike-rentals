import type { Metadata } from "next";
import Link from "next/link";

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "SportsActivityLocation",
  "@id": "https://wander-bike-rentals.vercel.app/#business",
  name: "Wander Bike Rentals",
  url: "https://wander-bike-rentals.vercel.app/location",
  telephone: "+1-778-952-1389",
  address: {
    "@type": "PostalAddress",
    streetAddress: "12071 First Ave #101",
    addressLocality: "Richmond",
    addressRegion: "BC",
    postalCode: "V7E 3M1",
    addressCountry: "CA",
  },
  areaServed: ["Richmond", "Steveston"],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      opens: "09:00",
      closes: "18:00",
    },
  ],
};

export const metadata: Metadata = {
  title: "Location and Contact",
  description:
    "Find Wander Bike Rentals in Steveston, Richmond. Get the address, phone number, hours, and directions.",
  alternates: {
    canonical: "/location",
  },
  openGraph: {
    title: "Location and Contact | Wander Bike Rentals",
    description:
      "Address, phone number, hours, and directions for Wander Bike Rentals in Steveston, Richmond.",
    url: "https://wander-bike-rentals.vercel.app/location",
  },
};

const contactCards = [
  { label: "Address", value: "12071 First Ave #101, Richmond, BC V7E 3M1" },
  { label: "Phone", value: "(778) 952-1389" },
  { label: "Hours", value: "Open, closes 18:00" },
];

export default function LocationPage() {
  return (
    <main className="pb-20 text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />

      <section className="relative overflow-hidden border-b border-white/70">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.16),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_30%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-22">
          <div className="space-y-6">
            <div className="inline-flex rounded-full border border-teal-200 bg-white/90 px-4 py-2 text-sm font-semibold text-teal-700 shadow-sm">
              Visit the shop
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
                Location and Contact
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                Find the address, phone number, hours, and directions for Wander Bike Rentals.
              </p>
            </div>
            <p className="max-w-2xl text-base leading-8 text-slate-600">
              If you are planning to visit, this page gives you the main shop details in one place so you can call, get directions, or head over directly.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="tel:+17789521389"
                className="inline-flex items-center justify-center rounded-full bg-teal-700 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(15,118,110,0.22)] transition hover:-translate-y-0.5 hover:bg-teal-800"
              >
                Call Now
              </a>
              <a
                href="https://maps.google.com/?q=12071+First+Ave+%23101+Richmond+BC+V7E+3M1"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50"
              >
                Open in Google Maps
              </a>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/80 bg-white/95 p-7 shadow-[0_24px_60px_rgba(15,23,42,0.10)]">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">Visit summary</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">Quick shop details</h2>
            <div className="mt-6 space-y-4">
              {contactCards.map((item) => (
                <div key={item.label} className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{item.label}</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl bg-teal-50 p-4 text-sm leading-7 text-teal-900">
              Use this page when you want the fastest way to call the shop, confirm the address, or open directions.
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Before you visit</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">The key details should be easy to find</h2>
            <p className="mt-4 text-base leading-8 text-slate-600">
              Address, phone number, and hours are usually the main things people want before heading to the shop. This page keeps them easy to check at a glance.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {contactCards.map((item) => (
                <div key={item.label} className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{item.label}</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,#f8fffd_0%,#eff6ff_100%)] p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">Related pages</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Helpful next links</h2>
            <p className="mt-4 text-base leading-8 text-slate-600">
              Once you confirm the location, you may want to go back to the rental pages or read a few quick answers before visiting.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/" className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50">
                Back to Home
              </Link>
              <Link href="/bike-rental-richmond" className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50">
                Bike Rental Richmond
              </Link>
              <Link href="/bike-rental-steveston" className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50">
                Bike Rental Steveston
              </Link>
              <Link href="/faq" className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50">
                View FAQ
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
