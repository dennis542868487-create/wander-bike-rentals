import type { Metadata } from "next";
import { ArrowRight, Bike } from "lucide-react";
import {
  CmsImage,
  CmsLink,
  CmsSection,
  CmsText,
  WebsiteContentRuntime,
} from "@/components/website-cms/content-runtime";
import { pricingContentDefaults } from "@/lib/website-cms/pages/pricing";
import { getWebsitePageRenderState } from "@/lib/website-cms/server";

export const metadata: Metadata = {
  title: "Wander Bike Rental Pricing",
  description:
    "See Wander Bike Rentals shop rates for adult bikes, kids bikes, and trailers. Bike sale prices vary by individual listing.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Wander Bike Rental Pricing | Steveston, Richmond",
    description:
      "Compare Wander Bike shop rental rates, then open Find a Bike to see individual bikes and sale prices.",
    url: "https://www.wanderbike.ca/pricing",
  },
};

const rentalOptions = [
  {
    id: "adult",
    labels: ["Per hour", "Half day", "Full day · 24 hr"],
    rateKeys: ["rates.adultHourly", "rates.adultHalfDay", "rates.adultFullDay"],
  },
  {
    id: "kids",
    labels: ["Per hour", "Half day", "Full day · 24 hr"],
    rateKeys: ["rates.kidsHourly", "rates.kidsHalfDay", "rates.kidsFullDay"],
  },
  {
    id: "trailer",
    labels: ["Per hour", "Half day", "Full day · 24 hr"],
    rateKeys: [
      "rates.trailerHourly",
      "rates.trailerHalfDay",
      "rates.trailerFullDay",
    ],
  },
] as const;

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ websitePreview?: string }>;
}) {
  const { content, previewMode } = await getWebsitePageRenderState(
    "pricing",
    searchParams,
  );

  return (
    <WebsiteContentRuntime initialContent={content} previewMode={previewMode}>
    <main data-website-preview={previewMode ? "true" : undefined} className="bg-white text-slate-900">
      <CmsSection sectionId="hero" label="Hero" className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-[90rem] lg:min-h-[39rem] lg:grid-cols-[0.92fr_1.08fr]">
          <div className="motion-rise flex items-center px-5 py-14 sm:px-8 sm:py-20 lg:px-14 xl:px-20">
            <div className="max-w-xl">
              <CmsText as="p" field="hero.eyebrow" fallback={pricingContentDefaults["hero.eyebrow"]} className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700" />
              <CmsText as="h1" field="hero.heading" fallback={pricingContentDefaults["hero.heading"]} className="mt-6 text-[2.8rem] font-bold leading-[0.98] tracking-[-0.055em] text-slate-950 sm:text-6xl lg:text-[4.3rem]" />
              <CmsText as="p" field="hero.body" fallback={pricingContentDefaults["hero.body"]} className="mt-7 text-base leading-8 text-slate-600 sm:text-lg" />
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <CmsLink
                  labelField="hero.primaryLabel"
                  hrefField="hero.primaryHref"
                  fallbackLabel={pricingContentDefaults["hero.primaryLabel"]}
                  fallbackHref={pricingContentDefaults["hero.primaryHref"]}
                  className="editorial-button editorial-button-primary w-full sm:w-auto"
                >
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </CmsLink>
                <CmsLink
                  labelField="hero.secondaryLabel"
                  hrefField="hero.secondaryHref"
                  fallbackLabel={pricingContentDefaults["hero.secondaryLabel"]}
                  fallbackHref={pricingContentDefaults["hero.secondaryHref"]}
                  className="editorial-button editorial-button-secondary w-full sm:w-auto"
                />
              </div>
            </div>
          </div>

          <div className="motion-rise motion-rise-delay-1 grid min-h-[34rem] grid-rows-[1fr_auto] border-t border-slate-200 bg-[#effcf9] lg:min-h-0 lg:border-l lg:border-t-0">
            <div className="relative min-h-[25rem] overflow-hidden">
              <CmsImage
                srcField="hero.imageSrc"
                altField="hero.imageAlt"
                fallbackSrc={pricingContentDefaults["hero.imageSrc"]}
                fallbackAlt={pricingContentDefaults["hero.imageAlt"]}
                fill
                priority
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="object-cover object-center"
              />
            </div>
            <div className="border-t border-teal-900/15 px-5 py-7 sm:px-8 lg:px-10">
              <CmsText as="p" field="hero.rateEyebrow" fallback={pricingContentDefaults["hero.rateEyebrow"]} className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700" />
              <div className="mt-5 grid grid-cols-1 divide-y divide-teal-900/15 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                {rentalOptions.map((option) => (
                  <div key={option.id} className="py-4 sm:px-5 sm:py-0 first:pl-0">
                    <CmsText as="p" field={`rates.${option.id}Name`} fallback={pricingContentDefaults[`rates.${option.id}Name`]} className="text-sm font-semibold text-slate-800" />
                    <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                      <CmsText field={option.rateKeys[0]} fallback={pricingContentDefaults[option.rateKeys[0]]} />
                      <span className="ml-1 text-xs font-medium text-slate-500">/hour</span>
                    </p>
                  </div>
                ))}
              </div>
              <CmsText as="p" field="hero.rateNote" fallback={pricingContentDefaults["hero.rateNote"]} className="mt-5 max-w-2xl text-xs leading-5 text-slate-600" />
            </div>
          </div>
        </div>
      </CmsSection>

      <CmsSection sectionId="rates" label="Rental rates" className="bg-white">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
          <div className="grid gap-6 border-b border-slate-300 pb-8 lg:grid-cols-[1fr_0.78fr] lg:items-end">
            <div>
              <CmsText as="p" field="rates.eyebrow" fallback={pricingContentDefaults["rates.eyebrow"]} className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700" />
              <CmsText as="h2" field="rates.heading" fallback={pricingContentDefaults["rates.heading"]} className="mt-3 text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl" />
            </div>
            <CmsText as="p" field="rates.body" fallback={pricingContentDefaults["rates.body"]} className="text-sm leading-7 text-slate-600" />
          </div>

          <div className="mt-8 overflow-x-auto border-b border-slate-300">
            <table className="w-full min-w-[760px] table-fixed border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-300 bg-[#effcf9]">
                  <th className="w-[20%] px-5 py-5 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                    Rental type
                  </th>
                  {rentalOptions.map((option) => (
                    <th
                      key={option.id}
                      scope="col"
                      className="border-l border-slate-200 px-5 py-5"
                    >
                      <span className="flex items-center gap-3 text-sm font-bold uppercase tracking-[0.08em] text-slate-950">
                        <Bike className="h-5 w-5 text-teal-700" aria-hidden="true" />
                        <CmsText field={`rates.${option.id}Name`} fallback={pricingContentDefaults[`rates.${option.id}Name`]} />
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-200 align-top">
                  <th scope="row" className="px-5 py-5 text-sm font-semibold text-slate-800">
                    Best for
                  </th>
                  {rentalOptions.map((option) => (
                    <td key={option.id} className="border-l border-slate-200 px-5 py-5 text-sm leading-6 text-slate-600">
                      <CmsText field={`rates.${option.id}Body`} fallback={pricingContentDefaults[`rates.${option.id}Body`]} />
                    </td>
                  ))}
                </tr>
                {rentalOptions[0].labels.map((label, rateIndex) => (
                  <tr key={label} className="border-b border-slate-200">
                    <th scope="row" className="px-5 py-5 text-sm font-semibold text-slate-800">
                      {label}
                    </th>
                    {rentalOptions.map((option) => (
                      <td key={option.id} className="border-l border-slate-200 px-5 py-5 text-xl font-bold text-teal-700">
                        <CmsText field={option.rateKeys[rateIndex]} fallback={pricingContentDefaults[option.rateKeys[rateIndex]]} />
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <th scope="row" className="px-5 py-5 text-sm font-semibold text-slate-800">
                    Details
                  </th>
                  {rentalOptions.map((option) => (
                    <td key={option.id} className="border-l border-slate-200 px-5 py-5">
                      <CmsLink labelField="rates.detailsLabel" hrefField={`rates.${option.id}Href`} fallbackLabel={pricingContentDefaults["rates.detailsLabel"]} fallbackHref={pricingContentDefaults[`rates.${option.id}Href`]} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-950 hover:text-teal-700">
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </CmsLink>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </CmsSection>

      <CmsSection sectionId="clarity" label="Price clarity" className="bg-slate-950 text-white">
        <div className="mx-auto grid max-w-6xl divide-y divide-white/15 px-5 sm:px-8 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
          <article className="py-12 lg:pr-14">
            <div className="h-0.5 w-10 bg-teal-400" />
            <CmsText as="h2" field="clarity.wanderHeading" fallback={pricingContentDefaults["clarity.wanderHeading"]} className="mt-6 text-2xl font-semibold tracking-tight" />
            <CmsText as="p" field="clarity.wanderBody" fallback={pricingContentDefaults["clarity.wanderBody"]} className="mt-4 max-w-xl leading-7 text-slate-300" />
          </article>
          <article className="py-12 lg:pl-14">
            <div className="h-0.5 w-10 bg-teal-400" />
            <CmsText as="h2" field="clarity.communityHeading" fallback={pricingContentDefaults["clarity.communityHeading"]} className="mt-6 text-2xl font-semibold tracking-tight" />
            <CmsText as="p" field="clarity.communityBody" fallback={pricingContentDefaults["clarity.communityBody"]} className="mt-4 max-w-xl leading-7 text-slate-300" />
          </article>
        </div>
      </CmsSection>

      <CmsSection sectionId="cta" label="Call to action" className="border-b border-teal-900/15 bg-[#effcf9]">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-center lg:py-16">
          <div className="border-l-2 border-teal-600 pl-6">
            <CmsText as="p" field="cta.eyebrow" fallback={pricingContentDefaults["cta.eyebrow"]} className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700" />
            <CmsText as="h2" field="cta.heading" fallback={pricingContentDefaults["cta.heading"]} className="mt-3 text-3xl font-bold tracking-[-0.03em] text-slate-950" />
            <CmsText as="p" field="cta.body" fallback={pricingContentDefaults["cta.body"]} className="mt-3 max-w-2xl leading-7 text-slate-600" />
          </div>
          <CmsLink labelField="cta.label" hrefField="cta.href" fallbackLabel={pricingContentDefaults["cta.label"]} fallbackHref={pricingContentDefaults["cta.href"]} className="editorial-button editorial-button-primary w-full px-8 lg:w-auto">
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </CmsLink>
        </div>
      </CmsSection>
    </main>
    </WebsiteContentRuntime>
  );
}
