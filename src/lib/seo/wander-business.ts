const address = {
  "@type": "PostalAddress",
  streetAddress: "12071 First Ave #101",
  addressLocality: "Richmond",
  addressRegion: "BC",
  postalCode: "V7E 3M1",
  addressCountry: "CA",
} as const;

export const SITE_URL = "https://www.wanderbike.ca";
export const BUSINESS_ID = `${SITE_URL}/#business`;

/*
 * Entity links. `sameAs` is how a search engine works out that this site and
 * the Google Business Profile are one business rather than two unrelated
 * things — the highest-leverage structured-data field a local shop has.
 *
 * The Google entry is the ?cid= form rather than the maps.app.goo.gl share
 * link it came from: the share link is a redirect that can be rotated, while
 * the CID addresses the place record directly and never moves. Do not
 * substitute a /maps/search?q= URL — that is a query, not an entity.
 *
 * Still missing, in descending value: Facebook page, Instagram profile, Yelp
 * and TripAdvisor listings. Add the canonical profile URL for each as they
 * exist; `sameAs` is omitted entirely while this array is empty.
 */
export const GOOGLE_BUSINESS_URL =
  "https://maps.google.com/?cid=4061658800160849931";

const sameAs: readonly string[] = [GOOGLE_BUSINESS_URL];

const everyDay = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export const wanderBusinessEntity = {
  "@type": ["BikeStore", "SportsActivityLocation"],
  "@id": BUSINESS_ID,
  name: "Wander Bike Rentals",
  alternateName: "Wander Bike",
  ...(sameAs.length > 0 ? { sameAs } : {}),
  description:
    "A physical bike rental, bike sale, and quick repair shop in Steveston, Richmond that also operates a local bike marketplace.",
  url: "https://www.wanderbike.ca/",
  logo: "https://www.wanderbike.ca/assets/wander-logo.jpg",
  image: [
    "https://www.wanderbike.ca/assets/bikes-row.jpg",
    "https://www.wanderbike.ca/assets/fishermans-wharf.webp",
    "https://www.wanderbike.ca/assets/west-dyke-ride.webp",
  ],
  telephone: "+1-778-952-1389",
  priceRange: "$$",
  address,
  areaServed: ["Richmond", "Steveston"],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: everyDay,
      opens: "09:00:00",
      closes: "22:00:00",
    },
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Wander Bike services",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Bike rental in Richmond and Steveston",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Local bike sales",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Quick bike repair",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Community bike marketplace",
        },
      },
    ],
  },
} as const;

export const wanderBusinessSchema = {
  "@context": "https://schema.org",
  ...wanderBusinessEntity,
} as const;

export const wanderWebsiteSchema = {
  "@context": "https://schema.org",
  "@graph": [
    wanderBusinessEntity,
    {
      "@type": "WebSite",
      "@id": "https://www.wanderbike.ca/#website",
      name: "Wander Bike",
      alternateName: "Wander Bike Rentals",
      url: "https://www.wanderbike.ca/",
      publisher: {
        "@id": "https://www.wanderbike.ca/#business",
      },
    },
  ],
} as const;
