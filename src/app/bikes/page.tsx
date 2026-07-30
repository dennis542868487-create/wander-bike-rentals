import type { Metadata } from "next";
import { ArrowRight, Store, UsersRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Find a Bike",
  description:
    "Choose between bikes listed by Wander Bike and bikes listed by local community owners.",
  alternates: { canonical: "/bikes" },
};

export default function FindBikePage() {
  return (
    <main className="min-h-[75vh] bg-[#f0fdf9]">
      <section className="marketplace-overview-hero route-wash border-b border-slate-200 bg-white">
        <div className="marketplace-overview-grid mx-auto grid max-w-7xl items-center gap-7 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10 lg:px-8 lg:py-14">
          <div className="marketplace-overview-copy motion-rise max-w-3xl">
            <p className="mb-5 hidden items-center gap-3 text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--teal)] xl:flex">
              <span className="h-px w-9 bg-[var(--teal)]" aria-hidden="true" />
              Two collections · one local marketplace
            </p>
            <h1 className="display-heading text-[2.65rem] leading-[0.98] sm:text-6xl lg:text-7xl">
              Find a bike{" "}
              <span className="block text-[var(--teal)]">that fits the ride.</span>
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600 sm:mt-5 sm:text-lg sm:leading-8">
              Start with Wander Bikes managed by our Steveston shop or browse
              Community Bikes listed separately by local owners.
            </p>
          </div>
          <div className="marketplace-overview-media photo-arch-right motion-rise motion-rise-delay-1 relative min-h-[11.5rem] overflow-hidden bg-slate-100 sm:min-h-[17rem] lg:min-h-[22rem]">
            <Image
              src="/assets/west-dyke-ride.webp"
              alt="Two riders cycling near the Richmond waterfront"
              fill
              priority
              sizes="(min-width: 1024px) 52vw, 100vw"
              className="object-cover"
            />
            <div className="marketplace-hero-note absolute bottom-5 left-5 hidden max-w-xs rounded-[1.35rem] border border-white/75 bg-white/88 px-5 py-4 shadow-xl backdrop-blur-xl xl:block">
              <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[var(--teal)]">
                Steveston + Richmond
              </p>
              <p className="mt-1.5 text-sm font-bold leading-6 text-[var(--navy)]">
                Choose shop-managed bikes or listings from nearby owners.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="marketplace-choice-section mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <div className="grid gap-6 lg:grid-cols-2">
          <Link
            href="/bikes/wander"
            className="group overflow-hidden rounded-[2rem] border border-[var(--card-border)] bg-white shadow-[0_14px_30px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_20px_42px_rgba(15,23,42,0.14)]"
          >
            <div className="relative aspect-[16/8] overflow-hidden">
              <Image
                src="/assets/bikes-row.jpg"
                alt="Wander Bikes at the Steveston shop"
                fill
                sizes="(min-width: 1024px) 46vw, 100vw"
                className="object-cover transition duration-500 group-hover:scale-[1.025]"
              />
              <div
                className="absolute left-0 top-0 h-16 w-16 bg-[var(--green)] [clip-path:polygon(0_0,100%_0,0_100%)]"
                aria-hidden="true"
              />
            </div>
            <div className="flex items-start gap-3 p-5 sm:gap-4 sm:p-8">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--teal-soft)] text-[var(--teal)]">
                <Store className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-[var(--navy)] sm:text-3xl">
                  Wander Bikes
                </h2>
                <p className="mt-3 max-w-md leading-7 text-slate-600">
                  Listed, prepared, and managed directly by the Wander Bike
                  Rentals team at the physical Steveston shop.
                </p>
                <span className="mt-7 flex items-center gap-2 font-bold text-[var(--teal)]">
                  Browse Wander Bikes
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </div>
            </div>
          </Link>
          <Link
            href="/bikes/community"
            className="group overflow-hidden rounded-[2rem] border border-[var(--card-border)] bg-white shadow-[0_14px_30px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_20px_42px_rgba(15,23,42,0.14)]"
          >
            <div className="relative aspect-[16/8] overflow-hidden">
              <Image
                src="/assets/steveston-ride-idea.jpg"
                alt="A Community Bike near the Richmond waterfront"
                fill
                sizes="(min-width: 1024px) 46vw, 100vw"
                className="object-cover transition duration-500 group-hover:scale-[1.025]"
              />
              <div
                className="absolute right-0 top-0 h-16 w-16 bg-[var(--coral)] [clip-path:polygon(0_0,100%_0,100%_100%)]"
                aria-hidden="true"
              />
            </div>
            <div className="flex items-start gap-3 p-5 sm:gap-4 sm:p-8">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#eef6df] text-[var(--green)]">
                <UsersRound className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-[var(--navy)] sm:text-3xl">
                  Community Bikes
                </h2>
                <p className="mt-3 max-w-md leading-7 text-slate-600">
                  Bikes offered by people nearby and published directly by
                  their owners on a completely separate collection page.
                </p>
                <span className="mt-7 flex items-center gap-2 font-bold text-[var(--green)]">
                  Browse Community Bikes
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </div>
            </div>
          </Link>
        </div>
      </section>
    </main>
  );
}
