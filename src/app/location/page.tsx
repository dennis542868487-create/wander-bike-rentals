import type { Metadata } from "next";
import {
  CmsImage,
  CmsLink,
  CmsSection,
  CmsText,
  WebsiteContentRuntime,
} from "@/components/website-cms/content-runtime";
import { wanderBusinessSchema } from "@/lib/seo/wander-business";
import { locationContentDefaults } from "@/lib/website-cms/pages/location";
import { getWebsitePageRenderState } from "@/lib/website-cms/server";

export const metadata: Metadata = {
  title: "Location and Contact",
  description:
    "Find Wander Bike Rentals in Steveston, Richmond. Get the address, phone number, hours, and directions.",
  alternates: {
    canonical: "/location",
  },
  openGraph: {
    title: "Location and Contact | Wander Bike Rentals",
    description:
      "Address, phone number, hours, and directions for Wander Bike Rentals in Steveston, Richmond.",
    url: "https://www.wanderbike.ca/location",
  },
};

const contactCards = ["address", "phone", "hours"] as const;

export default async function LocationPage({
  searchParams,
}: {
  searchParams: Promise<{ websitePreview?: string }>;
}) {
  const { content, previewMode } = await getWebsitePageRenderState(
    "location",
    searchParams,
  );

  return (
    <WebsiteContentRuntime initialContent={content} previewMode={previewMode}>
    <main data-website-preview={previewMode ? "true" : undefined} className="pb-20 text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(wanderBusinessSchema) }}
      />

      <CmsSection sectionId="hero" label="Hero" className="route-wash overflow-hidden border-b border-slate-200 bg-white">
        <div className="mx-auto grid min-h-[36rem] max-w-7xl items-center gap-10 px-6 py-12 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:py-14">
          <div className="motion-rise">
            <h1 className="display-heading text-5xl leading-[1] sm:text-6xl">
              <CmsText field="hero.heading" fallback={locationContentDefaults["hero.heading"]} />{" "}
              <CmsText as="span" field="hero.highlight" fallback={locationContentDefaults["hero.highlight"]} className="text-[var(--teal)]" />
            </h1>
            <CmsText as="p" field="hero.body" fallback={locationContentDefaults["hero.body"]} className="mt-6 max-w-xl text-lg leading-8 text-slate-600" />
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <CmsLink
                labelField="hero.primaryLabel"
                hrefField="hero.primaryHref"
                fallbackLabel={locationContentDefaults["hero.primaryLabel"]}
                fallbackHref={locationContentDefaults["hero.primaryHref"]}
                className="btn-primary px-6 py-3.5 text-sm no-underline"
              />
              <CmsLink
                labelField="hero.secondaryLabel"
                hrefField="hero.secondaryHref"
                fallbackLabel={locationContentDefaults["hero.secondaryLabel"]}
                fallbackHref={locationContentDefaults["hero.secondaryHref"]}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary px-6 py-3.5 text-sm no-underline"
              />
            </div>
            <dl className="mt-9 grid gap-4 border-t border-slate-200 pt-6 sm:grid-cols-3">
              {contactCards.map((item) => (
                <div key={item}>
                  <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500"><CmsText field={`hero.${item}Label`} fallback={locationContentDefaults[`hero.${item}Label`]} /></dt>
                  <dd className="mt-2 text-sm font-bold leading-6 text-[var(--navy)]"><CmsText field={`hero.${item}Value`} fallback={locationContentDefaults[`hero.${item}Value`]} /></dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="photo-arch-right motion-rise motion-rise-delay-1 relative min-h-[27rem] overflow-hidden bg-slate-100 lg:min-h-[32rem]">
            <CmsImage
              srcField="hero.imageSrc"
              altField="hero.imageAlt"
              fallbackSrc={locationContentDefaults["hero.imageSrc"]}
              fallbackAlt={locationContentDefaults["hero.imageAlt"]}
              fill
              priority
              sizes="(min-width: 1024px) 52vw, 100vw"
              className="object-cover"
            />
            <div
              className="absolute bottom-0 right-0 h-24 w-24 bg-[var(--orange)] [clip-path:polygon(100%_0,100%_100%,0_100%)]"
              aria-hidden="true"
            />
          </div>
        </div>
      </CmsSection>

      <CmsSection sectionId="map" label="Map" className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CmsText as="p" field="map.eyebrow" fallback={locationContentDefaults["map.eyebrow"]} className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700" />
            <CmsText as="h2" field="map.heading" fallback={locationContentDefaults["map.heading"]} className="mt-2 text-3xl font-bold tracking-tight text-slate-950" />
          </div>
          <CmsText as="p" field="map.body" fallback={locationContentDefaults["map.body"]} className="max-w-xl text-sm leading-7 text-slate-600" />
        </div>
        <div className="mt-8 overflow-hidden rounded-[2rem] border border-slate-200 shadow-[0_18px_50px_rgba(15,23,42,0.10)]">
          <iframe
            title="Map showing Wander Bike Rentals at 12071 First Ave #101, Richmond, BC"
            src="https://www.google.com/maps?q=12071%20First%20Ave%20%23101%2C%20Richmond%2C%20BC%20V7E%203M1&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-[340px] w-full border-0 sm:h-[440px]"
            allowFullScreen
          />
        </div>
      </CmsSection>

      <CmsSection sectionId="visit" label="Before you visit" className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <CmsText as="p" field="visit.eyebrow" fallback={locationContentDefaults["visit.eyebrow"]} className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700" />
            <CmsText as="h2" field="visit.heading" fallback={locationContentDefaults["visit.heading"]} className="mt-2 text-3xl font-bold tracking-tight text-slate-950" />
            <CmsText as="p" field="visit.body" fallback={locationContentDefaults["visit.body"]} className="mt-4 text-base leading-8 text-slate-600" />
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {contactCards.map((item) => (
                <div key={item} className="rounded-2xl bg-[#f0fdf9] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500"><CmsText field={`hero.${item}Label`} fallback={locationContentDefaults[`hero.${item}Label`]} /></p>
                  <p className="mt-2 text-sm font-medium text-slate-900"><CmsText field={`hero.${item}Value`} fallback={locationContentDefaults[`hero.${item}Value`]} /></p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,#ecfdf5_0%,#f0fdf9_100%)] p-8 shadow-sm">
            <CmsText as="p" field="visit.relatedEyebrow" fallback={locationContentDefaults["visit.relatedEyebrow"]} className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500" />
            <CmsText as="h2" field="visit.relatedHeading" fallback={locationContentDefaults["visit.relatedHeading"]} className="mt-2 text-2xl font-semibold text-slate-950" />
            <CmsText as="p" field="visit.relatedBody" fallback={locationContentDefaults["visit.relatedBody"]} className="mt-4 text-base leading-8 text-slate-600" />
            <div className="mt-8 flex flex-wrap gap-3">
              {(["home", "richmond", "steveston", "faq"] as const).map((item) => (
                <CmsLink key={item} labelField={`visit.${item}Label`} hrefField={`visit.${item}Href`} fallbackLabel={locationContentDefaults[`visit.${item}Label`]} fallbackHref={locationContentDefaults[`visit.${item}Href`]} className="btn-secondary px-4 py-2 text-sm" />
              ))}
            </div>
          </div>
        </div>
      </CmsSection>

      <CmsSection sectionId="repair" label="Quick repair" className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <CmsText as="p" field="repair.eyebrow" fallback={locationContentDefaults["repair.eyebrow"]} className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700" />
            <CmsText as="h2" field="repair.heading" fallback={locationContentDefaults["repair.heading"]} className="mt-2 text-3xl font-bold tracking-tight text-slate-950" />
            <CmsText as="p" field="repair.body1" fallback={locationContentDefaults["repair.body1"]} className="mt-4 text-base leading-8 text-slate-600" />
            <CmsText as="p" field="repair.body2" fallback={locationContentDefaults["repair.body2"]} className="mt-4 text-base leading-8 text-slate-600" />
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-8 shadow-[0_24px_60px_rgba(15,23,42,0.16)]">
            <CmsText as="p" field="repair.cardEyebrow" fallback={locationContentDefaults["repair.cardEyebrow"]} className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-300" />
            <CmsText as="h2" field="repair.cardHeading" fallback={locationContentDefaults["repair.cardHeading"]} className="mt-2 text-3xl font-bold tracking-tight text-white" />
            <CmsText as="p" field="repair.cardBody" fallback={locationContentDefaults["repair.cardBody"]} className="mt-4 text-base leading-8 text-slate-300" />
            <div className="mt-8 flex flex-wrap gap-3">
              <CmsLink labelField="repair.primaryLabel" hrefField="repair.primaryHref" fallbackLabel={locationContentDefaults["repair.primaryLabel"]} fallbackHref={locationContentDefaults["repair.primaryHref"]} className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-100" />
              <CmsLink labelField="repair.secondaryLabel" hrefField="repair.secondaryHref" fallbackLabel={locationContentDefaults["repair.secondaryLabel"]} fallbackHref={locationContentDefaults["repair.secondaryHref"]} className="btn-outline-light px-4 py-2 text-sm" />
            </div>
          </div>
        </div>
      </CmsSection>
    </main>
    </WebsiteContentRuntime>
  );
}
