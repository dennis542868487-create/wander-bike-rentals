"use client";

import {
  ArrowRight,
  Bike,
  ExternalLink,
  Filter,
  Map,
  Route,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  METRO_VANCOUVER_MAP_EMBED_URL,
  METRO_VANCOUVER_MAP_VIEW_URL,
  METRO_VANCOUVER_ROUTES,
  type MetroRouteDifficulty,
} from "@/lib/guides/metro-vancouver-routes";

const difficulties: Array<"All" | MetroRouteDifficulty> = [
  "All",
  "Easy",
  "Moderate",
  "Adventurous",
];

const difficultyTone: Record<MetroRouteDifficulty, string> = {
  Easy: "bg-emerald-100 text-emerald-900",
  Moderate: "bg-amber-100 text-amber-950",
  Adventurous: "bg-rose-100 text-rose-900",
};

export function MetroRouteExplorer() {
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] =
    useState<(typeof difficulties)[number]>("All");
  const [selectedRouteId, setSelectedRouteId] = useState(
    METRO_VANCOUVER_ROUTES[0].id,
  );
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);

  const filteredRoutes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return METRO_VANCOUVER_ROUTES.filter((route) => {
      const matchesDifficulty =
        difficulty === "All" || route.difficulty === difficulty;
      const matchesQuery =
        !normalizedQuery ||
        [route.name, route.area, route.terrain, route.distance]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      return matchesDifficulty && matchesQuery;
    });
  }, [difficulty, query]);

  const selectedRoute =
    filteredRoutes.find(
      (route) => route.id === selectedRouteId,
    ) ?? filteredRoutes[0];

  const selectRoute = (routeId: string) => {
    setSelectedRouteId(routeId);
    setMobilePanelOpen(true);
  };

  return (
    <div className="bg-[#eef7f5]">
      <div className="mx-auto max-w-[108rem] px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="flex flex-col overflow-hidden border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.12)] lg:grid lg:min-h-[44rem] lg:grid-cols-[24rem_minmax(0,1fr)] xl:grid-cols-[27rem_minmax(0,1fr)]">
          <aside className="order-2 border-b border-slate-200 bg-white lg:order-1 lg:border-b-0 lg:border-r">
            <div className="border-b border-slate-200 p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
                    Route finder
                  </p>
                  <h2 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-slate-950">
                    Pick a ride
                  </h2>
                </div>
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-50 text-teal-800">
                  <Filter className="h-5 w-5" aria-hidden="true" />
                </span>
              </div>

              <label className="relative mt-5 block">
                <span className="sr-only">Search routes by name or area</span>
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search route or area"
                  className="h-12 w-full border border-slate-300 bg-white pl-10 pr-10 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10"
                />
                {query ? (
                  <button
                    type="button"
                    aria-label="Clear route search"
                    onClick={() => setQuery("")}
                    className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                ) : null}
              </label>

              <div className="mt-4 flex flex-wrap gap-2" aria-label="Route difficulty filter">
                {difficulties.map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={difficulty === option}
                    onClick={() => setDifficulty(option)}
                    className={[
                      "min-h-10 border px-3 text-xs font-bold transition",
                      difficulty === option
                        ? "border-slate-950 bg-slate-950 text-white"
                        : "border-slate-300 bg-white text-slate-600 hover:border-teal-700 hover:text-teal-800",
                    ].join(" ")}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-h-[29rem] overflow-y-auto p-3 sm:p-4 lg:max-h-[33rem]">
              <p className="px-2 pb-3 text-xs font-semibold text-slate-500" aria-live="polite">
                {filteredRoutes.length} {filteredRoutes.length === 1 ? "route" : "routes"}
              </p>
              <div className="space-y-2">
                {filteredRoutes.map((route) => {
                  const active = selectedRoute?.id === route.id;
                  return (
                    <button
                      key={route.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => selectRoute(route.id)}
                      className={[
                        "group w-full border p-4 text-left transition",
                        active
                          ? "border-teal-700 bg-teal-50 shadow-[inset_4px_0_0_#0f766e]"
                          : "border-transparent bg-white hover:border-slate-200 hover:bg-slate-50",
                      ].join(" ")}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bold leading-5 text-slate-950">
                            {route.name}
                          </p>
                          <p className="mt-1 text-xs font-semibold text-teal-800">
                            {route.area}
                          </p>
                        </div>
                        <ArrowRight
                          className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-teal-700"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                        <span className={`px-2 py-1 font-bold ${difficultyTone[route.difficulty]}`}>
                          {route.difficulty}
                        </span>
                        <span className="font-semibold text-slate-500">
                          {route.distance}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {filteredRoutes.length === 0 ? (
                <div className="border border-dashed border-slate-300 px-5 py-10 text-center">
                  <Bike className="mx-auto h-6 w-6 text-teal-700" aria-hidden="true" />
                  <p className="mt-3 font-bold text-slate-950">No matching routes</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Try another area or clear the difficulty filter.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setDifficulty("All");
                    }}
                    className="mt-4 text-sm font-bold text-teal-800 underline underline-offset-4"
                  >
                    Clear filters
                  </button>
                </div>
              ) : null}
            </div>
          </aside>

          <section className="relative order-1 min-h-[31rem] bg-[#dcebe7] lg:order-2 lg:min-h-0">
            <iframe
              title="Let's Go Biking Around Vancouver route map"
              src={METRO_VANCOUVER_MAP_EMBED_URL}
              className="absolute inset-0 h-full w-full border-0"
              loading="eager"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />

            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-slate-950/55 to-transparent px-4 pb-14 pt-4 sm:px-5">
              <div className="flex items-center justify-between gap-3">
                <p className="rounded-sm bg-white/95 px-3 py-2 text-xs font-bold text-slate-950 shadow-lg backdrop-blur">
                  Interactive map · 80+ published routes
                </p>
                <a
                  href={METRO_VANCOUVER_MAP_VIEW_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="pointer-events-auto inline-flex min-h-10 items-center gap-2 rounded-sm bg-white px-3 text-xs font-bold text-slate-950 shadow-lg hover:bg-teal-50"
                >
                  Full map
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
            </div>

            {selectedRoute ? (
              <article className="absolute bottom-4 left-4 right-4 z-10 hidden max-w-lg border border-white/70 bg-white/95 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.22)] backdrop-blur-xl sm:block lg:left-auto lg:w-[25rem]">
                <div className="flex items-center justify-between gap-3">
                  <span className={`px-2.5 py-1 text-xs font-bold ${difficultyTone[selectedRoute.difficulty]}`}>
                    {selectedRoute.difficulty}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {selectedRoute.distance}
                  </span>
                </div>
                <h3 className="mt-4 text-2xl font-bold tracking-[-0.04em] text-slate-950">
                  {selectedRoute.name}
                </h3>
                <p className="mt-1 text-sm font-bold text-teal-800">
                  {selectedRoute.area}
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {selectedRoute.summary}
                </p>
                <div className="mt-4 flex items-start gap-2 border-t border-slate-200 pt-4 text-xs leading-5 text-slate-500">
                  <Route className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" aria-hidden="true" />
                  {selectedRoute.terrain}
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href={selectedRoute.guideHref}
                    className="editorial-button editorial-button-primary"
                  >
                    {selectedRoute.guideLabel}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <a
                    href={selectedRoute.sourceHref}
                    target="_blank"
                    rel="noreferrer"
                    className="editorial-button editorial-button-secondary"
                  >
                    Route details
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </a>
                </div>
              </article>
            ) : null}

            {selectedRoute ? (
              <button
                type="button"
                onClick={() => setMobilePanelOpen(true)}
                className="absolute bottom-4 left-4 right-20 z-10 flex min-h-14 items-center justify-between bg-slate-950 px-5 text-left text-sm font-bold text-white shadow-2xl sm:hidden"
              >
                <span>
                  <span className="block text-[0.65rem] uppercase tracking-[0.16em] text-teal-300">
                    Selected route
                  </span>
                  <span className="mt-0.5 block truncate">
                    {selectedRoute.name}
                  </span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
              </button>
            ) : null}
          </section>
        </div>

        <div className="mt-3 flex flex-col justify-between gap-2 text-xs leading-5 text-slate-500 sm:flex-row">
          <p>
            Map and route detail source: Let&apos;s Go Biking / Google My Maps.
          </p>
          <p>Check the linked source and local notices before riding.</p>
        </div>
      </div>

      {mobilePanelOpen && selectedRoute ? (
        <div className="fixed inset-0 z-[70] sm:hidden" role="dialog" aria-modal="true" aria-label={`${selectedRoute.name} route details`}>
          <button
            type="button"
            aria-label="Close route details"
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-[2px]"
            onClick={() => setMobilePanelOpen(false)}
          />
          <article className="absolute inset-x-0 bottom-0 max-h-[78dvh] overflow-y-auto rounded-t-[1.75rem] bg-white px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-4 shadow-2xl">
            <div className="mx-auto h-1 w-10 rounded-full bg-slate-300" aria-hidden="true" />
            <div className="mt-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">
                  {selectedRoute.area}
                </p>
                <h3 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-slate-950">
                  {selectedRoute.name}
                </h3>
              </div>
              <button
                type="button"
                aria-label="Close route details"
                onClick={() => setMobilePanelOpen(false)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
              <span className={`px-2.5 py-1 font-bold ${difficultyTone[selectedRoute.difficulty]}`}>
                {selectedRoute.difficulty}
              </span>
              <span className="font-semibold text-slate-500">
                {selectedRoute.distance}
              </span>
            </div>
            <p className="mt-5 text-sm leading-6 text-slate-600">
              {selectedRoute.summary}
            </p>
            <div className="mt-4 flex items-start gap-2 border-y border-slate-200 py-4 text-sm leading-6 text-slate-600">
              <Map className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" aria-hidden="true" />
              {selectedRoute.terrain}
            </div>
            <div className="mt-5 grid gap-3">
              <Link
                href={selectedRoute.guideHref}
                className="editorial-button editorial-button-primary"
              >
                Open {selectedRoute.guideLabel}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a
                href={selectedRoute.sourceHref}
                target="_blank"
                rel="noreferrer"
                className="editorial-button editorial-button-secondary"
              >
                Open source route details
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </article>
        </div>
      ) : null}
    </div>
  );
}
