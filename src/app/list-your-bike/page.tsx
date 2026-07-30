import type { Metadata } from "next";
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  HandCoins,
  MapPin,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getCurrentUser } from "@/lib/supabase/auth";

export const metadata: Metadata = {
  title: "List Your Bike",
  description:
    "Create a free local bike rental or sale listing on Wander Bike.",
};

export default async function ListYourBikePage() {
  const user = await getCurrentUser();
  const startHref = user
    ? "/account/bikes/new"
    : "/auth?mode=signup&next=/account/bikes/new";

  return (
    <main className="bg-[var(--background)]">
      <section className="list-bike-hero route-wash overflow-hidden border-b border-slate-200 bg-white">
        <div className="list-bike-hero-grid mx-auto grid max-w-7xl items-center gap-8 px-4 py-9 sm:px-6 sm:py-12 lg:min-h-[40rem] lg:grid-cols-[0.92fr_1.08fr] lg:gap-10 lg:px-8 lg:py-14">
          <div className="list-bike-hero-copy motion-rise max-w-2xl">
            <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--green)]">
              Free to list · no seller membership
            </p>
            <h1 className="display-heading mt-4 text-[2.65rem] leading-[0.98] sm:text-6xl lg:text-7xl">
              Put your bike to work locally.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:mt-6 sm:text-lg sm:leading-8">
              Offer one bike for rent, sale, or both. Set that bike’s own
              prices, upload its photos, and decide which requests to accept.
            </p>
            <Link href={startHref} className="btn-primary mt-7 w-full px-6 py-3.5 sm:mt-8 sm:w-auto">
              {user ? "Create a listing" : "Create your free account"}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <p className="mt-4 text-sm text-slate-500">
              One account lets you list bikes and request other bikes.
            </p>
          </div>
          <div className="list-bike-hero-media photo-arch-right motion-rise motion-rise-delay-1 relative min-h-[20rem] overflow-hidden bg-slate-100 sm:min-h-[26rem] lg:min-h-[34rem]">
            <Image
              src="/assets/steveston-ride-idea.jpg"
              alt="A locally owned bicycle ready to be listed"
              fill
              priority
              sizes="(min-width: 1024px) 52vw, 100vw"
              className="object-cover"
            />
            <div className="absolute bottom-5 left-5 right-5 rounded-lg border border-white/70 bg-white/94 p-5 shadow-xl backdrop-blur sm:left-auto sm:max-w-sm">
              <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.15em] text-[var(--teal)]">
                <Camera className="h-4 w-4" aria-hidden="true" />
                Your bike, your listing
              </p>
              <p className="mt-2 font-bold leading-6 text-[var(--navy)]">
                Add your own photos, choose rent, sale, or both, and set every
                price yourself.
              </p>
            </div>
            <div
              className="absolute right-0 top-0 h-24 w-24 bg-[var(--coral)] [clip-path:polygon(0_0,100%_0,100%_100%)]"
              aria-hidden="true"
            />
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-[var(--navy)] text-white">
        <div className="mx-auto grid max-w-7xl divide-y divide-white/15 px-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-6 lg:px-8">
          {[
            {
              icon: UserRound,
              title: "Use your regular account",
              text: "There is no separate seller account or paid membership.",
              accent: "text-[var(--orange)]",
            },
            {
              icon: BadgeCheck,
              title: "Publish immediately",
              text: "There is no listing approval queue. Automatic signals only alert Site Admin.",
              accent: "text-[var(--green)]",
            },
            {
              icon: HandCoins,
              title: "Get paid in person",
              text: "Wander does not collect money or take a transaction fee.",
              accent: "text-[var(--coral)]",
            },
          ].map((item) => (
            <article
              key={item.title}
              className="flex gap-4 py-8 sm:px-7 sm:first:pl-0 sm:last:pr-0"
            >
              <item.icon className={`mt-0.5 h-6 w-6 shrink-0 ${item.accent}`} aria-hidden="true" />
              <div>
                <h2 className="font-extrabold text-white">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-9 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[0.78fr_1.22fr] lg:gap-12 lg:px-8 lg:py-20">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--teal)]">
              You stay in control
            </p>
            <h2 className="display-heading mt-3 text-4xl sm:text-5xl">
              Four choices stay with you.
            </h2>
            <p className="mt-5 max-w-lg leading-7 text-slate-600">
              Wander supplies the place to publish and manage requests. You
              decide the offer, price, photos, and who you meet.
            </p>
          </div>
          <ol className="grid gap-x-8 gap-y-0 sm:grid-cols-2">
            {[
              {
                number: "01",
                title: "Choose the offer",
                text: "Rent only, sale only, or rent and sale.",
              },
              {
                number: "02",
                title: "Set bike-specific prices",
                text: "Add hourly, daily, and/or sale pricing.",
              },
              {
                number: "03",
                title: "Reply to each request",
                text: "Accept or decline from your Community Bike Dashboard.",
              },
              {
                number: "04",
                title: "Arrange a safe local meetup",
                text: "Share exact pickup details only after acceptance.",
              },
            ].map((item) => (
              <li
                key={item.number}
                className="grid grid-cols-[3.25rem_1fr] gap-4 border-t border-slate-200 py-6"
              >
                <span className="text-2xl font-black text-[var(--green)]">
                  {item.number}
                </span>
                <div>
                  <h3 className="font-extrabold text-[var(--navy)]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="route-wash border-t border-slate-200 bg-[#f0fdf9]">
        <div className="mx-auto flex max-w-7xl flex-col gap-7 px-4 py-12 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-14">
          <div className="flex max-w-2xl gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[var(--teal)] shadow-sm">
              <MapPin className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-2xl font-extrabold text-[var(--navy)]">
                Keep the public location general.
              </h2>
              <p className="mt-2 leading-7 text-slate-600">
                Show a neighbourhood or pickup area publicly. Exact instructions
                are shared only after you accept a rider’s request.
              </p>
            </div>
          </div>
          <Link href={startHref} className="btn-primary w-full shrink-0 px-6 sm:w-auto">
            Start your listing
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
