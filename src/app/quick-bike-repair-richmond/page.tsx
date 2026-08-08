import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Quick Repair in Richmond",
  description:
    "Walk in for quick bike repair and basic maintenance in Steveston, Richmond. Flat repair, brake and gear adjustment, chain cleaning, and basic safety checks.",
  alternates: {
    canonical: "/quick-bike-repair-richmond",
  },
  openGraph: {
    title: "Quick Repair in Richmond | Wander Bike Rentals",
    description:
      "Walk in for quick bike repair and basic maintenance in Steveston, Richmond. Flat repair, brake and gear adjustment, chain cleaning, and basic safety checks.",
    url: "https://www.wanderbike.ca/quick-bike-repair-richmond",
  },
};

const repairServices = [
  {
    title: "Flat Repair / Tire Replacement",
    text: "For punctures, flat tires, worn tires, and tube replacement.",
  },
  {
    title: "Brake Adjustment / Brake Cable Replacement",
    text: "Brake tuning, cable replacement, housing replacement, and basic brake checks.",
  },
  {
    title: "Gear Adjustment / Shifter Cable Replacement",
    text: "Gear tuning, shifter cable replacement, housing replacement, and basic drivetrain checks.",
  },
  {
    title: "Spoke & Wheel Adjustment",
    text: "Basic spoke adjustment and wheel truing for minor wobbling or rubbing.",
  },
  {
    title: "Chain Cleaning & Basic Lubrication",
    text: "Chain degreasing, dirt removal, and basic lubrication.",
  },
  {
    title: "Basic Safety Check",
    text: "Tires, brakes, gears, chain, wheels, bolts, and general ride safety.",
  },
] as const;

export default function QuickBikeRepairRichmondPage() {
  return (
    <main className="bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-[90rem] lg:grid-cols-[0.9fr_1.1fr]">
          <div className="motion-rise px-5 py-14 sm:px-8 sm:py-20 lg:px-14 xl:px-20">
            <div className="flex items-center gap-4 text-sm font-semibold text-slate-700">
              <span>No Appointment Needed</span>
              <span className="h-px w-14 bg-teal-600" aria-hidden="true" />
            </div>
            <p className="mt-9 text-xs font-bold uppercase tracking-[0.2em] text-teal-700">Quick Repair</p>
            <h1 className="mt-4 text-[2.7rem] font-bold leading-[1.02] tracking-[-0.05em] text-slate-950 sm:text-6xl lg:text-[4rem]">
              Walk-in quick repair in Richmond.
            </h1>
            <p className="mt-7 max-w-xl text-base leading-8 text-slate-700 sm:text-lg">
              Stop by Wander Bike Rentals for quick bike repair and basic maintenance in Steveston, Richmond.
            </p>
            <p className="mt-3 max-w-xl text-base leading-8 text-slate-600">
              Flat tires, brake and gear adjustments, chain cleaning, and basic safety checks can often be checked without an appointment.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href="tel:+17789521389" className="editorial-button editorial-button-primary w-full sm:w-auto">
                Call Now
              </a>
              <Link href="/location" className="editorial-button editorial-button-secondary w-full sm:w-auto">
                View Location
              </Link>
            </div>
          </div>

          <div className="motion-rise motion-rise-delay-1 flex items-center border-t border-slate-200 bg-[#c9f1ec] lg:border-l lg:border-t-0">
            <Image
              src="/assets/quick-repair-workshop.webp"
              alt="A teal commuter bicycle on a repair stand beside an organized bike workshop bench"
              width={1586}
              height={992}
              priority
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="h-auto w-full"
            />
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
          <div className="grid gap-6 border-b border-slate-300 pb-8 lg:grid-cols-[1fr_0.72fr] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">Services We Offer</p>
              <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl">
                Quick repair and basic maintenance for common bike issues
              </h2>
            </div>
            <p className="text-sm leading-7 text-slate-600">
              These services are a good fit for common problems that can often be checked quickly when you walk in.
            </p>
          </div>

          <div className="mt-6 grid lg:grid-cols-2 lg:divide-x lg:divide-slate-300">
            {[repairServices.slice(0, 3), repairServices.slice(3)].map((column, columnIndex) => (
              <div key={columnIndex} className={columnIndex === 0 ? "lg:pr-10" : "lg:pl-10"}>
                {column.map((item, itemIndex) => {
                  const number = columnIndex * 3 + itemIndex + 1;
                  return (
                    <article key={item.title} className="grid grid-cols-[4rem_1fr] gap-5 border-b border-slate-200 py-8 sm:grid-cols-[5rem_1fr]">
                      <p className="text-5xl font-light leading-none tracking-[-0.06em] text-teal-700">
                        {String(number).padStart(2, "0")}
                      </p>
                      <div>
                        <h3 className="text-base font-semibold leading-6 text-slate-950">{item.title}</h3>
                        <p className="mt-3 text-sm leading-7 text-slate-600">{item.text}</p>
                      </div>
                    </article>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid border-y border-slate-200 lg:grid-cols-2">
        <div className="bg-[#effcf9] px-5 py-14 sm:px-8 lg:px-14 lg:py-20 xl:pl-[max(3.5rem,calc((100vw-72rem)/2))]">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">Walk In Today</p>
          <h2 className="mt-4 max-w-xl text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl">
            Small issues can often be checked on the spot
          </h2>
          <div className="mt-6 max-w-xl space-y-4 text-base leading-8 text-slate-600">
            <p>If your bike has a flat, rubbing wheel, slipping gears, or brakes that do not feel right, you can walk in and ask the shop to take a look.</p>
            <p>Many smaller problems can be checked quickly, especially when the repair is straightforward and the bike does not need deeper parts work.</p>
          </div>
        </div>

        <div className="bg-slate-950 px-5 py-14 text-white sm:px-8 lg:px-14 lg:py-20 xl:pr-[max(3.5rem,calc((100vw-72rem)/2))]">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-300">Before service starts</p>
          <h2 className="mt-4 max-w-xl text-3xl font-bold tracking-[-0.035em] text-white sm:text-4xl">
            Final service and price depend on the inspection
          </h2>
          <div className="mt-6 max-w-xl space-y-4 text-base leading-8 text-slate-300">
            <p>The final repair recommendation depends on the bike condition after inspection, including parts wear, cable condition, tire condition, and overall ride safety.</p>
            <p>That means the exact service and final price are confirmed after the shop has had a chance to check the bike properly.</p>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-center lg:py-16">
          <div className="border-l-2 border-teal-600 pl-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">Need help now?</p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.035em] text-slate-950">
              Call first or walk in for a quick repair check
            </h2>
            <p className="mt-3 max-w-2xl leading-7 text-slate-600">
              If the issue is small, the shop can often take a look quickly. For location details or common questions, use the links below.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <a href="tel:+17789521389" className="editorial-button editorial-button-primary">Call Now</a>
            <Link href="/location" className="editorial-button editorial-button-secondary">Location</Link>
            <Link href="/faq" className="editorial-button editorial-button-secondary">FAQ</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
