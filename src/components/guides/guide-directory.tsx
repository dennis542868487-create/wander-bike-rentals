"use client";

import { ArrowRight, MapPin, Search, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { GuideResearchDepth } from "@/lib/guides/master-guide-data";
import { guideRegionId } from "@/lib/guides/region-id";

export type GuideDirectoryItem = {
  name: string;
  classification: string;
  region: string;
  depth: GuideResearchDepth;
  url: string;
  slug: string;
};

function normalize(value: string) {
  return value.trim().toLocaleLowerCase("en-CA");
}

export function GuideDirectory({ guides }: { guides: GuideDirectoryItem[] }) {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("all");
  const regions = useMemo(
    () => [...new Set(guides.map((guide) => guide.region))].sort(),
    [guides],
  );

  const filteredGuides = useMemo(() => {
    const normalizedQuery = normalize(query);

    return guides.filter((guide) => {
      if (region !== "all" && guide.region !== region) return false;
      if (!normalizedQuery) return true;

      return normalize(
        `${guide.name} ${guide.region} ${guide.classification}`,
      ).includes(normalizedQuery);
    });
  }, [guides, query, region]);

  const groupedGuides = useMemo(() => {
    const groups = new Map<string, GuideDirectoryItem[]>();

    for (const guide of filteredGuides) {
      const current = groups.get(guide.region) ?? [];
      current.push(guide);
      groups.set(guide.region, current);
    }

    return [...groups.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, items]) => ({
        name,
        items: items.sort((a, b) => a.name.localeCompare(b.name)),
      }));
  }, [filteredGuides]);

  const reset = () => {
    setQuery("");
    setRegion("all");
  };

  return (
    <div>
      <div className="grid gap-3 border-y border-teal-200 bg-teal-50/70 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <label className="relative block">
          <span className="sr-only">Search British Columbia cycling guides</span>
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-teal-700"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search a city, town, district, or region"
            className="guide-directory-search min-h-13 w-full border border-slate-300 bg-white py-3 pl-12 pr-11 text-base text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear guide search"
              className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center text-slate-500 hover:text-slate-950"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
        </label>

        <label>
          <span className="sr-only">Filter guides by region</span>
          <select
            value={region}
            onChange={(event) => setRegion(event.target.value)}
            className="min-h-13 w-full border border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-950 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
          >
            <option value="all">All {regions.length} regions</option>
            {regions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <p className="text-sm font-semibold text-slate-600" aria-live="polite">
          Showing {filteredGuides.length} of {guides.length} cycling guides
        </p>
        {query || region !== "all" ? (
          <button
            type="button"
            onClick={reset}
            className="text-sm font-bold text-teal-800 underline decoration-teal-300 underline-offset-4 hover:text-teal-950"
          >
            Clear filters
          </button>
        ) : null}
      </div>

      {groupedGuides.length > 0 ? (
        <div className="divide-y divide-slate-200">
          {groupedGuides.map((group) => (
            <section
              key={group.name}
              id={guideRegionId(group.name)}
              className="scroll-mt-28 py-9 sm:py-11"
            >
              <div className="flex items-end justify-between gap-5 border-b border-teal-500 pb-4">
                <div>
                  <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-teal-700">
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                    British Columbia
                  </p>
                  <h3 className="mt-2 text-2xl font-bold tracking-[-0.035em] text-slate-950 sm:text-3xl">
                    {group.name}
                  </h3>
                </div>
                <p className="shrink-0 text-sm font-bold text-slate-500">
                  {group.items.length} {group.items.length === 1 ? "guide" : "guides"}
                </p>
              </div>

              <ul className="grid gap-x-8 md:grid-cols-2 xl:grid-cols-3">
                {group.items.map((guide) => (
                  <li key={guide.slug} className="border-b border-slate-200">
                    <Link
                      href={guide.url}
                      className="group grid min-h-20 grid-cols-[1fr_auto] items-center gap-5 py-4"
                    >
                      <span>
                        <span className="block font-bold text-slate-950 transition group-hover:text-teal-800">
                          {guide.name}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-slate-500">
                          {guide.classification} · Research {guide.depth}
                        </span>
                      </span>
                      <ArrowRight
                        className="h-4 w-4 text-teal-700 transition group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <div className="border-b border-slate-200 py-14 text-center">
          <h3 className="text-2xl font-bold tracking-tight text-slate-950">
            No guide matched that search.
          </h3>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600">
            Try a nearby city, a regional name, or clear the filters to browse
            every published B.C. destination.
          </p>
          <button
            type="button"
            onClick={reset}
            className="editorial-button editorial-button-primary mt-6"
          >
            Show all guides
          </button>
        </div>
      )}
    </div>
  );
}
