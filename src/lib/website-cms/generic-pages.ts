import { readFileSync } from "node:fs";
import path from "node:path";
import {
  editableTextField,
  type WebsiteContent,
  type WebsitePageDefinition,
} from "@/lib/website-cms/definitions";
import {
  otherWebsitePages,
  primarySiteNavigation,
  serviceLinks,
  type CmsSiteNavigationItem,
  type SiteNavigationLink,
} from "@/lib/site-navigation";
import { getGuides } from "@/lib/guides/master-guide-data";

const MAX_GENERIC_TEXT_LENGTH = 4_000;
const SKIP_JSX_TEXT = new Set(["true", "false", "null", "undefined"]);

type SourceText = {
  key: string;
  label: string;
  value: string;
  occurrence: number;
};

const staticWebsitePages = [
  {
    href: "/bike-rental-richmond",
    label: "Bike Rental in Richmond",
    source: "src/app/bike-rental-richmond/page.tsx",
  },
  {
    href: "/bike-rental-steveston",
    label: "Bike Rental in Steveston",
    source: "src/app/bike-rental-steveston/page.tsx",
  },
  {
    href: "/about-marketplace",
    label: "About Marketplace",
    source: "src/app/about-marketplace/page.tsx",
  },
  {
    href: "/adult-bike-rental-richmond",
    label: "Adult Bikes",
    source: "src/app/adult-bike-rental-richmond/page.tsx",
  },
  {
    href: "/kids-bike-rental-richmond",
    label: "Kids Bikes",
    source: "src/app/kids-bike-rental-richmond/page.tsx",
  },
  {
    href: "/bike-trailer-rental-richmond",
    label: "Bike Trailers",
    source: "src/app/bike-trailer-rental-richmond/page.tsx",
  },
  {
    href: "/guides",
    label: "All 160 B.C. Guides",
    source: "src/app/guides/page.tsx",
  },
  {
    href: "/guides/metro-vancouver-route-map",
    label: "Metro Vancouver Route Map",
    source: "src/app/guides/metro-vancouver-route-map/page.tsx",
  },
  {
    href: "/guides/find-public-washroom-near-you",
    label: "Find a Public Washroom",
    source: "src/app/guides/find-public-washroom-near-you/page.tsx",
  },
  {
    href: "/guides/best-places-to-bike-in-steveston",
    label: "Best Places to Bike in Steveston",
    source: "src/app/guides/best-places-to-bike-in-steveston/page.tsx",
  },
  {
    href: "/guides/bike-trailer-rental-richmond-guide",
    label: "Bike Trailer Rental Guide",
    source: "src/app/guides/bike-trailer-rental-richmond-guide/page.tsx",
  },
  {
    href: "/guides/family-bike-rental-richmond",
    label: "Family Bike Rental Guide",
    source: "src/app/guides/family-bike-rental-richmond/page.tsx",
  },
  {
    href: "/guides/steveston-bike-ride-guide",
    label: "Steveston Bike Ride Guide",
    source: "src/app/guides/steveston-bike-ride-guide/page.tsx",
  },
] as const;

function slugFromPath(value: string) {
  if (value === "/") return "home";
  return value
    .split("#")[0]
    .split("?")[0]
    .split("/")
    .filter(Boolean)
    .join("-");
}

function humanizeKey(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/^\w/, (letter) => letter.toUpperCase());
}

function decodeLiteral(raw: string) {
  try {
    return JSON.parse(`"${raw.replace(/"/g, '\\"')}"`) as string;
  } catch {
    return raw.replace(/\\'/g, "'").replace(/\\"/g, '"');
  }
}

function extractSourceText(sourcePath: string) {
  const source = readFileSync(
    path.join(/* turbopackIgnore: true */ process.cwd(), sourcePath),
    "utf8",
  );
  const found: Array<{ label: string; value: string; index: number }> = [];

  const propertyPattern =
    /\b(title|introduction|heroImageAlt|description|inventoryHeading|inventoryIntroduction|text|question|answer|headline|lead)\s*[:=]\s*(?:\r?\n\s*)?["']((?:\\.|(?!\2).)+?)["']/g;
  for (const match of source.matchAll(propertyPattern)) {
    const value = decodeLiteral(match[2]).trim();
    if (!value || value.includes("${") || value.length > MAX_GENERIC_TEXT_LENGTH)
      continue;
    found.push({
      label: humanizeKey(match[1]),
      value,
      index: match.index ?? 0,
    });
  }

  const jsxTextPattern = />([^<>{}\n][^<>{}]*?)</g;
  for (const match of source.matchAll(jsxTextPattern)) {
    const value = match[1].replace(/\s+/g, " ").trim();
    if (
      !value ||
      value.length < 2 ||
      value.length > MAX_GENERIC_TEXT_LENGTH ||
      SKIP_JSX_TEXT.has(value)
    ) {
      continue;
    }
    found.push({ label: "Page text", value, index: match.index ?? 0 });
  }

  found.sort((a, b) => a.index - b.index);
  const occurrences = new Map<string, number>();
  return found.map<SourceText>((item, index) => {
    const occurrence = occurrences.get(item.value) ?? 0;
    occurrences.set(item.value, occurrence + 1);
    return {
      key: `content.${index + 1}`,
      label: `${item.label} ${index + 1}`,
      value: item.value,
      occurrence,
    };
  });
}

function genericDefinition({
  href,
  label,
  source,
}: {
  href: string;
  label: string;
  source: string;
}): WebsitePageDefinition {
  const texts = extractSourceText(source);
  const defaults: WebsiteContent = Object.fromEntries(
    texts.map((text) => [text.key, text.value]),
  );

  return {
    slug: slugFromPath(href),
    label,
    path: href,
    description: `Text content on the ${label} page.`,
    editable: true,
    source: "generic-text",
    defaults,
    renderBindings: texts.map((text) => ({
      mode: "exact",
      value: text.value,
      occurrence: text.occurrence,
      sourceKey: text.key,
    })),
    sections: [
      {
        id: "page-content",
        label: "Page content",
        description: `All editable text currently rendered on ${label}.`,
        fields: texts.map((text) =>
          editableTextField(
            text.key,
            text.label,
            MAX_GENERIC_TEXT_LENGTH,
            {
              mode: "exact",
              value: text.value,
              occurrence: text.occurrence,
            },
          ),
        ),
      },
    ],
  };
}

function guideDefinition(
  guide: ReturnType<typeof getGuides>[number],
): WebsitePageDefinition {
  const orderedTexts = [
    { label: "Guide title", value: guide.title },
    { label: "Introduction", value: guide.lead },
    ...guide.blocks.flatMap((block) => {
      if (block.type === "heading") {
        return [{ label: "Section heading", value: block.text }];
      }
      if (block.type === "paragraph") {
        return [{ label: "Paragraph", value: block.text }];
      }
      return block.items.map((value) => ({ label: "List item", value }));
    }),
  ];
  const defaults: WebsiteContent = Object.fromEntries(
    orderedTexts.map((item, index) => [`content.${index + 1}`, item.value]),
  );
  const occurrences = new Map<string, number>();
  const guideBindings = orderedTexts.map((item, index) => {
    const occurrence = occurrences.get(item.value) ?? 0;
    occurrences.set(item.value, occurrence + 1);
    return {
      mode: "exact" as const,
      value: item.value,
      occurrence,
      sourceKey: `content.${index + 1}`,
    };
  });

  return {
    slug: slugFromPath(guide.url),
    label: guide.name,
    path: guide.url,
    description: `${guide.name} cycling guide content.`,
    editable: true,
    source: "generic-text",
    defaults,
    renderBindings: guideBindings,
    sections: [
      {
        id: "guide-content",
        label: "Guide content",
        description: `All editable text in the ${guide.name} guide.`,
        fields: orderedTexts.map((item, index) =>
          editableTextField(
            `content.${index + 1}`,
            `${item.label} ${index + 1}`,
            MAX_GENERIC_TEXT_LENGTH,
            guideBindings[index],
          ),
        ),
      },
    ],
  };
}

export const genericWebsitePageDefinitions = [
  ...staticWebsitePages.map(genericDefinition),
  ...getGuides().map(guideDefinition),
];

export function getGenericWebsitePageDefinition(slug: string) {
  return (
    genericWebsitePageDefinitions.find((definition) =>
      definition.slug === slug,
    ) ?? null
  );
}

export function getGenericWebsitePageDefinitionByPath(pathname: string) {
  const normalized = pathname.split("#")[0].split("?")[0] || "/";
  return genericWebsitePageDefinitions.find(
    (definition) => definition.path === normalized,
  ) ?? null;
}

const genericDefinitionByPath = new Map(
  genericWebsitePageDefinitions.map((definition) => [
    definition.path,
    definition,
  ]),
);

function cmsLink(link: SiteNavigationLink): SiteNavigationLink {
  const definition = genericDefinitionByPath.get(link.href);
  return definition ? { ...link, cmsSlug: definition.slug } : link;
}

const guides = getGuides();
const guidesByRegion = new Map<string, typeof guides>();
for (const guide of guides) {
  const regionGuides = guidesByRegion.get(guide.region) ?? [];
  regionGuides.push(guide);
  guidesByRegion.set(guide.region, regionGuides);
}

export const websiteCmsNavigation: CmsSiteNavigationItem[] =
  primarySiteNavigation.map((item) => {
    if (item.kind === "page") return item;
    if (item.kind === "workspace") return item;
    if (item.id === "services") {
      return {
        ...item,
        sections: [{ links: serviceLinks.map(cmsLink) }],
      };
    }
    const seenGuidePaths = new Set<string>();
    const featuredGuideLinks = item.sections
      .flatMap((section) => section.links)
      .map(cmsLink)
      .filter((link) => {
        if (link.href.includes("#") || seenGuidePaths.has(link.href)) {
          return false;
        }
        seenGuidePaths.add(link.href);
        return true;
      });
    return {
      ...item,
      sections: [
        {
          label: "Guide pages",
          links: featuredGuideLinks,
        },
        ...[...guidesByRegion.entries()].map(([region, regionGuides]) => ({
          label: region,
          links: regionGuides.map((guide) => ({
            href: guide.url,
            label: guide.name,
            cmsSlug: slugFromPath(guide.url),
            workspace: "website" as const,
          })),
        })),
      ],
    };
  });

const headerPaths = new Set(
  primarySiteNavigation.flatMap((item) =>
    item.kind === "group"
      ? item.sections.flatMap((section) =>
          section.links.map((link) => link.href),
        )
      : [item.href],
  ),
);

export const websiteCmsOtherPages: SiteNavigationLink[] = [
  ...otherWebsitePages,
  ...staticWebsitePages
    .filter((page) => !headerPaths.has(page.href))
    .map((page) => cmsLink({
      href: page.href,
      label: page.label,
      workspace: "website",
    })),
];
