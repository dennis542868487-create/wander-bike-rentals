import "server-only";

import {
  getWebsitePageDefinition,
  mergeWebsiteContent,
  type WebsiteContent,
} from "@/lib/website-cms/config";
import type { WebsitePageDefinition } from "@/lib/website-cms/definitions";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getCurrentAdmin } from "@/lib/supabase/auth";
import { isLocalWebsiteCmsDemo } from "@/lib/website-cms/demo";
import { getGenericWebsitePageDefinition } from "@/lib/website-cms/generic-pages";

type WebsitePageRow = {
  slug: string;
  path: string;
  title: string;
  draft_content: unknown;
  published_content: unknown;
  draft_updated_at: string | null;
  published_at: string | null;
};

type WebsiteDefinitionResolver = (
  slug: string,
) => WebsitePageDefinition | null;

const coreDefinitionResolver: WebsiteDefinitionResolver =
  getWebsitePageDefinition;

export type WebsitePageDocument = {
  slug: string;
  path: string;
  title: string;
  draftContent: WebsiteContent;
  publishedContent: WebsiteContent;
  draftUpdatedAt: string | null;
  publishedAt: string | null;
  persistenceReady: boolean;
};

let warnedAboutMissingCms = false;

function resolveDefinition(
  slug: string,
  resolver?: WebsiteDefinitionResolver,
) {
  return (resolver ?? coreDefinitionResolver)(slug);
}

function fallbackDocument(
  slug: string,
  resolver?: WebsiteDefinitionResolver,
): WebsitePageDocument | null {
  const definition = resolveDefinition(slug, resolver);
  if (!definition) return null;

  return {
    slug: definition.slug,
    path: definition.path,
    title: definition.label,
    draftContent: { ...definition.defaults },
    publishedContent: { ...definition.defaults },
    draftUpdatedAt: null,
    publishedAt: null,
    persistenceReady: false,
  };
}

function mapRow(
  row: WebsitePageRow,
  resolver?: WebsiteDefinitionResolver,
): WebsitePageDocument | null {
  const definition = resolveDefinition(row.slug, resolver);
  if (!definition) return null;

  return {
    slug: row.slug,
    path: row.path,
    title: row.title,
    draftContent: mergeWebsiteContent(definition.defaults, row.draft_content),
    publishedContent: mergeWebsiteContent(
      definition.defaults,
      row.published_content,
    ),
    draftUpdatedAt: row.draft_updated_at,
    publishedAt: row.published_at,
    persistenceReady: true,
  };
}

async function queryWebsitePage(
  slug: string,
  resolver?: WebsiteDefinitionResolver,
) {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("website_pages")
      .select(
        "slug,path,title,draft_content,published_content,draft_updated_at,published_at",
      )
      .eq("slug", slug)
      .maybeSingle<WebsitePageRow>();

    if (error) throw error;
    return data ? mapRow(data, resolver) : fallbackDocument(slug, resolver);
  } catch (error) {
    if (!warnedAboutMissingCms && process.env.NODE_ENV !== "test") {
      warnedAboutMissingCms = true;
      console.warn(
        "Website CMS persistence is unavailable; using code defaults until the migration is applied.",
        error,
      );
    }
    return fallbackDocument(slug, resolver);
  }
}

export async function getWebsitePageForAdmin(slug: string) {
  return queryWebsitePage(slug, (candidate) =>
    getWebsitePageDefinition(candidate) ??
    getGenericWebsitePageDefinition(candidate),
  );
}

export async function getPublishedWebsiteContent(slug: string) {
  const document = await queryWebsitePage(slug, (candidate) =>
    getWebsitePageDefinition(candidate) ??
    getGenericWebsitePageDefinition(candidate),
  );
  return document?.publishedContent ?? {};
}

export async function getDraftWebsiteContent(slug: string) {
  const document = await queryWebsitePage(slug, (candidate) =>
    getWebsitePageDefinition(candidate) ??
    getGenericWebsitePageDefinition(candidate),
  );
  return document?.draftContent ?? {};
}

export async function getWebsitePageRenderState(
  slug: string,
  searchParams: Promise<{ websitePreview?: string }>,
) {
  const requestedPreview = (await searchParams).websitePreview === "1";
  const previewMode =
    requestedPreview &&
    (Boolean(await getCurrentAdmin()) || (await isLocalWebsiteCmsDemo()));
  const content = previewMode
    ? await getDraftWebsiteContent(slug)
    : await getPublishedWebsiteContent(slug);

  return { content, previewMode };
}
