import { z } from "zod";
import {
  getWebsitePageDefinition,
  mergeWebsiteContent,
  type WebsiteContent,
} from "@/lib/website-cms/config";
import type { WebsitePageDefinition } from "@/lib/website-cms/definitions";

const contentRecordSchema = z.record(
  z.string().min(1).max(120),
  z.string().max(4_000),
);

export const websiteDraftInputSchema = z.object({
  content: contentRecordSchema,
});

export type WebsiteDraftInput = z.infer<typeof websiteDraftInputSchema>;

function isSafeLink(value: string) {
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  if (value.startsWith("tel:") || value.startsWith("mailto:")) return true;

  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function isSafeImage(value: string) {
  if (value.startsWith("/assets/")) return true;

  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export type WebsiteContentValidation =
  | { success: true; content: WebsiteContent }
  | { success: false; error: string };

export function validateWebsiteContent(
  slug: string,
  rawContent: unknown,
  suppliedDefinition?: WebsitePageDefinition | null,
): WebsiteContentValidation {
  const definition = suppliedDefinition ?? getWebsitePageDefinition(slug);
  if (!definition || !definition.editable) {
    return { success: false, error: "This website page is not editable." };
  }

  const parsed = contentRecordSchema.safeParse(rawContent);
  if (!parsed.success) {
    return { success: false, error: "Check the page content and try again." };
  }

  const allowedFields = new Map(
    definition.sections.flatMap((section) =>
      section.fields.map((field) => [field.key, field] as const),
    ),
  );

  for (const key of Object.keys(parsed.data)) {
    if (!allowedFields.has(key)) {
      return { success: false, error: `Unsupported content field: ${key}` };
    }
  }

  const content = mergeWebsiteContent(definition.defaults, parsed.data);
  for (const [key, field] of allowedFields) {
    const value = content[key]?.trim() ?? "";
    if (!value) {
      return { success: false, error: `${field.label} cannot be empty.` };
    }
    if (value.length > field.maxLength) {
      return {
        success: false,
        error: `${field.label} must be ${field.maxLength} characters or fewer.`,
      };
    }
    if (field.kind === "link" && !isSafeLink(value)) {
      return {
        success: false,
        error: `${field.label} must be a site path, phone/email link, or secure https:// URL.`,
      };
    }
    if (field.kind === "image" && !isSafeImage(value)) {
      return {
        success: false,
        error: `${field.label} must use an existing site image or secure https:// URL.`,
      };
    }
    content[key] = value;
  }

  return { success: true, content };
}

export const websiteMediaMetadataSchema = z.object({
  pageSlug: z.string().regex(/^[a-z0-9-]+$/),
  fieldKey: z.string().min(1).max(120),
});

export const WEBSITE_MEDIA_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export const WEBSITE_MEDIA_MAX_BYTES = 8 * 1024 * 1024;
