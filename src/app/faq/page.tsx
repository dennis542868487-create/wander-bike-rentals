import type { Metadata } from "next";
import {
  CmsImage,
  CmsLink,
  CmsSection,
  CmsText,
  WebsiteContentRuntime,
} from "@/components/website-cms/content-runtime";
import {
  faqContentDefaults,
  faqGroupSeeds,
} from "@/lib/website-cms/pages/faq";
import { getWebsitePageRenderState } from "@/lib/website-cms/server";

export const metadata: Metadata = {
  title: "Bike Rental, Marketplace & B.C. Cycling Guide FAQ",
  description:
    "Answers about Wander Bike Rentals in Steveston, Community Bikes, local pickup, offline payment, and 160 British Columbia cycling guides.",
  alternates: { canonical: "/faq" },
};

export default async function FaqPage({
  searchParams,
}: {
  searchParams: Promise<{ websitePreview?: string }>;
}) {
  const { content, previewMode } = await getWebsitePageRenderState(
    "faq",
    searchParams,
  );
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqGroupSeeds.flatMap((group) =>
      group.items.map((_, index) => ({
        "@type": "Question",
        name: content[`${group.id}.question${index + 1}`],
        acceptedAnswer: {
          "@type": "Answer",
          text: content[`${group.id}.answer${index + 1}`],
        },
      })),
    ),
  };

  return (
    <WebsiteContentRuntime initialContent={content} previewMode={previewMode}>
    <main data-website-preview={previewMode ? "true" : undefined} className="bg-[var(--background)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <CmsSection sectionId="hero" label="Hero" className="hero faq-hero relative isolate overflow-hidden border-b border-white/60">
        <CmsImage
          srcField="hero.imageSrc"
          altField="hero.imageAlt"
          fallbackSrc={faqContentDefaults["hero.imageSrc"]}
          fallbackAlt={faqContentDefaults["hero.imageAlt"]}
          fill
          priority
          sizes="100vw"
          className="faq-hero-image -z-10 object-cover"
        />
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:min-h-[38rem] lg:grid-cols-[0.9fr_1.1fr] lg:gap-10 lg:px-8 lg:py-20">
          <div className="faq-hero-copy motion-rise">
            <CmsText as="div" field="hero.badge" fallback={faqContentDefaults["hero.badge"]} className="inline-flex rounded-full border border-white/80 bg-white/38 px-4 py-2 text-sm font-semibold text-teal-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_24px_rgba(13,148,136,0.08)] backdrop-blur-xl" />
            <CmsText as="h1" field="hero.heading" fallback={faqContentDefaults["hero.heading"]} className="mt-5 text-[2.65rem] font-bold leading-[1.03] tracking-[-0.045em] text-slate-950 sm:mt-7 sm:text-6xl" />
            <CmsText as="p" field="hero.body" fallback={faqContentDefaults["hero.body"]} className="mt-5 max-w-xl text-base leading-7 text-slate-700 sm:mt-6 sm:text-lg sm:leading-8" />
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <CmsLink labelField="hero.primaryLabel" hrefField="hero.primaryHref" fallbackLabel={faqContentDefaults["hero.primaryLabel"]} fallbackHref={faqContentDefaults["hero.primaryHref"]} className="btn-brand w-full px-7 py-3.5 text-sm sm:w-auto" />
              <CmsLink
                labelField="hero.secondaryLabel"
                hrefField="hero.secondaryHref"
                fallbackLabel={faqContentDefaults["hero.secondaryLabel"]}
                fallbackHref={faqContentDefaults["hero.secondaryHref"]}
                className="hero-glass-button w-full px-7 py-3.5 text-sm sm:w-auto"
              />
            </div>
          </div>
          <div className="faq-glass-panel motion-rise motion-rise-delay-1 p-5 text-slate-900 sm:p-9">
            <CmsText as="p" field="hero.overviewEyebrow" fallback={faqContentDefaults["hero.overviewEyebrow"]} className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500" />
            <CmsText as="h2" field="hero.overviewHeading" fallback={faqContentDefaults["hero.overviewHeading"]} className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl" />
            <div className="mt-5 space-y-3 text-sm leading-7 text-slate-600 sm:mt-7 sm:space-y-4 sm:text-base sm:leading-8">
              {[1, 2, 3].map((number) => (
                <CmsText key={number} as="p" field={`hero.overviewBody${number}`} fallback={faqContentDefaults[`hero.overviewBody${number}`]} />
              ))}
            </div>
            <div className="liquid-glass-note mt-5 rounded-2xl p-4 text-sm leading-7 text-teal-950 sm:mt-7 sm:p-5">
              <CmsText field="hero.note" fallback={faqContentDefaults["hero.note"]} />
            </div>
          </div>
        </div>
      </CmsSection>
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        {faqGroupSeeds.map((group, index) => (
          <CmsSection as="div" sectionId={group.id} label={`${group.title} questions`} key={group.id} className={index === 0 ? "" : "mt-14"}>
            <div className="grid gap-4 sm:grid-cols-[0.7fr_1.3fr] sm:items-end">
              <CmsText as="h2" field={`${group.id}.heading`} fallback={faqContentDefaults[`${group.id}.heading`]} className="text-3xl font-bold tracking-tight text-slate-950" />
              <CmsText as="p" field={`${group.id}.body`} fallback={faqContentDefaults[`${group.id}.body`]} className="max-w-xl text-sm leading-7 text-slate-600" />
            </div>
            <div className="mt-7 divide-y divide-slate-200 overflow-hidden border-y border-slate-200 bg-white">
              {group.items.map((_, itemIndex) => (
                <details key={itemIndex} className="group px-5 py-5 sm:px-7 sm:py-6">
                  <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 font-bold text-slate-950 marker:hidden">
                    <CmsText field={`${group.id}.question${itemIndex + 1}`} fallback={faqContentDefaults[`${group.id}.question${itemIndex + 1}`]} />
                    <span className="shrink-0 text-xl leading-none text-teal-700 transition group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <CmsText as="p" field={`${group.id}.answer${itemIndex + 1}`} fallback={faqContentDefaults[`${group.id}.answer${itemIndex + 1}`]} className="mt-4 max-w-3xl text-sm leading-7 text-slate-600" />
                </details>
              ))}
            </div>
          </CmsSection>
        ))}
        <CmsSection as="div" sectionId="cta" label="Page links" className="mt-10 flex flex-col gap-3 sm:flex-row">
          <CmsLink labelField="cta.findLabel" hrefField="cta.findHref" fallbackLabel={faqContentDefaults["cta.findLabel"]} fallbackHref={faqContentDefaults["cta.findHref"]} className="btn-primary" />
          <CmsLink labelField="cta.listLabel" hrefField="cta.listHref" fallbackLabel={faqContentDefaults["cta.listLabel"]} fallbackHref={faqContentDefaults["cta.listHref"]} className="btn-secondary" />
          <CmsLink labelField="cta.guidesLabel" hrefField="cta.guidesHref" fallbackLabel={faqContentDefaults["cta.guidesLabel"]} fallbackHref={faqContentDefaults["cta.guidesHref"]} className="btn-secondary" />
          <CmsLink labelField="cta.locationLabel" hrefField="cta.locationHref" fallbackLabel={faqContentDefaults["cta.locationLabel"]} fallbackHref={faqContentDefaults["cta.locationHref"]} className="btn-quiet" />
        </CmsSection>
      </section>
    </main>
    </WebsiteContentRuntime>
  );
}
