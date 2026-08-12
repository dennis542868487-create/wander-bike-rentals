import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, MapPin, Route } from "lucide-react";
import {
  GuideDirectory,
  type GuideDirectoryItem,
} from "@/components/guides/guide-directory";
import { NearestTrailButton } from "@/components/guides/nearest-trail-button";
import {
  GUIDE_RESEARCH_DATE,
  getGuides,
  type CyclingGuide,
} from "@/lib/guides/master-guide-data";
import { guideRegionId } from "@/lib/guides/region-id";

const guides = getGuides();
const publishedGuideCount = guides.length;
const regionCount = new Set(guides.map((guide) => guide.region)).size;

export const metadata: Metadata = {
  title: {
    absolute: `${publishedGuideCount} British Columbia Cycling Guides | Wander Bike`,
  },
  description: `Explore ${publishedGuideCount} cycling guides across British Columbia with local ride ideas, terrain notes, practical planning advice, and official sources.`,
  alternates: { canonical: "/guides" },
  openGraph: {
    title: `${publishedGuideCount} British Columbia Cycling Guides | Wander Bike`,
    description:
      "Search cycling guides for cities, towns, villages, and districts across British Columbia.",
    url: "https://www.wanderbike.ca/guides",
    type: "website",
    images: ["/assets/west-dyke-ride.webp"],
  },
};

const featuredNames = [
  "Richmond",
  "Vancouver",
  "Victoria",
  "Kelowna",
  "Whistler",
  "Tofino",
  "Kamloops",
  "Prince George",
] as const;

const highlightedRegions = [
  "Metro Vancouver",
  "Capital",
  "Thompson-Nicola",
  "Central Kootenay",
  "Bulkley-Nechako",
  "East Kootenay",
] as const;

function guideMap(items: CyclingGuide[]) {
  return new Map(items.map((guide) => [guide.name, guide]));
}

function QuickCityIndex({ items }: { items: CyclingGuide[] }) {
  const byName = guideMap(items);

  return (
    <div>
      <p className="border-b border-teal-500 pb-3 text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
        Start with a destination
      </p>
      <ol>
        {featuredNames.map((name, index) => {
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
                <span>
                  <span className="block font-semibold text-slate-950 transition group-hover:translate-x-1 group-hover:text-teal-800">
                    {name}
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    {guide.region}
                  </span>
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
  const regionCounts = new Map<string, number>();
  for (const guide of guides) {
    regionCounts.set(guide.region, (regionCounts.get(guide.region) ?? 0) + 1);
  }

  const directoryGuides: GuideDirectoryItem[] = guides.map(
    ({ name, classification, region, depth, url, slug }) => ({
      name,
      classification,
      region,
      depth,
      url,
      slug,
    }),
  );

  return (
    <main className="bg-white text-slate-950">
      <section className="border-b border-slate-200">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 sm:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-14 lg:py-24">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
              Ride British Columbia
            </p>
            <h1 className="mt-4 max-w-4xl text-[2.55rem] font-bold leading-[1.03] tracking-[-0.055em] text-slate-950 sm:text-6xl lg:text-7xl lg:leading-[1.02] lg:tracking-[-0.06em]">
              Cycling guides across British Columbia
            </h1>
            <div className="mt-7 h-1 w-16 bg-teal-600" />
            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600 sm:text-xl">
              Search local ride ideas, terrain notes, planning advice, and
              official sources for {publishedGuideCount} B.C. destinations.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href="#city-guides"
                className="editorial-button editorial-button-primary"
              >
                Browse all {publishedGuideCount} guides
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <Link
                href="/guides/richmond-bc-cycling-guide"
                className="editorial-button editorial-button-secondary"
              >
                Start with Richmond
              </Link>
            </div>
          </div>
          <div className="border-y border-teal-200 bg-teal-50 px-6 py-7 sm:px-10 sm:py-9 lg:border-y-0 lg:border-l lg:bg-white lg:py-0 lg:pl-14">
            <QuickCityIndex items={guides} />
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-9 sm:px-8 lg:grid-cols-[0.55fr_1.45fr] lg:items-center">
          <div>
            <p className="text-5xl font-light tracking-[-0.06em] text-teal-300">
              {regionCount}
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-[-0.035em]">
              B.C. regions in the directory
            </h2>
          </div>
          <nav
            aria-label="Jump to popular British Columbia guide regions"
            className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3"
          >
            {highlightedRegions.map((region) => (
              <a
                key={region}
                href={`#${guideRegionId(region)}`}
                className="group flex min-h-12 items-center justify-between gap-4 border-b border-white/15 py-2 text-sm font-semibold text-slate-200 hover:border-teal-300 hover:text-teal-200"
              >
                {region}
                <span className="flex items-center gap-2 text-xs text-slate-400 group-hover:text-teal-300">
                  {regionCounts.get(region) ?? 0}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </a>
            ))}
          </nav>
        </div>
      </section>

      <section
        id="city-guides"
        className="scroll-mt-28 border-b border-slate-200"
      >
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="grid gap-8 lg:grid-cols-[0.58fr_1fr] lg:items-end">
            <div>
              <p className="text-6xl font-light tracking-[-0.07em] text-teal-700">
                {publishedGuideCount}
              </p>
              <h2 className="mt-3 max-w-xl text-3xl font-bold tracking-[-0.05em] sm:text-5xl">
                City and community cycling guides
              </h2>
            </div>
            <div className="border-l border-teal-300 pl-6">
              <p className="max-w-2xl text-base leading-7 text-slate-600">
                Browse cities, towns, villages, districts, and resort
                municipalities. Search by place name or narrow the directory to
                one region.
              </p>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
                A+ Deep local research · A Strong local research · B Good
                regional/local research · C Regional basis—verify locally
              </p>
            </div>
          </div>
          <div className="mt-12">
            <GuideDirectory guides={directoryGuides} />
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-3 lg:py-16">
          <div className="border-b border-white/15 pb-9 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-10">
            <Route className="h-7 w-7 text-teal-300" aria-hidden="true" />
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-teal-300">
              Plan on the map
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.045em] sm:text-4xl">
              Explore Metro Vancouver routes
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
              Browse an interactive route map, filter selected rides, and open
              the matching city guide.
            </p>
            <Link
              href="/guides/metro-vancouver-route-map"
              className="editorial-button editorial-button-dark mt-7"
            >
              Open the route map
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="border-b border-white/15 pb-9 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-10">
            <MapPin className="h-7 w-7 text-teal-300" aria-hidden="true" />
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-teal-300">
              Ride essential
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.045em] sm:text-4xl">
              Find a public washroom near you
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
              Find covered washrooms by distance, check practical details, and
              open directions during a ride.
            </p>
            <Link
              href="/guides/find-public-washroom-near-you"
              className="editorial-button editorial-button-dark mt-7"
            >
              Open the washroom guide
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div>
            <Route className="h-7 w-7 text-teal-300" aria-hidden="true" />
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-teal-300">
              Use your location
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.045em] sm:text-4xl">
              Navigate to the nearest bike trail
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
              Allow location access and Wander will prepare bicycle directions
              to a nearby trail in Google Maps.
            </p>
            <div className="mt-7 [&_p]:!text-slate-300">
              <NearestTrailButton cityName="British Columbia" />
            </div>
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
          <div className="flex items-start gap-4">
            <BookOpen className="mt-1 h-6 w-6 shrink-0 text-teal-700" aria-hidden="true" />
            <h2 className="text-2xl font-bold tracking-[-0.035em] sm:text-3xl">
              Research you can check before the ride
            </h2>
          </div>
          <div className="border-l border-teal-400 pl-6">
            <p className="text-base leading-7 text-slate-600">
              Every destination page links to the municipal, regional, park,
              trail-management, or destination sources used in the master
              research. Conditions change—check current notices before leaving.
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
              Wander&apos;s physical rentals currently start in Richmond and
              Steveston; the guide library helps riders plan across B.C.
            </p>
          </div>
          <nav
            aria-label="Richmond and Steveston bike rental pages"
            className="grid gap-x-8 md:grid-cols-2"
          >
            {[
              ["/bike-rental-richmond", "Bike Rental in Richmond"],
              ["/bike-rental-steveston", "Bike Rental in Steveston"],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="group flex min-h-14 items-center justify-between gap-4 border-y border-teal-200 py-3 font-bold text-slate-950 hover:text-teal-800 md:border-b-0"
              >
                {label}
                <ArrowRight
                  className="h-4 w-4 transition group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </nav>
        </div>
      </section>
    </main>
  );
}
