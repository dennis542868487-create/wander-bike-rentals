import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { EditorialGuideBand } from "@/components/editorial-guide-band";

export const metadata: Metadata = {
  title: {
    absolute: "Best Places to Bike in Steveston | Wander Bike",
  },
  description:
    "A local guide to easy waterfront rides, village stops, parks, dyke trails, and scenic places to visit by bike around Steveston, Richmond.",
  alternates: {
    canonical: "/guides/best-places-to-bike-in-steveston",
  },
  openGraph: {
    title: "Best Places to Bike in Steveston | Wander Bike",
    description:
      "A local guide to easy waterfront rides, village stops, parks, dyke trails, and scenic places to visit by bike around Steveston, Richmond.",
    url: "https://www.wanderbike.ca/guides/best-places-to-bike-in-steveston",
    siteName: "Wander Bike Rentals",
    locale: "en_CA",
    type: "article",
  },
};

const guidePoints = [
  {
    title: "Garry Point Park",
    text: "Open waterfront, wide grass fields, and driftwood beaches where the Fraser River meets the ocean. The best first stop for photos and fresh air.",
    image: "/assets/garry-point-park.jpg",
    imageAlt: "Garry Point Park waterfront and lighthouse in Steveston",
  },
  {
    title: "Fisherman’s Wharf",
    text: "Lock up and walk the docks for fresh seafood off the boats, local shops, and Steveston’s working-harbour atmosphere.",
    image: "/assets/fishermans-wharf.webp",
    imageAlt: "Fishing boats at Steveston’s Fisherman’s Wharf",
  },
  {
    title: "Britannia Shipyards",
    text: "A National Historic Site of restored boardwalks and heritage buildings — the most memorable stop on the ride.",
    image: null,
    imageAlt: "",
  },
  {
    title: "South Dyke Trail",
    text: "A flat Fraser River route east of the village. Quieter than the busy streets and ideal for stretching the ride longer.",
    image: "/assets/west-dyke-ride.webp",
    imageAlt: "Cyclists riding on a flat Richmond dyke trail",
  },
  {
    title: "London Farm and Finn Slough",
    text: "A heritage farm and a tiny stilt-house fishing community — the quiet, local side of Steveston, farther out along the river.",
    image: null,
    imageAlt: "",
  },
  {
    title: "West Dyke Trail toward Terra Nova",
    text: "Wide open sky, marshland, and big Richmond views on flat, easy riding. From the shop, riding north toward the airport and back is about a 2-hour round trip at a sightseeing pace.",
    image: "/assets/steveston-ride-idea.jpg",
    imageAlt: "Cyclists pausing beside the open Richmond dyke landscape",
  },
] as const;

export default function BestPlacesToBikeInStevestonPage() {
  return (
    <main className="bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-[90rem] lg:min-h-[42rem] lg:grid-cols-[0.84fr_1.16fr]">
          <div className="motion-rise flex items-center px-5 py-14 sm:px-8 sm:py-20 lg:px-14 xl:px-20">
            <div className="max-w-xl">
              <h1 className="text-[2.9rem] font-bold leading-[0.98] tracking-[-0.055em] text-slate-950 sm:text-6xl lg:text-[4.4rem]">
                Best Places to Bike in Steveston
              </h1>
              <div className="mt-7 h-0.5 w-12 bg-teal-600" />
              <p className="mt-7 text-base leading-8 text-slate-700 sm:text-lg">
                A local guide to easy waterfront rides, village stops, parks,
                dyke trails, and scenic places to visit by bike around Steveston,
                Richmond.
              </p>
              <div className="mt-7 border-y border-teal-900/20 py-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">Guide overview</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Some riders want a short village loop, while others want a
                  longer afternoon with more open space, food stops, and more
                  time on the dyke trails. Pick the places first so the ride
                  feels more intentional and less like guesswork after pickup.
                </p>
              </div>
              <p className="mt-6 text-sm leading-7 text-slate-600">
                Steveston is one of the easier places in Richmond to explore by
                bike. A good ride usually includes one easy park stop, one
                village stop, and enough time left over to keep the day relaxed.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/bike-rental-steveston" className="editorial-button editorial-button-primary w-full sm:w-auto">
                  Steveston Rentals
                </Link>
                <Link href="/location" className="editorial-button editorial-button-secondary w-full sm:w-auto">
                  Location
                </Link>
              </div>
            </div>
          </div>

          <div className="motion-rise motion-rise-delay-1 relative min-h-[27rem] overflow-hidden border-t border-slate-200 lg:min-h-0 lg:border-l lg:border-t-0">
            <Image
              src="/assets/garry-point-park.jpg"
              alt="Garry Point Park in Steveston with the fishermen’s memorial, driftwood beach, and Fraser River views"
              fill
              priority
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="object-cover object-center"
            />
          </div>
        </div>
      </section>

      <section className="bg-[#f7fffd]">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
          <div className="grid gap-6 border-b border-slate-300 pb-8 lg:grid-cols-[1fr_0.72fr] lg:items-end">
          <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">Best local stops</p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl">
                Six places that make a Steveston ride feel worth doing
              </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-600">
            Use these stops to build a short casual ride or a longer half-day route around the village, waterfront, and dyke trails.
          </p>
        </div>

          <ol className="mt-2 border-t border-slate-300">
            {guidePoints.map((item, index) => (
              <li key={item.title} className="grid gap-5 border-b border-slate-300 py-8 sm:grid-cols-[4.5rem_1fr] lg:grid-cols-[5rem_0.72fr_1.28fr] lg:items-center">
                <p className="text-5xl font-light tracking-[-0.06em] text-teal-700">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="text-xl font-semibold tracking-tight text-slate-950">{item.title}</h3>
                <div className={item.image ? "grid gap-5 md:grid-cols-[0.86fr_1.14fr] md:items-center" : ""}>
                  <p className="text-sm leading-7 text-slate-600">{item.text}</p>
                  {item.image ? (
                    <div className="relative mt-1 aspect-[16/7] overflow-hidden rounded-[0.45rem] md:mt-0">
                      <Image src={item.image} alt={item.imageAlt} fill sizes="(min-width: 1024px) 30vw, 90vw" className="object-cover" />
                    </div>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <EditorialGuideBand
        heading="Know the stops? Now plan the route and book a bike"
        description="Follow the step-by-step Steveston route, grab a rental, or check the shop location before you go."
        links={[
          { href: "/guides/steveston-bike-ride-guide", label: "Steveston Route Guide" },
          { href: "/bike-rental-steveston", label: "Steveston Rentals" },
          { href: "/location", label: "Location" },
        ]}
      />
    </main>
  );
}
