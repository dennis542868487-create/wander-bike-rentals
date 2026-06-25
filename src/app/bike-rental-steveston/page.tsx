import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Bike Rental Steveston",
  description:
    "Bike rental in Steveston from Wander Bike Rentals. Rent adult bikes, kids bikes, and trailer rentals in Steveston, Richmond.",
  alternates: {
    canonical: "/bike-rental-steveston",
  },
  openGraph: {
    title: "Bike Rental Steveston | Wander Bike Rentals",
    description:
      "Rent adult bikes, kids bikes, and trailer rentals in Steveston, Richmond from Wander Bike Rentals.",
    url: "https://wanderbike.ca/bike-rental-steveston",
  },
};

const quickFacts = [
  { label: "Area", value: "Steveston Village, Richmond" },
  { label: "Ride style", value: "Village and waterfront rides" },
  { label: "Included", value: "Helmet and lock" },
];

const reasons = [
  {
    title: "Adult, kids & trailer bikes",
    text: "One stop covers the whole group — comfortable adult bikes, kids bikes, and trailers for younger riders.",
  },
  {
    title: "Helmet and lock included",
    text: "Every rental comes with a helmet and lock, so you can park and explore the village without bringing your own gear.",
  },
  {
    title: "Right by the waterfront",
    text: "Pick up in Steveston and you’re minutes from Garry Point Park, Fisherman’s Wharf, and the dyke trails.",
  },
];

export default function BikeRentalStevestonPage() {
  return (
    <main className="pb-20 text-slate-900">
      <section className="hero relative isolate overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/assets/steveston-ride-idea.jpg"
            alt="Two cyclists pausing by a fence to watch cows graze in a green field on a relaxed Steveston ride"
            fill
            priority
            sizes="100vw"
            className="hero-img-anim object-cover object-center"
          />
          <div className="hero-grad-anim absolute inset-0 bg-gradient-to-br from-slate-950/85 via-slate-950/68 to-slate-900/50" />
          <div className="hero-grad-anim absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.26),transparent_46%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.14),transparent_40%)]" />
        </div>
        <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8 lg:py-28">
          <div className="space-y-6">
            <div className="hero-anim hero-d1 inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-teal-100 shadow-sm backdrop-blur">
              Steveston rentals
            </div>
            <div className="space-y-4">
              <h1 className="hero-anim hero-d2 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
                Bike Rental Steveston
              </h1>
              <p className="hero-anim hero-d3 max-w-2xl text-lg leading-8 text-slate-100/90">
                Explore Steveston Village by bike. Ride from the historic fishing village to Garry Point Park, Fisherman’s Wharf, Imperial Landing, and the South Dyke Trail with an easy local bike rental.
              </p>
            </div>
            <p className="hero-anim hero-d3 max-w-2xl text-base leading-8 text-slate-200/85">
              Adult bikes, kids bikes, and trailers are available, with helmet and lock included for a smoother Steveston ride.
            </p>
            <div className="hero-anim hero-d4 flex flex-col gap-3 sm:flex-row">
              <a
                href="tel:+17789521389"
                className="btn-primary px-6 py-3.5 text-sm shadow-[0_14px_30px_rgba(15,23,42,0.16)]"
              >
                Call Now
              </a>
              <Link
                href="/location"
                className="btn-secondary px-6 py-3.5 text-sm"
              >
                View Location
              </Link>
            </div>
            <div className="hero-anim hero-d5 grid gap-4 sm:grid-cols-3">
              {quickFacts.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/20 bg-white/10 p-4 shadow-sm backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-100/80">{item.label}</p>
                  <p className="mt-2 text-sm font-medium text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-anim hero-d4 rounded-[2rem] border border-white/55 bg-white/90 p-7 shadow-[0_24px_60px_rgba(15,23,42,0.28)] backdrop-blur-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">Steveston overview</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">Explore more of Steveston by bike</h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
              <p>
                Steveston is one of Richmond’s easiest places to slow down, ride by the water, and turn a rental into a more complete day outside.
              </p>
              <p>
                Start in the village, stop at Garry Point Park, pass Fisherman’s Wharf, then continue toward Imperial Landing or Britannia Shipyards if you want a longer route.
              </p>
            </div>
            <div className="mt-6 rounded-[1.5rem] border border-teal-100 bg-[linear-gradient(180deg,#f0fdfa_0%,#ecfeff_100%)] p-5 text-sm leading-7 text-teal-950 shadow-sm">
              Recommended Steveston ride: start in the village, ride to Garry Point Park, then continue east along the waterfront toward Britannia Shipyards and the South Dyke Trail.
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">What’s included</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Everything you need for an easy Steveston ride</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-600">
            Rent the bikes here, then use our <Link href="/guides/best-places-to-bike-in-steveston" className="font-semibold text-teal-700 hover:underline">places</Link> and <Link href="/guides/steveston-bike-ride-guide" className="font-semibold text-teal-700 hover:underline">route</Link> guides to plan where to go.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {reasons.map((item) => (
            <div key={item.title} className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.08)]">
              <h3 className="text-lg font-semibold text-slate-950">{item.title}</h3>
              <p className="mt-4 text-sm leading-7 text-slate-600">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <div className="rounded-[2rem] border border-slate-200 bg-slate-950 px-8 py-10 text-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-300">Next step</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight">Call now, check the location, or plan the rest of the Steveston ride</h2>
              <p className="mt-4 text-base leading-8 text-slate-300">
                If you already know the kind of Steveston ride you want, call the shop, confirm the details, and head over.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="tel:+17789521389"
                className="btn-secondary px-6 py-3 text-sm"
              >
                Call Now
              </a>
              <Link
                href="/guides/steveston-bike-ride-guide"
                className="inline-flex items-center justify-center rounded-full border border-white/30 bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Steveston Ride Guide
              </Link>
              <Link
                href="/location"
                className="inline-flex items-center justify-center rounded-full border border-white/30 bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                View Location
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
