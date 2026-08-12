export type SiteNavigationWorkspace = "website" | "marketplace";

export type SiteNavigationLink = {
  href: string;
  label: string;
  cmsSlug?: string;
  workspace?: SiteNavigationWorkspace;
};

export type CmsSiteNavigationLink = SiteNavigationLink & {
  cmsSlug?: string;
};

export type SiteNavigationSection = {
  label?: string;
  links: SiteNavigationLink[];
};

export type SiteNavigationItem =
  | (SiteNavigationLink & {
      id: string;
      kind: "page" | "workspace";
    })
  | {
      id: string;
      kind: "group";
      label: string;
      sections: SiteNavigationSection[];
    };

export type CmsSiteNavigationItem =
  | (SiteNavigationLink & {
      id: string;
      kind: "page";
      cmsSlug: string;
    })
  | (SiteNavigationLink & {
      id: string;
      kind: "workspace";
    })
  | {
      id: string;
      kind: "group";
      label: string;
      sections: Array<{
        label?: string;
        links: CmsSiteNavigationLink[];
      }>;
    };

export const serviceLinks: SiteNavigationLink[] = [
  {
    href: "/bike-rental-richmond",
    label: "Bike Rental in Richmond",
    workspace: "website",
  },
  {
    href: "/bike-rental-steveston",
    label: "Bike Rental in Steveston",
    workspace: "website",
  },
  {
    href: "/about",
    label: "About Wander Bike",
    cmsSlug: "about",
    workspace: "website",
  },
  {
    href: "/about-marketplace",
    label: "About Marketplace",
    workspace: "website",
  },
  {
    href: "/pricing",
    label: "Pricing",
    cmsSlug: "pricing",
    workspace: "website",
  },
  {
    href: "/adult-bike-rental-richmond",
    label: "Adult Bikes",
    workspace: "website",
  },
  {
    href: "/kids-bike-rental-richmond",
    label: "Kids Bikes",
    workspace: "website",
  },
  {
    href: "/bike-trailer-rental-richmond",
    label: "Bike Trailers",
    workspace: "website",
  },
  {
    href: "/quick-bike-repair-richmond",
    label: "Quick Repair",
    cmsSlug: "quick-repair",
    workspace: "website",
  },
];

export const localGuideLinks: SiteNavigationLink[] = [
  {
    href: "/guides/best-places-to-bike-in-steveston",
    label: "Best Places to Bike in Steveston",
    workspace: "website",
  },
  {
    href: "/guides/family-bike-rental-richmond",
    label: "Family Bike Rental Guide",
    workspace: "website",
  },
  {
    href: "/guides/steveston-bike-ride-guide",
    label: "Steveston Bike Ride Guide",
    workspace: "website",
  },
  {
    href: "/guides/bike-trailer-rental-richmond-guide",
    label: "Bike Trailer Rental Guide",
    workspace: "website",
  },
];

export const guideHomeLink: SiteNavigationLink = {
  href: "/guides",
  label: "All 160 B.C. Guides",
  workspace: "website",
};

export const practicalGuideLinks: SiteNavigationLink[] = [
  {
    href: "/guides/metro-vancouver-route-map",
    label: "Metro Vancouver Route Map",
    workspace: "website",
  },
  {
    href: "/guides/find-public-washroom-near-you",
    label: "Find a Public Washroom",
    workspace: "website",
  },
];

export const guideGroups: SiteNavigationSection[] = [
  {
    label: "Start local",
    links: [
      {
        href: "/guides/richmond-bc-cycling-guide",
        label: "Richmond",
        workspace: "website",
      },
      {
        href: "/guides/vancouver-bc-cycling-guide",
        label: "Vancouver",
        workspace: "website",
      },
    ],
  },
  {
    label: "Across B.C.",
    links: [
      {
        href: "/guides/victoria-bc-cycling-guide",
        label: "Victoria",
        workspace: "website",
      },
      {
        href: "/guides/kelowna-bc-cycling-guide",
        label: "Kelowna",
        workspace: "website",
      },
      {
        href: "/guides/whistler-bc-cycling-guide",
        label: "Whistler",
        workspace: "website",
      },
      {
        href: "/guides/tofino-bc-cycling-guide",
        label: "Tofino",
        workspace: "website",
      },
      {
        href: "/guides/kamloops-bc-cycling-guide",
        label: "Kamloops",
        workspace: "website",
      },
      {
        href: "/guides/prince-george-bc-cycling-guide",
        label: "Prince George",
        workspace: "website",
      },
    ],
  },
  {
    label: "Browse by region",
    links: [
      {
        href: "/guides#region-metro-vancouver",
        label: "Metro Vancouver",
        workspace: "website",
      },
      {
        href: "/guides#region-capital",
        label: "Capital Region",
        workspace: "website",
      },
      {
        href: "/guides#region-thompson-nicola",
        label: "Thompson-Nicola",
        workspace: "website",
      },
      {
        href: "/guides#region-central-kootenay",
        label: "Central Kootenay",
        workspace: "website",
      },
      {
        href: "/guides#region-bulkley-nechako",
        label: "Bulkley-Nechako",
        workspace: "website",
      },
      {
        href: "/guides#region-east-kootenay",
        label: "East Kootenay",
        workspace: "website",
      },
    ],
  },
];

export const primaryNavigation = {
  home: {
    id: "home",
    kind: "page",
    href: "/",
    label: "Home",
    cmsSlug: "home",
    workspace: "website",
  },
  services: {
    id: "services",
    kind: "group",
    label: "Our Services",
    sections: [{ links: serviceLinks }],
  },
  findBike: {
    id: "find-bike",
    kind: "workspace",
    href: "/bikes",
    label: "Find a Bike",
    workspace: "marketplace",
  },
  listBike: {
    id: "list-bike",
    kind: "workspace",
    href: "/list-your-bike",
    label: "List Your Bike",
    workspace: "marketplace",
  },
  guides: {
    id: "guides",
    kind: "group",
    label: "Guides",
    sections: [
      { label: "Guide directory", links: [guideHomeLink] },
      { label: "Ride essentials", links: practicalGuideLinks },
      { label: "Local guides", links: localGuideLinks },
      ...guideGroups,
    ],
  },
  location: {
    id: "location",
    kind: "page",
    href: "/location",
    label: "Location",
    cmsSlug: "location",
    workspace: "website",
  },
  faq: {
    id: "faq",
    kind: "page",
    href: "/faq",
    label: "FAQ",
    cmsSlug: "faq",
    workspace: "website",
  },
} satisfies Record<string, SiteNavigationItem>;

export const primarySiteNavigation = [
  primaryNavigation.home,
  primaryNavigation.services,
  primaryNavigation.findBike,
  primaryNavigation.listBike,
  primaryNavigation.guides,
  primaryNavigation.location,
  primaryNavigation.faq,
] satisfies SiteNavigationItem[];

export const otherWebsitePages: SiteNavigationLink[] = [
  {
    href: "/how-it-works",
    label: "How it works",
    cmsSlug: "how-it-works",
    workspace: "website",
  },
];
