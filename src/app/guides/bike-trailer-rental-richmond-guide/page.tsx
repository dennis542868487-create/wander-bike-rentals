import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EditorialGuideBand } from "@/components/editorial-guide-band";

export const metadata: Metadata = {
  title: {
    absolute: "Bike Trailer Rental Richmond: Family Guide | Wander Bike",
  },
  description:
    "A practical guide for families deciding whether a bike trailer is the right fit for their Richmond or Steveston ride.",
  alternates: {
    canonical: "/guides/bike-trailer-rental-richmond-guide",
  },
  openGraph: {
    title: "Bike Trailer Rental Richmond: Family Guide | Wander Bike",
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
    <main className="bg-white text-slate-900">
      <section className="border-b border-slate-200">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-24">
          <div>
            <h1 className="max-w-3xl text-5xl font-bold tracking-[-0.06em] text-slate-950 sm:text-6xl lg:text-7xl lg:leading-[1.02]">
              Bike Trailer Rental Guide
            </h1>
            <div className="mt-7 h-1 w-16 bg-teal-600" />
            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
              A practical guide for parents deciding whether a trailer will
              make the ride smoother and more comfortable for the whole group.
            </p>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
              Riding with younger children? Use this page to decide whether a
              trailer is the better choice before you visit.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/bike-trailer-rental-richmond"
                className="editorial-button editorial-button-primary"
              >
                Trailer Rentals
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/location"
                className="editorial-button editorial-button-secondary"
              >
                Location
              </Link>
              <a
                href="tel:+17789521389"
                className="editorial-button editorial-button-secondary"
              >
                Call Now
              </a>
            </div>
          </div>

          <div className="border-y border-teal-300 py-7 lg:border-y-0 lg:border-l lg:py-3 lg:pl-12">
            <h2 className="text-2xl font-bold tracking-[-0.035em] text-slate-950 sm:text-3xl">
              Choose the setup that makes the family ride easier
            </h2>
            <div className="mt-5 space-y-4 text-base leading-7 text-slate-600">
              <p>
                A trailer can be the better fit when the ride needs to stay
                comfortable and flexible for a child who is not ready for the
                full route.
              </p>
              <p>
                The easiest plan is usually a simple Steveston or waterfront
                ride where the family can stop whenever it helps.
              </p>
            </div>
            <p className="mt-6 border-l-2 border-teal-600 bg-teal-50 px-5 py-4 text-sm leading-6 text-teal-950">
              If the outing depends on having a trailer, call ahead to confirm
              the details before you come by.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <h2 className="text-4xl font-bold tracking-[-0.05em] text-slate-950 sm:text-5xl">
              Simple trailer tips for easier family rides
            </h2>
          </div>
          <p className="border-l border-teal-300 pl-6 text-base leading-7 text-slate-600">
            Decide whether a trailer suits the ride, the child, and the kind of
            family outing you are planning.
          </p>
        </div>

        <div className="mt-12 grid gap-12 lg:grid-cols-[0.58fr_1.42fr] lg:items-start">
          <figure className="border border-slate-200 bg-slate-50">
            <Image
              src="/assets/trailer-bike.jpg"
              alt="A child bike trailer ready for a family ride"
              width={1500}
              height={2000}
              sizes="(min-width: 1024px) 34vw, 100vw"
              className="h-auto w-full object-contain"
            />
          </figure>
          <ol className="border-t border-teal-300">
            {guidePoints.map((item, index) => (
              <li
                key={item.title}
                className="grid gap-4 border-b border-teal-200 py-6 sm:grid-cols-[4.5rem_1fr] sm:gap-7"
              >
                <span className="text-4xl font-light tracking-[-0.06em] text-teal-700 sm:text-5xl">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-xl font-bold tracking-[-0.025em] text-slate-950">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-base leading-7 text-slate-600">
                    {item.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <EditorialGuideBand
        heading="Use the guide first, then confirm the trailer details you need"
        description="If a trailer matters for the ride, plan the outing first, then contact the shop to confirm the setup."
        links={[
          {
            href: "/bike-trailer-rental-richmond",
            label: "Bike Trailer Rentals",
          },
          {
            href: "/guides/family-bike-rental-richmond",
            label: "Family Bike Rentals in Richmond, BC",
          },
          {
            href: "/guides/richmond-bc-cycling-guide",
            label: "Cycling in Richmond, BC",
          },
        ]}
      />
    </main>
  );
}
