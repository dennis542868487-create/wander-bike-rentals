import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { EditorialGuideBand } from "@/components/editorial-guide-band";

export const metadata: Metadata = {
  title: {
    absolute: "Steveston Bike Ride Guide: Route & Stops | Wander Bike",
  },
  description:
    "Plan an easy Steveston bike ride from Steveston Village to Garry Point Park, Fisherman’s Wharf, Britannia Shipyards, and the South Dyke Trail.",
  alternates: {
    canonical: "/guides/steveston-bike-ride-guide",
  },
  openGraph: {
    title: "Steveston Bike Ride Guide: Route & Stops | Wander Bike",
    description:
      "Plan an easy Steveston bike ride from Steveston Village to Garry Point Park, Fisherman’s Wharf, Britannia Shipyards, and the South Dyke Trail.",
    url: "https://www.wanderbike.ca/guides/steveston-bike-ride-guide",
    siteName: "Wander Bike Rentals",
    locale: "en_CA",
    type: "article",
  },
};

const guidePoints = [
  {
    title: "1. Start in Steveston Village",
    text: "Begin at the waterfront where the shops, restaurants, and harbour sit close together. Easy parking and an easy start.",
    image: null,
    imageAlt: "",
    width: 0,
    height: 0,
  },
  {
    title: "2. Ride to Garry Point Park",
    text: "A short, flat waterfront stretch to Steveston’s best viewpoint — open water, grass fields, and driftwood beaches.",
    image: "/assets/garry-point-park.jpg",
    imageAlt: "Garry Point Park waterfront and lighthouse in Steveston",
    width: 1600,
    height: 1200,
  },
  {
    title: "3. Stop at Fisherman’s Wharf",
    text: "Loop back toward the village, lock up, and grab fresh seafood off the boats at Steveston’s most recognizable spot.",
    image: "/assets/fishermans-wharf.webp",
    imageAlt: "Fishing boats and docks at Steveston’s Fisherman’s Wharf",
    width: 2560,
    height: 1707,
  },
  {
    title: "4. Imperial Landing & Britannia Shipyards",
    text: "Roll east along the boardwalk past river views and heritage buildings for the most scenic stretch of the ride.",
    image: null,
    imageAlt: "",
    width: 0,
    height: 0,
  },
  {
    title: "5. Optional: South Dyke Trail",
    text: "Keep going east along the Fraser River for a quieter, more open ride away from the busy village streets.",
    image: "/assets/west-dyke-ride.webp",
    imageAlt: "Cyclists riding on a flat Richmond dyke trail",
    width: 1400,
    height: 580,
  },
] as const;

export default function StevestonBikeRideGuidePage() {
  return (
    <main className="bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-slate-950">
        <div className="mx-auto grid max-w-[90rem] lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="motion-rise bg-slate-900">
            <Image
              src="/assets/fishermans-wharf.webp"
              alt="Steveston’s Fisherman’s Wharf with fishing boats, docks, and waterfront restaurants"
              width={2560}
              height={1707}
              priority
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="h-auto w-full"
            />
          </div>

          <div className="motion-rise motion-rise-delay-1 flex items-center px-5 py-14 text-white sm:px-8 sm:py-20 lg:px-14 xl:px-16">
            <div className="max-w-xl">
              <h1 className="text-[2.8rem] font-bold leading-[0.99] tracking-[-0.055em] text-white sm:text-6xl lg:text-[4rem]">
                Steveston Bike Ride Guide
              </h1>
              <div className="mt-6 h-0.5 w-12 bg-teal-400" />
              <p className="mt-7 text-base leading-8 text-slate-200 sm:text-lg">
                A simple local route for riding from Steveston Village to Garry
                Point Park, Fisherman’s Wharf, Imperial Landing, Britannia
                Shipyards, and the South Dyke Trail.
              </p>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                Planning a bike ride in Steveston? This route can stay short and
                relaxed, or you can extend it into a longer waterfront ride
                toward London Farm and Finn Slough if you want more time outside.
              </p>
              <div className="mt-6 border-t border-white/20 pt-5 text-sm leading-7 text-slate-300">
                For a short ride, keep it around Steveston Village, Garry Point
                Park, and Fisherman’s Wharf. For more time out, add Britannia
                Shipyards and part of the South Dyke Trail.
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/bike-rental-steveston" className="editorial-button editorial-button-primary w-full sm:w-auto">Steveston Rentals</Link>
                <Link href="/#pricing" className="editorial-button editorial-button-dark w-full sm:w-auto">See Pricing</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f7fffd]">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
          <div className="grid gap-6 border-b border-slate-300 pb-8 lg:grid-cols-[1fr_0.72fr] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">A simple Steveston route</p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl">
                Follow this route for an easier Steveston ride
              </h2>
            </div>
            <p className="text-sm leading-7 text-slate-600">
              Use this page when you want one route that can stay casual, scenic,
              and easy to adjust based on time, energy, and who is riding with you.
            </p>
          </div>

          <ol className="relative ml-2 mt-10 border-l border-teal-600 sm:ml-8">
            {guidePoints.map((item, index) => (
              <li key={item.title} className="relative border-b border-slate-300 py-9 pl-10 sm:pl-14 lg:py-12">
                <span className="absolute -left-[5px] top-12 h-2.5 w-2.5 bg-teal-600" aria-hidden="true" />
                <div className={item.image ? "grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center" : "max-w-3xl"}>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
                      {index === 0 ? "Start" : index === guidePoints.length - 1 ? "Optional extension" : `Stop ${index + 1}`}
                    </p>
                    <div className="mt-3 grid grid-cols-[4rem_1fr] gap-5 sm:grid-cols-[5rem_1fr]">
                      <p className="text-5xl font-light tracking-[-0.06em] text-teal-700">
                        {String(index + 1).padStart(2, "0")}
                      </p>
                      <div>
                        <h3 className="text-xl font-semibold tracking-tight text-slate-950">{item.title}</h3>
                        <p className="mt-3 text-sm leading-7 text-slate-600">{item.text}</p>
                      </div>
                    </div>
                  </div>
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.imageAlt}
                      width={item.width}
                      height={item.height}
                      sizes="(min-width: 1024px) 46vw, 100vw"
                      className="h-auto w-full rounded-[0.45rem]"
                    />
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <EditorialGuideBand
        heading="Use the route, then choose the rental and shop details you need"
        description="Once you know how far you want to ride, head back to the Steveston rental page or check the location before you go."
        links={[
          { href: "/guides/best-places-to-bike-in-steveston", label: "Best Places to Bike" },
          { href: "/bike-rental-steveston", label: "Steveston Rentals" },
          { href: "/location", label: "Location" },
        ]}
      />
    </main>
  );
}
