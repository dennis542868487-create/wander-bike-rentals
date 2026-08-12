import {
  imageField,
  linkField,
  textField,
  textareaField,
  type WebsiteContent,
  type WebsitePageDefinition,
  type WebsiteSectionDefinition,
} from "@/lib/website-cms/definitions";

export const quickRepairContentDefaults: WebsiteContent = {
  "hero.kicker": "No Appointment Needed",
  "hero.eyebrow": "Quick Repair",
  "hero.heading": "Walk-in quick repair in Richmond.",
  "hero.body1":
    "Stop by Wander Bike Rentals for quick bike repair and basic maintenance in Steveston, Richmond.",
  "hero.body2":
    "Flat tires, brake and gear adjustments, chain cleaning, and basic safety checks can often be checked without an appointment.",
  "hero.primaryLabel": "Call Now",
  "hero.primaryHref": "tel:+17789521389",
  "hero.secondaryLabel": "View Location",
  "hero.secondaryHref": "/location",
  "hero.imageSrc": "/assets/quick-repair-workshop.webp",
  "hero.imageAlt":
    "A teal commuter bicycle on a repair stand beside an organized bike workshop bench",

  "services.eyebrow": "Services We Offer",
  "services.heading":
    "Quick repair and basic maintenance for common bike issues",
  "services.body":
    "These services are a good fit for common problems that can often be checked quickly when you walk in.",
  "services.item1Title": "Flat Repair / Tire Replacement",
  "services.item1Body":
    "For punctures, flat tires, worn tires, and tube replacement.",
  "services.item2Title": "Brake Adjustment / Brake Cable Replacement",
  "services.item2Body":
    "Brake tuning, cable replacement, housing replacement, and basic brake checks.",
  "services.item3Title": "Gear Adjustment / Shifter Cable Replacement",
  "services.item3Body":
    "Gear tuning, shifter cable replacement, housing replacement, and basic drivetrain checks.",
  "services.item4Title": "Spoke & Wheel Adjustment",
  "services.item4Body":
    "Basic spoke adjustment and wheel truing for minor wobbling or rubbing.",
  "services.item5Title": "Chain Cleaning & Basic Lubrication",
  "services.item5Body": "Chain degreasing, dirt removal, and basic lubrication.",
  "services.item6Title": "Basic Safety Check",
  "services.item6Body":
    "Tires, brakes, gears, chain, wheels, bolts, and general ride safety.",

  "expectations.walkInEyebrow": "Walk In Today",
  "expectations.walkInHeading": "Small issues can often be checked on the spot",
  "expectations.walkInBody1":
    "If your bike has a flat, rubbing wheel, slipping gears, or brakes that do not feel right, you can walk in and ask the shop to take a look.",
  "expectations.walkInBody2":
    "Many smaller problems can be checked quickly, especially when the repair is straightforward and the bike does not need deeper parts work.",
  "expectations.inspectionEyebrow": "Before service starts",
  "expectations.inspectionHeading":
    "Final service and price depend on the inspection",
  "expectations.inspectionBody1":
    "The final repair recommendation depends on the bike condition after inspection, including parts wear, cable condition, tire condition, and overall ride safety.",
  "expectations.inspectionBody2":
    "That means the exact service and final price are confirmed after the shop has had a chance to check the bike properly.",

  "cta.eyebrow": "Need help now?",
  "cta.heading": "Call first or walk in for a quick repair check",
  "cta.body":
    "If the issue is small, the shop can often take a look quickly. For location details or common questions, use the links below.",
  "cta.primaryLabel": "Call Now",
  "cta.primaryHref": "tel:+17789521389",
  "cta.locationLabel": "Location",
  "cta.locationHref": "/location",
  "cta.faqLabel": "FAQ",
  "cta.faqHref": "/faq",
};

const sections: WebsiteSectionDefinition[] = [
  {
    id: "hero",
    label: "Hero",
    description: "The walk-in repair introduction, actions, and workshop image.",
    fields: [
      textField("hero.kicker", "Top note", 60),
      textField("hero.eyebrow", "Eyebrow", 50),
      textField("hero.heading", "Headline", 100),
      textareaField("hero.body1", "First paragraph", 260),
      textareaField("hero.body2", "Second paragraph", 280),
      textField("hero.primaryLabel", "Primary button text", 32),
      linkField("hero.primaryHref", "Primary button link"),
      textField("hero.secondaryLabel", "Secondary button text", 32),
      linkField("hero.secondaryHref", "Secondary button link"),
      imageField("hero.imageSrc", "Hero image"),
      textField("hero.imageAlt", "Image alt text", 160),
    ],
  },
  {
    id: "services",
    label: "Services",
    description: "The six common quick-repair services.",
    fields: [
      textField("services.eyebrow", "Eyebrow", 60),
      textField("services.heading", "Heading", 120),
      textareaField("services.body", "Introduction", 280),
      ...[1, 2, 3, 4, 5, 6].flatMap((number) => [
        textField(`services.item${number}Title`, `Service ${number} title`, 90),
        textareaField(`services.item${number}Body`, `Service ${number} description`, 240),
      ]),
    ],
  },
  {
    id: "expectations",
    label: "What to expect",
    description: "Walk-in guidance and the inspection disclaimer.",
    fields: [
      textField("expectations.walkInEyebrow", "Walk-in eyebrow", 60),
      textField("expectations.walkInHeading", "Walk-in heading", 110),
      textareaField("expectations.walkInBody1", "Walk-in paragraph 1", 320),
      textareaField("expectations.walkInBody2", "Walk-in paragraph 2", 320),
      textField("expectations.inspectionEyebrow", "Inspection eyebrow", 60),
      textField("expectations.inspectionHeading", "Inspection heading", 120),
      textareaField("expectations.inspectionBody1", "Inspection paragraph 1", 360),
      textareaField("expectations.inspectionBody2", "Inspection paragraph 2", 320),
    ],
  },
  {
    id: "cta",
    label: "Call to action",
    description: "The final call, location, and FAQ links.",
    fields: [
      textField("cta.eyebrow", "Eyebrow", 60),
      textField("cta.heading", "Heading", 110),
      textareaField("cta.body", "Description", 300),
      textField("cta.primaryLabel", "Call button text", 32),
      linkField("cta.primaryHref", "Call button link"),
      textField("cta.locationLabel", "Location button text", 32),
      linkField("cta.locationHref", "Location button link"),
      textField("cta.faqLabel", "FAQ button text", 32),
      linkField("cta.faqHref", "FAQ button link"),
    ],
  },
];

export const quickRepairPageDefinition: WebsitePageDefinition = {
  slug: "quick-repair",
  label: "Quick repair",
  path: "/quick-bike-repair-richmond",
  description: "Quick repair services at the shop.",
  editable: true,
  sections,
  defaults: quickRepairContentDefaults,
};
