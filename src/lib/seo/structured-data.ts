import type { BikeListing } from "@/lib/marketplace/types";
import { BUSINESS_ID, SITE_URL } from "@/lib/seo/wander-business";

/*
 * JSON-LD builders. Everything these emit has to be visible on the page that
 * carries it — structured data that describes facts a reader cannot find is a
 * guidelines violation, not a shortcut.
 */

const CONTEXT = "https://schema.org";

export function jsonLd(schema: object) {
  return { __html: JSON.stringify(schema) };
}

/* ---------------------------------------------------------------- breadcrumb */

export type Crumb = { name: string; path: string };

export function breadcrumbSchema(crumbs: Crumb[]) {
  return {
    "@context": CONTEXT,
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...crumbs].map(
      (crumb, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: crumb.name,
        item: `${SITE_URL}${crumb.path === "/" ? "" : crumb.path}`,
      }),
    ),
  };
}

/* ------------------------------------------------------------------- article */

/*
 * The guides are written in-house rather than by a standing editorial team, so
 * the author is a Person tied to the shop via worksFor — a bare string author
 * carries no entity signal. `url` is left off on purpose: there is no author
 * background page yet, and pointing at an unrelated page is worse than omitting
 * the field.
 */
const GUIDE_AUTHOR = {
  "@type": "Person",
  name: "Dennis Z",
  worksFor: { "@id": BUSINESS_ID },
} as const;

export function guideArticleSchema({
  headline,
  description,
  path,
  images,
  datePublished,
  dateModified,
}: {
  headline: string;
  description: string;
  path: string;
  images: string[];
  datePublished: string;
  dateModified: string;
}) {
  return {
    "@context": CONTEXT,
    "@type": "Article",
    headline,
    description,
    mainEntityOfPage: `${SITE_URL}${path}`,
    ...(images.length > 0
      ? { image: images.map((src) => `${SITE_URL}${src}`) }
      : {}),
    datePublished,
    dateModified,
    author: GUIDE_AUTHOR,
    publisher: { "@id": BUSINESS_ID },
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };
}

/* ------------------------------------------------------------------- product */

const CONDITION: Record<BikeListing["condition"], string> = {
  new: "https://schema.org/NewCondition",
  like_new: "https://schema.org/UsedCondition",
  good: "https://schema.org/UsedCondition",
  fair: "https://schema.org/UsedCondition",
};

const AVAILABILITY: Partial<Record<BikeListing["status"], string>> = {
  active: "https://schema.org/InStock",
  reserved: "https://schema.org/LimitedAvailability",
  sold: "https://schema.org/SoldOut",
};

function dollars(cents: number) {
  return (cents / 100).toFixed(2);
}

/*
 * Rental rates are a recurring unit price, not a one-off transaction price, so
 * they go in a UnitPriceSpecification with the billing unit attached (UN/CEFACT
 * codes: DAY, HUR). A bare `price` on a rental would read as "buy this bike for
 * $40", which is not what the page says.
 */
function rentalOffer(
  listing: BikeListing,
  cents: number,
  unitCode: "DAY" | "HUR",
  unitText: string,
) {
  return {
    "@type": "Offer",
    url: `${SITE_URL}/bikes/${listing.slug}`,
    availability: AVAILABILITY[listing.status] ?? "https://schema.org/InStock",
    itemCondition: CONDITION[listing.condition],
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: dollars(cents),
      priceCurrency: listing.currency,
      unitCode,
      unitText,
    },
    ...sellerFor(listing),
  };
}

/*
 * Only Wander-owned stock can name the shop as the seller. Community listings
 * are sold by the individual owner, and claiming otherwise would misdescribe
 * who the visitor is actually dealing with.
 */
function sellerFor(listing: BikeListing) {
  return listing.source === "wander" ? { seller: { "@id": BUSINESS_ID } } : {};
}

export function listingProductSchema(listing: BikeListing) {
  const canRent =
    listing.offerMode === "rent" || listing.offerMode === "rent_sale";
  const canBuy =
    listing.offerMode === "sale" || listing.offerMode === "rent_sale";

  const offers = [];

  if (canBuy && listing.salePriceCents !== null) {
    offers.push({
      "@type": "Offer",
      url: `${SITE_URL}/bikes/${listing.slug}`,
      price: dollars(listing.salePriceCents),
      priceCurrency: listing.currency,
      availability: AVAILABILITY[listing.status] ?? "https://schema.org/InStock",
      itemCondition: CONDITION[listing.condition],
      ...sellerFor(listing),
    });
  }

  if (canRent && listing.rentalDailyCents !== null) {
    offers.push(rentalOffer(listing, listing.rentalDailyCents, "DAY", "per day"));
  }

  if (canRent && listing.rentalHourlyCents !== null) {
    offers.push(
      rentalOffer(listing, listing.rentalHourlyCents, "HUR", "per hour"),
    );
  }

  return {
    "@context": CONTEXT,
    "@type": "Product",
    name: listing.title,
    description: listing.shortDescription ?? listing.description,
    sku: listing.id,
    category: listing.bikeType,
    itemCondition: CONDITION[listing.condition],
    ...(listing.images.length > 0
      ? { image: listing.images.map((image) => image.src) }
      : {}),
    ...(listing.brand ? { brand: { "@type": "Brand", name: listing.brand } } : {}),
    ...(listing.model ? { model: listing.model } : {}),
    ...(offers.length > 0 ? { offers } : {}),
  };
}
