import type { Metadata } from "next";
import Link from "next/link";

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "SportsActivityLocation",
  "@id": "https://wanderbike.ca/#business",
  name: "Wander Bike Rentals",
  url: "https://wanderbike.ca/location",
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
      closes: "21:00",
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
    url: "https://wanderbike.ca/location",
  },
};

const contactCards = [
  { label: "Address", value: "12071 First Ave #101, Richmond, BC V7E 3M1" },
  { label: "Phone", value: "(778) 952-1389" },
  { label: "Hours", value: "10:00 AM to 9:00 PM" },
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
                Find Wander Bike before you head out for your ride.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                Check the address, call the shop, and open directions in a few seconds before you leave.
              </p>
            </div>
            <p className="max-w-2xl text-base leading-8 text-slate-600">
              If you are ready to ride, this page keeps the main visit details in one place so you can call ahead, confirm the location, and head over without digging through the site.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="tel:+17789521389"
                className="btn-primary px-6 py-3.5 text-sm no-underline shadow-[0_14px_30px_rgba(15,23,42,0.16)]"
              >
                Call Now
              </a>
              <a
                href="https://maps.google.com/?q=12071+First+Ave+%23101+Richmond+BC+V7E+3M1"
                target="_blank"
                rel="noreferrer"
                className="btn-secondary px-6 py-3.5 text-sm no-underline"
              >
                Open in Google Maps
              </a>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/80 bg-white/95 p-7 shadow-[0_24px_60px_rgba(15,23,42,0.10)]">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">Visit summary</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">The details most people want first</h2>
            <div className="mt-6 space-y-4">
              {contactCards.map((item) => (
                <div key={item.label} className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{item.label}</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl bg-teal-50 p-4 text-sm leading-7 text-teal-900">
              This is the fastest page to use when you want to call the shop, check the address, or open the map and go.
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Before you visit</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">The basics should be easy to confirm</h2>
            <p className="mt-4 text-base leading-8 text-slate-600">
              Most people just want the essentials before they leave: where the shop is, how to call, and when it is open. This section keeps those details easy to check at a glance.
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
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Helpful next steps before you go</h2>
            <p className="mt-4 text-base leading-8 text-slate-600">
              Once you have the location, you may want to look at the rental pages again or check a few quick answers before visiting.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/" className="btn-secondary px-4 py-2 text-sm">
                Back to Home
              </Link>
              <Link href="/bike-rental-richmond" className="btn-secondary px-4 py-2 text-sm">
                Bike Rental Richmond
              </Link>
              <Link href="/bike-rental-steveston" className="btn-secondary px-4 py-2 text-sm">
                Bike Rental Steveston
              </Link>
              <Link href="/faq" className="btn-secondary px-4 py-2 text-sm">
                View FAQ
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
