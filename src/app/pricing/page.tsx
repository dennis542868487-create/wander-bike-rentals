import type { Metadata } from "next";
import {
  ArrowRight,
  Bike,
  HandCoins,
  Store,
  UsersRound,
} from "lucide-react";
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
    <main className="bg-[var(--background)] text-slate-900">
      <section className="hero pricing-hero relative isolate overflow-hidden border-b border-white/60">
        <Image
          src="/assets/pricing-steveston-hero.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="pricing-hero-image -z-10 object-cover"
        />
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:min-h-[38rem] lg:grid-cols-[0.92fr_1.08fr] lg:gap-10 lg:px-8 lg:py-20">
          <div className="pricing-hero-copy motion-rise">
            <div className="inline-flex rounded-full border border-white/75 bg-white/35 px-4 py-2 text-sm font-semibold text-teal-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_8px_24px_rgba(13,148,136,0.08)] backdrop-blur-xl">
              Wander Bike Rentals · Steveston shop
            </div>
            <h1 className="mt-5 text-[2.65rem] font-bold leading-[1.03] tracking-[-0.045em] text-slate-950 sm:mt-7 sm:text-6xl">
              Wander Bike rental prices.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-700 sm:mt-6 sm:text-lg sm:leading-8">
              These are the rental rates for adult bikes, kids bikes, and
              trailers rented directly from Wander Bike Rentals. Bike sale
              prices are different for every individual bike.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/bikes" className="btn-brand w-full px-8 py-3.5 text-sm sm:w-auto">
                Find a Bike
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a
                href="tel:+17789521389"
                className="pricing-glass-button w-full px-7 py-3.5 text-sm sm:w-auto"
              >
                Call Now
              </a>
            </div>
          </div>

          <div className="liquid-glass-panel motion-rise motion-rise-delay-1 p-5 text-slate-900 sm:p-8">
            <div className="liquid-glass-content">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-600">
                Wander rental overview
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                Starting hourly rates
              </h2>
              <div className="mt-6 space-y-3">
                {rentalOptions.map((option) => (
                  <div
                    key={option.name}
                    className="liquid-glass-row flex items-center justify-between gap-4 px-4 py-4 sm:px-5"
                  >
                    <div>
                      <p className="font-semibold text-slate-950">{option.name}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        Wander Bike Rentals
                      </p>
                    </div>
                    <p className="text-xl font-bold text-teal-800 sm:text-2xl">
                      {option.rates[0][1]}
                      <span className="ml-1 text-sm font-medium text-slate-600">
                        /hour
                      </span>
                    </p>
                  </div>
                ))}
              </div>
              <p className="liquid-glass-note mt-4 rounded-2xl p-4 text-sm leading-6 text-teal-950">
                Rates are shown in CAD. Availability and the exact bike are
                confirmed through the individual listing or directly with the shop.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
                Wander shop rentals
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Compare the full rental rates
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-slate-600">
              These prices apply to Wander Bike Rentals’ own rental service.
              Community owners set their own prices separately.
            </p>
          </div>

          <div className="mt-9 grid gap-5 lg:grid-cols-3">
            {rentalOptions.map((option) => (
              <article
                key={option.name}
                className="flex flex-col rounded-[2rem] border border-[var(--card-border)] bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.06)] sm:p-7"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]">
                  <Bike className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-2xl font-semibold text-slate-950">
                  {option.name}
                </h3>
                <p className="mt-3 min-h-14 text-sm leading-7 text-slate-600">
                  {option.description}
                </p>
                <dl className="mt-6 divide-y divide-slate-200 border-y border-slate-200">
                  {option.rates.map(([label, price]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between gap-4 py-4"
                    >
                      <dt className="text-sm text-slate-600">{label}</dt>
                      <dd className="text-xl font-bold text-teal-700">{price}</dd>
                    </div>
                  ))}
                </dl>
                <Link
                  href={option.href}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-teal-700"
                >
                  Rental details
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-950 text-white">
        <div className="mx-auto grid max-w-6xl divide-y divide-white/10 px-4 sm:px-6 lg:grid-cols-2 lg:divide-x lg:divide-y-0 lg:px-8">
          <article className="flex gap-5 py-10 lg:pr-10">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-teal-300">
              <Store className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-2xl font-semibold">
                Buying a Wander bike?
              </h2>
              <p className="mt-3 leading-7 text-slate-300">
                There is no single Wander sale price. Every bike has a
                different model, condition, photos, and individual sale price.
                Open Find a Bike to see the exact amount.
              </p>
            </div>
          </article>
          <article className="flex gap-5 py-10 lg:pl-10">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-teal-300">
              <UsersRound className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-2xl font-semibold">
                Browsing Community Bikes?
              </h2>
              <p className="mt-3 leading-7 text-slate-300">
                Community owners choose their own rental and sale prices for
                each listing. Those prices do not use the Wander shop rental
                rate table above.
              </p>
            </div>
          </article>
        </div>
      </section>

      <section className="bg-[#f0fdf9]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="rounded-[2rem] border border-[var(--card-border)] bg-white px-5 py-8 shadow-[0_20px_50px_rgba(15,23,42,0.08)] sm:px-10 sm:py-10 lg:flex lg:items-center lg:justify-between lg:gap-10">
            <div className="max-w-2xl">
              <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
                <HandCoins className="h-5 w-5" aria-hidden="true" />
                No online payment
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                Choose the exact bike before sending a request.
              </h2>
              <p className="mt-3 leading-7 text-slate-600">
                Find a Bike shows whether each listing is for rent, sale, or
                both. Pickup, inspection, and payment happen locally.
              </p>
            </div>
            <Link
              href="/bikes"
              className="btn-brand mt-7 min-h-14 w-full shrink-0 px-9 text-base sm:w-auto lg:mt-0"
            >
              Find a Bike
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
