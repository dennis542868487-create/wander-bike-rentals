import {
  imageField as image,
  linkField as link,
  textField as text,
  textareaField as textarea,
  type WebsiteContent,
  type WebsitePageDefinition,
  type WebsiteSectionDefinition,
} from "@/lib/website-cms/definitions";
import { aboutPageDefinition } from "@/lib/website-cms/pages/about";
import { faqPageDefinition } from "@/lib/website-cms/pages/faq";
import { howItWorksPageDefinition } from "@/lib/website-cms/pages/how-it-works";
import { locationPageDefinition } from "@/lib/website-cms/pages/location";
import { pricingPageDefinition } from "@/lib/website-cms/pages/pricing";
import { quickRepairPageDefinition } from "@/lib/website-cms/pages/quick-repair";

export type {
  WebsiteContent,
  WebsiteFieldDefinition,
  WebsiteFieldKind,
  WebsitePageDefinition,
  WebsiteSectionDefinition,
} from "@/lib/website-cms/definitions";

export const homeContentDefaults: WebsiteContent = {
  "hero.badge": "Wander Bike Rentals • Steveston waterfront",
  "hero.heading": "Steveston bike rentals,",
  "hero.highlight": "now with a local marketplace.",
  "hero.body":
    "Wander Bike Rentals still operates its physical shop in Steveston. Rent or buy a Wander bike, or browse a separate collection listed by local owners.",
  "hero.primaryLabel": "Find a Bike",
  "hero.primaryHref": "/bikes",
  "hero.secondaryLabel": "List Your Bike",
  "hero.secondaryHref": "/list-your-bike",
  "hero.imageSrc": "/assets/fishermans-wharf.webp",
  "hero.imageAlt": "Steveston Fisherman’s Wharf waterfront",

  "collections.eyebrow": "Find a bike",
  "collections.heading": "Two collections, clearly separated.",
  "collections.body":
    "The physical shop’s Wander Bikes and owner-listed Community Bikes have separate pages and request flows, so the source is always clear.",
  "collections.wanderTitle": "Wander Bikes",
  "collections.wanderBody":
    "Rental and sale listings managed directly by the Wander team at the Steveston shop.",
  "collections.wanderLabel": "Browse Wander Bikes",
  "collections.wanderHref": "/bikes/wander",
  "collections.wanderImageSrc": "/assets/bikes-row.jpg",
  "collections.wanderImageAlt": "Wander Bikes inside the Steveston shop",
  "collections.communityTitle": "Community Bikes",
  "collections.communityBody":
    "Bikes listed by local owners, with pickup and offline payment arranged directly after a request.",
  "collections.communityLabel": "Browse Community Bikes",
  "collections.communityHref": "/bikes/community",
  "collections.communityImageSrc": "/assets/steveston-ride-idea.jpg",
  "collections.communityImageAlt":
    "A locally listed bicycle near the Richmond waterfront",

  "listings.wanderEyebrow": "From Wander Bike",
  "listings.wanderHeading": "Wander Bikes",
  "listings.wanderLinkLabel": "View all Wander Bikes",
  "listings.wanderLinkHref": "/bikes/wander",
  "listings.communityEyebrow": "From local owners",
  "listings.communityHeading": "Community Bikes",
  "listings.communityLinkLabel": "View all Community Bikes",
  "listings.communityLinkHref": "/bikes/community",

  "shop.heading": "A real bike shop in",
  "shop.highlight": "Steveston.",
  "shop.body":
    "Wander continues to provide its own rentals, bike sales, and quick repair services. The community marketplace is an additional service, not a replacement for the shop.",
  "shop.primaryLabel": "Visit the Shop",
  "shop.primaryHref": "/location",
  "shop.secondaryLabel": "Call (778) 952-1389",
  "shop.secondaryHref": "tel:+17789521389",
  "shop.imageSrc": "/assets/bikes-row.jpg",
  "shop.imageAlt": "Wander Bike Rentals shop inventory in Steveston",

  "explore.heading": "Explore Richmond and Steveston by bike.",
  "explore.body":
    "Start with the area or bike type you have in mind, then move into the live Wander and Community collections to see the exact bike.",
  "explore.imageSrc": "/assets/west-dyke-trail.jpg",
  "explore.imageAlt": "A waterfront bike route in Richmond, British Columbia",

  "gallery.eyebrow": "Gallery",
  "gallery.heading": "See our shop bikes and gear",
  "gallery.body":
    "These are photos from the physical Wander Bike shop. Community owners upload separate photos for each bike they list.",
  "gallery.image1Src": "/assets/bikes-row.jpg",
  "gallery.image1Alt": "Rows of Wander rental bikes ready for riders",
  "gallery.image1Label": "Wander bike lineup",
  "gallery.image2Src": "/assets/trailer-bike.jpg",
  "gallery.image2Alt": "Bike with a family trailer inside Wander Bike Rentals",
  "gallery.image2Label": "Trailer and family setup",
  "gallery.image3Src": "/assets/helmets.jpg",
  "gallery.image3Alt": "Helmet selection at Wander Bike Rentals",
  "gallery.image3Label": "Rental helmets and gear",

  "faq.eyebrow": "FAQ preview",
  "faq.heading": "What changed—and what stayed the same",
  "faq.body":
    "Wander still operates its Steveston shop. The new marketplace adds individually priced bikes from Wander and local owners, without online payment or shipping.",
  "faq.primaryLabel": "Read all questions",
  "faq.primaryHref": "/faq",
  "faq.secondaryLabel": "Call the shop",
  "faq.secondaryHref": "tel:+17789521389",
  "faq.question1": "Is the physical shop still open?",
  "faq.answer1":
    "Yes. Wander rentals, local bike sales, and quick repair continue at the Steveston location.",
  "faq.question2": "Are Wander and Community Bikes mixed?",
  "faq.answer2":
    "No. They stay in two separate collections so you always know who manages the bike.",
  "faq.question3": "Does every bike have its own price?",
  "faq.answer3":
    "Yes. Open the exact listing to see that bike’s photos, rental rate, sale price, and availability.",
  "faq.question4": "Do I pay or arrange shipping online?",
  "faq.answer4":
    "No. Send a request online, then inspect, pick up, and pay locally after the owner accepts.",

  "steps.heading": "No cart. No shipping. No platform payment.",
  "steps.step1Title": "Choose a bike",
  "steps.step1Body":
    "See that bike’s exact price, offer type, and pickup area.",
  "steps.step2Title": "Send a request",
  "steps.step2Body": "Ask to rent or buy. The owner confirms availability.",
  "steps.step3Title": "Meet locally",
  "steps.step3Body":
    "Inspect the bike, pick it up, and pay the owner in person.",
  "steps.linkLabel": "Read how the marketplace works",
  "steps.linkHref": "/how-it-works",
};

const homeSections: WebsiteSectionDefinition[] = [
  {
    id: "hero",
    label: "Hero",
    description: "The first section visitors see on the homepage.",
    fields: [
      text("hero.badge", "Eyebrow", 80),
      text("hero.heading", "Headline", 90),
      text("hero.highlight", "Highlighted line", 90),
      textarea("hero.body", "Short paragraph", 320),
      text("hero.primaryLabel", "Primary button text", 32),
      link("hero.primaryHref", "Primary button link"),
      text("hero.secondaryLabel", "Secondary button text", 32),
      link("hero.secondaryHref", "Secondary button link"),
      image("hero.imageSrc", "Hero image"),
      text(
        "hero.imageAlt",
        "Image alt text",
        160,
        "Describe the image for accessibility and search engines.",
      ),
    ],
  },
  {
    id: "collections",
    label: "Collections",
    description: "Introduces Wander Bikes and Community Bikes separately.",
    fields: [
      text("collections.eyebrow", "Eyebrow", 50),
      text("collections.heading", "Heading", 110),
      textarea("collections.body", "Introduction", 320),
      text("collections.wanderTitle", "Wander card title", 60),
      textarea("collections.wanderBody", "Wander card description", 240),
      text("collections.wanderLabel", "Wander card link text", 40),
      link("collections.wanderHref", "Wander card link"),
      image("collections.wanderImageSrc", "Wander card image"),
      text("collections.wanderImageAlt", "Wander image alt text", 160),
      text("collections.communityTitle", "Community card title", 60),
      textarea("collections.communityBody", "Community card description", 240),
      text("collections.communityLabel", "Community card link text", 40),
      link("collections.communityHref", "Community card link"),
      image("collections.communityImageSrc", "Community card image"),
      text("collections.communityImageAlt", "Community image alt text", 160),
    ],
  },
  {
    id: "listings",
    label: "Live listings",
    description: "Headings and links above live bike inventory.",
    fields: [
      text("listings.wanderEyebrow", "Wander eyebrow", 50),
      text("listings.wanderHeading", "Wander heading", 80),
      text("listings.wanderLinkLabel", "Wander link text", 50),
      link("listings.wanderLinkHref", "Wander link"),
      text("listings.communityEyebrow", "Community eyebrow", 50),
      text("listings.communityHeading", "Community heading", 80),
      text("listings.communityLinkLabel", "Community link text", 50),
      link("listings.communityLinkHref", "Community link"),
    ],
  },
  {
    id: "shop",
    label: "Shop",
    description: "Explains the physical Wander Bike shop and services.",
    fields: [
      text("shop.heading", "Heading", 80),
      text("shop.highlight", "Highlighted words", 50),
      textarea("shop.body", "Description", 320),
      text("shop.primaryLabel", "Primary button text", 32),
      link("shop.primaryHref", "Primary button link"),
      text("shop.secondaryLabel", "Secondary button text", 40),
      link("shop.secondaryHref", "Secondary button link"),
      image("shop.imageSrc", "Shop image"),
      text("shop.imageAlt", "Shop image alt text", 160),
    ],
  },
  {
    id: "explore",
    label: "Explore",
    description: "Points visitors to local rental and route information.",
    fields: [
      text("explore.heading", "Heading", 100),
      textarea("explore.body", "Description", 320),
      image("explore.imageSrc", "Section image"),
      text("explore.imageAlt", "Image alt text", 160),
    ],
  },
  {
    id: "gallery",
    label: "Gallery",
    description: "Photos from the physical Wander Bike shop.",
    fields: [
      text("gallery.eyebrow", "Eyebrow", 50),
      text("gallery.heading", "Heading", 100),
      textarea("gallery.body", "Description", 320),
      image("gallery.image1Src", "First image"),
      text("gallery.image1Alt", "First image alt text", 160),
      text("gallery.image1Label", "First image caption", 80),
      image("gallery.image2Src", "Second image"),
      text("gallery.image2Alt", "Second image alt text", 160),
      text("gallery.image2Label", "Second image caption", 80),
      image("gallery.image3Src", "Third image"),
      text("gallery.image3Alt", "Third image alt text", 160),
      text("gallery.image3Label", "Third image caption", 80),
    ],
  },
  {
    id: "faq",
    label: "FAQ",
    description: "A short homepage preview of common questions.",
    fields: [
      text("faq.eyebrow", "Eyebrow", 50),
      text("faq.heading", "Heading", 110),
      textarea("faq.body", "Introduction", 320),
      text("faq.primaryLabel", "Primary button text", 40),
      link("faq.primaryHref", "Primary button link"),
      text("faq.secondaryLabel", "Secondary button text", 40),
      link("faq.secondaryHref", "Secondary button link"),
      text("faq.question1", "Question 1", 140),
      textarea("faq.answer1", "Answer 1", 320),
      text("faq.question2", "Question 2", 140),
      textarea("faq.answer2", "Answer 2", 320),
      text("faq.question3", "Question 3", 140),
      textarea("faq.answer3", "Answer 3", 320),
      text("faq.question4", "Question 4", 140),
      textarea("faq.answer4", "Answer 4", 320),
    ],
  },
  {
    id: "steps",
    label: "How it works",
    description: "The three-step local request and pickup summary.",
    fields: [
      text("steps.heading", "Heading", 110),
      text("steps.step1Title", "Step 1 title", 60),
      textarea("steps.step1Body", "Step 1 description", 220),
      text("steps.step2Title", "Step 2 title", 60),
      textarea("steps.step2Body", "Step 2 description", 220),
      text("steps.step3Title", "Step 3 title", 60),
      textarea("steps.step3Body", "Step 3 description", 220),
      text("steps.linkLabel", "Link text", 60),
      link("steps.linkHref", "Link destination"),
    ],
  },
];

export const websitePageDefinitions: WebsitePageDefinition[] = [
  {
    slug: "home",
    label: "Home",
    path: "/",
    description: "The main Wander Bike homepage.",
    editable: true,
    sections: homeSections,
    defaults: homeContentDefaults,
  },
  aboutPageDefinition,
  pricingPageDefinition,
  howItWorksPageDefinition,
  quickRepairPageDefinition,
  locationPageDefinition,
  faqPageDefinition,
];

export function getWebsitePageDefinition(slug: string) {
  return websitePageDefinitions.find((page) => page.slug === slug) ?? null;
}

export function getWebsiteSectionDefinition(slug: string, sectionId: string) {
  return (
    getWebsitePageDefinition(slug)?.sections.find(
      (section) => section.id === sectionId,
    ) ?? null
  );
}

export function mergeWebsiteContent(
  defaults: WebsiteContent,
  stored: unknown,
): WebsiteContent {
  if (!stored || typeof stored !== "object" || Array.isArray(stored)) {
    return { ...defaults };
  }

  const merged = { ...defaults };
  for (const [key, value] of Object.entries(stored)) {
    if (key in defaults && typeof value === "string") merged[key] = value;
  }
  return merged;
}
