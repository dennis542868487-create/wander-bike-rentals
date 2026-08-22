import type { Metadata } from "next";
import {
  ArrowRight,
  Clock3,
  MapPin,
  PhoneCall,
  ShieldCheck,
  Store,
  UsersRound,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { CompactListingCard } from "@/components/marketplace/compact-listing-card";
import ReviewsSection from "@/components/reviews-section";
import {
  CmsImage,
  CmsLink,
  CmsSection,
  CmsText,
  WebsiteContentRuntime,
} from "@/components/website-cms/content-runtime";
import { getFeaturedListings } from "@/lib/marketplace/data";
import { WANDER_SHOP_DIRECTIONS_URL } from "@/lib/marketplace/wander-shop";
import { wanderWebsiteSchema } from "@/lib/seo/wander-business";
import { homeContentDefaults } from "@/lib/website-cms/config";
import { getWebsitePageRenderState } from "@/lib/website-cms/server";

export const metadata: Metadata = {
  title: "Bike Rentals in Steveston & Local Bike Marketplace",
  description:
    "Wander Bike Rentals is a physical bike rental, sale, and quick repair shop in Steveston, Richmond, plus a local marketplace for owner-listed bikes.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Wander Bike Rentals | Steveston, Richmond",
    description:
      "Rent or buy from the Wander shop, or browse bikes listed separately by local owners.",
    url: "https://www.wanderbike.ca/",
  },
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ websitePreview?: string }>;
}) {
  const [wanderListings, communityListings, renderState] = await Promise.all([
    getFeaturedListings("wander", 3),
    getFeaturedListings("community", 3),
    getWebsitePageRenderState("home", searchParams),
  ]);
  const { content, previewMode } = renderState;

  return (
    <WebsiteContentRuntime
      initialContent={content}
      previewMode={previewMode}
    >
      <main data-website-preview={previewMode ? "true" : undefined}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(wanderWebsiteSchema),
          }}
        />
        <CmsSection
          sectionId="hero"
          label="Hero"
          className="hero relative isolate overflow-hidden border-b border-white/10"
        >
          <div className="absolute inset-0 -z-10">
            <CmsImage
              srcField="hero.imageSrc"
              altField="hero.imageAlt"
              fallbackSrc={homeContentDefaults["hero.imageSrc"]}
              fallbackAlt={homeContentDefaults["hero.imageAlt"]}
              fill
              preload
              sizes="100vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-950/76 to-emerald-950/68" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.28),transparent_46%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.16),transparent_40%)]" />
          </div>

          <div className="relative mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:min-h-[46rem] lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-10 lg:px-8 lg:py-20">
            <div className="motion-rise max-w-3xl">
              <CmsText
                as="div"
                field="hero.badge"
                fallback={homeContentDefaults["hero.badge"]}
                className="inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-2 text-xs font-semibold text-teal-100 shadow-sm backdrop-blur sm:px-4 sm:text-sm"
              />
              <h1 className="mt-5 text-[2.65rem] font-bold leading-[1.02] tracking-[-0.05em] text-white sm:mt-7 sm:text-6xl lg:text-[4.4rem]">
                <CmsText
                  field="hero.heading"
                  fallback={homeContentDefaults["hero.heading"]}
                />
                <CmsText
                  as="span"
                  field="hero.highlight"
                  fallback={homeContentDefaults["hero.highlight"]}
                  className="block text-teal-200"
                />
              </h1>
              <CmsText
                as="p"
                field="hero.body"
                fallback={homeContentDefaults["hero.body"]}
                className="mt-5 max-w-2xl text-base leading-7 text-slate-100/90 sm:mt-6 sm:text-xl sm:leading-8"
              />
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <CmsLink
                  labelField="hero.primaryLabel"
                  hrefField="hero.primaryHref"
                  fallbackLabel={homeContentDefaults["hero.primaryLabel"]}
                  fallbackHref={homeContentDefaults["hero.primaryHref"]}
                  className="btn-brand w-full px-7 py-3.5 text-sm sm:w-auto"
                >
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </CmsLink>
                <CmsLink
                  labelField="hero.secondaryLabel"
                  hrefField="hero.secondaryHref"
                  fallbackLabel={homeContentDefaults["hero.secondaryLabel"]}
                  fallbackHref={homeContentDefaults["hero.secondaryHref"]}
                  className="btn-outline-light w-full px-7 py-3.5 text-sm sm:w-auto"
                />
              </div>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-white">
                <a
                  href="tel:+17789521389"
                  className="underline decoration-white/50 underline-offset-4 transition hover:decoration-white"
                >
                  Call (778) 952-1389
                </a>
                <a
                  href={WANDER_SHOP_DIRECTIONS_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="underline decoration-white/50 underline-offset-4 transition hover:decoration-white"
                >
                  Get Directions
                </a>
              </div>
              <div className="mt-9 hidden gap-4 sm:grid sm:grid-cols-3">
                {[
                  ["Location", "Steveston, Richmond"],
                  ["Collections", "Wander + Community"],
                  ["Exchange", "Pickup and pay locally"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/20 bg-white/10 p-4 shadow-sm backdrop-blur"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-100/80">
                      {label}
                    </p>
                    <p className="mt-2 text-sm font-medium text-white">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="motion-rise motion-rise-delay-1 lg:pl-5">
              <div className="relative isolate overflow-hidden rounded-[2rem] border border-white/25 bg-slate-950/75 p-5 text-white shadow-[0_28px_80px_rgba(2,6,23,0.42)] backdrop-blur-2xl sm:p-7">
                <div
                  className="pointer-events-none absolute -right-24 -top-28 -z-10 h-64 w-64 rounded-full bg-teal-400/15 blur-3xl"
                  aria-hidden="true"
                />

                <div className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-teal-200/30 bg-teal-300/15 text-teal-100">
                      <Store className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-200/80">
                        Local bike snapshot
                      </p>
                      <p className="mt-1 truncate text-sm text-slate-300">
                        Steveston, Richmond
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-emerald-200/25 bg-emerald-300/10 px-3 py-1.5 text-xs font-bold text-emerald-100">
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-emerald-300"
                      aria-hidden="true"
                    />
                    Open today
                  </span>
                </div>

                <h2 className="mt-6 max-w-md text-2xl font-semibold leading-tight tracking-[-0.025em] sm:text-[2rem]">
                  The shop stays.
                  <span className="block text-teal-200">
                    The marketplace is new.
                  </span>
                </h2>
                <p className="mt-3 max-w-lg text-sm leading-6 text-slate-300 sm:text-base sm:leading-7">
                  Choose an exact bike online, then confirm pickup and payment
                  directly with Wander or the community owner.
                </p>

                <div className="mt-6 overflow-hidden rounded-2xl border border-white/15 bg-white/[0.07]">
                  <a
                    href={WANDER_SHOP_DIRECTIONS_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center gap-3 px-4 py-4 transition hover:bg-white/10"
                  >
                    <MapPin
                      className="h-5 w-5 shrink-0 text-teal-200"
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-white">
                        Wander Bike Rentals
                      </span>
                      <span className="mt-1 block text-sm leading-5 text-slate-300">
                        12071 First Ave #101, Richmond, BC V7E 3M1
                      </span>
                    </span>
                    <ArrowRight
                      className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-white"
                      aria-hidden="true"
                    />
                  </a>

                  <div className="grid grid-cols-2 border-t border-white/15">
                    <a
                      href="tel:+17789521389"
                      className="flex items-center gap-3 border-r border-white/15 px-4 py-4 transition hover:bg-white/10"
                    >
                      <PhoneCall
                        className="h-4 w-4 shrink-0 text-teal-200"
                        aria-hidden="true"
                      />
                      <span>
                        <span className="block text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-400">
                          Call
                        </span>
                        <span className="mt-1 block text-sm font-semibold text-white">
                          (778) 952-1389
                        </span>
                      </span>
                    </a>
                    <div className="flex items-center gap-3 px-4 py-4">
                      <Clock3
                        className="h-4 w-4 shrink-0 text-teal-200"
                        aria-hidden="true"
                      />
                      <span>
                        <span className="block text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-400">
                          Hours
                        </span>
                        <span className="mt-1 block text-sm font-semibold text-white">
                          9 AM–10 PM
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                <dl className="mt-5 grid grid-cols-3 divide-x divide-white/15 border-y border-white/15 py-4">
                  {[
                    ["Wander bikes", "Shop managed"],
                    ["Community", "Owner listed"],
                    ["Payment", "In person"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="min-w-0 px-2 first:pl-0 last:pr-0 sm:px-4"
                    >
                      <dt className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-slate-400">
                        {label}
                      </dt>
                      <dd className="mt-1.5 text-xs font-semibold text-teal-100 sm:text-sm">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>

                <a
                  href={WANDER_SHOP_DIRECTIONS_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary group mt-5 min-h-12 w-full px-5 py-3 text-sm shadow-[0_12px_28px_rgba(2,6,23,0.28)] hover:-translate-y-0.5 hover:bg-teal-50"
                >
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  Go to Store
                  <ArrowRight
                    className="h-4 w-4 transition group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </a>
              </div>
            </div>
          </div>
        </CmsSection>

        {previewMode ? null : <ReviewsSection />}

      <CmsSection
        sectionId="collections"
        label="Collections"
        className="route-wash border-y border-[var(--card-border)] bg-[#ecfdf5]"
      >
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <CmsText
              as="p"
              field="collections.eyebrow"
              fallback={homeContentDefaults["collections.eyebrow"]}
              className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700"
            />
            <CmsText
              as="h2"
              field="collections.heading"
              fallback={homeContentDefaults["collections.heading"]}
              className="display-heading mt-2 text-4xl sm:text-5xl"
            />
            <CmsText
              as="p"
              field="collections.body"
              fallback={homeContentDefaults["collections.body"]}
              className="mt-4 text-lg leading-8 text-slate-600"
            />
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <CmsLink
              labelField="collections.wanderLabel"
              hrefField="collections.wanderHref"
              fallbackLabel={homeContentDefaults["collections.wanderLabel"]}
              fallbackHref={homeContentDefaults["collections.wanderHref"]}
              showLabel={false}
              className="group overflow-hidden rounded-[2rem] border border-[var(--card-border)] bg-white shadow-[0_14px_30px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_20px_42px_rgba(15,23,42,0.14)]"
            >
              <div className="relative aspect-[16/8] overflow-hidden">
                <CmsImage
                  srcField="collections.wanderImageSrc"
                  altField="collections.wanderImageAlt"
                  fallbackSrc={
                    homeContentDefaults["collections.wanderImageSrc"]
                  }
                  fallbackAlt={
                    homeContentDefaults["collections.wanderImageAlt"]
                  }
                  fill
                  sizes="(min-width: 1024px) 46vw, 100vw"
                  className="object-cover transition duration-500 group-hover:scale-[1.025]"
                />
                <div
                  className="absolute left-0 top-0 h-16 w-16 bg-[var(--green)] [clip-path:polygon(0_0,100%_0,0_100%)]"
                  aria-hidden="true"
                />
              </div>
              <div className="p-5 sm:p-8">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--teal-soft)] text-[var(--teal)]">
                    <Store className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <div>
                    <CmsText
                      as="h3"
                      field="collections.wanderTitle"
                      fallback={homeContentDefaults["collections.wanderTitle"]}
                      className="text-2xl font-extrabold tracking-tight text-[var(--navy)] sm:text-3xl"
                    />
                    <CmsText
                      as="p"
                      field="collections.wanderBody"
                      fallback={homeContentDefaults["collections.wanderBody"]}
                      className="mt-2 max-w-lg leading-7 text-slate-600"
                    />
                    <span className="mt-6 inline-flex items-center gap-2 font-bold text-[var(--teal)]">
                      <CmsText
                        field="collections.wanderLabel"
                        fallback={homeContentDefaults["collections.wanderLabel"]}
                      />
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </div>
            </CmsLink>
            <CmsLink
              labelField="collections.communityLabel"
              hrefField="collections.communityHref"
              fallbackLabel={homeContentDefaults["collections.communityLabel"]}
              fallbackHref={homeContentDefaults["collections.communityHref"]}
              showLabel={false}
              className="group overflow-hidden rounded-[2rem] border border-[var(--card-border)] bg-white shadow-[0_14px_30px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_20px_42px_rgba(15,23,42,0.14)]"
            >
              <div className="relative aspect-[16/8] overflow-hidden">
                <CmsImage
                  srcField="collections.communityImageSrc"
                  altField="collections.communityImageAlt"
                  fallbackSrc={
                    homeContentDefaults["collections.communityImageSrc"]
                  }
                  fallbackAlt={
                    homeContentDefaults["collections.communityImageAlt"]
                  }
                  fill
                  sizes="(min-width: 1024px) 46vw, 100vw"
                  className="object-cover transition duration-500 group-hover:scale-[1.025]"
                />
                <div
                  className="absolute right-0 top-0 h-16 w-16 bg-[var(--coral)] [clip-path:polygon(0_0,100%_0,100%_100%)]"
                  aria-hidden="true"
                />
              </div>
              <div className="p-5 sm:p-8">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#eef6df] text-[var(--green)]">
                    <UsersRound className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <div>
                    <CmsText
                      as="h3"
                      field="collections.communityTitle"
                      fallback={
                        homeContentDefaults["collections.communityTitle"]
                      }
                      className="text-2xl font-extrabold tracking-tight text-[var(--navy)] sm:text-3xl"
                    />
                    <CmsText
                      as="p"
                      field="collections.communityBody"
                      fallback={
                        homeContentDefaults["collections.communityBody"]
                      }
                      className="mt-2 max-w-lg leading-7 text-slate-600"
                    />
                    <span className="mt-6 inline-flex items-center gap-2 font-bold text-[var(--green)]">
                      <CmsText
                        field="collections.communityLabel"
                        fallback={
                          homeContentDefaults["collections.communityLabel"]
                        }
                      />
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </div>
            </CmsLink>
          </div>
        </div>
      </CmsSection>

      <CmsSection
        as="div"
        sectionId="listings"
        label="Live listings"
      >
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <CmsText
                as="p"
                field="listings.wanderEyebrow"
                fallback={homeContentDefaults["listings.wanderEyebrow"]}
                className="text-sm font-bold text-teal-800"
              />
              <CmsText
                as="h2"
                field="listings.wanderHeading"
                fallback={homeContentDefaults["listings.wanderHeading"]}
                className="mt-2 text-3xl font-bold tracking-tight text-slate-950"
              />
            </div>
            <CmsLink
              labelField="listings.wanderLinkLabel"
              hrefField="listings.wanderLinkHref"
              fallbackLabel={homeContentDefaults["listings.wanderLinkLabel"]}
              fallbackHref={homeContentDefaults["listings.wanderLinkHref"]}
              className="text-sm font-bold text-teal-800 hover:text-teal-950"
            >
              <span aria-hidden="true"> →</span>
            </CmsLink>
          </div>
          <div className="mobile-card-rail -mx-4 mt-7 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
            {wanderListings.map((listing) => (
              <div
                key={listing.id}
                className="min-w-[84vw] snap-center sm:min-w-0"
              >
                <CompactListingCard listing={listing} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f0fdf9]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <CmsText
                as="p"
                field="listings.communityEyebrow"
                fallback={homeContentDefaults["listings.communityEyebrow"]}
                className="text-sm font-bold text-teal-800"
              />
              <CmsText
                as="h2"
                field="listings.communityHeading"
                fallback={homeContentDefaults["listings.communityHeading"]}
                className="mt-2 text-3xl font-bold tracking-tight text-slate-950"
              />
            </div>
            <CmsLink
              labelField="listings.communityLinkLabel"
              hrefField="listings.communityLinkHref"
              fallbackLabel={
                homeContentDefaults["listings.communityLinkLabel"]
              }
              fallbackHref={
                homeContentDefaults["listings.communityLinkHref"]
              }
              className="text-sm font-bold text-teal-800 hover:text-teal-950"
            >
              <span aria-hidden="true"> →</span>
            </CmsLink>
          </div>
          <div className="mobile-card-rail -mx-4 mt-7 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
            {communityListings.map((listing) => (
              <div
                key={listing.id}
                className="min-w-[84vw] snap-center sm:min-w-0"
              >
                <CompactListingCard listing={listing} />
              </div>
            ))}
          </div>
        </div>
      </section>
      </CmsSection>

      <CmsSection
        sectionId="shop"
        label="Shop"
        className="overflow-hidden border-t border-slate-200 bg-white"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <h2 className="display-heading text-4xl sm:text-5xl">
              <CmsText
                field="shop.heading"
                fallback={homeContentDefaults["shop.heading"]}
              />{" "}
              <CmsText
                as="span"
                field="shop.highlight"
                fallback={homeContentDefaults["shop.highlight"]}
                className="text-[var(--teal)]"
              />
            </h2>
            <CmsText
              as="p"
              field="shop.body"
              fallback={homeContentDefaults["shop.body"]}
              className="mt-4 max-w-md leading-7 text-slate-600"
            />
            <div className="mt-8 space-y-6">
            {[
              {
                icon: Store,
                title: "Wander rentals & sales",
                text: "Our team lists each store bike with its own photos, rental rate, sale price, and availability.",
                href: "/bikes/wander",
                label: "See Wander Bikes",
              },
              {
                icon: Wrench,
                title: "Quick bike repair",
                text: "Visit the shop for common issues such as flats, brake adjustment, gear tuning, and basic safety checks.",
                href: "/quick-bike-repair-richmond",
                label: "Repair information",
              },
              {
                icon: MapPin,
                title: "Visit in Steveston",
                text: "Find the address, hours, phone number, directions, and map before you head over.",
                href: "/location",
                label: "Location and hours",
              },
            ].map(({ icon: Icon, title, text, href, label }) => (
              <article key={title} className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--teal-soft)] text-[var(--teal)]">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-bold text-[var(--navy)]">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
                  <Link
                    href={href}
                    className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-[var(--teal)]"
                  >
                    {label}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <CmsLink
                labelField="shop.primaryLabel"
                hrefField="shop.primaryHref"
                fallbackLabel={homeContentDefaults["shop.primaryLabel"]}
                fallbackHref={homeContentDefaults["shop.primaryHref"]}
                className="btn-primary px-5 py-2.5 text-sm"
              />
              <CmsLink
                labelField="shop.secondaryLabel"
                hrefField="shop.secondaryHref"
                fallbackLabel={homeContentDefaults["shop.secondaryLabel"]}
                fallbackHref={homeContentDefaults["shop.secondaryHref"]}
                className="btn-secondary px-5 py-2.5 text-sm"
              />
            </div>
          </div>
          <div className="photo-arch-left relative min-h-[20rem] overflow-hidden bg-slate-100 sm:min-h-[26rem] lg:min-h-[32rem]">
            <CmsImage
              srcField="shop.imageSrc"
              altField="shop.imageAlt"
              fallbackSrc={homeContentDefaults["shop.imageSrc"]}
              fallbackAlt={homeContentDefaults["shop.imageAlt"]}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
            <div
              className="absolute bottom-0 left-0 h-24 w-24 bg-[var(--teal)] [clip-path:polygon(0_0,100%_100%,0_100%)]"
              aria-hidden="true"
            />
          </div>
        </div>
      </CmsSection>

      <CmsSection
        sectionId="explore"
        label="Explore"
        className="border-t border-slate-200 bg-white"
      >
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:px-8">
          <div className="relative min-h-[18rem] overflow-hidden rounded-[1.5rem] bg-slate-100 sm:min-h-[24rem]">
            <CmsImage
              srcField="explore.imageSrc"
              altField="explore.imageAlt"
              fallbackSrc={homeContentDefaults["explore.imageSrc"]}
              fallbackAlt={homeContentDefaults["explore.imageAlt"]}
              fill
              sizes="(min-width: 1024px) 44vw, 100vw"
              className="object-cover"
            />
          </div>
          <div>
            <CmsText
              as="h2"
              field="explore.heading"
              fallback={homeContentDefaults["explore.heading"]}
              className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl"
            />
            <CmsText
              as="p"
              field="explore.body"
              fallback={homeContentDefaults["explore.body"]}
              className="mt-4 max-w-xl text-lg leading-8 text-slate-600"
            />
            <nav aria-label="Local bike rental information" className="mt-8 border-y border-slate-200">
              {[
                ["Bike Rental Richmond", "/bike-rental-richmond"],
                ["Bike Rental Steveston", "/bike-rental-steveston"],
                ["Adult Bike Rentals", "/adult-bike-rental-richmond"],
                ["Kids Bike Rentals", "/kids-bike-rental-richmond"],
                ["Bike Trailer Rentals", "/bike-trailer-rental-richmond"],
              ].map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex items-center justify-between gap-4 border-b border-slate-200 py-4 text-sm font-bold text-slate-950 transition last:border-b-0 hover:text-teal-800"
                >
                  {label}
                  <ArrowRight
                    className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-teal-700"
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </CmsSection>

      <CmsSection
        sectionId="gallery"
        label="Gallery"
        className="border-t border-[var(--card-border)] bg-[#f0fdf9]"
      >
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-18">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CmsText
                as="p"
                field="gallery.eyebrow"
                fallback={homeContentDefaults["gallery.eyebrow"]}
                className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700"
              />
              <CmsText
                as="h2"
                field="gallery.heading"
                fallback={homeContentDefaults["gallery.heading"]}
                className="mt-2 text-3xl font-bold tracking-tight text-slate-950"
              />
            </div>
            <CmsText
              as="p"
              field="gallery.body"
              fallback={homeContentDefaults["gallery.body"]}
              className="max-w-xl text-sm leading-7 text-slate-600"
            />
          </div>
          <div className="mobile-card-rail -mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0 md:pb-0">
            {[
              {
                srcField: "gallery.image1Src",
                altField: "gallery.image1Alt",
                labelField: "gallery.image1Label",
              },
              {
                srcField: "gallery.image2Src",
                altField: "gallery.image2Alt",
                labelField: "gallery.image2Label",
              },
              {
                srcField: "gallery.image3Src",
                altField: "gallery.image3Alt",
                labelField: "gallery.image3Label",
              },
            ].map((item) => (
              <figure
                key={item.srcField}
                className="min-w-[82vw] snap-center overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm md:min-w-0"
              >
                <div className="relative aspect-[4/5]">
                  <CmsImage
                    srcField={item.srcField}
                    altField={item.altField}
                    fallbackSrc={homeContentDefaults[item.srcField]}
                    fallbackAlt={homeContentDefaults[item.altField]}
                    fill
                    sizes="(min-width: 768px) 31vw, 100vw"
                    className="object-cover transition duration-500 hover:scale-[1.025]"
                  />
                </div>
                <CmsText
                  as="figcaption"
                  field={item.labelField}
                  fallback={homeContentDefaults[item.labelField]}
                  className="p-5 text-sm font-semibold text-slate-700"
                />
              </figure>
            ))}
          </div>
        </div>
      </CmsSection>

      <CmsSection
        sectionId="faq"
        label="FAQ"
        className="border-t border-slate-200 bg-white"
      >
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-18">
          <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr]">
            <div>
              <CmsText
                as="p"
                field="faq.eyebrow"
                fallback={homeContentDefaults["faq.eyebrow"]}
                className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700"
              />
              <CmsText
                as="h2"
                field="faq.heading"
                fallback={homeContentDefaults["faq.heading"]}
                className="mt-2 text-3xl font-bold tracking-tight text-slate-950"
              />
              <CmsText
                as="p"
                field="faq.body"
                fallback={homeContentDefaults["faq.body"]}
                className="mt-4 leading-7 text-slate-600"
              />
              <div className="mt-7 flex flex-wrap gap-3">
                <CmsLink
                  labelField="faq.primaryLabel"
                  hrefField="faq.primaryHref"
                  fallbackLabel={homeContentDefaults["faq.primaryLabel"]}
                  fallbackHref={homeContentDefaults["faq.primaryHref"]}
                  className="btn-primary px-5 text-sm"
                />
                <CmsLink
                  labelField="faq.secondaryLabel"
                  hrefField="faq.secondaryHref"
                  fallbackLabel={homeContentDefaults["faq.secondaryLabel"]}
                  fallbackHref={homeContentDefaults["faq.secondaryHref"]}
                  className="btn-secondary px-5 text-sm"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { question: "faq.question1", answer: "faq.answer1" },
                { question: "faq.question2", answer: "faq.answer2" },
                { question: "faq.question3", answer: "faq.answer3" },
                { question: "faq.question4", answer: "faq.answer4" },
              ].map((item) => (
                <article
                  key={item.question}
                  className="rounded-[2rem] border border-[var(--card-border)] bg-[#f0fdf9] p-6"
                >
                  <CmsText
                    as="h3"
                    field={item.question}
                    fallback={homeContentDefaults[item.question]}
                    className="font-semibold text-slate-950"
                  />
                  <CmsText
                    as="p"
                    field={item.answer}
                    fallback={homeContentDefaults[item.answer]}
                    className="mt-3 text-sm leading-7 text-slate-600"
                  />
                </article>
              ))}
            </div>
          </div>
        </div>
      </CmsSection>

      <CmsSection
        sectionId="steps"
        label="How it works"
        className="border-t border-slate-800 bg-[var(--navy)] text-white"
      >
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <CmsText
              as="h2"
              field="steps.heading"
              fallback={homeContentDefaults["steps.heading"]}
              className="text-3xl font-bold tracking-tight"
            />
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "steps.step1Title",
                body: "steps.step1Body",
              },
              {
                step: "2",
                title: "steps.step2Title",
                body: "steps.step2Body",
              },
              {
                step: "3",
                title: "steps.step3Title",
                body: "steps.step3Body",
              },
            ].map((item) => (
              <div key={item.step}>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--teal)] text-sm font-bold text-white">
                  {item.step}
                </span>
                <CmsText
                  as="h3"
                  field={item.title}
                  fallback={homeContentDefaults[item.title]}
                  className="mt-4 font-bold text-white"
                />
                <CmsText
                  as="p"
                  field={item.body}
                  fallback={homeContentDefaults[item.body]}
                  className="mt-2 text-sm leading-6 text-slate-300"
                />
              </div>
            ))}
          </div>
          <div className="lg:col-start-2">
            <CmsLink
              labelField="steps.linkLabel"
              hrefField="steps.linkHref"
              fallbackLabel={homeContentDefaults["steps.linkLabel"]}
              fallbackHref={homeContentDefaults["steps.linkHref"]}
              className="inline-flex items-center gap-2 text-sm font-bold text-teal-300"
            >
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            </CmsLink>
          </div>
        </div>
      </CmsSection>
      </main>
    </WebsiteContentRuntime>
  );
}
