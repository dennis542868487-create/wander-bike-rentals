import type { Metadata } from "next";
import {
  ArrowRight,
  CalendarCheck,
  HandCoins,
  Store,
  UsersRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Reserve a Bike in Richmond",
  description:
    "Reserve a specific bike from the Wander Bike Rentals shop, or request a separate Community Bike from its local owner.",
  alternates: { canonical: "/booking" },
  openGraph: {
    title: "Reserve a Bike in Richmond | Wander Bike",
    description:
      "Choose the exact bike first, request it online, then pick up and pay locally.",
    url: "https://www.wanderbike.ca/booking",
  },
};

export default function BookingPage() {
  return (
    <main className="min-h-[70vh] bg-[var(--background)] text-slate-900">
      <section className="route-wash border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-14 text-center lg:px-8 lg:py-20">
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--teal)]">
            Reserve the exact listing
          </p>
          <h1 className="display-heading mx-auto mt-4 max-w-4xl text-5xl leading-[0.98] sm:text-6xl">
            Choose a bike before you reserve.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Reservations are attached to a specific listing because every bike
            has a different price, fit, availability, and pickup arrangement.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-14 lg:grid-cols-2 lg:px-8 lg:py-20">
        <Link
          href="/bikes/wander"
          className="group overflow-hidden rounded-[2rem] border border-[var(--card-border)] bg-white shadow-[0_14px_32px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_22px_46px_rgba(15,23,42,0.15)]"
        >
          <div className="relative aspect-[16/9] overflow-hidden">
            <Image
              src="/assets/bikes-row.jpg"
              alt="Wander Bikes at the Steveston shop"
              fill
              sizes="(min-width: 1024px) 46vw, 100vw"
              className="object-cover transition duration-500 group-hover:scale-[1.025]"
            />
            <span className="absolute left-5 top-5 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[var(--teal)] shadow-lg">
              <Store className="h-6 w-6" aria-hidden="true" />
            </span>
            <div
              className="absolute bottom-0 right-0 h-20 w-20 bg-[var(--green)] [clip-path:polygon(100%_0,100%_100%,0_100%)]"
              aria-hidden="true"
            />
          </div>
          <div className="p-7 sm:p-9">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--teal)]">
              Physical shop collection
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[var(--navy)]">
              Wander Bikes
            </h2>
            <p className="mt-4 max-w-xl leading-7 text-slate-600">
              Browse bikes managed directly by the Wander Bike Rentals shop,
              then open the exact listing to send a rental or purchase request.
            </p>
            <span className="mt-8 inline-flex items-center gap-2 font-extrabold text-[var(--teal)]">
              Browse Wander Bikes
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
            </span>
          </div>
        </Link>
        <Link
          href="/bikes/community"
          className="group overflow-hidden rounded-[2rem] border border-[var(--card-border)] bg-white shadow-[0_14px_32px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_22px_46px_rgba(15,23,42,0.15)]"
        >
          <div className="relative aspect-[16/9] overflow-hidden">
            <Image
              src="/assets/steveston-ride-idea.jpg"
              alt="A Community Bike near the Steveston waterfront"
              fill
              sizes="(min-width: 1024px) 46vw, 100vw"
              className="object-cover transition duration-500 group-hover:scale-[1.025]"
            />
            <span className="absolute left-5 top-5 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[var(--green)] shadow-lg">
              <UsersRound className="h-6 w-6" aria-hidden="true" />
            </span>
            <div
              className="absolute right-0 top-0 h-20 w-20 bg-[var(--coral)] [clip-path:polygon(0_0,100%_0,100%_100%)]"
              aria-hidden="true"
            />
          </div>
          <div className="p-7 sm:p-9">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--green)]">
              Local owner collection
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[var(--navy)]">
              Community Bikes
            </h2>
            <p className="mt-4 max-w-xl leading-7 text-slate-600">
              Browse bikes listed by local owners. The owner confirms
              availability, pickup, and offline payment directly with you.
            </p>
            <span className="mt-8 inline-flex items-center gap-2 font-extrabold text-[var(--green)]">
              Browse Community Bikes
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
            </span>
          </div>
        </Link>
      </section>

      <section className="bg-[var(--navy)] text-white">
        <div className="mx-auto grid max-w-7xl divide-y divide-white/15 px-6 sm:grid-cols-3 sm:divide-x sm:divide-y-0 lg:px-8">
          {[
            {
              number: "01",
              icon: CalendarCheck,
              title: "Choose dates or ask to buy",
              text: "The request stays attached to one specific bike.",
            },
            {
              number: "02",
              icon: ArrowRight,
              title: "Wait for confirmation",
              text: "Wander staff or the community owner accepts the request.",
            },
            {
              number: "03",
              icon: HandCoins,
              title: "Pick up and pay locally",
              text: "Inspect the bike and complete the transaction in person.",
            },
          ].map((item) => (
            <article
              key={item.number}
              className="grid grid-cols-[auto_1fr] gap-4 py-8 sm:px-7 sm:first:pl-0 sm:last:pr-0"
            >
              <span className="text-3xl font-black text-[var(--orange)]">
                {item.number}
              </span>
              <div>
                <h2 className="flex items-center gap-2 font-extrabold">
                  <item.icon className="h-4 w-4 text-[var(--green)]" aria-hidden="true" />
                  {item.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
