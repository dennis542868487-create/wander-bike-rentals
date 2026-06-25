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
      closes: "22:00",
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
  { label: "Hours", value: "9:00 AM to 10:00 PM" },
];

export default function LocationPage() {
  return (
    <main className="pb-20 text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />

      <section className="hero relative isolate overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_16%_14%,rgba(20,184,166,0.34),transparent_44%),radial-gradient(circle_at_84%_80%,rgba(14,165,233,0.22),transparent_48%),linear-gradient(135deg,#0f172a_0%,#052e2b_52%,#0b3b39_100%)]" />
        <div className="hero-grad-anim absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:46px_46px] [mask-image:radial-gradient(circle_at_50%_40%,#000,transparent_75%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-28">
          <div className="space-y-6">
            <div className="hero-anim hero-d1 inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-teal-100 shadow-sm backdrop-blur">
              Visit the shop
            </div>
            <div className="space-y-4">
              <h1 className="hero-anim hero-d2 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
                Find Wander Bike before you head out for your ride.
              </h1>
              <p className="hero-anim hero-d3 max-w-2xl text-lg leading-8 text-slate-100/90">
                Check the address, call the shop, and open directions in a few seconds before you leave.
              </p>
            </div>
            <p className="hero-anim hero-d3 max-w-2xl text-base leading-8 text-slate-200/85">
              Everything you need to visit in one place: address, phone, hours, and a map with directions.
            </p>
            <div className="hero-anim hero-d4 flex flex-col gap-3 sm:flex-row">
              <a
                href="tel:+17789521389"
                className="btn-brand px-6 py-3.5 text-sm no-underline"
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

          <div className="hero-anim hero-d4 rounded-[2rem] border border-white/55 bg-white/95 p-7 shadow-[0_24px_60px_rgba(15,23,42,0.28)]">
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Map</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Find us on the map
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-600">
            12071 First Ave #101, Richmond, BC V7E 3M1. Tap the map to open directions in Google Maps.
          </p>
        </div>
        <div className="mt-8 overflow-hidden rounded-[2rem] border border-slate-200 shadow-[0_18px_50px_rgba(15,23,42,0.10)]">
          <iframe
            title="Map showing Wander Bike Rentals at 12071 First Ave #101, Richmond, BC"
            src="https://www.google.com/maps?q=12071%20First%20Ave%20%23101%2C%20Richmond%2C%20BC%20V7E%203M1&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-[340px] w-full border-0 sm:h-[440px]"
            allowFullScreen
          />
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

      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Quick Repair</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Walk in if you need help with a common bike issue
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-600">
              If you need help with a flat tire, brake adjustment, gear tuning, wheel rubbing, chain cleaning, or a basic safety check, you can stop by and ask the shop to take a look.
            </p>
            <p className="mt-4 text-base leading-8 text-slate-600">
              Smaller issues can often be checked quickly, and the final service depends on the bike condition after inspection.
            </p>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-8 shadow-[0_24px_60px_rgba(15,23,42,0.16)]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-300">Walk-in repair info</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">
              Check repair details before you head over
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-300">
              Use the repair page if you want a clearer overview of common services, walk-in expectations, and what the shop may be able to check on the spot.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/quick-bike-repair-richmond" className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">
                Quick Repair
              </Link>
              <a href="tel:+17789521389" className="btn-outline-light px-4 py-2 text-sm">
                Call Now
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
