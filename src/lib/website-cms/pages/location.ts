import {
  imageField,
  linkField,
  textField,
  textareaField,
  type WebsiteContent,
  type WebsitePageDefinition,
  type WebsiteSectionDefinition,
} from "@/lib/website-cms/definitions";

export const locationContentDefaults: WebsiteContent = {
  "hero.heading": "Visit Wander Bike Rentals in",
  "hero.highlight": "Steveston.",
  "hero.body":
    "The physical shop is still open for Wander bike rentals, local bike sales, and quick repair. Check the address, hours, phone, and directions before you leave.",
  "hero.primaryLabel": "Call (778) 952-1389",
  "hero.primaryHref": "tel:+17789521389",
  "hero.secondaryLabel": "Open in Google Maps",
  "hero.secondaryHref":
    "https://maps.google.com/?q=12071+First+Ave+%23101+Richmond+BC+V7E+3M1",
  "hero.addressLabel": "Address",
  "hero.addressValue": "12071 First Ave #101, Richmond, BC V7E 3M1",
  "hero.phoneLabel": "Phone",
  "hero.phoneValue": "(778) 952-1389",
  "hero.hoursLabel": "Hours",
  "hero.hoursValue": "9:00 AM to 10:00 PM",
  "hero.imageSrc": "/assets/fishermans-wharf.webp",
  "hero.imageAlt": "Steveston harbour near Wander Bike Rentals",

  "map.eyebrow": "Map",
  "map.heading": "Find us on the map",
  "map.body":
    "12071 First Ave #101, Richmond, BC V7E 3M1. Tap the map to open directions in Google Maps.",

  "visit.eyebrow": "Before you visit",
  "visit.heading": "The basics should be easy to confirm",
  "visit.body":
    "Most people just want the essentials before they leave: where the shop is, how to call, and when it is open. This section keeps those details easy to check at a glance.",
  "visit.relatedEyebrow": "Related pages",
  "visit.relatedHeading": "Helpful next steps before you go",
  "visit.relatedBody":
    "Once you have the location, you may want to look at the rental pages again or check a few quick answers before visiting.",
  "visit.homeLabel": "Back to Home",
  "visit.homeHref": "/",
  "visit.richmondLabel": "Bike Rental Richmond",
  "visit.richmondHref": "/bike-rental-richmond",
  "visit.stevestonLabel": "Bike Rental Steveston",
  "visit.stevestonHref": "/bike-rental-steveston",
  "visit.faqLabel": "View FAQ",
  "visit.faqHref": "/faq",

  "repair.eyebrow": "Quick Repair",
  "repair.heading": "Walk in if you need help with a common bike issue",
  "repair.body1":
    "If you need help with a flat tire, brake adjustment, gear tuning, wheel rubbing, chain cleaning, or a basic safety check, you can stop by and ask the shop to take a look.",
  "repair.body2":
    "Smaller issues can often be checked quickly, and the final service depends on the bike condition after inspection.",
  "repair.cardEyebrow": "Walk-in repair info",
  "repair.cardHeading": "Check repair details before you head over",
  "repair.cardBody":
    "Use the repair page if you want a clearer overview of common services, walk-in expectations, and what the shop may be able to check on the spot.",
  "repair.primaryLabel": "Quick Repair",
  "repair.primaryHref": "/quick-bike-repair-richmond",
  "repair.secondaryLabel": "Call Now",
  "repair.secondaryHref": "tel:+17789521389",
};

const contactFields = [
  textField("hero.addressLabel", "Address label", 30),
  textField("hero.addressValue", "Address", 120),
  textField("hero.phoneLabel", "Phone label", 30),
  textField("hero.phoneValue", "Phone number", 40),
  textField("hero.hoursLabel", "Hours label", 30),
  textField("hero.hoursValue", "Opening hours", 60),
];

const sections: WebsiteSectionDefinition[] = [
  {
    id: "hero",
    label: "Hero",
    description: "The shop location, contact actions, hours, and harbour image.",
    fields: [
      textField("hero.heading", "Headline", 100),
      textField("hero.highlight", "Highlighted words", 50),
      textareaField("hero.body", "Short paragraph", 340),
      textField("hero.primaryLabel", "Primary button text", 40),
      linkField("hero.primaryHref", "Primary button link"),
      textField("hero.secondaryLabel", "Secondary button text", 40),
      linkField("hero.secondaryHref", "Secondary button link"),
      ...contactFields,
      imageField("hero.imageSrc", "Hero image"),
      textField("hero.imageAlt", "Image alt text", 160),
    ],
  },
  {
    id: "map",
    label: "Map",
    description: "The introduction above the locked store map.",
    fields: [
      textField("map.eyebrow", "Eyebrow", 40),
      textField("map.heading", "Heading", 90),
      textareaField("map.body", "Map description", 240),
    ],
  },
  {
    id: "visit",
    label: "Before you visit",
    description: "Essential contact details and related website links.",
    fields: [
      textField("visit.eyebrow", "Eyebrow", 50),
      textField("visit.heading", "Heading", 110),
      textareaField("visit.body", "Description", 320),
      textField("visit.relatedEyebrow", "Related pages eyebrow", 50),
      textField("visit.relatedHeading", "Related pages heading", 110),
      textareaField("visit.relatedBody", "Related pages description", 300),
      ...(["home", "richmond", "steveston", "faq"] as const).flatMap((key) => [
        textField(`visit.${key}Label`, `${key} link text`, 42),
        linkField(`visit.${key}Href`, `${key} link`),
      ]),
    ],
  },
  {
    id: "repair",
    label: "Quick repair",
    description: "The repair summary and links at the bottom of the location page.",
    fields: [
      textField("repair.eyebrow", "Eyebrow", 50),
      textField("repair.heading", "Heading", 120),
      textareaField("repair.body1", "First paragraph", 360),
      textareaField("repair.body2", "Second paragraph", 300),
      textField("repair.cardEyebrow", "Card eyebrow", 50),
      textField("repair.cardHeading", "Card heading", 110),
      textareaField("repair.cardBody", "Card description", 320),
      textField("repair.primaryLabel", "Primary button text", 32),
      linkField("repair.primaryHref", "Primary button link"),
      textField("repair.secondaryLabel", "Secondary button text", 32),
      linkField("repair.secondaryHref", "Secondary button link"),
    ],
  },
];

export const locationPageDefinition: WebsitePageDefinition = {
  slug: "location",
  label: "Location",
  path: "/location",
  description: "Address, hours, directions, and contact details.",
  editable: true,
  sections,
  defaults: locationContentDefaults,
};
