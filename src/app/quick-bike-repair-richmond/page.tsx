import type { Metadata } from "next";
import {
  CmsImage,
  CmsLink,
  CmsSection,
  CmsText,
  WebsiteContentRuntime,
} from "@/components/website-cms/content-runtime";
import { quickRepairContentDefaults } from "@/lib/website-cms/pages/quick-repair";
import { getWebsitePageRenderState } from "@/lib/website-cms/server";

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

const repairServices = [
  1, 2, 3, 4, 5, 6,
] as const;

export default async function QuickBikeRepairRichmondPage({
  searchParams,
}: {
  searchParams: Promise<{ websitePreview?: string }>;
}) {
  const { content, previewMode } = await getWebsitePageRenderState(
    "quick-repair",
    searchParams,
  );

  return (
    <WebsiteContentRuntime initialContent={content} previewMode={previewMode}>
    <main data-website-preview={previewMode ? "true" : undefined} className="bg-white text-slate-900">
      <CmsSection sectionId="hero" label="Hero" className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-[90rem] lg:grid-cols-[0.9fr_1.1fr]">
          <div className="motion-rise px-5 py-14 sm:px-8 sm:py-20 lg:px-14 xl:px-20">
            <div className="flex items-center gap-4 text-sm font-semibold text-slate-700">
              <CmsText field="hero.kicker" fallback={quickRepairContentDefaults["hero.kicker"]} />
              <span className="h-px w-14 bg-teal-600" aria-hidden="true" />
            </div>
            <CmsText as="p" field="hero.eyebrow" fallback={quickRepairContentDefaults["hero.eyebrow"]} className="mt-9 text-xs font-bold uppercase tracking-[0.2em] text-teal-700" />
            <CmsText as="h1" field="hero.heading" fallback={quickRepairContentDefaults["hero.heading"]} className="mt-4 text-[2.7rem] font-bold leading-[1.02] tracking-[-0.05em] text-slate-950 sm:text-6xl lg:text-[4rem]" />
            <CmsText as="p" field="hero.body1" fallback={quickRepairContentDefaults["hero.body1"]} className="mt-7 max-w-xl text-base leading-8 text-slate-700 sm:text-lg" />
            <CmsText as="p" field="hero.body2" fallback={quickRepairContentDefaults["hero.body2"]} className="mt-3 max-w-xl text-base leading-8 text-slate-600" />
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <CmsLink labelField="hero.primaryLabel" hrefField="hero.primaryHref" fallbackLabel={quickRepairContentDefaults["hero.primaryLabel"]} fallbackHref={quickRepairContentDefaults["hero.primaryHref"]} className="editorial-button editorial-button-primary w-full sm:w-auto" />
              <CmsLink labelField="hero.secondaryLabel" hrefField="hero.secondaryHref" fallbackLabel={quickRepairContentDefaults["hero.secondaryLabel"]} fallbackHref={quickRepairContentDefaults["hero.secondaryHref"]} className="editorial-button editorial-button-secondary w-full sm:w-auto" />
            </div>
          </div>

          <div className="motion-rise motion-rise-delay-1 flex items-center border-t border-slate-200 bg-[#c9f1ec] lg:border-l lg:border-t-0">
            <CmsImage
              srcField="hero.imageSrc"
              altField="hero.imageAlt"
              fallbackSrc={quickRepairContentDefaults["hero.imageSrc"]}
              fallbackAlt={quickRepairContentDefaults["hero.imageAlt"]}
              width={1586}
              height={992}
              priority
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="h-auto w-full"
            />
          </div>
        </div>
      </CmsSection>

      <CmsSection sectionId="services" label="Services" className="bg-white">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
          <div className="grid gap-6 border-b border-slate-300 pb-8 lg:grid-cols-[1fr_0.72fr] lg:items-end">
            <div>
              <CmsText as="p" field="services.eyebrow" fallback={quickRepairContentDefaults["services.eyebrow"]} className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700" />
              <CmsText as="h2" field="services.heading" fallback={quickRepairContentDefaults["services.heading"]} className="mt-3 max-w-2xl text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl" />
            </div>
            <CmsText as="p" field="services.body" fallback={quickRepairContentDefaults["services.body"]} className="text-sm leading-7 text-slate-600" />
          </div>

          <div className="mt-6 grid lg:grid-cols-2 lg:divide-x lg:divide-slate-300">
            {[repairServices.slice(0, 3), repairServices.slice(3)].map((column, columnIndex) => (
              <div key={columnIndex} className={columnIndex === 0 ? "lg:pr-10" : "lg:pl-10"}>
                {column.map((number) => {
                  return (
                    <article key={number} className="grid grid-cols-[4rem_1fr] gap-5 border-b border-slate-200 py-8 sm:grid-cols-[5rem_1fr]">
                      <p className="text-5xl font-light leading-none tracking-[-0.06em] text-teal-700">
                        {String(number).padStart(2, "0")}
                      </p>
                      <div>
                        <CmsText as="h3" field={`services.item${number}Title`} fallback={quickRepairContentDefaults[`services.item${number}Title`]} className="text-base font-semibold leading-6 text-slate-950" />
                        <CmsText as="p" field={`services.item${number}Body`} fallback={quickRepairContentDefaults[`services.item${number}Body`]} className="mt-3 text-sm leading-7 text-slate-600" />
                      </div>
                    </article>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </CmsSection>

      <CmsSection sectionId="expectations" label="What to expect" className="grid border-y border-slate-200 lg:grid-cols-2">
        <div className="bg-[#effcf9] px-5 py-14 sm:px-8 lg:px-14 lg:py-20 xl:pl-[max(3.5rem,calc((100vw-72rem)/2))]">
          <CmsText as="p" field="expectations.walkInEyebrow" fallback={quickRepairContentDefaults["expectations.walkInEyebrow"]} className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700" />
          <CmsText as="h2" field="expectations.walkInHeading" fallback={quickRepairContentDefaults["expectations.walkInHeading"]} className="mt-4 max-w-xl text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl" />
          <div className="mt-6 max-w-xl space-y-4 text-base leading-8 text-slate-600">
            <CmsText as="p" field="expectations.walkInBody1" fallback={quickRepairContentDefaults["expectations.walkInBody1"]} />
            <CmsText as="p" field="expectations.walkInBody2" fallback={quickRepairContentDefaults["expectations.walkInBody2"]} />
          </div>
        </div>

        <div className="bg-slate-950 px-5 py-14 text-white sm:px-8 lg:px-14 lg:py-20 xl:pr-[max(3.5rem,calc((100vw-72rem)/2))]">
          <CmsText as="p" field="expectations.inspectionEyebrow" fallback={quickRepairContentDefaults["expectations.inspectionEyebrow"]} className="text-xs font-bold uppercase tracking-[0.2em] text-teal-300" />
          <CmsText as="h2" field="expectations.inspectionHeading" fallback={quickRepairContentDefaults["expectations.inspectionHeading"]} className="mt-4 max-w-xl text-3xl font-bold tracking-[-0.035em] text-white sm:text-4xl" />
          <div className="mt-6 max-w-xl space-y-4 text-base leading-8 text-slate-300">
            <CmsText as="p" field="expectations.inspectionBody1" fallback={quickRepairContentDefaults["expectations.inspectionBody1"]} />
            <CmsText as="p" field="expectations.inspectionBody2" fallback={quickRepairContentDefaults["expectations.inspectionBody2"]} />
          </div>
        </div>
      </CmsSection>

      <CmsSection sectionId="cta" label="Call to action" className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-center lg:py-16">
          <div className="border-l-2 border-teal-600 pl-6">
            <CmsText as="p" field="cta.eyebrow" fallback={quickRepairContentDefaults["cta.eyebrow"]} className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700" />
            <CmsText as="h2" field="cta.heading" fallback={quickRepairContentDefaults["cta.heading"]} className="mt-3 text-3xl font-bold tracking-[-0.035em] text-slate-950" />
            <CmsText as="p" field="cta.body" fallback={quickRepairContentDefaults["cta.body"]} className="mt-3 max-w-2xl leading-7 text-slate-600" />
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <CmsLink labelField="cta.primaryLabel" hrefField="cta.primaryHref" fallbackLabel={quickRepairContentDefaults["cta.primaryLabel"]} fallbackHref={quickRepairContentDefaults["cta.primaryHref"]} className="editorial-button editorial-button-primary" />
            <CmsLink labelField="cta.locationLabel" hrefField="cta.locationHref" fallbackLabel={quickRepairContentDefaults["cta.locationLabel"]} fallbackHref={quickRepairContentDefaults["cta.locationHref"]} className="editorial-button editorial-button-secondary" />
            <CmsLink labelField="cta.faqLabel" hrefField="cta.faqHref" fallbackLabel={quickRepairContentDefaults["cta.faqLabel"]} fallbackHref={quickRepairContentDefaults["cta.faqHref"]} className="editorial-button editorial-button-secondary" />
          </div>
        </div>
      </CmsSection>
    </main>
    </WebsiteContentRuntime>
  );
}
