import { readFileSync } from "node:fs";
import path from "node:path";

export const GUIDE_RESEARCH_DATE = "8 August 2026";

export type GuideResearchDepth = "A+" | "A" | "B" | "C";

export type GuideSource = {
  id: string;
  title: string;
  url: string;
  use: string;
};

export type GuideBlock =
  | {
      type: "heading";
      level: 2 | 3;
      text: string;
      id: string;
    }
  | {
      type: "paragraph";
      text: string;
    }
  | {
      type: "list";
      ordered: boolean;
      items: string[];
    };

export type CyclingGuide = {
  name: string;
  classification: string;
  region: string;
  depth: GuideResearchDepth;
  url: string;
  slug: string;
  title: string;
  seoTitle: string;
  description: string;
  lead: string;
  blocks: GuideBlock[];
  sourceIds: string[];
  sources: GuideSource[];
};

const MASTER_GUIDE_PATH = path.join(
  /* turbopackIgnore: true */ process.cwd(),
  "content/guides/wanderbike_bc_cycling_guides_master.md",
);

const masterGuide = readFileSync(MASTER_GUIDE_PATH, "utf8");

function stripInlineCode(value: string) {
  return value.trim().replace(/^`|`$/g, "");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function extractField(section: string, label: string) {
  const match = section.match(
    new RegExp(`^\\*\\*${escapeRegExp(label)}:\\*\\*\\s+(.+?)\\s*$`, "m"),
  );
  return match ? stripInlineCode(match[1]) : "";
}

function extractDestinationSection(name: string) {
  const destinationsStart = masterGuide.indexOf("# All B.C. destination guides");
  const sourceDeskStart = masterGuide.indexOf("# Source desk");
  const destinations = masterGuide.slice(destinationsStart, sourceDeskStart);
  const startPattern = new RegExp(`^## ${escapeRegExp(name)}\\s*$`, "m");
  const startMatch = startPattern.exec(destinations);

  if (!startMatch) {
    throw new Error(`Guide section not found for ${name}`);
  }

  const afterStart = startMatch.index + startMatch[0].length;
  const remainder = destinations.slice(afterStart);
  const nextHeading = /^## .+$/m.exec(remainder);
  const end = nextHeading ? afterStart + nextHeading.index : destinations.length;
  return destinations.slice(startMatch.index, end).trim();
}

function extractRichmondFlagship() {
  const start = masterGuide.indexOf(
    "# Richmond Cycling Guide Hub — Flagship publish-ready copy",
  );
  const end = masterGuide.indexOf("# All B.C. destination guides");

  if (start === -1 || end === -1) {
    throw new Error("Richmond flagship guide section not found");
  }

  return masterGuide.slice(start, end).trim();
}

function parseSourceDesk() {
  const sourceDesk = masterGuide.slice(masterGuide.indexOf("# Source desk"));
  const sourcePattern =
    /^## (S\d+) — (.+?)\n\n- \*\*URL:\*\* (.+?)\n- \*\*Use:\*\* (.+?)\s*(?=\n\n## |\n# |$)/gm;
  const sources = new Map<string, GuideSource>();

  for (const match of sourceDesk.matchAll(sourcePattern)) {
    sources.set(match[1], {
      id: match[1],
      title: match[2].trim(),
      url: match[3].trim(),
      use: match[4].trim(),
    });
  }

  return sources;
}

const sourceDesk = parseSourceDesk();

function extractSourceIds(section: string) {
  const ids = new Set<string>();
  for (const match of section.matchAll(/^- (S\d+):\s+https?:\/\/.+$/gm)) {
    ids.add(match[1]);
  }
  return [...ids];
}

function parseMarkdownBody(section: string) {
  const withoutComments = section.replace(/<!--[\s\S]*?-->/g, "");
  const titleMatch = /^#{2,3} (Cycling in .+?, BC)\s*$/m.exec(withoutComments);

  if (!titleMatch) {
    throw new Error("Cycling guide title heading not found");
  }

  const sourceTitleLevel = titleMatch[0].match(/^#+/)?.[0].length ?? 2;
  const bodyStart = titleMatch.index + titleMatch[0].length;
  const body = withoutComments
    .slice(bodyStart)
    .replace(/^---\s*$/gm, "")
    .trim();
  const lines = body.split(/\r?\n/);
  const blocks: GuideBlock[] = [];
  const usedIds = new Map<string, number>();
  let index = 0;

  const uniqueId = (text: string) => {
    const base = slugify(text) || "section";
    const count = usedIds.get(base) ?? 0;
    usedIds.set(base, count + 1);
    return count === 0 ? base : `${base}-${count + 1}`;
  };

  while (index < lines.length) {
    const line = lines[index].trim();

    if (!line) {
      index += 1;
      continue;
    }

    const headingMatch = /^(#{2,4})\s+(.+)$/.exec(line);
    if (headingMatch) {
      const rawLevel = headingMatch[1].length;
      const normalizedLevel =
        sourceTitleLevel === 3
          ? Math.max(2, rawLevel - 2)
          : Math.max(2, rawLevel);
      const level = Math.min(3, normalizedLevel) as 2 | 3;
      const text = headingMatch[2].trim();
      blocks.push({ type: "heading", level, text, id: uniqueId(text) });
      index += 1;
      continue;
    }

    if (/^-\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^-\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^-\s+/, ""));
        index += 1;
      }
      blocks.push({ type: "list", ordered: false, items });
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+\.\s+/, ""));
        index += 1;
      }
      blocks.push({ type: "list", ordered: true, items });
      continue;
    }

    const paragraph: string[] = [];
    while (index < lines.length) {
      const candidate = lines[index].trim();
      if (
        !candidate ||
        /^(#{2,4})\s+/.test(candidate) ||
        /^-\s+/.test(candidate) ||
        /^\d+\.\s+/.test(candidate)
      ) {
        break;
      }
      paragraph.push(candidate);
      index += 1;
    }

    if (paragraph.length > 0) {
      blocks.push({ type: "paragraph", text: paragraph.join(" ") });
    } else {
      index += 1;
    }
  }

  const leadIndex = blocks.findIndex((block) => block.type === "paragraph");
  const leadBlock = leadIndex >= 0 ? blocks[leadIndex] : undefined;
  const lead = leadBlock?.type === "paragraph" ? leadBlock.text : "";

  if (leadIndex >= 0) blocks.splice(leadIndex, 1);

  return {
    title: titleMatch[1].trim(),
    lead,
    blocks,
  };
}

function parseGuideIndex() {
  const indexStart = masterGuide.indexOf("## Master destination index");
  const indexEnd = masterGuide.indexOf(
    "# Richmond Cycling Guide Hub — Flagship publish-ready copy",
  );
  const index = masterGuide.slice(indexStart, indexEnd);
  const rowPattern =
    /^\| (.+?) \| (.+?) \| (.+?) \| (A\+|A|B|C|HOLD) \| `(.+?)` \|$/gm;

  return [...index.matchAll(rowPattern)]
    .map((match) => ({
      name: match[1].trim(),
      classification: match[2].trim(),
      region: match[3].trim(),
      depth: match[4].trim(),
      url: match[5].trim(),
      slug: match[5].trim().split("/").filter(Boolean).at(-1) ?? "",
    }))
    .filter(
      (entry): entry is typeof entry & { depth: GuideResearchDepth } =>
        entry.depth !== "HOLD",
    );
}

const guideIndex = parseGuideIndex();

// Each destination targets a distinct local search intent instead of repeating
// the same generic "best rides and trails" title across the whole directory.
const curatedGuideSeoTitles: Record<string, string> = {
  Anmore: "Cycling in Anmore, BC: Hilly Road Routes | Wander Bike",
  Belcarra: "Cycling in Belcarra, BC: Scenic Road Rides | Wander Bike",
  "Bowen Island":
    "Bowen Island Cycling Guide: Ferry & Road Rides | Wander Bike",
  Burnaby: "Cycling in Burnaby, BC: Trails & Bike Routes | Wander Bike",
  Coquitlam: "Cycling in Coquitlam, BC: Trails & Bike Routes | Wander Bike",
  Delta: "Cycling in Delta, BC: Boundary Bay & Ladner | Wander Bike",
  "City of Langley":
    "Langley City Cycling Guide: Local Bike Routes | Wander Bike",
  "Township of Langley":
    "Langley Township Cycling: Fort Langley & Trails | Wander Bike",
  "Lions Bay":
    "Cycling in Lions Bay, BC: Road Climbs & Routes | Wander Bike",
  "Maple Ridge":
    "Maple Ridge Cycling Guide: Dikes & Greenways | Wander Bike",
  "New Westminster":
    "New Westminster Cycling: Waterfront Bike Routes | Wander Bike",
  "City of North Vancouver":
    "North Vancouver City Cycling: Routes & SeaBus | Wander Bike",
  "District of North Vancouver":
    "North Vancouver District Cycling: Roads & Trails | Wander Bike",
  "Pitt Meadows":
    "Pitt Meadows Cycling Guide: Dikes & Greenways | Wander Bike",
  "Port Coquitlam":
    "Port Coquitlam Cycling: River Greenway Routes | Wander Bike",
  "Port Moody":
    "Port Moody Cycling Guide: Inlet & Trail Routes | Wander Bike",
  Richmond: "Cycling in Richmond, BC: 8 Scenic Bike Routes | Wander Bike",
  Surrey: "Cycling in Surrey, BC: Greenways & Bike Routes | Wander Bike",
  Vancouver: "Cycling in Vancouver, BC: Seawall & Greenways | Wander Bike",
  "West Vancouver":
    "West Vancouver Cycling: Coastal Road Routes | Wander Bike",
  "White Rock":
    "White Rock Cycling Guide: Waterfront & Hills | Wander Bike",
};

const guides = guideIndex.map<CyclingGuide>((entry) => {
  const section =
    entry.name === "Richmond"
      ? extractRichmondFlagship()
      : extractDestinationSection(entry.name);
  const body = parseMarkdownBody(section);
  const sourceIds = extractSourceIds(section);
  const sources = sourceIds
    .map((id) => sourceDesk.get(id))
    .filter((source): source is GuideSource => Boolean(source));

  return {
    ...entry,
    title: body.title,
    seoTitle:
      curatedGuideSeoTitles[entry.name] ||
      extractField(section, "SEO title") ||
      `${body.title} | Wander Bike`,
    description: extractField(section, "Meta description"),
    lead: body.lead,
    blocks: body.blocks,
    sourceIds,
    sources,
  };
});

export function getGuides() {
  return guides;
}

export function getGuideBySlug(slug: string) {
  return guides.find((guide) => guide.slug === slug);
}

export function getGuideSlugs() {
  return guides.map((guide) => guide.slug);
}
