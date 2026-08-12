import {
  imageField,
  linkField,
  textField,
  textareaField,
  type WebsiteContent,
  type WebsitePageDefinition,
  type WebsiteSectionDefinition,
} from "@/lib/website-cms/definitions";

type FaqSeed = readonly [question: string, answer: string];

export const faqGroupSeeds: Array<{
  id: "shop" | "marketplace" | "guides";
  title: string;
  description: string;
  items: readonly FaqSeed[];
}> = [
  {
    id: "shop",
    title: "Wander Bike Rentals shop",
    description:
      "Location, hours, direct rental services, equipment, and quick repair.",
    items: [
      [
        "Is the Wander Bike Rentals physical shop still operating?",
        "Yes. Wander Bike Rentals continues to operate at 12071 First Ave #101 in Steveston, Richmond. The shop is open daily from 9:00 AM to 10:00 PM, and the phone number is (778) 952-1389.",
      ],
      [
        "What does the Wander shop offer?",
        "The Steveston shop offers Wander-managed bike rentals, local bike sales, and quick repair for common issues. The Community Bike marketplace is an additional service, not a replacement for the shop.",
      ],
      [
        "Does every Wander rental have the same price?",
        "No. Each Wander bike has its own hourly and/or daily rental price, and some bikes also have an individual sale price. Open the specific listing for its current photos, fit, availability, and price.",
      ],
      [
        "Do you have kids bikes and bike trailers?",
        "Kids bikes and trailers are offered when a matching Wander listing is available. Check the individual collection page or call the shop to confirm the right size and current availability.",
      ],
      [
        "Are a helmet and lock included?",
        "Yes. Every Wander Bike rental includes a helmet, basket, and lock. Call the shop if you need a specific helmet size or want to confirm any extra equipment.",
      ],
      [
        "Do I need photo ID or a deposit for a Wander rental?",
        "A valid government-issued photo ID is required for Wander rentals. No rental deposit is required.",
      ],
      [
        "Can I walk in for quick bike repair?",
        "Yes. You can visit the Steveston shop for common issues such as flat tires, brake adjustment, gear tuning, wheel rubbing, chain cleaning, and basic safety checks. Final service depends on inspection.",
      ],
    ],
  },
  {
    id: "marketplace",
    title: "Community marketplace",
    description:
      "Listings, reservation requests, pickup privacy, and offline transactions.",
    items: [
      [
        "What is the difference between Wander Bikes and Community Bikes?",
        "Wander Bikes are listed and managed directly by the physical Wander shop. Community Bikes are published by local owners. The two collections stay on separate browse pages so ownership is always clear.",
      ],
      [
        "Does every bike have the same price?",
        "No. Every bike has its own hourly, daily, and/or sale price. Open the individual bike listing for its exact offer and price.",
      ],
      [
        "Can one bike be available for both rent and sale?",
        "Yes. An owner can choose rent only, sale only, or rent and sale for each individual bike.",
      ],
      [
        "Do I pay online?",
        "No. Wander does not collect marketplace payments. Send a request online, then inspect the bike and pay the owner in person after the request is accepted.",
      ],
      [
        "Do you ship or deliver bikes?",
        "No. All marketplace exchanges are local pickup. There is no Canada Post shipping, courier delivery, or online checkout.",
      ],
      [
        "Is it free to list a bike?",
        "Yes. Listing is free at this stage, and Wander does not take a transaction fee.",
      ],
      [
        "Do I need a separate owner account?",
        "No. The same account can request another person’s bike and publish your own bikes.",
      ],
      [
        "When does a rental become confirmed?",
        "Sending a request does not confirm it. The owner must accept it. After acceptance, the rider can see the private pickup details in the Community Bike Dashboard.",
      ],
      [
        "Why can’t I see the exact pickup address publicly?",
        "Only the general pickup area is public. The exact address and instructions are shown to the owner, Wander staff, and an accepted rider.",
      ],
      [
        "Do Community Bike listings wait for approval?",
        "No. New listings publish immediately. Sensitive text and high-risk image scores can create a private Site Admin signal, but automated checks never pause a listing or suspend an account.",
      ],
      [
        "What if I need help with a marketplace request?",
        "Use the Community Bike Dashboard to review its status first. For Wander-owned bikes or platform help, call (778) 952-1389.",
      ],
    ],
  },
  {
    id: "guides",
    title: "British Columbia cycling guides",
    description:
      "Province-wide coverage, research labels, current-condition checks, and nearest-trail navigation.",
    items: [
      [
        "How many British Columbia cycling guides does Wander publish?",
        "Wander publishes 160 cycling guides covering cities, towns, villages, districts, and other local-government destinations across 27 British Columbia regions.",
      ],
      [
        "Does a city guide mean Wander rents bikes in that city?",
        "No. The guide library is a province-wide ride-planning resource. Wander-managed rentals and the Community Bike marketplace currently operate locally in Richmond and Steveston unless a listing says otherwise.",
      ],
      [
        "How current are the cycling guides?",
        "The province-wide research pass was completed on August 8, 2026. Every destination page links to the official sources used, but closures, construction, wildfire conditions, ferry service, and trail rules can change. Check current notices before each ride.",
      ],
      [
        "What do the A+, A, B, and C research labels mean?",
        "A+ and A guides have the strongest destination-specific research. B guides have good regional and local support. C guides use a regional research basis and need extra local verification before relying on an exact route.",
      ],
      [
        "How does Navigate to Nearest Trail work?",
        "Choose Nearest Trail in the mobile action bar or on a city guide, allow location access, and Wander prepares bicycle directions to a nearby trail in Google Maps. If location is unavailable, you can use a Google Maps trail search instead.",
      ],
    ],
  },
];

export const faqContentDefaults: WebsiteContent = {
  "hero.badge": "Shop + marketplace + guide questions",
  "hero.heading": "Quick answers before you call, visit, or send a request.",
  "hero.body":
    "Start with the physical Wander shop, then check how individual Wander Bikes, Community Bikes, local pickup, offline payment, and the province-wide cycling guide library work.",
  "hero.primaryLabel": "Call Now",
  "hero.primaryHref": "tel:+17789521389",
  "hero.secondaryLabel": "View Location",
  "hero.secondaryHref": "/location",
  "hero.imageSrc": "/assets/faq-steveston-hero.jpg",
  "hero.imageAlt": "Steveston waterfront near Wander Bike Rentals",
  "hero.overviewEyebrow": "FAQ overview",
  "hero.overviewHeading":
    "One local shop, one marketplace, and a province-wide guide library.",
  "hero.overviewBody1":
    "Wander Bike Rentals continues to rent and sell its own bikes and provide quick repair from the Steveston shop.",
  "hero.overviewBody2":
    "The marketplace adds a separate Community Bikes collection where local owners can list a bike for rent, sale, or both.",
  "hero.overviewBody3":
    "The guide library now covers 160 B.C. destinations. It helps plan a ride, but it does not mean Wander rents bikes in every listed city.",
  "hero.note":
    "No shopping cart, shipping, or platform payment: requests happen online, while pickup and payment happen locally.",
  "cta.findLabel": "Find a Bike",
  "cta.findHref": "/bikes",
  "cta.listLabel": "List Your Bike",
  "cta.listHref": "/list-your-bike",
  "cta.guidesLabel": "Explore B.C. Guides",
  "cta.guidesHref": "/guides",
  "cta.locationLabel": "Wander location",
  "cta.locationHref": "/location",
};

for (const group of faqGroupSeeds) {
  faqContentDefaults[`${group.id}.heading`] = group.title;
  faqContentDefaults[`${group.id}.body`] = group.description;
  group.items.forEach(([question, answer], index) => {
    faqContentDefaults[`${group.id}.question${index + 1}`] = question;
    faqContentDefaults[`${group.id}.answer${index + 1}`] = answer;
  });
}

const faqSection = (
  id: (typeof faqGroupSeeds)[number]["id"],
  label: string,
  itemCount: number,
): WebsiteSectionDefinition => ({
  id,
  label,
  description: `Heading and ${itemCount} expandable questions in this FAQ group.`,
  fields: [
    textField(`${id}.heading`, "Group heading", 100),
    textareaField(`${id}.body`, "Group description", 260),
    ...Array.from({ length: itemCount }, (_, index) => index + 1).flatMap(
      (number) => [
        textField(`${id}.question${number}`, `Question ${number}`, 160),
        textareaField(`${id}.answer${number}`, `Answer ${number}`, 420),
      ],
    ),
  ],
});

const sections: WebsiteSectionDefinition[] = [
  {
    id: "hero",
    label: "Hero",
    description: "The FAQ introduction and overview card.",
    fields: [
      textField("hero.badge", "Badge", 80),
      textField("hero.heading", "Headline", 120),
      textareaField("hero.body", "Short paragraph", 360),
      textField("hero.primaryLabel", "Primary button text", 32),
      linkField("hero.primaryHref", "Primary button link"),
      textField("hero.secondaryLabel", "Secondary button text", 32),
      linkField("hero.secondaryHref", "Secondary button link"),
      imageField("hero.imageSrc", "Hero image"),
      textField("hero.imageAlt", "Image alt text", 160),
      textField("hero.overviewEyebrow", "Overview eyebrow", 60),
      textField("hero.overviewHeading", "Overview heading", 120),
      textareaField("hero.overviewBody1", "Overview paragraph 1", 280),
      textareaField("hero.overviewBody2", "Overview paragraph 2", 280),
      textareaField("hero.overviewBody3", "Overview paragraph 3", 280),
      textareaField("hero.note", "Overview note", 280),
    ],
  },
  faqSection("shop", "Shop questions", 7),
  faqSection("marketplace", "Marketplace questions", 11),
  faqSection("guides", "Guide questions", 5),
  {
    id: "cta",
    label: "Page links",
    description: "The four links at the bottom of the FAQ page.",
    fields: [
      ...(["find", "list", "guides", "location"] as const).flatMap((key) => [
        textField(`cta.${key}Label`, `${key} link text`, 42),
        linkField(`cta.${key}Href`, `${key} link`),
      ]),
    ],
  },
];

export const faqPageDefinition: WebsitePageDefinition = {
  slug: "faq",
  label: "FAQ",
  path: "/faq",
  description: "Frequently asked questions.",
  editable: true,
  sections,
  defaults: faqContentDefaults,
};
