export type WebsiteContent = Record<string, string>;

export type WebsiteFieldKind = "text" | "textarea" | "link" | "image";

export type WebsiteFieldDefinition = {
  key: string;
  label: string;
  kind: WebsiteFieldKind;
  maxLength: number;
  help?: string;
};

export type WebsiteSectionDefinition = {
  id: string;
  label: string;
  description: string;
  fields: WebsiteFieldDefinition[];
};

export type WebsitePageDefinition = {
  slug: string;
  label: string;
  path: string;
  description: string;
  editable: boolean;
  sections: WebsiteSectionDefinition[];
  defaults: WebsiteContent;
};

export const textField = (
  key: string,
  label: string,
  maxLength: number,
  help?: string,
): WebsiteFieldDefinition => ({ key, label, kind: "text", maxLength, help });

export const textareaField = (
  key: string,
  label: string,
  maxLength: number,
  help?: string,
): WebsiteFieldDefinition => ({
  key,
  label,
  kind: "textarea",
  maxLength,
  help,
});

export const linkField = (
  key: string,
  label: string,
  help = "Choose a page on this site or paste a full https:// link.",
): WebsiteFieldDefinition => ({
  key,
  label,
  kind: "link",
  maxLength: 2_048,
  help,
});

export const imageField = (
  key: string,
  label: string,
  help = "JPG, PNG, WebP, or AVIF up to 8 MB.",
): WebsiteFieldDefinition => ({
  key,
  label,
  kind: "image",
  maxLength: 2_048,
  help,
});
