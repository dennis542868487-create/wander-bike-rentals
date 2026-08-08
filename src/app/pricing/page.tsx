import type { Metadata } from "next";
import { ArrowRight, Bike } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Wander Bike Rental Pricing",
  description:
    "See Wander Bike Rentals shop rates for adult bikes, kids bikes, and trailers. Bike sale prices vary by individual listing.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Wander Bike Rental Pricing | Steveston, Richmond",
    description:
      "Compare Wander Bike shop rental rates, then open Find a Bike to see individual bikes and sale prices.",
    url: "https://www.wanderbike.ca/pricing",
  },
};

const rentalOptions = [
  {
    name: "Adult Bike",
    description:
      "For solo rides, couples, and relaxed trips around Steveston and Richmond.",
    href: "/adult-bike-rental-richmond",
    rates: [
      ["Per hour", "$12.38"],
      ["Half day", "$40"],
      ["Full day · 24 hr", "$64.76"],
    ],
  },
  {
    name: "Kids Bike",
    description:
      "A family-friendly option when you need a bike sized for a younger rider.",
    href: "/kids-bike-rental-richmond",
    rates: [
      ["Per hour", "$9.52"],
      ["Half day", "$30"],
      ["Full day · 24 hr", "$50"],
    ],
  },
  {
    name: "Bike Trailer",
    description:
      "A practical family option for rides with younger children.",
    href: "/bike-trailer-rental-richmond",
    rates: [
      ["Per hour", "$9.52"],
      ["Half day", "$30"],
      ["Full day · 24 hr", "$50"],
    ],
  },
] as const;

export default function PricingPage() {
  return (
    <main className="bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-[90rem] lg:min-h-[39rem] lg:grid-cols-[0.92fr_1.08fr]">
          <div className="motion-rise flex items-center px-5 py-14 sm:px-8 sm:py-20 lg:px-14 xl:px-20">
            <div className="max-w-xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">
                Wander Bike Rentals · Steveston shop
              </p>
              <h1 className="mt-6 text-[2.8rem] font-bold leading-[0.98] tracking-[-0.055em] text-slate-950 sm:text-6xl lg:text-[4.3rem]">
                Wander Bike rental prices.
              </h1>
              <p className="mt-7 text-base leading-8 text-slate-600 sm:text-lg">
                These are the rental rates for adult bikes, kids bikes, and
                trailers rented directly from Wander Bike Rentals. Bike sale
                prices are different for every individual bike.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/bikes"
                  className="editorial-button editorial-button-primary w-full sm:w-auto"
                >
                  Find a Bike
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <a
                  href="tel:+17789521389"
                  className="editorial-button editorial-button-secondary w-full sm:w-auto"
                >
                  Call Now
                </a>
              </div>
            </div>
          </div>

          <div className="motion-rise motion-rise-delay-1 grid min-h-[34rem] grid-rows-[1fr_auto] border-t border-slate-200 bg-[#effcf9] lg:min-h-0 lg:border-l lg:border-t-0">
            <div className="relative min-h-[25rem] overflow-hidden">
              <Image
                src="/assets/pricing-steveston-hero.jpg"
                alt="A bicycle beside the Steveston waterfront"
                fill
                priority
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="object-cover object-center"
              />
            </div>
            <div className="border-t border-teal-900/15 px-5 py-7 sm:px-8 lg:px-10">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
                Starting hourly rates
              </p>
              <div className="mt-5 grid grid-cols-1 divide-y divide-teal-900/15 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                {rentalOptions.map((option) => (
                  <div key={option.name} className="py-4 sm:px-5 sm:py-0 first:pl-0">
                    <p className="text-sm font-semibold text-slate-800">{option.name}</p>
                    <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                      {option.rates[0][1]}
                      <span className="ml-1 text-xs font-medium text-slate-500">/hour</span>
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-5 max-w-2xl text-xs leading-5 text-slate-600">
                Rates are shown in CAD. Availability and the exact bike are
                confirmed through the individual listing or directly with the shop.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
          <div className="grid gap-6 border-b border-slate-300 pb-8 lg:grid-cols-[1fr_0.78fr] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">
                Wander shop rentals
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl">
                Compare the full rental rates
              </h2>
            </div>
            <p className="text-sm leading-7 text-slate-600">
              These prices apply to Wander Bike Rentals’ own rental service.
              Community owners set their own prices separately.
            </p>
          </div>

          <div className="mt-8 overflow-x-auto border-b border-slate-300">
            <table className="w-full min-w-[760px] table-fixed border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-300 bg-[#effcf9]">
                  <th className="w-[20%] px-5 py-5 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                    Rental type
                  </th>
                  {rentalOptions.map((option) => (
                    <th
                      key={option.name}
                      scope="col"
                      className="border-l border-slate-200 px-5 py-5"
                    >
                      <span className="flex items-center gap-3 text-sm font-bold uppercase tracking-[0.08em] text-slate-950">
                        <Bike className="h-5 w-5 text-teal-700" aria-hidden="true" />
                        {option.name}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-200 align-top">
                  <th scope="row" className="px-5 py-5 text-sm font-semibold text-slate-800">
                    Best for
                  </th>
                  {rentalOptions.map((option) => (
                    <td key={option.name} className="border-l border-slate-200 px-5 py-5 text-sm leading-6 text-slate-600">
                      {option.description}
                    </td>
                  ))}
                </tr>
                {rentalOptions[0].rates.map(([label], rateIndex) => (
                  <tr key={label} className="border-b border-slate-200">
                    <th scope="row" className="px-5 py-5 text-sm font-semibold text-slate-800">
                      {label}
                    </th>
                    {rentalOptions.map((option) => (
                      <td key={option.name} className="border-l border-slate-200 px-5 py-5 text-xl font-bold text-teal-700">
                        {option.rates[rateIndex][1]}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <th scope="row" className="px-5 py-5 text-sm font-semibold text-slate-800">
                    Details
                  </th>
                  {rentalOptions.map((option) => (
                    <td key={option.name} className="border-l border-slate-200 px-5 py-5">
                      <Link href={option.href} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-950 hover:text-teal-700">
                        Rental details
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="bg-slate-950 text-white">
        <div className="mx-auto grid max-w-6xl divide-y divide-white/15 px-5 sm:px-8 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
          <article className="py-12 lg:pr-14">
            <div className="h-0.5 w-10 bg-teal-400" />
            <h2 className="mt-6 text-2xl font-semibold tracking-tight">Buying a Wander bike?</h2>
            <p className="mt-4 max-w-xl leading-7 text-slate-300">
              There is no single Wander sale price. Every bike has a different
              model, condition, photos, and individual sale price. Open Find a
              Bike to see the exact amount.
            </p>
          </article>
          <article className="py-12 lg:pl-14">
            <div className="h-0.5 w-10 bg-teal-400" />
            <h2 className="mt-6 text-2xl font-semibold tracking-tight">Browsing Community Bikes?</h2>
            <p className="mt-4 max-w-xl leading-7 text-slate-300">
              Community owners choose their own rental and sale prices for each
              listing. Those prices do not use the Wander shop rental rate table
              above.
            </p>
          </article>
        </div>
      </section>

      <section className="border-b border-teal-900/15 bg-[#effcf9]">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-center lg:py-16">
          <div className="border-l-2 border-teal-600 pl-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">No online payment</p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em] text-slate-950">
              Choose the exact bike before sending a request.
            </h2>
            <p className="mt-3 max-w-2xl leading-7 text-slate-600">
              Find a Bike shows whether each listing is for rent, sale, or both.
              Pickup, inspection, and payment happen locally.
            </p>
          </div>
          <Link href="/bikes" className="editorial-button editorial-button-primary w-full px-8 lg:w-auto">
            Find a Bike
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
