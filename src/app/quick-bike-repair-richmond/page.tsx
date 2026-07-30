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

export default function QuickBikeRepairRichmondPage() {
  return (
    <main className="pb-20 text-slate-900">
      <section className="hero relative isolate overflow-hidden border-b border-white/10">
        <Image
          src="/assets/quick-repair-hero.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="quick-repair-hero-image -z-10 object-cover"
        />
        <div className="relative mx-auto flex min-h-[38rem] max-w-6xl items-center justify-center px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-20">
          <div className="quick-repair-glass-panel motion-rise w-full max-w-3xl p-5 sm:p-8 lg:p-10">
            <div className="inline-flex rounded-full border border-white/80 bg-white/40 px-4 py-2 text-sm font-semibold text-teal-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_24px_rgba(13,148,136,0.08)] backdrop-blur-xl">
              No Appointment Needed
            </div>
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
              Quick Repair
            </p>
            <h1 className="mt-3 text-[2.45rem] font-bold leading-[1.05] tracking-tight text-slate-950 sm:text-5xl lg:text-[3.35rem] lg:leading-[1.06]">
              Walk-in quick repair in Richmond.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-slate-700 sm:text-lg sm:leading-8">
              Stop by Wander Bike Rentals for quick bike repair and basic maintenance in Steveston, Richmond.
            </p>
            <p className="mt-3 max-w-3xl text-base leading-8 text-slate-600">
              Flat tires, brake and gear adjustments, chain cleaning, and basic safety checks can often be checked without an appointment.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href="tel:+17789521389"
                className="btn-brand w-full px-6 py-3.5 text-sm sm:w-auto"
              >
                Call Now
              </a>
              <Link
                href="/location"
                className="btn-secondary w-full px-6 py-3.5 text-sm sm:w-auto"
              >
                View Location
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
              Services We Offer
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Quick repair and basic maintenance for common bike issues
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-600">
            These services are a good fit for common problems that can often be checked quickly when you walk in.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[
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
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.08)] sm:p-7"
            >
              <h3 className="text-lg font-semibold text-slate-950">{item.title}</h3>
              <p className="mt-4 text-sm leading-7 text-slate-600">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
              Walk In Today
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
              Small issues can often be checked on the spot
            </h2>
            <div className="mt-5 space-y-4 text-base leading-8 text-slate-600">
              <p>
                If your bike has a flat, rubbing wheel, slipping gears, or brakes that do not feel right, you can walk in and ask the shop to take a look.
              </p>
              <p>
                Many smaller problems can be checked quickly, especially when the repair is straightforward and the bike does not need deeper parts work.
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.16)] sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-300">
              Before service starts
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white">
              Final service and price depend on the inspection
            </h2>
            <div className="mt-5 space-y-4 text-base leading-8 text-slate-300">
              <p>
                The final repair recommendation depends on the bike condition after inspection, including parts wear, cable condition, tire condition, and overall ride safety.
              </p>
              <p>
                That means the exact service and final price are confirmed after the shop has had a chance to check the bike properly.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="rounded-[2rem] border border-slate-200 bg-slate-950 px-5 py-8 text-white shadow-[0_24px_60px_rgba(15,23,42,0.18)] sm:px-8 sm:py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-300">
                Need help now?
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">
                Call first or walk in for a quick repair check
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-300">
                If the issue is small, the shop can often take a look quickly. For location details or common questions, use the links below.
              </p>
            </div>
            <div className="grid gap-3 sm:flex sm:flex-wrap">
              <a
                href="tel:+17789521389"
                className="inline-flex min-h-12 w-full min-w-[140px] items-center justify-center rounded-full border border-slate-700 bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(15,23,42,0.28)] transition hover:-translate-y-0.5 hover:bg-slate-800 sm:w-auto"
              >
                Call Now
              </a>
              <Link
                href="/location"
                className="inline-flex min-h-12 w-full min-w-[124px] items-center justify-center rounded-full border border-slate-600 bg-slate-800 px-5 py-2.5 text-sm font-semibold text-slate-100 transition hover:-translate-y-0.5 hover:bg-slate-700 sm:w-auto"
              >
                Location
              </Link>
              <Link
                href="/faq"
                className="inline-flex min-h-12 w-full min-w-[104px] items-center justify-center rounded-full border border-slate-600 bg-slate-800 px-5 py-2.5 text-sm font-semibold text-slate-100 transition hover:-translate-y-0.5 hover:bg-slate-700 sm:w-auto"
              >
                FAQ
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
