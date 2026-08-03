import type { Metadata } from "next";
import {
  ArrowRight,
  Bike,
  HandCoins,
  MapPin,
  MessageSquareText,
  Search,
  Store,
  UsersRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const pageDescription =
  "Browse used bikes and local bike rentals in Richmond, BC, or list your idle bike for free on Wander Bike’s bicycle-only marketplace for local riders today.";

export const metadata: Metadata = {
  title: {
    absolute: "Bike Marketplace Richmond | Buy, Rent or List Free",
  },
  description: pageDescription,
  alternates: { canonical: "/about-marketplace" },
  openGraph: {
    title: "Bike Marketplace Richmond | Buy, Rent or List Free",
    description: pageDescription,
    url: "https://www.wanderbike.ca/about-marketplace",
    siteName: "Wander Bike Rentals",
    locale: "en_CA",
    type: "website",
    images: [
      {
        url: "/assets/steveston-ride-idea.jpg",
        width: 1600,
        height: 900,
        alt: "A bicycle beside the Steveston waterfront in Richmond, BC",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bike Marketplace Richmond | Buy, Rent or List Free",
    description: pageDescription,
    images: ["/assets/steveston-ride-idea.jpg"],
  },
};

const marketplaceFaqs = [
  {
    question: "Is it really free to list my bike?",
    answer:
      "Yes. Creating a Community Bike listing on Wander is free. Add your own photos, choose rent, sale, or both, and set the price for your individual bike.",
  },
  {
    question: "How do marketplace payments work?",
    answer:
      "Wander does not take an online marketplace payment. A rider sends a request first; after the owner accepts, both sides meet, inspect the bike, and complete payment directly.",
  },
  {
    question: "Do I need to deliver the bike?",
    answer:
      "No. Community Bikes use local pickup. Only a general pickup area is public, and the exact meetup details are shared after a request is accepted.",
  },
] as const;

const marketplaceSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://www.wanderbike.ca/about-marketplace#webpage",
      url: "https://www.wanderbike.ca/about-marketplace",
      name: "Bike Marketplace Richmond | Buy, Rent or List Free",
      description: pageDescription,
      isPartOf: {
        "@type": "WebSite",
        "@id": "https://www.wanderbike.ca/#website",
        name: "Wander Bike Rentals",
        url: "https://www.wanderbike.ca/",
      },
      about: {
        "@type": "Service",
        name: "Wander Bike Community Marketplace",
        serviceType: "Local bicycle marketplace",
        areaServed: {
          "@type": "City",
          name: "Richmond, British Columbia",
        },
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "CAD",
          description: "Free Community Bike listing",
        },
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: marketplaceFaqs.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
  ],
};

const marketplaceSteps = [
  {
    icon: Search,
    number: "01",
    title: "List or browse",
    text: "Create a free bike listing, or search used bikes and local rentals near you.",
  },
  {
    icon: MessageSquareText,
    number: "02",
    title: "Send a request",
    text: "Choose rental dates or ask to buy. The owner confirms before any meetup.",
  },
  {
    icon: MapPin,
    number: "03",
    title: "Meet and exchange locally",
    text: "Inspect the bike, pay the owner directly, and complete the exchange in Richmond.",
  },
] as const;

export default function AboutMarketplacePage() {
  return (
    <main className="bg-[var(--background)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(marketplaceSchema) }}
      />

      <section className="route-wash overflow-hidden border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-9 sm:px-6 sm:py-12 lg:min-h-[38rem] lg:grid-cols-[0.9fr_1.1fr] lg:gap-10 lg:px-8 lg:py-14">
          <div className="motion-rise max-w-2xl">
            <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--teal)] sm:text-sm">
              <Bike className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
              Richmond&apos;s bike-only marketplace
            </p>
            <h1 className="display-heading mt-4 text-[2.75rem] leading-[0.97] sm:text-6xl lg:text-7xl">
              One local marketplace.
              <span className="block text-[var(--teal)]">Bikes only.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:mt-6 sm:text-lg sm:leading-8">
              Find second-hand bikes to buy, browse local rentals, or list an
              idle bike for free. Every listing on Wander is for a bicycle or
              bike trailer—nothing else.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/bikes/community" className="btn-primary w-full px-6 sm:w-auto">
                Browse bikes
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/list-your-bike" className="btn-secondary w-full px-6 sm:w-auto">
                List your bike free
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="photo-arch-right motion-rise motion-rise-delay-1 relative min-h-[17rem] overflow-hidden bg-slate-100 sm:min-h-[25rem] lg:min-h-[32rem]">
            <Image
              src="/assets/steveston-ride-idea.jpg"
              alt="A bicycle beside the Steveston waterfront in Richmond"
              fill
              priority
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="object-cover"
            />
            <div
              className="absolute right-0 top-0 h-20 w-20 bg-[var(--orange)] [clip-path:polygon(100%_0,100%_100%,0_0)]"
              aria-hidden="true"
            />
            <div className="absolute bottom-4 left-4 right-4 grid grid-cols-3 overflow-hidden rounded-2xl border border-white/80 bg-white/90 shadow-xl backdrop-blur sm:bottom-5 sm:left-auto sm:right-5 sm:w-[26rem]">
              {[
                [MapPin, "Local pickup"],
                [HandCoins, "No listing fee"],
                [MessageSquareText, "Request first"],
              ].map(([Icon, label], index) => (
                <span
                  key={label as string}
                  className={[
                    "flex min-w-0 flex-col items-center justify-center gap-1 px-2 py-3 text-center text-[0.62rem] font-bold text-[var(--navy)] sm:gap-2 sm:px-3 sm:py-4 sm:text-xs",
                    index > 0 ? "border-l border-slate-200" : "",
                  ].join(" ")}
                >
                  <Icon className="h-4 w-4 text-[var(--teal)] sm:h-5 sm:w-5" aria-hidden="true" />
                  {label as string}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:grid-cols-3 sm:px-6 sm:py-8 lg:px-8">
          {[
            [Bike, "Built only for bikes", "No furniture, electronics, or unrelated listings."],
            [HandCoins, "Free to list", "Post your bike with no listing fee."],
            [MapPin, "Local Richmond exchanges", "Meet in Steveston or elsewhere in Richmond."],
          ].map(([Icon, title, text]) => (
            <div key={title as string} className="flex items-start gap-3 sm:px-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--teal-soft)] text-[var(--teal)]">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span>
                <strong className="block text-sm text-[var(--navy)]">{title as string}</strong>
                <span className="mt-1 block text-xs leading-5 text-slate-500">{text as string}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#f0fdf9]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <p className="text-center text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--teal)] sm:text-sm">
            Made for local bikes
          </p>
          <h2 className="display-heading mx-auto mt-3 max-w-3xl text-center text-4xl sm:text-5xl">
            A better place for every bike.
          </h2>
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <article className="group grid overflow-hidden rounded-[1.75rem] border border-[var(--card-border)] bg-white shadow-[0_12px_30px_rgba(15,23,42,0.06)] sm:grid-cols-[0.9fr_1.1fr]">
              <div className="relative min-h-56 overflow-hidden bg-slate-100 sm:min-h-[21rem]">
                <Image
                  src="/assets/bikes-row.jpg"
                  alt="Bicycles ready for Richmond riders"
                  fill
                  sizes="(min-width: 1024px) 24vw, 100vw"
                  className="object-cover transition duration-500 group-hover:scale-[1.02]"
                />
                <div className="absolute left-0 top-0 h-16 w-16 bg-[var(--teal)] [clip-path:polygon(0_0,100%_0,0_100%)]" aria-hidden="true" />
              </div>
              <div className="flex flex-col justify-center p-6 sm:p-7">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--teal-soft)] text-[var(--teal)]">
                  <Search className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-2xl font-extrabold tracking-tight text-[var(--navy)]">
                  Looking for a bike?
                </h3>
                <p className="mt-3 leading-7 text-slate-600">
                  Browse quality used bikes for sale or request a local bike
                  rental from people in Richmond.
                </p>
                <Link href="/bikes/community" className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-[var(--teal)]">
                  Browse Community Bikes
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              </div>
            </article>

            <article className="group grid overflow-hidden rounded-[1.75rem] border border-[var(--card-border)] bg-white shadow-[0_12px_30px_rgba(15,23,42,0.06)] sm:grid-cols-[0.9fr_1.1fr]">
              <div className="relative min-h-56 overflow-hidden bg-slate-100 sm:min-h-[21rem]">
                <Image
                  src="/assets/garry-point-park.jpg"
                  alt="A bike near a Richmond waterfront path"
                  fill
                  sizes="(min-width: 1024px) 24vw, 100vw"
                  className="object-cover transition duration-500 group-hover:scale-[1.02]"
                />
                <div className="absolute left-0 top-0 h-16 w-16 bg-[var(--teal)] [clip-path:polygon(0_0,100%_0,0_100%)]" aria-hidden="true" />
              </div>
              <div className="flex flex-col justify-center p-6 sm:p-7">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--teal-soft)] text-[var(--teal)]">
                  <Bike className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-2xl font-extrabold tracking-tight text-[var(--navy)]">
                  Have an idle bike?
                </h3>
                <p className="mt-3 leading-7 text-slate-600">
                  Post it on Wander and rent it out—or offer it for sale. You
                  set the price, and listing is free.
                </p>
                <Link href="/list-your-bike" className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-[var(--teal)]">
                  List your bike free
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-[var(--navy)] text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <p className="text-center text-xs font-extrabold uppercase tracking-[0.18em] text-teal-300 sm:text-sm">
            Clear from request to pickup
          </p>
          <h2 className="mt-3 text-center text-3xl font-extrabold tracking-tight sm:text-5xl">
            How Wander Marketplace works
          </h2>
          <ol className="mt-9 grid gap-4 md:grid-cols-3">
            {marketplaceSteps.map((step) => (
              <li key={step.number} className="rounded-[1.5rem] border border-white/15 bg-white/[0.06] p-6">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-extrabold text-teal-300">{step.number}</span>
                  <step.icon className="h-6 w-6 text-teal-200" aria-hidden="true" />
                </div>
                <h3 className="mt-8 text-xl font-extrabold">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">{step.text}</p>
              </li>
            ))}
          </ol>
          <p className="mx-auto mt-8 max-w-3xl text-center text-sm leading-6 text-slate-300">
            Wander provides the listing and request tools. Community owners
            remain responsible for their own bike, availability, meetup, and
            payment agreement.
          </p>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[0.88fr_1.12fr] lg:items-center lg:px-8 lg:py-20">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--teal)] sm:text-sm">
              Steveston locals · Real bikes · Real people
            </p>
            <h2 className="display-heading mt-3 text-4xl sm:text-5xl">
              Used bikes and local bike rentals in Richmond
            </h2>
            <div className="mt-5 space-y-4 text-base leading-7 text-slate-600">
              <p>
                Wander is a bicycle-only marketplace for Richmond and
                Steveston. Instead of searching through unrelated marketplace
                categories, riders can focus on second-hand bikes for sale,
                local bicycle rentals, kids&apos; bikes, trailers, and more.
              </p>
              <p>
                Owners can list a bike for free. If a bike is sitting idle,
                post it on Wander to rent it out, sell it, or offer both. Each
                bike keeps its own photos, price, pickup area, and availability.
              </p>
              <p>
                Requests happen online; inspection, pickup, and payment happen
                locally after the owner accepts. Exact meetup details stay
                private until then.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3 text-sm font-bold text-[var(--teal)]">
              <Link href="/bikes/community" className="underline decoration-teal-300 underline-offset-4">Find a bike</Link>
              <Link href="/list-your-bike" className="underline decoration-teal-300 underline-offset-4">List your bike</Link>
              <Link href="/how-it-works" className="underline decoration-teal-300 underline-offset-4">How it works</Link>
              <Link href="/policies/safety" className="underline decoration-teal-300 underline-offset-4">Safety tips</Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              ["/assets/west-dyke-ride.webp", "Cyclists on the Richmond waterfront", "row-span-2 min-h-[22rem]"],
              ["/assets/west-dyke-trail.jpg", "West Dyke Trail in Richmond", "min-h-44"],
              ["/assets/fishermans-wharf.webp", "Steveston harbour near local bike routes", "min-h-44"],
            ].map(([src, alt, className], index) => (
              <div
                key={src}
                className={[
                  "relative overflow-hidden rounded-[1.5rem] bg-slate-100",
                  className,
                ].join(" ")}
              >
                <Image
                  src={src}
                  alt={alt}
                  fill
                  sizes="(min-width: 1024px) 28vw, 50vw"
                  className="object-cover"
                />
                {index === 0 ? (
                  <div className="absolute left-0 top-0 h-16 w-16 bg-[var(--orange)] [clip-path:polygon(0_0,100%_0,0_100%)]" aria-hidden="true" />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-[#f8fffc]">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--teal)] sm:text-sm">
              Marketplace questions
            </p>
            <h2 className="display-heading mt-3 text-4xl sm:text-5xl">
              Quick answers before you list.
            </h2>
          </div>
          <div className="mt-8 space-y-3">
            {marketplaceFaqs.map((item) => (
              <details key={item.question} className="group rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6">
                <summary className="flex min-h-8 cursor-pointer list-none items-center justify-between gap-5 font-extrabold text-[var(--navy)] [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <span className="text-xl font-normal text-[var(--teal)] transition group-open:rotate-45" aria-hidden="true">+</span>
                </summary>
                <p className="mt-3 max-w-3xl border-t border-slate-100 pt-4 text-sm leading-6 text-slate-600">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-slate-600">
            Need the full process? Read the{" "}
            <Link href="/how-it-works" className="font-bold text-[var(--teal)] underline underline-offset-4">
              How It Works
            </Link>{" "}
            or the{" "}
            <Link href="/policies/marketplace" className="font-bold text-[var(--teal)] underline underline-offset-4">
              Marketplace Terms
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="route-wash relative overflow-hidden rounded-[2rem] border border-[var(--card-border)] bg-[#e9fbf5] px-6 py-9 sm:px-10 sm:py-11 lg:flex lg:items-center lg:justify-between lg:gap-10">
            <div className="relative z-10 flex max-w-2xl items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[var(--teal)] shadow-sm">
                <UsersRound className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-[var(--teal)]">
                  Ready for its next rider?
                </p>
                <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[var(--navy)] sm:text-4xl">
                  Your bike could be someone else&apos;s next ride.
                </h2>
              </div>
            </div>
            <div className="relative z-10 mt-7 flex flex-col gap-3 sm:flex-row lg:mt-0">
              <Link href="/list-your-bike" className="btn-primary w-full px-6 sm:w-auto">
                List for free
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/bikes/community" className="btn-secondary w-full px-6 sm:w-auto">
                Explore Community Bikes
              </Link>
            </div>
            <Store className="absolute -bottom-10 -right-6 h-40 w-40 text-teal-700/[0.06]" aria-hidden="true" />
          </div>
        </div>
      </section>
    </main>
  );
}
