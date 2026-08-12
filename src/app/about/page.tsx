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
import {
  CmsImage,
  CmsLink,
  CmsSection,
  CmsText,
  WebsiteContentRuntime,
} from "@/components/website-cms/content-runtime";
import { wanderBusinessEntity } from "@/lib/seo/wander-business";
import { aboutContentDefaults } from "@/lib/website-cms/pages/about";
import { getWebsitePageRenderState } from "@/lib/website-cms/server";

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
  },
  {
    icon: Wrench,
  },
  {
    icon: UsersRound,
  },
  {
    icon: BookOpen,
  },
] as const;

export default async function AboutPage({
  searchParams,
}: {
  searchParams: Promise<{ websitePreview?: string }>;
}) {
  const { content, previewMode } = await getWebsitePageRenderState(
    "about",
    searchParams,
  );

  return (
    <WebsiteContentRuntime initialContent={content} previewMode={previewMode}>
    <main
      data-website-preview={previewMode ? "true" : undefined}
      className="bg-[var(--background)]"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />

      <CmsSection sectionId="hero" label="Hero" className="relative overflow-hidden bg-[var(--navy)] text-white">
        <div className="absolute inset-0 lg:left-[52%]">
          <CmsImage
            srcField="hero.imageSrc"
            altField="hero.imageAlt"
            fallbackSrc={aboutContentDefaults["hero.imageSrc"]}
            fallbackAlt={aboutContentDefaults["hero.imageAlt"]}
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
              <CmsText field="hero.eyebrow" fallback={aboutContentDefaults["hero.eyebrow"]} />
            </p>
            <CmsText as="h1" field="hero.heading" fallback={aboutContentDefaults["hero.heading"]} className="mt-5 text-[2.75rem] font-extrabold leading-[0.98] tracking-[-0.05em] sm:text-6xl lg:text-7xl" />
            <CmsText as="p" field="hero.body" fallback={aboutContentDefaults["hero.body"]} className="mt-6 max-w-2xl text-base leading-7 text-slate-200 sm:text-xl sm:leading-8" />
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <CmsLink
                labelField="hero.primaryLabel"
                hrefField="hero.primaryHref"
                fallbackLabel={aboutContentDefaults["hero.primaryLabel"]}
                fallbackHref={aboutContentDefaults["hero.primaryHref"]}
                target="_blank"
                rel="noreferrer"
                className="btn-brand w-full px-6 sm:w-auto"
              >
                <MapPin className="h-4 w-4" aria-hidden="true" />
              </CmsLink>
              <CmsLink labelField="hero.secondaryLabel" hrefField="hero.secondaryHref" fallbackLabel={aboutContentDefaults["hero.secondaryLabel"]} fallbackHref={aboutContentDefaults["hero.secondaryHref"]} className="btn-outline-light w-full px-6 sm:w-auto">
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </CmsLink>
              <CmsLink labelField="hero.tertiaryLabel" hrefField="hero.tertiaryHref" fallbackLabel={aboutContentDefaults["hero.tertiaryLabel"]} fallbackHref={aboutContentDefaults["hero.tertiaryHref"]} className="btn-outline-light w-full px-6 sm:w-auto" />
            </div>
          </div>
        </div>
      </CmsSection>

      <CmsSection sectionId="snapshot" label="Shop snapshot" className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-7 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {[Store, CalendarDays, UsersRound, BookOpen].map((Icon, index) => (
            <div key={index} className="flex items-start gap-3 sm:px-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--teal-soft)] text-[var(--teal)]">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span>
                <strong className="block text-sm text-[var(--navy)]">
                  <CmsText field={`snapshot.item${index + 1}Title`} fallback={aboutContentDefaults[`snapshot.item${index + 1}Title`]} />
                </strong>
                <span className="mt-1 block text-xs leading-5 text-slate-500">
                  <CmsText field={`snapshot.item${index + 1}Body`} fallback={aboutContentDefaults[`snapshot.item${index + 1}Body`]} />
                </span>
              </span>
            </div>
          ))}
        </div>
      </CmsSection>

      <CmsSection sectionId="story" label="Our story" className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8">
          <div className="relative min-h-[22rem] overflow-hidden rounded-[2rem] bg-slate-100 sm:min-h-[32rem]">
            <CmsImage
              srcField="story.imageSrc"
              altField="story.imageAlt"
              fallbackSrc={aboutContentDefaults["story.imageSrc"]}
              fallbackAlt={aboutContentDefaults["story.imageAlt"]}
              fill
              sizes="(min-width: 1024px) 44vw, 100vw"
              className="object-cover"
            />
            <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/70 bg-white/90 p-5 shadow-xl backdrop-blur sm:left-auto sm:w-72">
              <CmsText as="p" field="story.imageEyebrow" fallback={aboutContentDefaults["story.imageEyebrow"]} className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--teal)]" />
              <CmsText as="p" field="story.imageCaption" fallback={aboutContentDefaults["story.imageCaption"]} className="mt-2 text-xl font-extrabold text-[var(--navy)]" />
            </div>
          </div>
          <div>
            <CmsText as="p" field="story.eyebrow" fallback={aboutContentDefaults["story.eyebrow"]} className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--teal)] sm:text-sm" />
            <CmsText as="h2" field="story.heading" fallback={aboutContentDefaults["story.heading"]} className="display-heading mt-3 text-4xl sm:text-5xl" />
            <div className="mt-6 space-y-4 text-base leading-8 text-slate-600">
              {[1, 2, 3, 4].map((number) => (
                <CmsText key={number} as="p" field={`story.body${number}`} fallback={aboutContentDefaults[`story.body${number}`]} />
              ))}
            </div>
          </div>
        </div>
      </CmsSection>

      <CmsSection sectionId="services" label="Services" className="bg-[#f0fdf9]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <CmsText as="p" field="services.eyebrow" fallback={aboutContentDefaults["services.eyebrow"]} className="text-center text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--teal)] sm:text-sm" />
          <CmsText as="h2" field="services.heading" fallback={aboutContentDefaults["services.heading"]} className="display-heading mx-auto mt-3 max-w-3xl text-center text-4xl sm:text-5xl" />
          <div className="mt-9 grid gap-5 md:grid-cols-2">
            {services.map((service, index) => (
              <article
                key={index}
                className="flex flex-col rounded-[1.75rem] border border-[var(--card-border)] bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)] sm:p-7"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--teal-soft)] text-[var(--teal)]">
                  <service.icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="mt-6 text-2xl font-extrabold text-[var(--navy)]">
                  <CmsText field={`services.item${index + 1}Title`} fallback={aboutContentDefaults[`services.item${index + 1}Title`]} />
                </h3>
                <p className="mt-3 flex-1 leading-7 text-slate-600">
                  <CmsText field={`services.item${index + 1}Body`} fallback={aboutContentDefaults[`services.item${index + 1}Body`]} />
                </p>
                <CmsLink
                  labelField={`services.item${index + 1}Label`}
                  hrefField={`services.item${index + 1}Href`}
                  fallbackLabel={aboutContentDefaults[`services.item${index + 1}Label`]}
                  fallbackHref={aboutContentDefaults[`services.item${index + 1}Href`]}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-[var(--teal)]"
                >
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </CmsLink>
              </article>
            ))}
          </div>
        </div>
      </CmsSection>

      <CmsSection sectionId="safety" label="Safety details" className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8">
          <div>
            <CmsText as="p" field="safety.eyebrow" fallback={aboutContentDefaults["safety.eyebrow"]} className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--teal)] sm:text-sm" />
            <CmsText as="h2" field="safety.heading" fallback={aboutContentDefaults["safety.heading"]} className="display-heading mt-3 text-4xl sm:text-5xl" />
            <CmsText as="p" field="safety.body" fallback={aboutContentDefaults["safety.body"]} className="mt-5 max-w-2xl text-base leading-8 text-slate-600" />
          </div>
          <div className="rounded-[2rem] bg-[var(--navy)] p-6 text-white shadow-[0_22px_55px_rgba(15,23,42,0.18)] sm:p-8">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-7 w-7 text-teal-200" aria-hidden="true" />
              <CmsText as="h3" field="safety.cardHeading" fallback={aboutContentDefaults["safety.cardHeading"]} className="text-xl font-extrabold" />
            </div>
            <ul className="mt-6 space-y-4 text-sm leading-6 text-slate-200">
              {[1, 2, 3, 4].map((number) => (
                <li key={number} className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal-300" aria-hidden="true" />
                  <CmsText field={`safety.item${number}`} fallback={aboutContentDefaults[`safety.item${number}`]} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CmsSection>

      <CmsSection sectionId="mission" label="Mission" className="overflow-hidden bg-[var(--navy)] text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <CmsText as="p" field="mission.eyebrow" fallback={aboutContentDefaults["mission.eyebrow"]} className="text-xs font-extrabold uppercase tracking-[0.18em] text-teal-300 sm:text-sm" />
            <CmsText as="h2" field="mission.heading" fallback={aboutContentDefaults["mission.heading"]} className="mt-4 text-4xl font-extrabold tracking-[-0.04em] sm:text-6xl" />
            <CmsText as="p" field="mission.body" fallback={aboutContentDefaults["mission.body"]} className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg" />
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            <article className="rounded-[1.75rem] border border-white/15 bg-white/[0.06] p-6 sm:p-8">
              <CmsText as="p" field="mission.todayEyebrow" fallback={aboutContentDefaults["mission.todayEyebrow"]} className="text-xs font-extrabold uppercase tracking-[0.16em] text-teal-300" />
              <CmsText as="h3" field="mission.todayHeading" fallback={aboutContentDefaults["mission.todayHeading"]} className="mt-3 text-2xl font-extrabold" />
              <CmsText as="p" field="mission.todayBody" fallback={aboutContentDefaults["mission.todayBody"]} className="mt-4 leading-7 text-slate-300" />
            </article>
            <article className="rounded-[1.75rem] border border-teal-300/30 bg-teal-300/[0.08] p-6 sm:p-8">
              <CmsText as="p" field="mission.futureEyebrow" fallback={aboutContentDefaults["mission.futureEyebrow"]} className="text-xs font-extrabold uppercase tracking-[0.16em] text-teal-300" />
              <CmsText as="h3" field="mission.futureHeading" fallback={aboutContentDefaults["mission.futureHeading"]} className="mt-3 text-2xl font-extrabold" />
              <CmsText as="p" field="mission.futureBody" fallback={aboutContentDefaults["mission.futureBody"]} className="mt-4 leading-7 text-slate-300" />
            </article>
          </div>
        </div>
      </CmsSection>

      <CmsSection sectionId="facts" label="Company facts" className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <CmsText as="p" field="facts.eyebrow" fallback={aboutContentDefaults["facts.eyebrow"]} className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--teal)] sm:text-sm" />
          <CmsText as="h2" field="facts.heading" fallback={aboutContentDefaults["facts.heading"]} className="display-heading mt-3 text-4xl sm:text-5xl" />
          <dl className="mt-8 divide-y divide-slate-200 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-50">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((number) => (
              <div key={number} className="grid gap-1 p-5 sm:grid-cols-[12rem_1fr] sm:gap-5 sm:p-6">
                <dt className="text-sm font-extrabold text-[var(--navy)]"><CmsText field={`facts.item${number}Term`} fallback={aboutContentDefaults[`facts.item${number}Term`]} /></dt>
                <dd className="text-sm leading-6 text-slate-600"><CmsText field={`facts.item${number}Detail`} fallback={aboutContentDefaults[`facts.item${number}Detail`]} /></dd>
              </div>
            ))}
          </dl>
        </div>
      </CmsSection>

      <CmsSection sectionId="faq" label="About FAQ" className="bg-[#f0fdf9]">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <CmsText as="p" field="faq.eyebrow" fallback={aboutContentDefaults["faq.eyebrow"]} className="text-center text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--teal)] sm:text-sm" />
          <CmsText as="h2" field="faq.heading" fallback={aboutContentDefaults["faq.heading"]} className="display-heading mt-3 text-center text-4xl sm:text-5xl" />
          <div className="mt-8 grid gap-4">
            {aboutFaqs.map((item, index) => (
              <details
                key={item.question}
                className="group rounded-[1.4rem] border border-[var(--card-border)] bg-white p-5 open:shadow-sm sm:p-6"
              >
                <summary className="cursor-pointer list-none pr-7 text-base font-extrabold text-[var(--navy)] marker:content-none">
                  <CmsText field={`faq.question${index + 1}`} fallback={aboutContentDefaults[`faq.question${index + 1}`]} />
                </summary>
                <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600">
                  <CmsText field={`faq.answer${index + 1}`} fallback={aboutContentDefaults[`faq.answer${index + 1}`]} />
                </p>
              </details>
            ))}
          </div>
        </div>
      </CmsSection>

      <CmsSection sectionId="cta" label="Call to action" className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="rounded-[2rem] bg-[var(--teal)] p-7 text-white sm:p-10 lg:flex lg:items-center lg:justify-between lg:gap-8">
            <div>
              <CmsText as="p" field="cta.eyebrow" fallback={aboutContentDefaults["cta.eyebrow"]} className="text-sm font-extrabold uppercase tracking-[0.16em] text-teal-100" />
              <CmsText as="h2" field="cta.heading" fallback={aboutContentDefaults["cta.heading"]} className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl" />
              <CmsText as="p" field="cta.body" fallback={aboutContentDefaults["cta.body"]} className="mt-3 max-w-2xl leading-7 text-teal-50" />
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:mt-0">
              <CmsLink
                labelField="cta.primaryLabel"
                hrefField="cta.primaryHref"
                fallbackLabel={aboutContentDefaults["cta.primaryLabel"]}
                fallbackHref={aboutContentDefaults["cta.primaryHref"]}
                target="_blank"
                rel="noreferrer"
                className="btn-primary w-full px-6 sm:w-auto"
              />
              <CmsLink labelField="cta.secondaryLabel" hrefField="cta.secondaryHref" fallbackLabel={aboutContentDefaults["cta.secondaryLabel"]} fallbackHref={aboutContentDefaults["cta.secondaryHref"]} className="btn-secondary w-full px-6 sm:w-auto">
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </CmsLink>
              <CmsLink labelField="cta.tertiaryLabel" hrefField="cta.tertiaryHref" fallbackLabel={aboutContentDefaults["cta.tertiaryLabel"]} fallbackHref={aboutContentDefaults["cta.tertiaryHref"]} className="btn-secondary w-full px-6 sm:w-auto" />
            </div>
          </div>
        </div>
      </CmsSection>
    </main>
    </WebsiteContentRuntime>
  );
}
