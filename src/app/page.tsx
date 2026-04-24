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
    url: "https://wander-bike-rentals.vercel.app/",
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
    text: "A convenient local starting point for simple rides around Steveston and nearby Richmond routes.",
  },
  {
    title: "Family-friendly options",
    text: "Adult bikes, kids bikes, and trailer rentals make the shop a practical choice for different group sizes.",
  },
  {
    title: "Straightforward pricing",
    text: "Clear hourly rates make it easy to understand the rental options before you arrive.",
  },
  {
    title: "Helmet and lock included",
    text: "The essentials are already covered, so it is easier to get on the road without extra hassle.",
  },
];

const serviceLinks = [
  {
    title: "Bike Rental Richmond",
    href: "/bike-rental-richmond",
    text: "Targeted for Richmond bike rental searches and local visitors looking for a simple place to ride.",
  },
  {
    title: "Bike Rental Steveston",
    href: "/bike-rental-steveston",
    text: "A location-specific page for Steveston visitors and riders planning a local trip.",
  },
  {
    title: "Kids Bike Rental Richmond",
    href: "/kids-bike-rental-richmond",
    text: "Built for family-related searches and parents looking for child-friendly rentals.",
  },
  {
    title: "Bike Trailer Rental Richmond",
    href: "/bike-trailer-rental-richmond",
    text: "A direct landing page for trailer rental searches and family outing planning.",
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
    question: "Where are you located?",
    answer:
      "Wander Bike Rentals is located at 12071 First Ave #101, Richmond, BC V7E 3M1 in the Steveston area.",
  },
];

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "SportsActivityLocation",
  "@id": "https://wander-bike-rentals.vercel.app/#business",
  name: "Wander Bike Rentals",
  description:
    "Bike rentals in Steveston, Richmond offering adult bikes, kids bikes, and trailer rentals.",
  url: "https://wander-bike-rentals.vercel.app/",
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
      closes: "18:00",
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

      <section className="relative overflow-hidden border-b border-white/60">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.18),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.10),transparent_34%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1.15fr_0.95fr] lg:items-center lg:px-8 lg:py-24">
          <div className="max-w-3xl space-y-7">
            <div className="inline-flex rounded-full border border-teal-200 bg-white/90 px-4 py-2 text-sm font-semibold text-teal-700 shadow-sm">
              Wander Bike Rentals • Steveston, Richmond
            </div>
            <div className="space-y-5">
              <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl lg:leading-[1.05]">
                Bike rentals that feel simple, local, and easy to trust.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                Adult bikes, kids bikes, and trailers for relaxed rides around Steveston.
                Helmet and lock included, clear pricing, and fast contact when you need it.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="tel:+17789521389"
                className="inline-flex items-center justify-center rounded-full bg-teal-700 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(15,118,110,0.25)] transition hover:-translate-y-0.5 hover:bg-teal-800"
              >
                Call Now
              </a>
              <a
                href="https://maps.google.com/?q=12071+First+Ave+%23101+Richmond+BC+V7E+3M1"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white/90 px-7 py-3.5 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-400 hover:bg-white"
              >
                Get Directions
              </a>
            </div>

            <div className="grid gap-4 pt-2 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Location</p>
                <p className="mt-2 text-sm font-medium text-slate-900">Steveston, Richmond</p>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Included</p>
                <p className="mt-2 text-sm font-medium text-slate-900">Helmet and lock</p>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Good for</p>
                <p className="mt-2 text-sm font-medium text-slate-900">Visitors and families</p>
              </div>
            </div>
          </div>

          <div className="grid gap-5 lg:pl-8">
            <div className="rounded-[2rem] border border-white/80 bg-white/95 p-7 shadow-[0_25px_70px_rgba(15,23,42,0.10)] backdrop-blur">
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
                    <p className="mt-1">Closes 18:00</p>
                  </div>
                </div>
                <div className="rounded-2xl bg-teal-50 p-4 text-teal-900">
                  <p className="font-semibold">Why people choose this setup</p>
                  <p className="mt-2 leading-7 text-teal-900/80">
                    Clear pricing, family-friendly options, and a simple path from Google search to real contact.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {pricing.map((item) => (
                <div key={item.name} className="rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-sm">
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
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Clear rental pricing
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-600">
            Simple hourly pricing for local rides, relaxed exploring, and family outings around Steveston.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {pricing.map((item) => (
            <div
              key={item.name}
              className="group rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.08)]"
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-xl font-semibold text-slate-950">{item.name}</h3>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 group-hover:bg-teal-50 group-hover:text-teal-700">
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
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-300">Why Choose Us</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              A cleaner local rental experience, online and in person.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
              This site is intentionally straightforward. People usually want a few key things,
              where the shop is, what it costs, what options exist, and how quickly they can get started.
              The design now reflects that more clearly.
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

      <section className="mx-auto max-w-6xl px-6 py-18 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Service Pages</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Explore the main rental pages
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-600">
            These pages support the site’s most important local search terms and help visitors land on the right service faster.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {serviceLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-teal-200 hover:shadow-[0_20px_45px_rgba(15,23,42,0.08)]"
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
              Real photos will make this feel finished
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-600">
            Replacing placeholders with storefront, bike, and family-ride photos will be one of the highest-impact upgrades.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            "Storefront and entrance",
            "Adult and kids bikes",
            "Family or visitor riding scene",
          ].map((item, index) => (
            <div
              key={item}
              className={`flex min-h-72 items-end rounded-[2rem] border border-dashed border-slate-300 p-7 text-base font-semibold text-slate-500 ${index === 1 ? "bg-[linear-gradient(180deg,#dffaf7_0%,#f8fafc_100%)]" : "bg-slate-100"}`}
            >
              {item}
            </div>
          ))}
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
              Clear location details matter for both customers and Google. This section helps visitors confirm the shop location, call the business, and head over without digging.
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
                <p className="mt-2 text-sm font-medium text-slate-900">Open, closes 18:00</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,#f8fffd_0%,#eff6ff_100%)] p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">Visit or contact</p>
            <p className="mt-4 text-base leading-8 text-slate-600">
              Strong local business pages do more than look good. They make the address, phone number, and location intent obvious for both search engines and real people.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/location"
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                View full location page
              </Link>
              <a
                href="https://maps.google.com/?q=12071+First+Ave+%23101+Richmond+BC+V7E+3M1"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
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
          These are the kinds of questions local riders and visitors often want answered quickly before calling or visiting the shop. You can also view the full <Link href="/faq" className="font-semibold text-teal-700 hover:underline">FAQ page</Link> or go straight to the <Link href="/location" className="font-semibold text-teal-700 hover:underline">location page</Link>.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {faqs.map((faq) => (
            <div
              key={faq.question}
              className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-slate-950">{faq.question}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="rounded-[2.25rem] bg-slate-950 px-8 py-14 text-white shadow-[0_30px_80px_rgba(15,23,42,0.30)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-300">Ready to rent?</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight">
                Call now or get directions to Wander Bike Rentals
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-300">
                This first polished version is already positioned as a clean local business site. Next upgrades would be real photos, refined service-page visuals, and finished guide content.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="tel:+17789521389"
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
              >
                Call (778) 952-1389
              </a>
              <Link
                href="/location"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
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
