import {
  imageField,
  linkField,
  textField,
  textareaField,
  type WebsiteContent,
  type WebsitePageDefinition,
  type WebsiteSectionDefinition,
} from "@/lib/website-cms/definitions";

export const howItWorksContentDefaults: WebsiteContent = {
  "hero.eyebrow": "Request first, meet locally",
  "hero.heading": "A local marketplace,",
  "hero.highlight": "without checkout.",
  "hero.body":
    "Wander helps people find each other and manage requests. The actual pickup, inspection, and payment happen in person.",
  "hero.imageSrc": "/assets/west-dyke-ride.webp",
  "hero.imageAlt": "Cyclists riding together on a Richmond waterfront route",

  "collections.wanderTitle": "Wander Bikes",
  "collections.wanderBody": "Managed directly by the Steveston shop.",
  "collections.wanderHref": "/bikes/wander",
  "collections.communityTitle": "Community Bikes",
  "collections.communityBody": "Listed separately by local owners.",
  "collections.communityHref": "/bikes/community",

  "journey.eyebrow": "The request journey",
  "journey.heading": "Four steps. No surprise checkout.",
  "journey.body":
    "Wander records the request and its status. The owner still decides whether the bike is available and where the accepted exchange happens.",
  "journey.step1Title": "Browse the right collection",
  "journey.step1Body":
    "Choose Wander Bikes or Community Bikes. Each listing shows who owns it, exactly what is offered, and that bike’s individual price.",
  "journey.step2Title": "Send a rental request or buying inquiry",
  "journey.step2Body":
    "Pick dates for a rental, or ask to buy. Sending a request does not charge you and is not yet a confirmed reservation.",
  "journey.step3Title": "Wait for the owner to confirm",
  "journey.step3Body":
    "The owner accepts or declines in their dashboard. Once accepted, you receive the private pickup details.",
  "journey.step4Title": "Meet, inspect, and pay locally",
  "journey.step4Body":
    "There is no shipping and no online payment. Complete the exchange directly with Wander or the community owner at pickup.",

  "cta.eyebrow": "Ready when you are",
  "cta.heading": "Find a bike—or put yours into the community.",
  "cta.primaryLabel": "Find a Bike",
  "cta.primaryHref": "/bikes",
  "cta.secondaryLabel": "List Your Bike",
  "cta.secondaryHref": "/list-your-bike",
};

const sections: WebsiteSectionDefinition[] = [
  {
    id: "hero",
    label: "Hero",
    description: "The opening explanation of the local request model.",
    fields: [
      textField("hero.eyebrow", "Eyebrow", 70),
      textField("hero.heading", "Headline", 90),
      textField("hero.highlight", "Highlighted line", 90),
      textareaField("hero.body", "Short paragraph", 320),
      imageField("hero.imageSrc", "Hero image"),
      textField("hero.imageAlt", "Image alt text", 160),
    ],
  },
  {
    id: "collections",
    label: "Collections",
    description: "Links to the separate Wander and Community collections.",
    fields: [
      textField("collections.wanderTitle", "Wander title", 60),
      textareaField("collections.wanderBody", "Wander description", 160),
      linkField("collections.wanderHref", "Wander link"),
      textField("collections.communityTitle", "Community title", 60),
      textareaField("collections.communityBody", "Community description", 160),
      linkField("collections.communityHref", "Community link"),
    ],
  },
  {
    id: "journey",
    label: "Request journey",
    description: "The four fixed steps from browsing to local pickup.",
    fields: [
      textField("journey.eyebrow", "Eyebrow", 60),
      textField("journey.heading", "Heading", 110),
      textareaField("journey.body", "Introduction", 300),
      ...[1, 2, 3, 4].flatMap((number) => [
        textField(`journey.step${number}Title`, `Step ${number} title`, 80),
        textareaField(`journey.step${number}Body`, `Step ${number} description`, 280),
      ]),
    ],
  },
  {
    id: "cta",
    label: "Call to action",
    description: "The final Find a Bike and List Your Bike prompt.",
    fields: [
      textField("cta.eyebrow", "Eyebrow", 60),
      textField("cta.heading", "Heading", 110),
      textField("cta.primaryLabel", "Primary button text", 32),
      linkField("cta.primaryHref", "Primary button link"),
      textField("cta.secondaryLabel", "Secondary button text", 32),
      linkField("cta.secondaryHref", "Secondary button link"),
    ],
  },
];

export const howItWorksPageDefinition: WebsitePageDefinition = {
  slug: "how-it-works",
  label: "How it works",
  path: "/how-it-works",
  description: "The rental and local marketplace process.",
  editable: true,
  sections,
  defaults: howItWorksContentDefaults,
};
