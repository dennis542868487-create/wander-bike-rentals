import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import {
  GUIDE_RESEARCH_DATE,
  getMetroGuides,
  type MetroGuide,
} from "@/lib/guides/master-guide-data";

export const metadata: Metadata = {
  title: {
    absolute: "Metro Vancouver Cycling Guides: 21 Cities | Wander Bike",
  },
  description:
    "Explore 21 cycling guides for Richmond and Metro Vancouver with local ride ideas, practical planning notes, research depth and official sources.",
  alternates: { canonical: "/guides" },
  openGraph: {
    title: "Metro Vancouver Cycling Guides: 21 Cities | Wander Bike",
    description:
      "Explore city-specific cycling routes, practical planning notes and official sources across Metro Vancouver.",
    url: "https://www.wanderbike.ca/guides",
    type: "website",
    images: ["/assets/west-dyke-ride.webp"],
  },
};

const guideGroups = [
  {
    title: "Start local",
    names: [
      "Richmond",
      "Vancouver",
      "Burnaby",
      "Surrey",
      "Delta",
      "New Westminster",
      "White Rock",
    ],
  },
  {
    title: "Urban routes",
    names: [
      "Coquitlam",
      "Port Moody",
      "Port Coquitlam",
      "Pitt Meadows",
      "Maple Ridge",
    ],
  },
  {
    title: "North Shore & inlets",
    names: [
      "City of North Vancouver",
      "District of North Vancouver",
      "West Vancouver",
      "Anmore",
      "Belcarra",
      "Lions Bay",
      "Bowen Island",
    ],
  },
  {
    title: "River & valley",
    names: ["City of Langley", "Township of Langley"],
  },
] as const;

function guideMap(guides: MetroGuide[]) {
  return new Map(guides.map((guide) => [guide.name, guide]));
}

function GuideDirectory({ guides }: { guides: MetroGuide[] }) {
  const byName = guideMap(guides);

  return (
    <div className="grid gap-x-10 gap-y-9 sm:gap-y-12 md:grid-cols-2 xl:grid-cols-4">
      {guideGroups.map((group) => (
        <section key={group.title}>
          <h3 className="border-b border-teal-500 pb-3 text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
            {group.title}
          </h3>
          <ul>
            {group.names.map((name) => {
              const guide = byName.get(name);
              if (!guide) return null;
              return (
                <li key={guide.slug} className="border-b border-slate-200">
                  <Link
                    href={guide.url}
                    className="group flex min-h-14 items-center justify-between gap-4 py-3 text-sm text-slate-800 transition hover:text-teal-800"
                  >
                    <span className="font-semibold">{guide.name}</span>
                    <span className="shrink-0 font-semibold text-teal-700 transition group-hover:translate-x-0.5">
                      {guide.depth}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

function HeroGuideIndex({ guides }: { guides: MetroGuide[] }) {
  const heroNames = [
    "Richmond",
    "Vancouver",
    "Burnaby",
    "Surrey",
    "Delta",
    "Coquitlam",
    "City of North Vancouver",
    "New Westminster",
  ];
  const byName = guideMap(guides);

  return (
    <div>
      <p className="border-b border-teal-500 pb-3 text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
        Quick city index
      </p>
      <ol>
      {heroNames.map((name, index) => {
        const guide = byName.get(name);
        if (!guide) return null;
        return (
          <li key={name} className="border-b border-teal-100 last:border-b-0">
            <Link
              href={guide.url}
              className="group grid min-h-12 grid-cols-[3rem_1fr] items-center gap-4 py-2 sm:min-h-16 sm:grid-cols-[4rem_1fr]"
            >
              <span className="text-2xl font-semibold tracking-[-0.04em] text-teal-700 sm:text-3xl">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="font-semibold text-slate-950 transition group-hover:translate-x-1 group-hover:text-teal-800">
                {name}
              </span>
            </Link>
          </li>
        );
      })}
      </ol>
    </div>
  );
}

export default function GuidesPage() {
  const guides = getMetroGuides();

  return (
    <main className="bg-white text-slate-950">
      <section className="border-b border-slate-200">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 sm:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-14 lg:py-24">
          <div>
            <h1 className="max-w-4xl text-[2.55rem] font-bold leading-[1.03] tracking-[-0.055em] text-slate-950 sm:text-6xl lg:text-7xl lg:leading-[1.02] lg:tracking-[-0.06em]">
              Cycling guides for Richmond &amp; Metro Vancouver
            </h1>
            <div className="mt-7 h-1 w-16 bg-teal-600" />
            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600 sm:text-xl">
              Plan a ride with city-specific routes, practical notes, and
              official sources.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/guides/richmond-bc-cycling-guide"
                className="editorial-button editorial-button-primary"
              >
                Start with Richmond
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a
                href="#city-guides"
                className="editorial-button editorial-button-secondary"
              >
                Browse all 21 guides
              </a>
            </div>
          </div>
          <div className="border-y border-teal-200 bg-[linear-gradient(110deg,#f0fdfa_0%,#ffffff_75%)] px-6 py-7 sm:px-10 sm:py-9 lg:border-y-0 lg:border-l lg:bg-white lg:py-0 lg:pl-14">
            <HeroGuideIndex guides={guides} />
          </div>
        </div>
      </section>

      <section id="city-guides" className="scroll-mt-28 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="grid gap-8 lg:grid-cols-[0.52fr_1fr] lg:items-end">
            <div>
              <p className="text-6xl font-light tracking-[-0.07em] text-teal-700">
                21
              </p>
              <h2 className="mt-3 max-w-xl text-3xl font-bold tracking-[-0.05em] sm:text-5xl">
                Metro Vancouver cycling guides
              </h2>
            </div>
            <div className="border-l border-teal-300 pl-6">
              <p className="max-w-2xl text-base leading-7 text-slate-600">
                Local route ideas, terrain notes, planning advice and direct
                source links. Research depth shows how destination-specific the
                available official material is.
              </p>
              <p className="mt-3 text-sm font-semibold text-slate-500">
                A+ Deep local research · A Strong local research · B Good
                regional/local research
              </p>
            </div>
          </div>
          <div className="mt-12 border-t border-slate-200 pt-10">
            <GuideDirectory guides={guides} />
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center lg:py-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-300">
              Ride essential guide
            </p>
            <h2 className="mt-4 max-w-2xl text-3xl font-bold tracking-[-0.045em] sm:text-4xl">
              Find a public washroom near you
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              Use FindWashroom.com to locate covered washrooms by distance,
              check practical details, and open directions when you need a stop
              during a ride.
            </p>
            <Link
              href="/guides/find-public-washroom-near-you"
              className="editorial-button editorial-button-dark mt-7"
            >
              Read the washroom guide
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="border-y border-teal-400/60 py-6 lg:border-y-0 lg:border-l lg:py-4 lg:pl-12">
            <MapPin className="h-7 w-7 text-teal-300" aria-hidden="true" />
            <p className="mt-4 text-5xl font-semibold tracking-[-0.06em] text-white">
              13
            </p>
            <p className="mt-2 max-w-xs text-sm leading-6 text-slate-300">
              Canadian provinces and territories covered, with expansion into
              the United States underway.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.62fr_1.38fr] lg:items-center lg:py-20">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
              Featured guide
            </p>
            <h2 className="mt-4 text-4xl font-bold tracking-[-0.05em] sm:text-5xl">
              Richmond: eight official scenic loops
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
              Start with a 6 km Steveston outing, build toward the West and
              South Dyke loop, or plan the full 47.5 km island circuit.
            </p>
            <Link
              href="/guides/richmond-bc-cycling-guide"
              className="editorial-button editorial-button-primary mt-7"
            >
              Read the Richmond guide
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="overflow-hidden border border-slate-200 bg-slate-50">
            <Image
              src="/assets/west-dyke-ride.webp"
              alt="Cyclists riding along Richmond's West Dyke beside the river"
              width={1400}
              height={580}
              sizes="(min-width: 1024px) 62vw, 100vw"
              className="h-auto w-full object-contain"
            />
          </div>
        </div>
      </section>

      <section className="bg-teal-50">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <h2 className="text-2xl font-bold tracking-[-0.035em] sm:text-3xl">
            Research you can check before the ride
          </h2>
          <div className="border-l border-teal-400 pl-6">
            <p className="text-base leading-7 text-slate-600">
              Every city page links to the official municipal, regional, park
              or trail sources used in the master file. Route conditions can
              change, so confirm notices again before leaving.
            </p>
            <p className="mt-3 text-sm font-semibold text-teal-800">
              Research pass: {GUIDE_RESEARCH_DATE}
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-teal-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-[-0.035em] sm:text-3xl">
              Pair a local guide with a local rental
            </h2>
            <p className="mt-3 max-w-lg text-base leading-7 text-slate-600">
              These two rental pages remain separate landing pages for riders
              starting in Richmond or Steveston.
            </p>
          </div>
          <nav
            aria-label="Richmond and Steveston bike rental pages"
            className="grid gap-x-8 md:grid-cols-2"
          >
            <Link
              href="/bike-rental-richmond"
              className="group flex min-h-14 items-center justify-between gap-4 border-y border-teal-200 py-3 font-bold text-slate-950 hover:text-teal-800 md:border-b-0"
            >
              Bike Rental in Richmond
              <ArrowRight
                className="h-4 w-4 transition group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
            <Link
              href="/bike-rental-steveston"
              className="group flex min-h-14 items-center justify-between gap-4 border-y border-teal-200 py-3 font-bold text-slate-950 hover:text-teal-800"
            >
              Bike Rental in Steveston
              <ArrowRight
                className="h-4 w-4 transition group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </nav>
        </div>
      </section>
    </main>
  );
}
