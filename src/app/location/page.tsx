import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { wanderBusinessSchema } from "@/lib/seo/wander-business";

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
    url: "https://www.wanderbike.ca/location",
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(wanderBusinessSchema) }}
      />

      <section className="route-wash overflow-hidden border-b border-slate-200 bg-white">
        <div className="mx-auto grid min-h-[36rem] max-w-7xl items-center gap-10 px-6 py-12 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:py-14">
          <div className="motion-rise">
            <h1 className="display-heading text-5xl leading-[1] sm:text-6xl">
              Visit Wander Bike Rentals in{" "}
              <span className="text-[var(--teal)]">Steveston.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              The physical shop is still open for Wander bike rentals, local
              bike sales, and quick repair. Check the address, hours, phone,
              and directions before you leave.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="tel:+17789521389"
                className="btn-primary px-6 py-3.5 text-sm no-underline"
              >
                Call (778) 952-1389
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
            <dl className="mt-9 grid gap-4 border-t border-slate-200 pt-6 sm:grid-cols-3">
              {contactCards.map((item) => (
                <div key={item.label}>
                  <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{item.label}</dt>
                  <dd className="mt-2 text-sm font-bold leading-6 text-[var(--navy)]">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="photo-arch-right motion-rise motion-rise-delay-1 relative min-h-[27rem] overflow-hidden bg-slate-100 lg:min-h-[32rem]">
            <Image
              src="/assets/fishermans-wharf.webp"
              alt="Steveston harbour near Wander Bike Rentals"
              fill
              priority
              sizes="(min-width: 1024px) 52vw, 100vw"
              className="object-cover"
            />
            <div
              className="absolute bottom-0 right-0 h-24 w-24 bg-[var(--orange)] [clip-path:polygon(100%_0,100%_100%,0_100%)]"
              aria-hidden="true"
            />
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
                <div key={item.label} className="rounded-2xl bg-[#f0fdf9] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{item.label}</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,#ecfdf5_0%,#f0fdf9_100%)] p-8 shadow-sm">
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
