import {
  imageField,
  linkField,
  textField,
  textareaField,
  type WebsiteContent,
  type WebsitePageDefinition,
  type WebsiteSectionDefinition,
} from "@/lib/website-cms/definitions";

const aboutFaqSeeds = [
  [
    "When did Wander Bike Rentals open?",
    "Wander Bike Rentals opened its Steveston shop in April 2026 at 12071 First Ave #101, Richmond, British Columbia.",
  ],
  [
    "What does the Wander Bike shop do?",
    "The physical shop provides bike rentals, local bike sales, and quick repairs for common bicycle issues. It also manages the Wander Bikes collection on the online marketplace.",
  ],
  [
    "What is Wander Bike building?",
    "Wander is building a bicycle-sharing marketplace where shops and local owners can make bikes available to other riders. Alongside it, Wander publishes province-wide cycling guides so riders can understand a destination before finding a bike there.",
  ],
  [
    "Is the sharing platform available everywhere now?",
    "Not yet. Rentals and marketplace exchanges currently operate locally from Steveston and serve Richmond-area riders. The 160 British Columbia cycling guides are available province-wide as planning resources, but they do not represent rental coverage in every city.",
  ],
  [
    "What are the British Columbia cycling guides?",
    "They are 160 destination pages covering cities, towns, villages, districts, and other B.C. communities. Each guide includes ride ideas, planning notes, a research-depth label, and links to the official sources used.",
  ],
] as const;

export const aboutContentDefaults: WebsiteContent = {
  "hero.eyebrow": "Opened in Steveston · April 2026",
  "hero.heading": "A local bike shop with a bigger riding mission.",
  "hero.body":
    "Based in Steveston, Wander Bike Rentals is one of Richmond's largest and most dependable used bike rental and sales shops. We pair a real local shop and community marketplace with 160 B.C. cycling guides, building toward a simple idea: understand the ride, then find a useful bike near the destination.",
  "hero.primaryLabel": "Go to Store",
  "hero.primaryHref":
    "https://maps.google.com/?q=12071+First+Ave+%23101+Richmond+BC+V7E+3M1",
  "hero.secondaryLabel": "Find a Bike",
  "hero.secondaryHref": "/bikes",
  "hero.tertiaryLabel": "Explore B.C. Guides",
  "hero.tertiaryHref": "/guides",
  "hero.imageSrc": "/assets/bikes-row.jpg",
  "hero.imageAlt": "Bicycles ready at Wander Bike Rentals in Steveston",

  "snapshot.item1Title": "A real local shop",
  "snapshot.item1Body": "12071 First Ave #101, Steveston",
  "snapshot.item2Title": "Open every day",
  "snapshot.item2Body": "9:00 AM–10:00 PM",
  "snapshot.item3Title": "Local first",
  "snapshot.item3Body": "Serving Richmond-area riders today",
  "snapshot.item4Title": "160 B.C. guides",
  "snapshot.item4Body": "Ride planning across 27 regions",

  "story.eyebrow": "The Wander story",
  "story.heading": "We started by helping people ride right here.",
  "story.body1":
    "Wander Bike Rentals opened in April 2026 at 12071 First Ave #101 in Steveston, Richmond. The shop gives visitors and local riders a straightforward place to rent a bike, ask for a quick repair, or learn what is available before heading out.",
  "story.body2":
    "Steveston is where the idea became real: bikes in one physical shop, riders arriving with different needs, and useful bikes sitting idle elsewhere in the community. That led us to build an online marketplace alongside the shop.",
  "story.body3":
    "Wander Bikes are managed by our team. Community Bikes remain separately listed by local owners. Keeping those collections clear is part of building trust as the platform grows.",
  "story.body4":
    "The same question—what does someone need for a good local ride?—led to our B.C. guide library. The guides expand Wander's planning help across the province while rentals and marketplace exchanges remain clearly local.",
  "story.imageSrc": "/assets/quick-repair-hero.jpg",
  "story.imageAlt": "Quick bike repair service at Wander Bike Rentals",
  "story.imageEyebrow": "Our beginning",
  "story.imageCaption": "One storefront in Steveston. April 2026.",

  "services.eyebrow": "What Wander does today",
  "services.heading":
    "Shop services, a local marketplace, and B.C. ride guides",
  "services.item1Title": "Bike rentals",
  "services.item1Body":
    "Choose a specific Wander bike with its own photos and price. Rentals include a helmet, basket, and lock.",
  "services.item1Label": "Browse Wander Bikes",
  "services.item1Href": "/bikes/wander",
  "services.item2Title": "Quick bike repair",
  "services.item2Body":
    "Bring common problems such as flat tires, brake adjustment, gear tuning, wheel rubbing, or chain issues to our Steveston shop.",
  "services.item2Label": "See quick repair services",
  "services.item2Href": "/quick-bike-repair-richmond",
  "services.item3Title": "Community marketplace",
  "services.item3Body":
    "Local owners can list an idle bike for rent or sale, helping more bikes spend time on the road instead of in storage.",
  "services.item3Label": "About the marketplace",
  "services.item3Href": "/about-marketplace",
  "services.item4Title": "B.C. cycling guides",
  "services.item4Body":
    "Plan rides across 160 British Columbia destinations with terrain notes, local ideas, research labels, and official source links.",
  "services.item4Label": "Explore all B.C. guides",
  "services.item4Href": "/guides",

  "safety.eyebrow": "Rental-ready every day",
  "safety.heading": "The small safety details matter.",
  "safety.body":
    "Every Wander rental bike is checked daily before it is sent out. We make sure the practical equipment riders expect is present, visible, and ready for the trip.",
  "safety.cardHeading": "Daily Wander bike check",
  "safety.item1": "Kickstand installed and working",
  "safety.item2": "Bell present and easy to use",
  "safety.item3": "White front reflector and red rear reflector present",
  "safety.item4": "Helmet, basket, and lock included with every rental",

  "mission.eyebrow": "Where we want to go",
  "mission.heading": "Find the bike there. Leave yours at home.",
  "mission.body":
    "Our long-term goal is a bicycle-sharing platform for everyone: local shops and owners making bikes available, and riders finding a suitable bike wherever they are. A weekend away, a visit to a new neighbourhood, or a casual ride should not require carrying your own bicycle with you.",
  "mission.todayEyebrow": "Today",
  "mission.todayHeading": "Local service from Steveston",
  "mission.todayBody":
    "Wander currently serves Richmond-area riders through one physical shop, Wander-managed rentals, and Community Bikes listed by local owners. Pickup and payment are arranged locally, while 160 B.C. guides help anyone plan a ride across the province.",
  "mission.futureEyebrow": "Building toward",
  "mission.futureHeading": "A wider network of shared bikes",
  "mission.futureBody":
    "We want more idle bikes to become useful local transportation and more riders to access a bike near their destination. That broader network is our direction, not a claim of current worldwide coverage.",

  "facts.eyebrow": "Wander Bike facts",
  "facts.heading": "Clear information about the shop and platform",
  "facts.item1Term": "Opened",
  "facts.item1Detail": "April 2026",
  "facts.item2Term": "Physical shop",
  "facts.item2Detail": "12071 First Ave #101, Richmond, BC V7E 3M1",
  "facts.item3Term": "Hours",
  "facts.item3Detail": "Open daily from 9:00 AM to 10:00 PM",
  "facts.item4Term": "Current service area",
  "facts.item4Detail": "Steveston and the Richmond, BC area",
  "facts.item5Term": "Shop services",
  "facts.item5Detail": "Bike rentals, local bike sales, and quick bike repair",
  "facts.item6Term": "Online platform",
  "facts.item6Detail":
    "Separate Wander Bikes and Community Bikes collections for local rental or sale requests",
  "facts.item7Term": "Guide library",
  "facts.item7Detail":
    "160 published cycling guides across 27 British Columbia regions",
  "facts.item8Term": "Long-term mission",
  "facts.item8Detail":
    "Make shared bicycles easier to find near a rider’s destination",

  "faq.eyebrow": "About Wander Bike",
  "faq.heading": "Common questions",

  "cta.eyebrow": "Start local",
  "cta.heading": "Visit Wander Bike in Steveston.",
  "cta.body":
    "Rent a bike, ask about a quick repair, explore the local marketplace, or plan your next B.C. ride.",
  "cta.primaryLabel": "Go to Store",
  "cta.primaryHref":
    "https://maps.google.com/?q=12071+First+Ave+%23101+Richmond+BC+V7E+3M1",
  "cta.secondaryLabel": "Explore the platform",
  "cta.secondaryHref": "/about-marketplace",
  "cta.tertiaryLabel": "Browse B.C. guides",
  "cta.tertiaryHref": "/guides",
};

aboutFaqSeeds.forEach(([question, answer], index) => {
  aboutContentDefaults[`faq.question${index + 1}`] = question;
  aboutContentDefaults[`faq.answer${index + 1}`] = answer;
});

const sections: WebsiteSectionDefinition[] = [
  {
    id: "hero",
    label: "Hero",
    description: "Wander's opening story, calls to action, and shop image.",
    fields: [
      textField("hero.eyebrow", "Eyebrow", 70),
      textField("hero.heading", "Headline", 110),
      textareaField("hero.body", "Short paragraph", 520),
      textField("hero.primaryLabel", "Primary button text", 36),
      linkField("hero.primaryHref", "Primary button link"),
      textField("hero.secondaryLabel", "Secondary button text", 36),
      linkField("hero.secondaryHref", "Secondary button link"),
      textField("hero.tertiaryLabel", "Third button text", 36),
      linkField("hero.tertiaryHref", "Third button link"),
      imageField("hero.imageSrc", "Hero image"),
      textField("hero.imageAlt", "Image alt text", 160),
    ],
  },
  {
    id: "snapshot",
    label: "Shop snapshot",
    description: "Four quick facts immediately below the hero.",
    fields: [1, 2, 3, 4].flatMap((number) => [
      textField(`snapshot.item${number}Title`, `Fact ${number} title`, 60),
      textField(`snapshot.item${number}Body`, `Fact ${number} detail`, 90),
    ]),
  },
  {
    id: "story",
    label: "Our story",
    description: "The origin story and accompanying repair-shop image.",
    fields: [
      textField("story.eyebrow", "Eyebrow", 60),
      textField("story.heading", "Heading", 110),
      textareaField("story.body1", "Paragraph 1", 420),
      textareaField("story.body2", "Paragraph 2", 420),
      textareaField("story.body3", "Paragraph 3", 360),
      textareaField("story.body4", "Paragraph 4", 420),
      imageField("story.imageSrc", "Story image"),
      textField("story.imageAlt", "Image alt text", 160),
      textField("story.imageEyebrow", "Image card eyebrow", 50),
      textField("story.imageCaption", "Image card caption", 100),
    ],
  },
  {
    id: "services",
    label: "Services",
    description: "The four things Wander offers today.",
    fields: [
      textField("services.eyebrow", "Eyebrow", 60),
      textField("services.heading", "Heading", 120),
      ...[1, 2, 3, 4].flatMap((number) => [
        textField(`services.item${number}Title`, `Service ${number} title`, 70),
        textareaField(`services.item${number}Body`, `Service ${number} description`, 300),
        textField(`services.item${number}Label`, `Service ${number} link text`, 50),
        linkField(`services.item${number}Href`, `Service ${number} link`),
      ]),
    ],
  },
  {
    id: "safety",
    label: "Safety details",
    description: "Daily rental-bike checks and included equipment.",
    fields: [
      textField("safety.eyebrow", "Eyebrow", 60),
      textField("safety.heading", "Heading", 100),
      textareaField("safety.body", "Description", 320),
      textField("safety.cardHeading", "Checklist heading", 80),
      ...[1, 2, 3, 4].map((number) =>
        textField(`safety.item${number}`, `Checklist item ${number}`, 120),
      ),
    ],
  },
  {
    id: "mission",
    label: "Mission",
    description: "Wander's present footprint and longer-term direction.",
    fields: [
      textField("mission.eyebrow", "Eyebrow", 60),
      textField("mission.heading", "Heading", 110),
      textareaField("mission.body", "Mission description", 520),
      textField("mission.todayEyebrow", "Today eyebrow", 40),
      textField("mission.todayHeading", "Today heading", 90),
      textareaField("mission.todayBody", "Today description", 420),
      textField("mission.futureEyebrow", "Future eyebrow", 40),
      textField("mission.futureHeading", "Future heading", 90),
      textareaField("mission.futureBody", "Future description", 420),
    ],
  },
  {
    id: "facts",
    label: "Company facts",
    description: "The structured facts about Wander, its shop, and its platform.",
    fields: [
      textField("facts.eyebrow", "Eyebrow", 60),
      textField("facts.heading", "Heading", 110),
      ...[1, 2, 3, 4, 5, 6, 7, 8].flatMap((number) => [
        textField(`facts.item${number}Term`, `Fact ${number} label`, 60),
        textareaField(`facts.item${number}Detail`, `Fact ${number} detail`, 220),
      ]),
    ],
  },
  {
    id: "faq",
    label: "About FAQ",
    description: "Five common questions about Wander Bike.",
    fields: [
      textField("faq.eyebrow", "Eyebrow", 60),
      textField("faq.heading", "Heading", 90),
      ...[1, 2, 3, 4, 5].flatMap((number) => [
        textField(`faq.question${number}`, `Question ${number}`, 160),
        textareaField(`faq.answer${number}`, `Answer ${number}`, 420),
      ]),
    ],
  },
  {
    id: "cta",
    label: "Call to action",
    description: "The final Steveston visit prompt and links.",
    fields: [
      textField("cta.eyebrow", "Eyebrow", 60),
      textField("cta.heading", "Heading", 100),
      textareaField("cta.body", "Description", 280),
      ...(["primary", "secondary", "tertiary"] as const).flatMap((key) => [
        textField(`cta.${key}Label`, `${key} button text`, 40),
        linkField(`cta.${key}Href`, `${key} button link`),
      ]),
    ],
  },
];

export const aboutPageDefinition: WebsitePageDefinition = {
  slug: "about",
  label: "About",
  path: "/about",
  description: "About Wander Bike and the Steveston shop.",
  editable: true,
  sections,
  defaults: aboutContentDefaults,
};
