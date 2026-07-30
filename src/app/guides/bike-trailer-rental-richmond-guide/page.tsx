import type { Metadata } from "next";
import Link from "next/link";
import { GuideByline } from "@/components/guide-byline";
import {
  breadcrumbSchema,
  guideArticleSchema,
  jsonLd,
} from "@/lib/seo/structured-data";

const PUBLISHED = "2026-06-15";
const PATH = "/guides/bike-trailer-rental-richmond-guide";

export const metadata: Metadata = {
  title: "Bike Trailer Rental Guide",
  description:
    "A practical guide for families deciding whether a bike trailer is the right fit for their Richmond or Steveston ride.",
  alternates: {
    canonical: "/guides/bike-trailer-rental-richmond-guide",
  },
  openGraph: {
    title: "Bike Trailer Rental Guide",
    description:
      "A practical guide for families deciding whether a bike trailer is the right fit for their Richmond or Steveston ride.",
    url: "https://www.wanderbike.ca/guides/bike-trailer-rental-richmond-guide",
    siteName: "Wander Bike Rentals",
    locale: "en_CA",
    type: "article",
  },
};

const guidePoints = [
  {
    title: "A better fit for younger children",
    text: "A trailer often makes more sense when younger children are not ready to ride the full route on their own but you still want the outing to feel easy.",
  },
  {
    title: "Good for Steveston and shorter waterfront rides",
    text: "Trailers work especially well for relaxed routes around Steveston Village, Garry Point Park, and nearby waterfront stops where the pace can stay flexible.",
  },
  {
    title: "Helpful when the family wants a slower pace",
    text: "If the goal is a relaxed family ride with photo stops, snacks, and breaks, a trailer can make the day easier to manage.",
  },
  {
    title: "Best when you confirm first",
    text: "If the ride depends on having a trailer, call ahead so the plan feels clearer before you make the trip to the shop.",
  },
  {
    title: "Good when comfort matters more than distance",
    text: "For many families, the best setup is not the longest ride. It is the one that keeps the child comfortable and the outing easy for everyone.",
  },
  {
    title: "Pair it with a simple route",
    text: "The easiest trailer outing is usually one short route, one or two stops, and enough time left over to keep the day calm.",
  },
];

export default function BikeTrailerRentalRichmondGuidePage() {
  return (
    <main className="pb-20 text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(
          guideArticleSchema({
            headline: "Bike Trailer Rental Guide",
            description:
              "A practical guide for families deciding whether a bike trailer is the right fit for their Richmond or Steveston ride.",
            path: PATH,
            /* This guide has a CSS-gradient hero, not a photo. */
            images: [],
            datePublished: PUBLISHED,
            dateModified: PUBLISHED,
          }),
        )}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(
          breadcrumbSchema([{ name: "Bike Trailer Rental Guide", path: PATH }]),
        )}
      />
      <section className="hero relative isolate overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_16%_14%,rgba(20,184,166,0.34),transparent_44%),radial-gradient(circle_at_84%_80%,rgba(14,165,233,0.22),transparent_48%),linear-gradient(135deg,#0f172a_0%,#052e2b_52%,#0b3b39_100%)]" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:46px_46px] [mask-image:radial-gradient(circle_at_50%_40%,#000,transparent_75%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-28">
          <div className="space-y-6">
            <div className="hero-anim hero-d1 inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-teal-100 shadow-sm backdrop-blur">
              Family trailer guide
            </div>
            <div className="space-y-4">
              <h1 className="hero-anim hero-d2 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
                A simple bike trailer guide for easier family rides.
              </h1>
              <p className="hero-anim hero-d3 max-w-2xl text-lg leading-8 text-slate-100/90">
                A practical guide for parents deciding whether a trailer will make the ride smoother and more comfortable for the whole group.
              </p>
            </div>
            <div className="hero-anim hero-d3 space-y-3">
              <p className="max-w-2xl text-base leading-8 text-slate-200/85">
                Riding with younger children? This guide helps you decide whether a trailer is the better choice before you visit.
              </p>
              <GuideByline published={PUBLISHED} />
            </div>
            <div className="hero-anim hero-d4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/bike-trailer-rental-richmond"
                className="btn-brand px-6 py-3.5 text-sm"
              >
                Trailer Rentals
              </Link>
              <Link
                href="/location"
                className="btn-secondary px-6 py-3.5 text-sm"
              >
                Location
              </Link>
              <a
                href="tel:+17789521389"
                className="btn-secondary px-6 py-3.5 text-sm"
              >
                Call Now
              </a>
            </div>
          </div>

          <div className="hero-anim hero-d4 rounded-[2rem] border border-white/55 bg-white/90 p-7 shadow-[0_24px_60px_rgba(15,23,42,0.28)] backdrop-blur-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">Guide overview</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">When should you rent a bike trailer instead of a kids bike?</h2>
            <div className="mt-5 text-sm leading-7 text-slate-600">
              <p>
                <strong className="font-semibold text-slate-900">
                  A bike trailer is the better rental when a child is too young to
                  ride the full route alone but the family still wants a relaxed
                  outing.
                </strong>{" "}
                Wander Bike Rentals in Steveston rents trailers alongside
                adult bikes and kids bikes, and they suit the flat waterfront
                routes nearby — Steveston Village, Garry Point Park, and the dyke
                trails — where the pace stays slow enough for photo stops, snacks,
                and breaks. Choose a trailer over a kids bike when comfort matters
                more than distance, and when one tired child turning back early
                would end the outing for everyone. A kids bike is the better
                choice once a child is comfortable riding the full route on their
                own. If the ride depends on having a trailer, call (778) 952-1389
                to confirm before making the trip.
                The shop is at 12071 First Ave #101 in Steveston, open 9:00 AM to
                10:00 PM daily.
              </p>
            </div>
            <dl className="mt-6 grid grid-cols-2 gap-x-5 gap-y-3 rounded-[1.5rem] border border-teal-100 bg-[linear-gradient(180deg,#f0fdfa_0%,#ecfeff_100%)] p-5 text-sm leading-6 text-teal-950 shadow-sm">
              <div>
                <dt className="font-semibold">Best for</dt>
                <dd className="text-teal-900/85">Younger children</dd>
              </div>
              <div>
                <dt className="font-semibold">Best routes</dt>
                <dd className="text-teal-900/85">Flat waterfront</dd>
              </div>
              <div>
                <dt className="font-semibold">Before you go</dt>
                <dd className="text-teal-900/85">Call (778) 952-1389</dd>
              </div>
              <div>
                <dt className="font-semibold">Rentals</dt>
                <dd className="text-teal-900/85">9:00 AM – 10:00 PM daily</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">When a trailer makes sense</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">When does a bike trailer make sense?</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-600">
            Use this page if you want to decide whether a trailer suits the ride, the child, and the kind of family outing you are planning.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {guidePoints.map((item) => (
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
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-300">Related pages</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight">How do you confirm a trailer before you visit?</h2>
              <p className="mt-4 text-base leading-8 text-slate-300">
                If a trailer matters for the ride, use this page to plan the outing first, then contact the shop to confirm the setup.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/bike-trailer-rental-richmond"
                className="btn-outline-light px-4 py-2 text-sm"
              >
                Trailer Rentals
              </Link>
              <Link
                href="/guides/family-bike-rental-richmond"
                className="btn-outline-light px-4 py-2 text-sm"
              >
                Family Ride Guide
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
