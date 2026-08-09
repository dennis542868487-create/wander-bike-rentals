import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, ChevronDown } from "lucide-react";
import { notFound } from "next/navigation";
import { GuideCopy } from "@/components/guides/guide-copy";
import { NearestTrailButton } from "@/components/guides/nearest-trail-button";
import {
  GUIDE_RESEARCH_DATE,
  getGuideBySlug,
  getGuides,
  type GuideBlock,
  type GuideResearchDepth,
} from "@/lib/guides/master-guide-data";

type GuidePageProps = {
  params: Promise<{ slug: string }>;
};

const richmondLocalPages = [
  { href: "/bike-rental-richmond", label: "Bike Rental in Richmond" },
  { href: "/bike-rental-steveston", label: "Bike Rental in Steveston" },
  {
    href: "/guides/best-places-to-bike-in-steveston",
    label: "Best Places to Bike in Steveston",
  },
  {
    href: "/guides/family-bike-rental-richmond",
    label: "Family Bike Rentals in Richmond, BC",
  },
  {
    href: "/guides/steveston-bike-ride-guide",
    label: "Steveston Bike Ride Guide",
  },
  {
    href: "/guides/bike-trailer-rental-richmond-guide",
    label: "Bike Trailer Rental Guide",
  },
] as const;

export const dynamicParams = false;

export function generateStaticParams() {
  return getGuides().map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({
  params,
}: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) notFound();

  return {
    title: { absolute: guide.seoTitle },
    description: guide.description,
    alternates: { canonical: guide.url },
    openGraph: {
      title: guide.seoTitle,
      description: guide.description,
      url: `https://www.wanderbike.ca${guide.url}`,
      type: "article",
      images:
        guide.name === "Richmond" ? ["/assets/west-dyke-ride.webp"] : undefined,
    },
  };
}

function researchDepthLabel(depth: GuideResearchDepth) {
  if (depth === "A+") return "Deep destination-specific research";
  if (depth === "A") return "Strong destination-specific research";
  if (depth === "B") return "Good regional and local research";
  return "Regional research basis; verify routes locally";
}

function findRideSectionId(blocks: GuideBlock[]) {
  const match = blocks.find(
    (block) =>
      block.type === "heading" &&
      /bike rides|scenic cycling loops/i.test(block.text),
  );
  return match?.type === "heading" ? match.id : undefined;
}

function GuideTableOfContents({
  guideName,
  toc,
}: {
  guideName: string;
  toc: GuideBlock[];
}) {
  return (
    <nav aria-label={`${guideName} guide sections`}>
      <ul>
        {toc.map((item) =>
          item.type === "heading" ? (
            <li key={item.id} className="border-b border-slate-200">
              <a
                href={`#${item.id}`}
                className="block py-3 text-sm font-medium leading-5 text-slate-600 hover:text-teal-800"
              >
                {item.text}
              </a>
            </li>
          ) : null,
        )}
      </ul>
    </nav>
  );
}

export default async function CyclingGuidePage({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) notFound();

  const guides = getGuides();
  const toc = guide.blocks.filter(
    (block) => block.type === "heading" && block.level === 2,
  );
  const rideSectionId = findRideSectionId(guide.blocks);
  const regionalGuides = guides.filter((item) => item.region === guide.region);
  const currentRegionIndex = regionalGuides.findIndex(
    (item) => item.slug === guide.slug,
  );
  const rotatedRegionalGuides = [
    ...regionalGuides.slice(currentRegionIndex + 1),
    ...regionalGuides.slice(0, currentRegionIndex),
  ];
  const relatedGuides = [
    ...rotatedRegionalGuides,
    ...guides.filter((item) => item.region !== guide.region),
  ].slice(0, 4);
  const relatedRegionLabel =
    regionalGuides.length > 1 ? guide.region : "British Columbia";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    dateModified: "2026-08-08",
    mainEntityOfPage: `https://www.wanderbike.ca${guide.url}`,
    author: {
      "@type": "Organization",
      name: "Wander Bike",
      url: "https://www.wanderbike.ca",
    },
    publisher: {
      "@type": "Organization",
      name: "Wander Bike",
      url: "https://www.wanderbike.ca",
    },
  };

  return (
    <main className="bg-white text-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article>
        <header className="border-b border-slate-200">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 sm:py-20 lg:grid-cols-[1.45fr_0.55fr] lg:items-center lg:gap-12 lg:py-24">
            <div>
              <Link
                href="/guides"
                className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-900"
              >
                <span aria-hidden="true">←</span>
                All British Columbia guides
              </Link>
              <h1 className="mt-7 max-w-4xl text-[2.55rem] font-bold leading-[1.02] tracking-[-0.055em] sm:text-6xl lg:text-7xl lg:leading-[1.02] lg:tracking-[-0.06em]">
                {guide.title}
              </h1>
              <div className="mt-7 h-1 w-16 bg-teal-600" />
              <p className="mt-7 max-w-3xl text-base leading-7 text-slate-600 sm:text-xl sm:leading-8">
                {guide.lead}
              </p>
              <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8 sm:gap-y-3">
                {rideSectionId ? (
                  <a
                    href={`#${rideSectionId}`}
                    className="inline-flex min-h-10 items-center justify-between gap-2 border-b border-teal-600 pb-1 text-sm font-bold text-slate-950 hover:text-teal-800 sm:min-h-0 sm:justify-start"
                  >
                    Explore ride ideas
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                ) : null}
                <a
                  href="#official-sources"
                  className="inline-flex min-h-10 items-center justify-between gap-2 border-b border-teal-600 pb-1 text-sm font-bold text-slate-950 hover:text-teal-800 sm:min-h-0 sm:justify-start"
                >
                  Official sources
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
                <NearestTrailButton cityName={guide.name} />
              </div>
            </div>

            <dl className="border-y border-teal-300 py-7 lg:border-y-0 lg:border-l lg:py-4 lg:pl-12">
              <div className="grid grid-cols-[1fr_auto] gap-6 border-b border-slate-200 pb-6 lg:block">
                <dt className="text-sm font-semibold text-slate-500">
                  Research depth
                </dt>
                <dd className="text-4xl font-semibold tracking-[-0.05em] text-teal-700 lg:mt-2 lg:text-5xl">
                  {guide.depth}
                </dd>
                <dd className="col-span-2 text-sm leading-6 text-slate-600 lg:mt-2">
                  {researchDepthLabel(guide.depth)}
                </dd>
              </div>
              <div className="grid grid-cols-[1fr_auto] gap-4 pt-6 lg:block">
                <dt className="text-sm font-semibold text-slate-500">
                  Reviewed
                </dt>
                <dd className="font-bold text-slate-950 lg:mt-2">
                  {GUIDE_RESEARCH_DATE}
                </dd>
                <dd className="col-span-2 text-sm text-slate-500 lg:mt-2">
                  {guide.classification} · {guide.region}
                </dd>
              </div>
            </dl>
          </div>
        </header>

        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16 lg:py-20">
          <details className="group border-y border-teal-300 lg:hidden">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 text-sm font-bold text-slate-950 marker:content-none">
              <span>
                On this page
                <span className="ml-2 font-medium text-slate-500">
                  {toc.length} sections
                </span>
              </span>
              <ChevronDown
                className="h-4 w-4 shrink-0 text-teal-700 transition group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <div className="border-t border-teal-100 pb-3">
              <GuideTableOfContents guideName={guide.name} toc={toc} />
            </div>
          </details>

          <aside className="hidden lg:sticky lg:top-32 lg:block lg:h-fit">
            <p className="border-b border-teal-500 pb-3 text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
              On this page
            </p>
            <GuideTableOfContents guideName={guide.name} toc={toc} />
          </aside>

          <div className="min-w-0 lg:border-l lg:border-teal-200 lg:pl-12">
            <GuideCopy blocks={guide.blocks} />

            <section
              id="official-sources"
              className="scroll-mt-32 border-t border-slate-300 py-12"
            >
              <h2 className="text-3xl font-bold tracking-[-0.045em] sm:text-4xl">
                Official sources
              </h2>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
                These are the municipal, regional and trail-management sources
                used for this guide. Check their current notices before relying
                on exact access or closure information.
              </p>
              <ul className="mt-8 border-t border-teal-200">
                {guide.sources.map((source) => (
                  <li key={source.id} className="border-b border-teal-200">
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group grid gap-2 py-5 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_auto] sm:items-start sm:gap-6"
                    >
                      <span className="font-bold text-slate-950 group-hover:text-teal-800">
                        {source.title}
                      </span>
                      <span className="text-sm leading-6 text-slate-600">
                        {source.use}
                      </span>
                      <ArrowUpRight
                        className="h-4 w-4 text-teal-700"
                        aria-hidden="true"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </section>

            {guide.name === "Richmond" ? (
              <section className="border-t border-slate-300 py-12">
                <h2 className="text-3xl font-bold tracking-[-0.045em] sm:text-4xl">
                  Richmond local guides and rentals
                </h2>
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
                  Continue with a Steveston route, family planning guide or the
                  rental page that matches where you want to start.
                </p>
                <nav
                  aria-label="Richmond local cycling and bike rental pages"
                  className="mt-7 grid gap-x-8 md:grid-cols-2"
                >
                  {richmondLocalPages.map((page) => (
                    <Link
                      key={page.href}
                      href={page.href}
                      className="editorial-arrow-link !border-teal-200 !text-slate-950 hover:!border-teal-600 hover:!text-teal-800"
                    >
                      {page.label}
                      <ArrowRight
                        className="h-4 w-4 shrink-0"
                        aria-hidden="true"
                      />
                    </Link>
                  ))}
                </nav>
              </section>
            ) : null}
          </div>
        </div>
      </article>

      <section className="border-y border-white/10 bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-center lg:py-16">
          <div>
            <h2 className="text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
              Keep exploring {relatedRegionLabel}
            </h2>
            <p className="mt-4 max-w-xl leading-7 text-slate-300">
              Compare terrain, route character and planning notes before you
              choose the next city.
            </p>
          </div>
          <nav
            aria-label={`More ${relatedRegionLabel} cycling guides`}
            className="grid gap-x-8 md:grid-cols-2"
          >
            {relatedGuides.map((item) => (
              <Link
                key={item.slug}
                href={item.url}
                className="editorial-arrow-link"
              >
                {item.title}
                <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
              </Link>
            ))}
          </nav>
        </div>
      </section>
    </main>
  );
}
