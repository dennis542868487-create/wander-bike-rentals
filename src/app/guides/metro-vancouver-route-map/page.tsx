import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Compass, MapPinned, ShieldCheck } from "lucide-react";
import { MetroRouteExplorer } from "@/components/guides/metro-route-explorer";

export const metadata: Metadata = {
  title: "Metro Vancouver Cycling Route Map",
  description:
    "Explore an interactive Metro Vancouver cycling map, filter selected route ideas by difficulty, and open Wander's local city guides.",
  alternates: { canonical: "/guides/metro-vancouver-route-map" },
  openGraph: {
    title: "Metro Vancouver Cycling Route Map | Wander Bike",
    description:
      "Explore cycling routes across Vancouver, Richmond, Burnaby, Surrey, Coquitlam, Delta, and more.",
    url: "https://www.wanderbike.ca/guides/metro-vancouver-route-map",
    type: "website",
    images: ["/assets/west-dyke-ride.webp"],
  },
};

export default function MetroVancouverRouteMapPage() {
  return (
    <main className="bg-white text-slate-950">
      <section className="overflow-hidden border-b border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto grid max-w-[108rem] gap-10 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-end lg:gap-16 lg:py-16">
          <div>
            <Link
              href="/guides"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-teal-300 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              All B.C. cycling guides
            </Link>
            <p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-teal-300">
              Plan on the map
            </p>
            <h1 className="mt-4 max-w-4xl text-[2.65rem] font-bold leading-[1.02] tracking-[-0.06em] sm:text-6xl lg:text-7xl">
              Metro Vancouver cycling route map
            </h1>
            <div className="mt-7 h-1 w-16 bg-teal-300" />
          </div>
          <div className="border-l border-white/20 pl-6 sm:pl-8">
            <p className="max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              Explore the public Around Vancouver route layer, then use
              Wander&apos;s filters and city guides to choose a ride that fits
              your distance, comfort, and destination.
            </p>
            <div className="mt-7 grid gap-4 text-sm text-slate-300 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <p className="flex items-center gap-2">
                <MapPinned className="h-4 w-4 text-teal-300" aria-hidden="true" />
                80+ mapped routes
              </p>
              <p className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-teal-300" aria-hidden="true" />
                Search by area
              </p>
              <p className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-teal-300" aria-hidden="true" />
                Verify before riding
              </p>
            </div>
          </div>
        </div>
      </section>

      <MetroRouteExplorer />

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:py-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
              Before you ride
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.045em] sm:text-4xl">
              A route line is the start of planning
            </h2>
          </div>
          <div className="border-l border-teal-400 pl-6">
            <p className="text-base leading-7 text-slate-600">
              Construction, closures, surface conditions, and permitted access
              can change. Open the source route, check the relevant city guide,
              and confirm current local notices before leaving.
            </p>
            <Link
              href="/guides"
              className="editorial-button editorial-button-primary mt-6"
            >
              Browse all B.C. guides
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
