import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Bike Rentals in Steveston, Richmond",
  description:
    "Bike rentals in Steveston, Richmond from Wander Bike Rentals. Adult bikes, kids bikes, and trailer rentals with helmet and lock included.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Bike Rentals in Steveston, Richmond | Wander Bike Rentals",
    description:
      "Adult bikes, kids bikes, and trailer rentals in Steveston, Richmond with helmet and lock included.",
    url: "https://wanderbike.ca/",
  },
};

const pricing = [
  {
    name: "Adult Bike",
    price: "$12.38",
    unit: "/hour",
    description: "Comfortable local rentals for solo rides, couples, and casual exploring around Steveston.",
  },
  {
    name: "Kids Bike",
    price: "$9.52",
    unit: "/hour",
    description: "Family-friendly bike rentals for easy outings with children around Richmond and Steveston.",
  },
  {
    name: "Trailer",
    price: "$9.52",
    unit: "/hour",
    description: "A practical option for families who want a smoother local ride with younger children.",
  },
];

const highlights = [
  {
    title: "Steveston location",
    text: "The shop is in a convenient spot for getting onto a relaxed ride without wasting time on a long setup.",
  },
  {
    title: "Family-friendly options",
    text: "It is easier to plan a ride when one shop can cover adults, kids, and trailer rentals in one stop.",
  },
  {
    title: "Straightforward pricing",
    text: "You can check the hourly rates before you visit, which helps you choose the right option faster.",
  },
  {
    title: "Helmet and lock included",
    text: "Helmet and lock are already included, so you can focus on the ride instead of extra add-ons.",
  },
];

const serviceLinks = [
  {
    title: "Bike Rental Richmond",
    href: "/bike-rental-richmond",
    text: "See the main Richmond rental details first if you want a simple starting point before calling or visiting.",
  },
  {
    title: "Bike Rental Steveston",
    href: "/bike-rental-steveston",
    text: "A good place to start if you want a ride closer to Steveston Village and nearby waterfront areas.",
  },
  {
    title: "Kids Bike Rental Richmond",
    href: "/kids-bike-rental-richmond",
    text: "Check the kids bike options if you are planning a family ride and want something easier to organize.",
  },
  {
    title: "Bike Trailer Rental Richmond",
    href: "/bike-trailer-rental-richmond",
    text: "Useful if you are riding with younger children and want to see trailer details before you head over.",
  },
];

const faqs = [
  {
    question: "Do rentals include helmets and locks?",
    answer:
      "Yes. Helmet and lock are included with rentals, which keeps the experience simple and convenient.",
  },
  {
    question: "Do you have kids bikes?",
    answer:
      "Yes. Kids bikes are available, making the shop a good option for family outings around Steveston and Richmond.",
  },
  {
    question: "Do you offer bike trailers?",
    answer:
      "Yes. Bike trailers are available. If you need one for a family ride, it is best to call ahead and confirm availability.",
  },
  {
    question: "Do I need a photo ID to verify my identity?",
    answer:
      "Yes, a valid photo ID may be required to verify your identity before renting. Please contact the shop for current rental requirements.",
  },
  {
    question: "Where are you located?",
    answer:
      "Wander Bike Rentals is located at 12071 First Ave #101, Richmond, BC V7E 3M1 in the Steveston area.",
  },
];

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "SportsActivityLocation",
  "@id": "https://wanderbike.ca/#business",
  name: "Wander Bike Rentals",
  description:
    "Bike rentals in Steveston, Richmond offering adult bikes, kids bikes, and trailer rentals.",
  url: "https://wanderbike.ca/",
  telephone: "+1-778-952-1389",
  priceRange: "$$",
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
  amenityFeature: [
    {
      "@type": "LocationFeatureSpecification",
      name: "Helmet included",
      value: true,
    },
    {
      "@type": "LocationFeatureSpecification",
      name: "Lock included",
      value: true,
    },
  ],
  makesOffer: [
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Adult Bike Rental",
      },
      price: "12.38",
      priceCurrency: "CAD",
      eligibleDuration: {
        "@type": "QuantitativeValue",
        value: 1,
        unitText: "hour",
      },
    },
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Kids Bike Rental",
      },
      price: "9.52",
      priceCurrency: "CAD",
      eligibleDuration: {
        "@type": "QuantitativeValue",
        value: 1,
        unitText: "hour",
      },
    },
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Bike Trailer Rental",
      },
      price: "9.52",
      priceCurrency: "CAD",
      eligibleDuration: {
        "@type": "QuantitativeValue",
        value: 1,
        unitText: "hour",
      },
    },
  ],
};

export default function Home() {
  return (
    <main className="pb-20 text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />

      <section className="hero relative isolate overflow-hidden border-b border-white/10">
        {/* Full-bleed hero background */}
        <div className="absolute inset-0 -z-10">
          <Image
            src="/assets/bikes-row.jpg"
            alt="Rows of rental bikes inside Wander Bike Rentals"
            fill
            priority
            sizes="100vw"
            className="hero-img-anim object-cover object-center"
          />
          <div className="hero-grad-anim absolute inset-0 bg-gradient-to-br from-slate-950/88 via-slate-950/72 to-slate-900/55" />
          <div className="hero-grad-anim absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.28),transparent_46%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.16),transparent_40%)]" />
        </div>

        <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-20 lg:grid-cols-[1.15fr_0.95fr] lg:items-center lg:px-8 lg:py-28">
          <div className="max-w-3xl space-y-7">
            <div className="hero-anim hero-d1 inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-teal-100 shadow-sm backdrop-blur">
              Wander Bike Rentals • Steveston, Richmond
            </div>
            <div className="space-y-5">
              <h1 className="hero-anim hero-d2 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl lg:leading-[1.05]">
                Easy bike rentals for relaxed rides around Steveston and Richmond.
              </h1>
              <p className="hero-anim hero-d3 max-w-2xl text-lg leading-8 text-slate-100/90 sm:text-xl">
                Rent an adult bike, kids bike, or trailer and start your ride with less hassle. Wander Bike makes it easy to check pricing, call the shop, and get directions before you head over.
              </p>
            </div>

            <div className="hero-anim hero-d4 flex flex-col gap-3 sm:flex-row">
              <a
                href="tel:+17789521389"
                className="btn-primary px-7 py-3.5 text-sm shadow-[0_16px_34px_rgba(15,23,42,0.16)]"
              >
                Call Now
              </a>
              <a
                href="https://maps.google.com/?q=12071+First+Ave+%23101+Richmond+BC+V7E+3M1"
                target="_blank"
                rel="noreferrer"
                className="btn-secondary px-7 py-3.5 text-sm shadow-sm"
              >
                Get Directions
              </a>
            </div>

            <div className="hero-anim hero-d5 grid gap-4 pt-2 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4 shadow-sm backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-100/80">Location</p>
                <p className="mt-2 text-sm font-medium text-white">Steveston, Richmond</p>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4 shadow-sm backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-100/80">Included</p>
                <p className="mt-2 text-sm font-medium text-white">Helmet and lock</p>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4 shadow-sm backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-100/80">Good for</p>
                <p className="mt-2 text-sm font-medium text-white">Visitors and families</p>
              </div>
            </div>
          </div>

          <div className="hero-anim hero-d4 grid gap-5 lg:pl-8">
            <div className="overflow-hidden rounded-[2rem] border border-white/40 bg-white/80 shadow-[0_20px_50px_rgba(15,23,42,0.22)] backdrop-blur-xl">
              <div className="p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">
                      Rental Snapshot
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">Quick local info</p>
                  </div>
                  <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                    Open today
                  </span>
                </div>

                <div className="mt-7 space-y-5 text-sm text-slate-600">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="font-semibold text-slate-950">Address</p>
                    <p className="mt-1">12071 First Ave #101, Richmond, BC V7E 3M1</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="font-semibold text-slate-950">Phone</p>
                      <p className="mt-1">(778) 952-1389</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="font-semibold text-slate-950">Hours shown</p>
                      <p className="mt-1">9:00 AM to 10:00 PM</p>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-teal-50 p-4 text-teal-900">
                    <p className="font-semibold">What’s included</p>
                    <p className="mt-2 leading-7 text-teal-900/80">
                      Helmet and lock are included, and the shop has options for solo rides, couples, and family outings.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {pricing.map((item) => (
                <div key={item.name} className="rounded-3xl border border-white/40 bg-white/80 p-5 shadow-[0_14px_34px_rgba(15,23,42,0.18)] backdrop-blur-md transition hover:-translate-y-1 hover:bg-white/90 hover:shadow-[0_20px_44px_rgba(15,23,42,0.22)]">
                  <p className="text-sm font-semibold text-slate-950">{item.name}</p>
                  <p className="mt-3 text-2xl font-bold text-teal-700">
                    {item.price}
                    <span className="text-sm font-medium text-slate-500">{item.unit}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-18 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Pricing</p>
            <h2 id="pricing" className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Straightforward rates before you visit
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-600">
            Check the hourly rates first, then choose the bike or trailer that fits your plans for the day.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {pricing.map((item) => (
            <div
              key={item.name}
              className="group rounded-[2rem] border border-[var(--card-border)] bg-white p-7 shadow-[0_14px_34px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.08)]"
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-xl font-semibold text-slate-950">{item.name}</h3>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 group-hover:bg-[var(--brand-soft)] group-hover:text-[var(--brand)]">
                  Hourly
                </span>
              </div>
              <p className="mt-5 text-4xl font-bold tracking-tight text-teal-700">
                {item.price}
                <span className="ml-1 text-base font-medium text-slate-500">{item.unit}</span>
              </p>
              <p className="mt-4 text-sm leading-7 text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-950 py-18 text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[1.05fr_1fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-300">Why riders choose Wander Bike</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              A practical option when you want to spend more time riding and less time figuring things out.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
              If you want a simple pickup, clear prices, and rental options that work for adults, kids, and family outings, this shop keeps the process easy.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {highlights.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
              >
                <h3 className="text-base font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Start here</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Quick paths for planning your visit
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-600">
            Jump to rentals, ride ideas, or the main visit details depending on what you want to figure out first.
          </p>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
          <div className="group rounded-[2rem] border border-[var(--card-border)] bg-white p-7 shadow-[0_14px_34px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:border-teal-200 hover:shadow-[0_20px_45px_rgba(15,23,42,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">Rent a bike</p>
            <h3 className="mt-3 text-2xl font-semibold text-slate-950">See the rental options first</h3>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Compare adult bikes, kids bikes, trailers, and hourly pricing before you call or visit.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Link href="/adult-bike-rental-richmond" className="btn-secondary px-4 py-2 text-sm">Adult Bikes</Link>
              <Link href="/kids-bike-rental-richmond" className="btn-secondary px-4 py-2 text-sm">Kids Bikes</Link>
              <Link href="/bike-trailer-rental-richmond" className="btn-secondary px-4 py-2 text-sm">Trailers</Link>
              <Link href="/pricing" className="btn-secondary px-4 py-2 text-sm">Pricing</Link>
            </div>
          </div>

          <div className="group rounded-[2rem] border border-[var(--card-border)] bg-white p-7 shadow-[0_14px_34px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:border-teal-200 hover:shadow-[0_20px_45px_rgba(15,23,42,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">Plan your ride</p>
            <h3 className="mt-3 text-2xl font-semibold text-slate-950">Browse local guides and route ideas</h3>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Start with Steveston and Richmond ride ideas if you want a better sense of where to go after pickup.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Link href="/bike-rental-richmond" className="btn-secondary px-4 py-2 text-sm">Richmond Ride Ideas</Link>
              <Link href="/bike-rental-steveston" className="btn-secondary px-4 py-2 text-sm">Steveston Ride Ideas</Link>
              <Link href="/guides/best-places-to-bike-in-steveston" className="btn-secondary px-4 py-2 text-sm">Best Bike Routes</Link>
            </div>
          </div>

          <div className="group rounded-[2rem] border border-[var(--card-border)] bg-white p-7 shadow-[0_14px_34px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:border-teal-200 hover:shadow-[0_20px_45px_rgba(15,23,42,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">Quick repair</p>
            <h3 className="mt-3 text-2xl font-semibold text-slate-950">Walk in for common bike issues</h3>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Check quick repair and basic maintenance details if you need help with a flat tire, brake adjustment, gear tuning, or a safety check.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Link href="/quick-bike-repair-richmond" className="btn-secondary px-4 py-2 text-sm">Quick Repair</Link>
              <a href="tel:+17789521389" className="btn-primary px-4 py-2 text-sm">Call Now</a>
            </div>
          </div>

          <div className="group rounded-[2rem] border border-[var(--card-border)] bg-white p-7 shadow-[0_14px_34px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:border-teal-200 hover:shadow-[0_20px_45px_rgba(15,23,42,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">Visit us</p>
            <h3 className="mt-3 text-2xl font-semibold text-slate-950">Check the shop details before you go</h3>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Find the address, map, phone number, and quick answers if you want the smoothest start to your ride.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Link href="/location" className="btn-secondary px-4 py-2 text-sm">Location</Link>
              <Link href="/faq" className="btn-secondary px-4 py-2 text-sm">FAQ</Link>
              <a href="tel:+17789521389" className="btn-primary px-4 py-2 text-sm">Call Now</a>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Our Rentals</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Find the right rental for your ride
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-600">
            Explore adult bikes, kids bikes, trailers, and location details before your visit.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {serviceLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-[2rem] border border-[var(--card-border)] bg-white p-7 shadow-[0_14px_34px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:border-teal-200 hover:shadow-[0_20px_45px_rgba(15,23,42,0.08)]"
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-slate-950">{item.title}</h3>
                <span className="text-sm font-semibold text-teal-700 transition group-hover:translate-x-1">
                  View →
                </span>
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.text}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-18 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Gallery</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              See our bikes and gear
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-600">
            Take a quick look at the rental bikes, trailer setup, and helmets available at the shop.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className="relative aspect-[4/5] w-full">
              <Image
                src="/assets/bikes-row.jpg"
                alt="Rows of rental bikes ready for riders"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-5 text-sm font-semibold text-slate-700">Adult and rental bike lineup</div>
          </div>
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className="relative aspect-[4/5] w-full">
              <Image
                src="/assets/trailer-bike.jpg"
                alt="Bike with family trailer inside Wander Bike Rentals"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-5 text-sm font-semibold text-slate-700">Trailer and family rental setup</div>
          </div>
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className="relative aspect-[4/5] w-full">
              <Image
                src="/assets/helmets.jpg"
                alt="Helmet selection at Wander Bike Rentals"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-5 text-sm font-semibold text-slate-700">Helmets included with rentals</div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-18 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Location</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
              Easy to find in Steveston, Richmond
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
              If you are ready to visit, this is the quickest place to check the address, phone number, and basic shop details before you head over.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Address</p>
                <p className="mt-2 text-sm font-medium text-slate-900">12071 First Ave #101, Richmond</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Phone</p>
                <p className="mt-2 text-sm font-medium text-slate-900">(778) 952-1389</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Hours</p>
                <p className="mt-2 text-sm font-medium text-slate-900">9:00 AM to 10:00 PM</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,#f8fffd_0%,#eff6ff_100%)] p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">Visit or contact</p>
            <p className="mt-4 text-base leading-8 text-slate-600">
              You can open the full location page for the shop details or jump straight to the map when you are ready to go.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/location"
                className="btn-primary px-5 py-3 text-sm"
              >
                View full location page
              </Link>
              <a
                href="https://maps.google.com/?q=12071+First+Ave+%23101+Richmond+BC+V7E+3M1"
                target="_blank"
                rel="noreferrer"
                className="btn-secondary px-5 py-3 text-sm"
              >
                Open map
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-18 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">FAQ Preview</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Common questions before renting
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
          If you want a quick answer before you call or visit, start here. You can also open the full <Link href="/faq" className="font-semibold text-teal-700 hover:underline">FAQ page</Link> or go straight to the <Link href="/location" className="font-semibold text-teal-700 hover:underline">location page</Link>.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {faqs.map((faq) => (
            <div
              key={faq.question}
              className="rounded-[2rem] border border-[var(--card-border)] bg-white p-7 shadow-[0_14px_34px_rgba(15,23,42,0.06)]"
            >
              <h3 className="text-lg font-semibold text-slate-950">{faq.question}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="rounded-[2.25rem] bg-slate-950 px-8 py-14 text-white shadow-[0_30px_80px_rgba(15,23,42,0.30)]">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-300">Ready to rent?</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight">
                Call the shop or head straight to Wander Bike when you are ready to ride.
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-300">
                If you already know what you want, the quickest next step is to call, confirm the details, and head over with directions ready.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="tel:+17789521389"
                className="btn-secondary px-6 py-3 text-sm shadow-sm"
              >
                Call (778) 952-1389
              </a>
              <Link
                href="/location"
                className="inline-flex items-center justify-center rounded-full border border-white/30 bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                View location details
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
