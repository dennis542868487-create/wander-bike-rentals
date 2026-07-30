import type { Metadata } from "next";
import {
  ArrowRight,
  CalendarCheck,
  HandCoins,
  MessageSquareText,
  Search,
  ShieldCheck,
  Store,
  UsersRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Learn how local bike rentals and purchase inquiries work on Wander Bike.",
  alternates: { canonical: "/how-it-works" },
};

const steps = [
  {
    icon: Search,
    title: "Browse the right collection",
    text: "Choose Wander Bikes or Community Bikes. Each listing shows who owns it, exactly what is offered, and that bike’s individual price.",
  },
  {
    icon: CalendarCheck,
    title: "Send a rental request or buying inquiry",
    text: "Pick dates for a rental, or ask to buy. Sending a request does not charge you and is not yet a confirmed reservation.",
  },
  {
    icon: MessageSquareText,
    title: "Wait for the owner to confirm",
    text: "The owner accepts or declines in their dashboard. Once accepted, you receive the private pickup details.",
  },
  {
    icon: HandCoins,
    title: "Meet, inspect, and pay locally",
    text: "There is no shipping and no online payment. Complete the exchange directly with Wander or the community owner at pickup.",
  },
];

export default function HowItWorksPage() {
  return (
    <main className="bg-[var(--background)]">
      <section className="route-wash overflow-hidden border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-7 px-4 py-8 sm:px-6 sm:py-10 lg:min-h-[36rem] lg:grid-cols-[0.92fr_1.08fr] lg:gap-10 lg:px-8 lg:py-14">
          <div className="motion-rise max-w-2xl">
            <p className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--teal)]">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              Request first, meet locally
            </p>
            <h1 className="display-heading mt-4 text-[2.65rem] leading-[0.98] sm:text-6xl lg:text-7xl">
              A local marketplace,{" "}
              <span className="block text-[var(--teal)]">without checkout.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:mt-6 sm:text-lg sm:leading-8">
              Wander helps people find each other and manage requests. The
              actual pickup, inspection, and payment happen in person.
            </p>
          </div>
          <div className="photo-arch-right motion-rise motion-rise-delay-1 relative min-h-[12rem] overflow-hidden bg-slate-100 sm:min-h-[20rem] lg:min-h-[31rem]">
            <Image
              src="/assets/west-dyke-ride.webp"
              alt="Cyclists riding together on a Richmond waterfront route"
              fill
              priority
              sizes="(min-width: 1024px) 52vw, 100vw"
              className="object-cover"
            />
            <div
              className="absolute bottom-0 right-0 h-24 w-24 bg-[var(--green)] [clip-path:polygon(100%_0,100%_100%,0_100%)]"
              aria-hidden="true"
            />
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-[#f0fdf9]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-2 px-4 py-5 sm:gap-3 sm:px-6 sm:py-8 lg:px-8">
          <Link
            href="/bikes/wander"
            className="group flex flex-col items-start gap-2 rounded-2xl border border-slate-300 bg-white p-3 transition hover:border-[var(--teal)] sm:flex-row sm:items-center sm:gap-4 sm:p-5"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--teal-soft)] text-[var(--teal)] sm:h-12 sm:w-12">
              <Store className="h-4 w-4 sm:h-6 sm:w-6" aria-hidden="true" />
            </span>
            <span>
              <strong className="block text-sm text-[var(--navy)] sm:text-lg">Wander Bikes</strong>
              <span className="mt-1 hidden text-sm text-slate-600 sm:block">
                Managed directly by the Steveston shop.
              </span>
            </span>
            <ArrowRight className="hidden h-5 w-5 text-[var(--teal)] transition group-hover:translate-x-1 sm:ml-auto sm:block" aria-hidden="true" />
          </Link>
          <Link
            href="/bikes/community"
            className="group flex flex-col items-start gap-2 rounded-2xl border border-slate-300 bg-white p-3 transition hover:border-[var(--green)] sm:flex-row sm:items-center sm:gap-4 sm:p-5"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eef6df] text-[var(--green)] sm:h-12 sm:w-12">
              <UsersRound className="h-4 w-4 sm:h-6 sm:w-6" aria-hidden="true" />
            </span>
            <span>
              <strong className="block text-sm text-[var(--navy)] sm:text-lg">Community Bikes</strong>
              <span className="mt-1 hidden text-sm text-slate-600 sm:block">
                Listed separately by local owners.
              </span>
            </span>
            <ArrowRight className="hidden h-5 w-5 text-[var(--green)] transition group-hover:translate-x-1 sm:ml-auto sm:block" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-9 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[0.65fr_1.35fr] lg:gap-10 lg:px-8 lg:py-20">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--teal)]">
              The request journey
            </p>
            <h2 className="display-heading mt-3 text-4xl sm:text-5xl">
              Four steps. No surprise checkout.
            </h2>
            <p className="mt-5 max-w-md leading-7 text-slate-600">
              Wander records the request and its status. The owner still decides
              whether the bike is available and where the accepted exchange happens.
            </p>
          </div>
          <ol className="border-t border-slate-200">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="grid grid-cols-[2.5rem_1fr] gap-4 border-b border-slate-200 py-6 sm:grid-cols-[4.25rem_3rem_1fr] sm:items-start sm:gap-5 sm:py-7"
            >
              <span className="text-3xl font-black text-[var(--green)]">
                0{index + 1}
              </span>
              <span className="hidden h-11 w-11 items-center justify-center rounded-full bg-[var(--teal-soft)] text-[var(--teal)] sm:flex">
                <step.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-xl font-extrabold text-[var(--navy)]">
                  {step.title}
                </h3>
                <p className="mt-2 leading-7 text-slate-600">{step.text}</p>
              </div>
            </li>
          ))}
          </ol>
        </div>
      </section>

      <section className="bg-[var(--navy)] text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-7 px-4 py-12 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-14">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--orange)]">
              Ready when you are
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight">
              Find a bike—or put yours into the community.
            </h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/bikes" className="btn-primary w-full px-6 sm:w-auto">
              Find a Bike
            </Link>
            <Link
              href="/list-your-bike"
              className="btn-outline-light w-full px-6 sm:w-auto"
            >
              List Your Bike
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
