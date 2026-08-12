import {
  imageField,
  linkField,
  textField,
  textareaField,
  type WebsiteContent,
  type WebsitePageDefinition,
  type WebsiteSectionDefinition,
} from "@/lib/website-cms/definitions";

export const pricingContentDefaults: WebsiteContent = {
  "hero.eyebrow": "Wander Bike Rentals · Steveston shop",
  "hero.heading": "Wander Bike rental prices.",
  "hero.body":
    "These are the rental rates for adult bikes, kids bikes, and trailers rented directly from Wander Bike Rentals. Bike sale prices are different for every individual bike.",
  "hero.primaryLabel": "Find a Bike",
  "hero.primaryHref": "/bikes",
  "hero.secondaryLabel": "Call Now",
  "hero.secondaryHref": "tel:+17789521389",
  "hero.imageSrc": "/assets/pricing-steveston-hero.jpg",
  "hero.imageAlt": "A bicycle beside the Steveston waterfront",
  "hero.rateEyebrow": "Starting hourly rates",
  "hero.rateNote":
    "Rates are shown in CAD. Availability and the exact bike are confirmed through the individual listing or directly with the shop.",

  "rates.eyebrow": "Wander shop rentals",
  "rates.heading": "Compare the full rental rates",
  "rates.body":
    "These prices apply to Wander Bike Rentals’ own rental service. Community owners set their own prices separately.",
  "rates.adultName": "Adult Bike",
  "rates.adultBody":
    "For solo rides, couples, and relaxed trips around Steveston and Richmond.",
  "rates.adultHourly": "$12.38",
  "rates.adultHalfDay": "$40",
  "rates.adultFullDay": "$64.76",
  "rates.adultHref": "/adult-bike-rental-richmond",
  "rates.kidsName": "Kids Bike",
  "rates.kidsBody":
    "A family-friendly option when you need a bike sized for a younger rider.",
  "rates.kidsHourly": "$9.52",
  "rates.kidsHalfDay": "$30",
  "rates.kidsFullDay": "$50",
  "rates.kidsHref": "/kids-bike-rental-richmond",
  "rates.trailerName": "Bike Trailer",
  "rates.trailerBody":
    "A practical family option for rides with younger children.",
  "rates.trailerHourly": "$9.52",
  "rates.trailerHalfDay": "$30",
  "rates.trailerFullDay": "$50",
  "rates.trailerHref": "/bike-trailer-rental-richmond",
  "rates.detailsLabel": "Rental details",

  "clarity.wanderHeading": "Buying a Wander bike?",
  "clarity.wanderBody":
    "There is no single Wander sale price. Every bike has a different model, condition, photos, and individual sale price. Open Find a Bike to see the exact amount.",
  "clarity.communityHeading": "Browsing Community Bikes?",
  "clarity.communityBody":
    "Community owners choose their own rental and sale prices for each listing. Those prices do not use the Wander shop rental rate table above.",

  "cta.eyebrow": "No online payment",
  "cta.heading": "Choose the exact bike before sending a request.",
  "cta.body":
    "Find a Bike shows whether each listing is for rent, sale, or both. Pickup, inspection, and payment happen locally.",
  "cta.label": "Find a Bike",
  "cta.href": "/bikes",
};

const pricingSections: WebsiteSectionDefinition[] = [
  {
    id: "hero",
    label: "Hero",
    description: "The pricing page introduction and starting-rate summary.",
    fields: [
      textField("hero.eyebrow", "Eyebrow", 80),
      textField("hero.heading", "Headline", 100),
      textareaField("hero.body", "Short paragraph", 360),
      textField("hero.primaryLabel", "Primary button text", 32),
      linkField("hero.primaryHref", "Primary button link"),
      textField("hero.secondaryLabel", "Secondary button text", 32),
      linkField("hero.secondaryHref", "Secondary button link"),
      imageField("hero.imageSrc", "Hero image"),
      textField("hero.imageAlt", "Image alt text", 160),
      textField("hero.rateEyebrow", "Rate summary heading", 80),
      textareaField("hero.rateNote", "Rate summary note", 280),
    ],
  },
  {
    id: "rates",
    label: "Rental rates",
    description: "Names, descriptions, prices, and detail links in the rate table.",
    fields: [
      textField("rates.eyebrow", "Eyebrow", 60),
      textField("rates.heading", "Heading", 100),
      textareaField("rates.body", "Introduction", 280),
      ...(["adult", "kids", "trailer"] as const).flatMap((type) => {
        const label = type === "adult" ? "Adult bike" : type === "kids" ? "Kids bike" : "Bike trailer";
        return [
          textField(`rates.${type}Name`, `${label} name`, 60),
          textareaField(`rates.${type}Body`, `${label} description`, 220),
          textField(`rates.${type}Hourly`, `${label} hourly price`, 20),
          textField(`rates.${type}HalfDay`, `${label} half-day price`, 20),
          textField(`rates.${type}FullDay`, `${label} full-day price`, 20),
          linkField(`rates.${type}Href`, `${label} details link`),
        ];
      }),
      textField("rates.detailsLabel", "Details link text", 40),
    ],
  },
  {
    id: "clarity",
    label: "Price clarity",
    description: "Explains how Wander and Community sale prices differ.",
    fields: [
      textField("clarity.wanderHeading", "Wander heading", 80),
      textareaField("clarity.wanderBody", "Wander description", 320),
      textField("clarity.communityHeading", "Community heading", 80),
      textareaField("clarity.communityBody", "Community description", 320),
    ],
  },
  {
    id: "cta",
    label: "Call to action",
    description: "The final prompt at the bottom of the pricing page.",
    fields: [
      textField("cta.eyebrow", "Eyebrow", 60),
      textField("cta.heading", "Heading", 110),
      textareaField("cta.body", "Description", 280),
      textField("cta.label", "Button text", 32),
      linkField("cta.href", "Button link"),
    ],
  },
];

export const pricingPageDefinition: WebsitePageDefinition = {
  slug: "pricing",
  label: "Pricing",
  path: "/pricing",
  description: "Rental prices, inclusions, and service details.",
  editable: true,
  sections: pricingSections,
  defaults: pricingContentDefaults,
};
