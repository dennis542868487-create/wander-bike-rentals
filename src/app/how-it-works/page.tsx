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
import {
  CmsImage,
  CmsLink,
  CmsSection,
  CmsText,
  WebsiteContentRuntime,
} from "@/components/website-cms/content-runtime";
import { howItWorksContentDefaults } from "@/lib/website-cms/pages/how-it-works";
import { getWebsitePageRenderState } from "@/lib/website-cms/server";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Learn how local bike rentals and purchase inquiries work on Wander Bike.",
};

const steps = [
  {
    icon: Search,
  },
  {
    icon: CalendarCheck,
  },
  {
    icon: MessageSquareText,
  },
  {
    icon: HandCoins,
  },
];

export default async function HowItWorksPage({
  searchParams,
}: {
  searchParams: Promise<{ websitePreview?: string }>;
}) {
  const { content, previewMode } = await getWebsitePageRenderState(
    "how-it-works",
    searchParams,
  );

  return (
    <WebsiteContentRuntime initialContent={content} previewMode={previewMode}>
    <main data-website-preview={previewMode ? "true" : undefined} className="bg-[var(--background)]">
      <CmsSection sectionId="hero" label="Hero" className="route-wash overflow-hidden border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-7 px-4 py-8 sm:px-6 sm:py-10 lg:min-h-[36rem] lg:grid-cols-[0.92fr_1.08fr] lg:gap-10 lg:px-8 lg:py-14">
          <div className="motion-rise max-w-2xl">
            <p className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--teal)]">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              <CmsText field="hero.eyebrow" fallback={howItWorksContentDefaults["hero.eyebrow"]} />
            </p>
            <h1 className="display-heading mt-4 text-[2.65rem] leading-[0.98] sm:text-6xl lg:text-7xl">
              <CmsText field="hero.heading" fallback={howItWorksContentDefaults["hero.heading"]} />
              <CmsText as="span" field="hero.highlight" fallback={howItWorksContentDefaults["hero.highlight"]} className="block text-[var(--teal)]" />
            </h1>
            <CmsText as="p" field="hero.body" fallback={howItWorksContentDefaults["hero.body"]} className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:mt-6 sm:text-lg sm:leading-8" />
          </div>
          <div className="photo-arch-right motion-rise motion-rise-delay-1 relative min-h-[12rem] overflow-hidden bg-slate-100 sm:min-h-[20rem] lg:min-h-[31rem]">
            <CmsImage
              srcField="hero.imageSrc"
              altField="hero.imageAlt"
              fallbackSrc={howItWorksContentDefaults["hero.imageSrc"]}
              fallbackAlt={howItWorksContentDefaults["hero.imageAlt"]}
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
      </CmsSection>

      <CmsSection sectionId="collections" label="Collections" className="border-b border-slate-200 bg-[#f0fdf9]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-2 px-4 py-5 sm:gap-3 sm:px-6 sm:py-8 lg:px-8">
          <CmsLink
            labelField="collections.wanderTitle"
            hrefField="collections.wanderHref"
            fallbackLabel={howItWorksContentDefaults["collections.wanderTitle"]}
            fallbackHref={howItWorksContentDefaults["collections.wanderHref"]}
            showLabel={false}
            className="group flex flex-col items-start gap-2 rounded-2xl border border-slate-300 bg-white p-3 transition hover:border-[var(--teal)] sm:flex-row sm:items-center sm:gap-4 sm:p-5"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--teal-soft)] text-[var(--teal)] sm:h-12 sm:w-12">
              <Store className="h-4 w-4 sm:h-6 sm:w-6" aria-hidden="true" />
            </span>
            <span>
              <CmsText as="strong" field="collections.wanderTitle" fallback={howItWorksContentDefaults["collections.wanderTitle"]} className="block text-sm text-[var(--navy)] sm:text-lg" />
              <CmsText as="span" field="collections.wanderBody" fallback={howItWorksContentDefaults["collections.wanderBody"]} className="mt-1 hidden text-sm text-slate-600 sm:block" />
            </span>
            <ArrowRight className="hidden h-5 w-5 text-[var(--teal)] transition group-hover:translate-x-1 sm:ml-auto sm:block" aria-hidden="true" />
          </CmsLink>
          <CmsLink
            labelField="collections.communityTitle"
            hrefField="collections.communityHref"
            fallbackLabel={howItWorksContentDefaults["collections.communityTitle"]}
            fallbackHref={howItWorksContentDefaults["collections.communityHref"]}
            showLabel={false}
            className="group flex flex-col items-start gap-2 rounded-2xl border border-slate-300 bg-white p-3 transition hover:border-[var(--green)] sm:flex-row sm:items-center sm:gap-4 sm:p-5"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eef6df] text-[var(--green)] sm:h-12 sm:w-12">
              <UsersRound className="h-4 w-4 sm:h-6 sm:w-6" aria-hidden="true" />
            </span>
            <span>
              <CmsText as="strong" field="collections.communityTitle" fallback={howItWorksContentDefaults["collections.communityTitle"]} className="block text-sm text-[var(--navy)] sm:text-lg" />
              <CmsText as="span" field="collections.communityBody" fallback={howItWorksContentDefaults["collections.communityBody"]} className="mt-1 hidden text-sm text-slate-600 sm:block" />
            </span>
            <ArrowRight className="hidden h-5 w-5 text-[var(--green)] transition group-hover:translate-x-1 sm:ml-auto sm:block" aria-hidden="true" />
          </CmsLink>
        </div>
      </CmsSection>

      <CmsSection sectionId="journey" label="Request journey" className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-9 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[0.65fr_1.35fr] lg:gap-10 lg:px-8 lg:py-20">
          <div>
            <CmsText as="p" field="journey.eyebrow" fallback={howItWorksContentDefaults["journey.eyebrow"]} className="text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--teal)]" />
            <CmsText as="h2" field="journey.heading" fallback={howItWorksContentDefaults["journey.heading"]} className="display-heading mt-3 text-4xl sm:text-5xl" />
            <CmsText as="p" field="journey.body" fallback={howItWorksContentDefaults["journey.body"]} className="mt-5 max-w-md leading-7 text-slate-600" />
          </div>
          <ol className="border-t border-slate-200">
          {steps.map((step, index) => (
            <li
              key={index}
              className="grid grid-cols-[2.5rem_1fr] gap-4 border-b border-slate-200 py-6 sm:grid-cols-[4.25rem_3rem_1fr] sm:items-start sm:gap-5 sm:py-7"
            >
              <span className="text-3xl font-black text-[var(--green)]">
                0{index + 1}
              </span>
              <span className="hidden h-11 w-11 items-center justify-center rounded-full bg-[var(--teal-soft)] text-[var(--teal)] sm:flex">
                <step.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <CmsText as="h3" field={`journey.step${index + 1}Title`} fallback={howItWorksContentDefaults[`journey.step${index + 1}Title`]} className="text-xl font-extrabold text-[var(--navy)]" />
                <CmsText as="p" field={`journey.step${index + 1}Body`} fallback={howItWorksContentDefaults[`journey.step${index + 1}Body`]} className="mt-2 leading-7 text-slate-600" />
              </div>
            </li>
          ))}
          </ol>
        </div>
      </CmsSection>

      <CmsSection sectionId="cta" label="Call to action" className="bg-[var(--navy)] text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-7 px-4 py-12 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-14">
          <div>
            <CmsText as="p" field="cta.eyebrow" fallback={howItWorksContentDefaults["cta.eyebrow"]} className="text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--orange)]" />
            <CmsText as="h2" field="cta.heading" fallback={howItWorksContentDefaults["cta.heading"]} className="mt-2 text-3xl font-extrabold tracking-tight" />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <CmsLink labelField="cta.primaryLabel" hrefField="cta.primaryHref" fallbackLabel={howItWorksContentDefaults["cta.primaryLabel"]} fallbackHref={howItWorksContentDefaults["cta.primaryHref"]} className="btn-primary w-full px-6 sm:w-auto" />
            <CmsLink
              labelField="cta.secondaryLabel"
              hrefField="cta.secondaryHref"
              fallbackLabel={howItWorksContentDefaults["cta.secondaryLabel"]}
              fallbackHref={howItWorksContentDefaults["cta.secondaryHref"]}
              className="btn-outline-light w-full px-6 sm:w-auto"
            />
          </div>
        </div>
      </CmsSection>
    </main>
    </WebsiteContentRuntime>
  );
}
