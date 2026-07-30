const address = {
  "@type": "PostalAddress",
  streetAddress: "12071 First Ave #101",
  addressLocality: "Richmond",
  addressRegion: "BC",
  postalCode: "V7E 3M1",
  addressCountry: "CA",
} as const;

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
  "@id": "https://www.wanderbike.ca/#business",
  name: "Wander Bike Rentals",
  alternateName: "Wander Bike",
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
