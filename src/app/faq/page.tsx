import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about bike rentals, kids bikes, trailer rentals, helmets, and location for Wander Bike Rentals.",
  alternates: {
    canonical: "/faq",
  },
  openGraph: {
    title: "FAQ | Wander Bike Rentals",
    description:
      "Answers to common questions about bike rentals, kids bikes, trailer rentals, helmets, and location.",
    url: "https://wander-bike-rentals.vercel.app/faq",
  },
};

const faqs = [
  ["Do rentals include helmets?", "Yes. Helmet and lock are included."],
  ["Do you have kids bikes?", "Yes. Kids bike rentals are available."],
  ["Do you offer bike trailers?", "Yes. Contact the shop for current trailer availability."],
  ["Do I need a photo ID to verify my identity?", "Yes, a valid photo ID may be required to verify your identity before renting. Please contact the shop for current rental requirements."],
  ["Where are you located?", "12071 First Ave #101, Richmond, BC V7E 3M1."],
  ["How can I contact you?", "Call (778) 952-1389 for direct contact."],
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map(([question, answer]) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: {
      "@type": "Answer",
      text: answer,
    },
  })),
};

const quickLinks = [
  { label: "Back to Home", href: "/" },
  { label: "Visit Location Page", href: "/location" },
  { label: "Bike Rental Richmond", href: "/bike-rental-richmond" },
  { label: "Bike Rental Steveston", href: "/bike-rental-steveston" },
];

export default function FaqPage() {
  return (
    <main className="pb-20 text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <section className="relative overflow-hidden border-b border-white/70">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.16),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_30%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-22">
          <div className="space-y-6">
            <div className="inline-flex rounded-full border border-teal-200 bg-white/90 px-4 py-2 text-sm font-semibold text-teal-700 shadow-sm">
              FAQ page
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
                Frequently Asked Questions
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                Clear answers to the most common questions people ask before calling or visiting the shop.
              </p>
            </div>
            <p className="max-w-2xl text-base leading-8 text-slate-600">
              A good FAQ page helps in two ways. It reduces friction for real customers and also gives
              search engines stronger context around helmets, kids bikes, trailer rentals, contact details,
              and location intent.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/location"
                className="inline-flex items-center justify-center rounded-full bg-teal-700 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(15,118,110,0.22)] transition hover:-translate-y-0.5 hover:bg-teal-800"
              >
                View Location
              </Link>
              <a
                href="tel:+17789521389"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50"
              >
                Call Now
              </a>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/80 bg-white/95 p-7 shadow-[0_24px_60px_rgba(15,23,42,0.10)]">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">FAQ overview</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">What this page helps clarify</h2>
            <div className="mt-6 space-y-4 text-sm leading-7 text-slate-600">
              <p>
                Visitors often want quick confirmation before they act. Helmets, kids bikes, trailers,
                address, and phone number are all common points of uncertainty.
              </p>
              <p>
                This page reduces that uncertainty and gives the site a cleaner support page for both users and SEO.
              </p>
            </div>
            <div className="mt-6 rounded-2xl bg-teal-50 p-4 text-sm leading-7 text-teal-900">
              Because the page also includes FAQ schema, it is one of the site’s stronger support pages for search understanding.
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">FAQ list</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Common questions before renting</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-600">
            These answers are simple by design, because most visitors want quick confirmation more than long explanations.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {faqs.map(([question, answer]) => (
            <div key={question} className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.08)]">
              <h3 className="text-lg font-semibold text-slate-950">{question}</h3>
              <p className="mt-4 text-sm leading-7 text-slate-600">{answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <div className="rounded-[2rem] border border-slate-200 bg-slate-950 px-8 py-10 text-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-300">Related pages</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight">Use the FAQ, then jump to the page you need</h2>
              <p className="mt-4 text-base leading-8 text-slate-300">
                Once visitors have their quick answers, they usually want to go back to the main rental pages or check the location.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {quickLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
