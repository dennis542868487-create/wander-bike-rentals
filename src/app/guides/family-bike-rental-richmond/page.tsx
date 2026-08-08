import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { EditorialGuideBand } from "@/components/editorial-guide-band";

export const metadata: Metadata = {
  title: {
    absolute: "Family Bike Rentals Richmond, BC | Wander Bike",
  },
  description:
    "Plan an easy family bike ride in Richmond, BC. Rent kids bikes or bike trailers near Steveston and explore Garry Point Park, waterfront paths, and flat dyke trails.",
  alternates: {
    canonical: "/guides/family-bike-rental-richmond",
  },
  openGraph: {
    title: "Family Bike Rentals Richmond, BC | Wander Bike",
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
    <main className="bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.04fr_0.96fr] lg:items-start lg:py-24">
          <div className="motion-rise">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">Family ride guide</p>
            <h1 className="mt-5 max-w-3xl text-[2.8rem] font-bold leading-[0.99] tracking-[-0.055em] text-slate-950 sm:text-6xl lg:text-[4.2rem]">
              Family Bike Rentals in Richmond, BC
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-700 sm:text-lg">
              A simple guide for families looking for kids bikes, bike trailers,
              and easy places to ride around Steveston and Richmond.
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
              Planning a family ride in Richmond? Wander Bike Rentals offers
              adult bikes, kids bikes, and bike trailers for an easy day out near
              Steveston, Garry Point Park, the waterfront, and Richmond’s flat
              dyke trails.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/kids-bike-rental-richmond" className="editorial-button editorial-button-primary w-full sm:w-auto">Kids Bikes</Link>
              <Link href="/bike-trailer-rental-richmond" className="editorial-button editorial-button-secondary w-full sm:w-auto">Bike Trailers</Link>
              <a href="tel:+17789521389" className="editorial-button editorial-button-secondary w-full sm:w-auto">Call Now</a>
            </div>
          </div>

          <div className="motion-rise motion-rise-delay-1 border-l border-teal-700/40 pl-6 sm:pl-8 lg:mt-2">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">Guide overview</p>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
              Why Richmond works well for family bike rides
            </h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
              <p>Richmond is a good place for a family ride because many routes are flat, scenic, and easy to keep flexible without overplanning the day.</p>
              <p>The best family plan is usually simple: choose one easy route, add one or two fun stops, and leave enough time for snacks, photos, and breaks.</p>
              <p className="border-t border-teal-900/20 pt-5 text-teal-950">
                Whether your child is ready for their own bike or you prefer a trailer for a younger rider, this page helps you choose the better fit before you head out.
              </p>
            </div>
          </div>
        </div>

        <Image
          src="/assets/west-dyke-ride.webp"
          alt="Two cyclists riding along the West Dyke in Richmond"
          width={1400}
          height={580}
          priority
          sizes="100vw"
          className="h-auto w-full"
        />
      </section>

      <section className="bg-[#f7fffd]">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
          <div className="grid gap-6 border-b border-slate-300 pb-8 lg:grid-cols-[1fr_0.72fr] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">Easy family ride ideas</p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl">
                Plan the ride around your family, not the longest route
              </h2>
            </div>
            <p className="text-sm leading-7 text-slate-600">
              Use this page to decide whether kids bikes or trailers fit better,
              then choose one easy Richmond route that keeps the outing relaxed.
            </p>
          </div>

          <div className="mt-10 grid gap-12 lg:grid-cols-[0.86fr_1.14fr] lg:gap-16">
            <div className="lg:border-r lg:border-slate-300 lg:pr-14">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">Equipment choice</p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                Choose the family setup first
              </h3>
              <div className="mt-7 border-t border-slate-300">
                {guidePoints.slice(0, 2).map((item, index) => (
                  <article key={item.title} className="grid grid-cols-[3rem_1fr] gap-4 border-b border-slate-300 py-7">
                    <p className="text-2xl font-light text-teal-700">0{index + 1}</p>
                    <div>
                      <h4 className="text-lg font-semibold text-slate-950">{item.title}</h4>
                      <p className="mt-3 text-sm leading-7 text-slate-600">{item.text}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">Places to ride</p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                Four easy Richmond rides for families
              </h3>
              <ol className="mt-7 border-t border-slate-300">
                {guidePoints.slice(2).map((item, index) => (
                  <li key={item.title} className="grid grid-cols-[4rem_1fr] gap-5 border-b border-slate-300 py-7 sm:grid-cols-[5rem_1fr]">
                    <p className="text-4xl font-light tracking-[-0.05em] text-teal-700">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <div>
                      <h4 className="text-lg font-semibold text-slate-950">{item.title}</h4>
                      <p className="mt-3 text-sm leading-7 text-slate-600">{item.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <EditorialGuideBand
        heading="Choose the family setup first, then plan the ride around it"
        description="Once you know whether kids bikes or a trailer make more sense, it gets much easier to plan a simple Richmond family ride."
        links={[
          { href: "/kids-bike-rental-richmond", label: "Kids Bikes" },
          { href: "/bike-trailer-rental-richmond", label: "Bike Trailers" },
          { href: "/bike-rental-richmond", label: "Richmond Ride Ideas" },
        ]}
      />
    </main>
  );
}
