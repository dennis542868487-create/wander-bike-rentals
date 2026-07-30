import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { GuideByline } from "@/components/guide-byline";
import {
  breadcrumbSchema,
  guideArticleSchema,
  jsonLd,
} from "@/lib/seo/structured-data";

const PUBLISHED = "2026-06-15";
const PATH = "/guides/family-bike-rental-richmond";

export const metadata: Metadata = {
  title: "Family Bike Rentals in Richmond, BC",
  description:
    "Plan an easy family bike ride in Richmond, BC. Rent kids bikes or bike trailers near Steveston and explore Garry Point Park, waterfront paths, and flat dyke trails.",
  alternates: {
    canonical: "/guides/family-bike-rental-richmond",
  },
  openGraph: {
    title: "Family Bike Rentals in Richmond, BC",
    description:
      "Plan an easy family bike ride in Richmond, BC. Rent kids bikes or bike trailers near Steveston and explore Garry Point Park, waterfront paths, and flat dyke trails.",
    url: "https://www.wanderbike.ca/guides/family-bike-rental-richmond",
    siteName: "Wander Bike Rentals",
    locale: "en_CA",
    type: "article",
  },
};

const guidePoints = [
  {
    title: "Kids Bikes",
    text: "For children comfortable riding on their own — short, flat rides around Steveston, Garry Point Park, and the waterfront paths.",
  },
  {
    title: "Bike Trailers",
    text: "For younger children or kids who tire quickly, so the whole family can keep riding without stopping early.",
  },
  {
    title: "Steveston Village + Garry Point Park",
    text: "The easiest family loop — short, flat, and scenic, with a park and driftwood beach at the turnaround.",
  },
  {
    title: "West Dyke Trail",
    text: "Flat and open with lots of room. From the shop, riding north toward the airport and back is about a 2-hour round trip — shorten it however you like.",
  },
  {
    title: "Terra Nova",
    text: "A natural destination kids can look forward to, with open space and play areas at the north end of the West Dyke Trail.",
  },
  {
    title: "Railway Greenway",
    text: "A connected, mostly car-free Richmond route when you want to ride beyond Steveston Village.",
  },
];

export default function FamilyBikeRentalRichmondPage() {
  return (
    <main className="pb-20 text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(
          guideArticleSchema({
            headline: "Family Bike Rentals in Richmond, BC",
            description:
              "Plan an easy family bike ride in Richmond, BC. Rent kids bikes or bike trailers near Steveston and explore Garry Point Park, waterfront paths, and flat dyke trails.",
            path: PATH,
            images: ["/assets/west-dyke-trail.jpg"],
            datePublished: PUBLISHED,
            dateModified: PUBLISHED,
          }),
        )}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(
          breadcrumbSchema([
            { name: "Family Bike Rentals in Richmond, BC", path: PATH },
          ]),
        )}
      />
      <section className="hero relative isolate overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/assets/west-dyke-trail.jpg"
            alt="West Dyke Trail sign in Richmond with parked rental bikes and riders on the path"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/85 via-slate-950/68 to-slate-900/50" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.26),transparent_46%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.14),transparent_40%)]" />
        </div>
        <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-28">
          <div className="space-y-6">
            <div className="hero-anim hero-d1 inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-teal-100 shadow-sm backdrop-blur">
              Family ride guide
            </div>
            <div className="space-y-4">
              <h1 className="hero-anim hero-d2 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
                Family Bike Rentals in Richmond, BC
              </h1>
              <p className="hero-anim hero-d3 max-w-2xl text-lg leading-8 text-slate-100/90">
                A simple guide for families looking for kids bikes, bike trailers, and easy places to ride around Steveston and Richmond.
              </p>
            </div>
            <div className="hero-anim hero-d3 space-y-3">
              <p className="max-w-2xl text-base leading-8 text-slate-200/85">
                Planning a family ride in Richmond? Wander Bike Rentals offers adult bikes, kids bikes, and bike trailers for an easy day out near Steveston, Garry Point Park, the waterfront, and Richmond’s flat dyke trails.
              </p>
              <GuideByline published={PUBLISHED} />
            </div>
            <div className="hero-anim hero-d4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/kids-bike-rental-richmond"
                className="btn-brand px-6 py-3.5 text-sm"
              >
                Kids Bikes
              </Link>
              <Link
                href="/bike-trailer-rental-richmond"
                className="btn-secondary px-6 py-3.5 text-sm"
              >
                Bike Trailers
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
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">Where should families bike in Richmond, BC?</h2>
            <div className="mt-5 text-sm leading-7 text-slate-600">
              <p>
                <strong className="font-semibold text-slate-900">
                  Families riding in Richmond have four easy options, all of them
                  flat: the Steveston Village loop out to Garry Point Park, the
                  West Dyke Trail, Terra Nova at the north end of that trail, and
                  the mostly car-free Railway Greenway.
                </strong>{" "}
                None of these routes involve
                climbing, which is what makes them workable with children. Wander
                Bike Rentals stocks adult bikes, kids bikes for children who ride
                on their own, and bike trailers for younger children or kids who
                tire quickly — the trailer is what keeps the rest of the family
                riding instead of turning back early. The West Dyke Trail north
                toward the airport and back is about a two-hour round trip and can
                be shortened at any point. The shop is at 12071 First Ave #101 in
                Steveston, open 9:00 AM to 10:00 PM daily.
              </p>
            </div>
            <dl className="mt-6 grid grid-cols-2 gap-x-5 gap-y-3 rounded-[1.5rem] border border-teal-100 bg-[linear-gradient(180deg,#f0fdfa_0%,#ecfeff_100%)] p-5 text-sm leading-6 text-teal-950 shadow-sm">
              <div>
                <dt className="font-semibold">Easy routes</dt>
                <dd className="text-teal-900/85">4, all flat</dd>
              </div>
              <div>
                <dt className="font-semibold">For young kids</dt>
                <dd className="text-teal-900/85">Bike trailer</dd>
              </div>
              <div>
                <dt className="font-semibold">Longest route</dt>
                <dd className="text-teal-900/85">≈2-hour round trip</dd>
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
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Easy family ride ideas</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">What do you need for a family bike ride in Richmond?</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-600">
            Use this page to decide whether kids bikes or trailers fit better, then choose one easy Richmond route that keeps the outing relaxed.
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
              <h2 className="mt-2 text-3xl font-bold tracking-tight">Kids bikes or a bike trailer — which should you rent?</h2>
              <p className="mt-4 text-base leading-8 text-slate-300">
                Once you know whether kids bikes or a trailer make more sense, it gets much easier to plan a simple Richmond family ride.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/kids-bike-rental-richmond"
                className="btn-outline-light px-4 py-2 text-sm"
              >
                Kids Bikes
              </Link>
              <Link
                href="/bike-trailer-rental-richmond"
                className="btn-outline-light px-4 py-2 text-sm"
              >
                Bike Trailers
              </Link>
              <Link
                href="/bike-rental-richmond"
                className="btn-outline-light px-4 py-2 text-sm"
              >
                Richmond Ride Ideas
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
