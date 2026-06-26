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
    url: "https://wanderbike.ca/faq",
  },
};

const faqs = [
  ["Are helmets included with rentals?", "Yes. Helmet and lock are included."],
  ["Do you have bikes for kids?", "Yes. Kids bike rentals are available."],
  ["Can I rent a bike trailer?", "Yes. Contact the shop for current trailer availability."],
  ["What are the full-day and half-day rental prices?", "Adult bike: full day (24 hr) is $64.76, half day (4 hr) is $40. Kids bike: full day (24 hr) is $50, half day (4 hr) is $30. Trailer: full day (24 hr) is $50, half day (4 hr) is $30."],
  ["What is the hourly rental price?", "Adult bike: $12.38/hr. Kids bike: $9.52/hr. Trailer: $9.52/hr."],
  ["Do I need an appointment for quick bike repair?", "No appointment is needed for quick bike repair. You can walk in and ask the shop to take a look."],
  ["What kinds of bike repairs do you handle?", "The shop can help with common issues such as flat tires, brake adjustment, gear tuning, wheel rubbing, chain cleaning, and basic safety checks. Final service depends on the bike condition after inspection."],
  ["Do I need photo ID before renting?", "Yes. A valid photo ID is required before renting — it's part of our insurance requirements. Any type of government-issued photo ID is accepted."],
  ["Do I need to pay a deposit?", "No. No deposit is required to rent."],
  ["Where is Wander Bike located?", "12071 First Ave #101, Richmond, BC V7E 3M1."],
  ["What is the best way to contact the shop?", "Call (778) 952-1389 for direct contact."],
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
  { label: "Quick Repair", href: "/quick-bike-repair-richmond" },
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

      <section className="hero relative isolate overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_16%_14%,rgba(20,184,166,0.34),transparent_44%),radial-gradient(circle_at_84%_80%,rgba(14,165,233,0.22),transparent_48%),linear-gradient(135deg,#0f172a_0%,#052e2b_52%,#0b3b39_100%)]" />
        <div className="hero-grad-anim absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:46px_46px] [mask-image:radial-gradient(circle_at_50%_40%,#000,transparent_75%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-28">
          <div className="space-y-6">
            <div className="hero-anim hero-d1 inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-teal-100 shadow-sm backdrop-blur">
              Common questions
            </div>
            <div className="space-y-4">
              <h1 className="hero-anim hero-d2 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
                Quick answers before you call or visit Wander Bike.
              </h1>
              <p className="hero-anim hero-d3 max-w-2xl text-lg leading-8 text-slate-100/90">
                Start here if you want to check the basics first, from helmets and kids bikes to trailers, location, and contact details.
              </p>
            </div>
            <p className="hero-anim hero-d3 max-w-2xl text-base leading-8 text-slate-200/85">
              The most common answers in one place — helmets, kids bikes, trailers, hours, pricing, and how to find us.
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
            </div>
          </div>

          <div className="hero-anim hero-d4 rounded-[2rem] border border-white/55 bg-white/95 p-7 shadow-[0_24px_60px_rgba(15,23,42,0.28)]">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">FAQ overview</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">The questions most riders ask first</h2>
            <div className="mt-6 space-y-4 text-sm leading-7 text-slate-600">
              <p>
                Most people do not want to read a lot before they decide whether to call, visit, or keep planning.
              </p>
              <p>
                This page keeps the common questions simple so you can get the answer you need and move on quickly.
              </p>
            </div>
            <div className="mt-6 rounded-2xl bg-teal-50 p-4 text-sm leading-7 text-teal-900">
              If your question is not listed here, calling the shop is still the fastest way to get a direct answer.
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">FAQ list</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Common questions before you head over</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-600">
            Check the basics here first so you can get what you need quickly without digging through the site.
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
              <h2 className="mt-2 text-3xl font-bold tracking-tight">Use the FAQ, then go to the page you need</h2>
              <p className="mt-4 text-base leading-8 text-slate-300">
                Once you have your quick answers, you can go back to the rental pages or check the location before visiting.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {quickLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="btn-outline-light px-4 py-2 text-sm"
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
