import type { Metadata } from "next";
import {
  ArrowRight,
  Bike,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  Store,
  UsersRound,
  Wrench,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { WANDER_SHOP_DIRECTIONS_URL } from "@/lib/marketplace/wander-shop";
import { wanderBusinessEntity } from "@/lib/seo/wander-business";

const pageTitle = "About Wander Bike | Rentals, Marketplace & B.C. Guides";
const pageDescription =
  "Meet Wander Bike: a Steveston rental, sales, and repair shop with a local bicycle marketplace and 160 cycling guides across British Columbia.";

export const metadata: Metadata = {
  title: { absolute: pageTitle },
  description: pageDescription,
  alternates: { canonical: "/about" },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: "https://www.wanderbike.ca/about",
    siteName: "Wander Bike Rentals",
    locale: "en_CA",
    type: "website",
    images: [
      {
        url: "/assets/bikes-row.jpg",
        width: 1600,
        height: 900,
        alt: "Bikes at Wander Bike Rentals in Steveston, Richmond",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: ["/assets/bikes-row.jpg"],
  },
};

const aboutFaqs = [
  {
    question: "When did Wander Bike Rentals open?",
    answer:
      "Wander Bike Rentals opened its Steveston shop in April 2026 at 12071 First Ave #101, Richmond, British Columbia.",
  },
  {
    question: "What does the Wander Bike shop do?",
    answer:
      "The physical shop provides bike rentals, local bike sales, and quick repairs for common bicycle issues. It also manages the Wander Bikes collection on the online marketplace.",
  },
  {
    question: "What is Wander Bike building?",
    answer:
      "Wander is building a bicycle-sharing marketplace where shops and local owners can make bikes available to other riders. Alongside it, Wander publishes province-wide cycling guides so riders can understand a destination before finding a bike there.",
  },
  {
    question: "Is the sharing platform available everywhere now?",
    answer:
      "Not yet. Rentals and marketplace exchanges currently operate locally from Steveston and serve Richmond-area riders. The 160 British Columbia cycling guides are available province-wide as planning resources, but they do not represent rental coverage in every city.",
  },
  {
    question: "What are the British Columbia cycling guides?",
    answer:
      "They are 160 destination pages covering cities, towns, villages, districts, and other B.C. communities. Each guide includes ride ideas, planning notes, a research-depth label, and links to the official sources used.",
  },
] as const;

const aboutSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      "@id": "https://www.wanderbike.ca/about#webpage",
      url: "https://www.wanderbike.ca/about",
      name: pageTitle,
      description: pageDescription,
      datePublished: "2026-08-02",
      dateModified: "2026-08-09",
      mainEntity: { "@id": "https://www.wanderbike.ca/#business" },
      isPartOf: {
        "@type": "WebSite",
        "@id": "https://www.wanderbike.ca/#website",
        name: "Wander Bike Rentals",
        url: "https://www.wanderbike.ca/",
      },
    },
    {
      ...wanderBusinessEntity,
      foundingDate: "2026-04",
      slogan: "Find a bike where you are, without bringing your own.",
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://www.wanderbike.ca/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "About Wander Bike",
          item: "https://www.wanderbike.ca/about",
        },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: aboutFaqs.map((item) => ({
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

const services = [
  {
    icon: Bike,
    title: "Bike rentals",
    text: "Choose a specific Wander bike with its own photos and price. Rentals include a helmet, basket, and lock.",
    href: "/bikes/wander",
    linkLabel: "Browse Wander Bikes",
  },
  {
    icon: Wrench,
    title: "Quick bike repair",
    text: "Bring common problems such as flat tires, brake adjustment, gear tuning, wheel rubbing, or chain issues to our Steveston shop.",
    href: "/quick-bike-repair-richmond",
    linkLabel: "See quick repair services",
  },
  {
    icon: UsersRound,
    title: "Community marketplace",
    text: "Local owners can list an idle bike for rent or sale, helping more bikes spend time on the road instead of in storage.",
    href: "/about-marketplace",
    linkLabel: "About the marketplace",
  },
  {
    icon: BookOpen,
    title: "B.C. cycling guides",
    text: "Plan rides across 160 British Columbia destinations with terrain notes, local ideas, research labels, and official source links.",
    href: "/guides",
    linkLabel: "Explore all B.C. guides",
  },
] as const;

export default function AboutPage() {
  return (
    <main className="bg-[var(--background)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />

      <section className="relative overflow-hidden bg-[var(--navy)] text-white">
        <div className="absolute inset-0 lg:left-[52%]">
          <Image
            src="/assets/bikes-row.jpg"
            alt="Bicycles ready at Wander Bike Rentals in Steveston"
            fill
            priority
            sizes="(min-width: 1024px) 48vw, 100vw"
            className="object-cover opacity-30 lg:opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--navy)] via-[var(--navy)]/55 to-[var(--navy)]/10" />
        </div>
        <div className="relative mx-auto grid max-w-7xl items-center px-4 py-14 sm:px-6 sm:py-20 lg:min-h-[40rem] lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
          <div className="motion-rise max-w-3xl lg:pr-8">
            <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-teal-200 sm:text-sm">
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              Opened in Steveston · April 2026
            </p>
            <h1 className="mt-5 text-[2.75rem] font-extrabold leading-[0.98] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
              A local bike shop with a bigger riding mission.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-200 sm:text-xl sm:leading-8">
              Based in Steveston, Wander Bike Rentals is one of Richmond&apos;s
              largest and most dependable used bike rental and sales shops. We
              We pair a real local shop and community marketplace with 160 B.C.
              cycling guides, building toward a simple idea: understand the
              ride, then find a useful bike near the destination.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={WANDER_SHOP_DIRECTIONS_URL}
                target="_blank"
                rel="noreferrer"
                className="btn-brand w-full px-6 sm:w-auto"
              >
                <MapPin className="h-4 w-4" aria-hidden="true" />
                Go to Store
              </a>
              <Link href="/bikes" className="btn-outline-light w-full px-6 sm:w-auto">
                Find a Bike
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/guides" className="btn-outline-light w-full px-6 sm:w-auto">
                Explore B.C. Guides
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-7 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {[
            [Store, "A real local shop", "12071 First Ave #101, Steveston"],
            [CalendarDays, "Open every day", "9:00 AM–10:00 PM"],
            [UsersRound, "Local first", "Serving Richmond-area riders today"],
            [BookOpen, "160 B.C. guides", "Ride planning across 27 regions"],
          ].map(([Icon, title, text]) => (
            <div key={title as string} className="flex items-start gap-3 sm:px-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--teal-soft)] text-[var(--teal)]">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span>
                <strong className="block text-sm text-[var(--navy)]">
                  {title as string}
                </strong>
                <span className="mt-1 block text-xs leading-5 text-slate-500">
                  {text as string}
                </span>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8">
          <div className="relative min-h-[22rem] overflow-hidden rounded-[2rem] bg-slate-100 sm:min-h-[32rem]">
            <Image
              src="/assets/quick-repair-hero.jpg"
              alt="Quick bike repair service at Wander Bike Rentals"
              fill
              sizes="(min-width: 1024px) 44vw, 100vw"
              className="object-cover"
            />
            <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/70 bg-white/90 p-5 shadow-xl backdrop-blur sm:left-auto sm:w-72">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--teal)]">
                Our beginning
              </p>
              <p className="mt-2 text-xl font-extrabold text-[var(--navy)]">
                One storefront in Steveston. April 2026.
              </p>
            </div>
          </div>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--teal)] sm:text-sm">
              The Wander story
            </p>
            <h2 className="display-heading mt-3 text-4xl sm:text-5xl">
              We started by helping people ride right here.
            </h2>
            <div className="mt-6 space-y-4 text-base leading-8 text-slate-600">
              <p>
                Wander Bike Rentals opened in April 2026 at 12071 First Ave
                #101 in Steveston, Richmond. The shop gives visitors and local
                riders a straightforward place to rent a bike, ask for a quick
                repair, or learn what is available before heading out.
              </p>
              <p>
                Steveston is where the idea became real: bikes in one physical
                shop, riders arriving with different needs, and useful bikes
                sitting idle elsewhere in the community. That led us to build
                an online marketplace alongside the shop.
              </p>
              <p>
                Wander Bikes are managed by our team. Community Bikes remain
                separately listed by local owners. Keeping those collections
                clear is part of building trust as the platform grows.
              </p>
              <p>
                The same question—what does someone need for a good local
                ride?—led to our B.C. guide library. The guides expand Wander&apos;s
                planning help across the province while rentals and marketplace
                exchanges remain clearly local.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f0fdf9]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <p className="text-center text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--teal)] sm:text-sm">
            What Wander does today
          </p>
          <h2 className="display-heading mx-auto mt-3 max-w-3xl text-center text-4xl sm:text-5xl">
            Shop services, a local marketplace, and B.C. ride guides
          </h2>
          <div className="mt-9 grid gap-5 md:grid-cols-2">
            {services.map((service) => (
              <article
                key={service.title}
                className="flex flex-col rounded-[1.75rem] border border-[var(--card-border)] bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)] sm:p-7"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--teal-soft)] text-[var(--teal)]">
                  <service.icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="mt-6 text-2xl font-extrabold text-[var(--navy)]">
                  {service.title}
                </h3>
                <p className="mt-3 flex-1 leading-7 text-slate-600">
                  {service.text}
                </p>
                <Link
                  href={service.href}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-[var(--teal)]"
                >
                  {service.linkLabel}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--teal)] sm:text-sm">
              Rental-ready every day
            </p>
            <h2 className="display-heading mt-3 text-4xl sm:text-5xl">
              The small safety details matter.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
              Every Wander rental bike is checked daily before it is sent out.
              We make sure the practical equipment riders expect is present,
              visible, and ready for the trip.
            </p>
          </div>
          <div className="rounded-[2rem] bg-[var(--navy)] p-6 text-white shadow-[0_22px_55px_rgba(15,23,42,0.18)] sm:p-8">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-7 w-7 text-teal-200" aria-hidden="true" />
              <h3 className="text-xl font-extrabold">Daily Wander bike check</h3>
            </div>
            <ul className="mt-6 space-y-4 text-sm leading-6 text-slate-200">
              {[
                "Kickstand installed and working",
                "Bell present and easy to use",
                "White front reflector and red rear reflector present",
                "Helmet, basket, and lock included with every rental",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal-300" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-[var(--navy)] text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-teal-300 sm:text-sm">
              Where we want to go
            </p>
            <h2 className="mt-4 text-4xl font-extrabold tracking-[-0.04em] sm:text-6xl">
              Find the bike there. Leave yours at home.
            </h2>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
              Our long-term goal is a bicycle-sharing platform for everyone:
              local shops and owners making bikes available, and riders finding
              a suitable bike wherever they are. A weekend away, a visit to a
              new neighbourhood, or a casual ride should not require carrying
              your own bicycle with you.
            </p>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            <article className="rounded-[1.75rem] border border-white/15 bg-white/[0.06] p-6 sm:p-8">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-teal-300">
                Today
              </p>
              <h3 className="mt-3 text-2xl font-extrabold">
                Local service from Steveston
              </h3>
              <p className="mt-4 leading-7 text-slate-300">
                Wander currently serves Richmond-area riders through one
                physical shop, Wander-managed rentals, and Community Bikes
                listed by local owners. Pickup and payment are arranged locally,
                while 160 B.C. guides help anyone plan a ride across the province.
              </p>
            </article>
            <article className="rounded-[1.75rem] border border-teal-300/30 bg-teal-300/[0.08] p-6 sm:p-8">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-teal-300">
                Building toward
              </p>
              <h3 className="mt-3 text-2xl font-extrabold">
                A wider network of shared bikes
              </h3>
              <p className="mt-4 leading-7 text-slate-300">
                We want more idle bikes to become useful local transportation
                and more riders to access a bike near their destination. That
                broader network is our direction, not a claim of current
                worldwide coverage.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--teal)] sm:text-sm">
            Wander Bike facts
          </p>
          <h2 className="display-heading mt-3 text-4xl sm:text-5xl">
            Clear information about the shop and platform
          </h2>
          <dl className="mt-8 divide-y divide-slate-200 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-50">
            {[
              ["Opened", "April 2026"],
              ["Physical shop", "12071 First Ave #101, Richmond, BC V7E 3M1"],
              ["Hours", "Open daily from 9:00 AM to 10:00 PM"],
              ["Current service area", "Steveston and the Richmond, BC area"],
              ["Shop services", "Bike rentals, local bike sales, and quick bike repair"],
              ["Online platform", "Separate Wander Bikes and Community Bikes collections for local rental or sale requests"],
              ["Guide library", "160 published cycling guides across 27 British Columbia regions"],
              ["Long-term mission", "Make shared bicycles easier to find near a rider’s destination"],
            ].map(([term, detail]) => (
              <div key={term} className="grid gap-1 p-5 sm:grid-cols-[12rem_1fr] sm:gap-5 sm:p-6">
                <dt className="text-sm font-extrabold text-[var(--navy)]">{term}</dt>
                <dd className="text-sm leading-6 text-slate-600">{detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="bg-[#f0fdf9]">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <p className="text-center text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--teal)] sm:text-sm">
            About Wander Bike
          </p>
          <h2 className="display-heading mt-3 text-center text-4xl sm:text-5xl">
            Common questions
          </h2>
          <div className="mt-8 grid gap-4">
            {aboutFaqs.map((item) => (
              <details
                key={item.question}
                className="group rounded-[1.4rem] border border-[var(--card-border)] bg-white p-5 open:shadow-sm sm:p-6"
              >
                <summary className="cursor-pointer list-none pr-7 text-base font-extrabold text-[var(--navy)] marker:content-none">
                  {item.question}
                </summary>
                <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="rounded-[2rem] bg-[var(--teal)] p-7 text-white sm:p-10 lg:flex lg:items-center lg:justify-between lg:gap-8">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-teal-100">
                Start local
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Visit Wander Bike in Steveston.
              </h2>
              <p className="mt-3 max-w-2xl leading-7 text-teal-50">
                Rent a bike, ask about a quick repair, explore the local
                marketplace, or plan your next B.C. ride.
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:mt-0">
              <a
                href={WANDER_SHOP_DIRECTIONS_URL}
                target="_blank"
                rel="noreferrer"
                className="btn-primary w-full px-6 sm:w-auto"
              >
                Go to Store
              </a>
              <Link href="/about-marketplace" className="btn-secondary w-full px-6 sm:w-auto">
                Explore the platform
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/guides" className="btn-secondary w-full px-6 sm:w-auto">
                Browse B.C. guides
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
