"use client";

import Image, { type ImageProps } from "next/image";
import Link from "next/link";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ElementType,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import type { WebsiteContent } from "@/lib/website-cms/config";

const CMS_UPDATE_MESSAGE = "wander-cms:update";
const CMS_READY_MESSAGE = "wander-cms:ready";
const CMS_SELECT_MESSAGE = "wander-cms:select-section";

type ContentRuntimeContextValue = {
  content: WebsiteContent;
  previewMode: boolean;
  selectedSection: string | null;
};

const ContentRuntimeContext = createContext<ContentRuntimeContextValue | null>(
  null,
);

function isWebsiteContent(value: unknown): value is WebsiteContent {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.values(value as Record<string, unknown>).every(
      (entry) => typeof entry === "string",
    )
  );
}

export function WebsiteContentRuntime({
  initialContent,
  previewMode,
  children,
}: {
  initialContent: WebsiteContent;
  previewMode: boolean;
  children: ReactNode;
}) {
  const [content, setContent] = useState(initialContent);
  const [selectedSection, setSelectedSection] = useState<string | null>(
    previewMode ? "hero" : null,
  );

  useEffect(() => {
    if (!previewMode) return;

    document.documentElement.dataset.websitePreview = "true";

    const receiveUpdate = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const message = event.data as {
        type?: string;
        content?: unknown;
        selectedSection?: unknown;
      };
      if (message.type !== CMS_UPDATE_MESSAGE) return;
      if (isWebsiteContent(message.content)) setContent(message.content);
      if (
        typeof message.selectedSection === "string" ||
        message.selectedSection === null
      ) {
        setSelectedSection(message.selectedSection);
      }
    };

    window.addEventListener("message", receiveUpdate);
    const keepNavigationInPreview = (event: globalThis.MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("a, button, form")) event.preventDefault();
    };
    document.addEventListener("click", keepNavigationInPreview);
    window.parent.postMessage(
      { type: CMS_READY_MESSAGE },
      window.location.origin,
    );
    return () => {
      delete document.documentElement.dataset.websitePreview;
      window.removeEventListener("message", receiveUpdate);
      document.removeEventListener("click", keepNavigationInPreview);
    };
  }, [previewMode]);

  const value = useMemo(
    () => ({ content, previewMode, selectedSection }),
    [content, previewMode, selectedSection],
  );

  return (
    <ContentRuntimeContext.Provider value={value}>
      {children}
    </ContentRuntimeContext.Provider>
  );
}

function useContentRuntime() {
  const value = useContext(ContentRuntimeContext);
  if (!value) {
    throw new Error(
      "CMS content must be rendered inside WebsiteContentRuntime.",
    );
  }
  return value;
}

function selectSection(
  event: ReactMouseEvent<HTMLElement>,
  sectionId: string,
) {
  event.preventDefault();
  event.stopPropagation();
  const target = event.target as HTMLElement | null;
  const fieldKey = target
    ?.closest<HTMLElement>("[data-cms-field]")
    ?.getAttribute("data-cms-field");
  window.parent.postMessage(
    { type: CMS_SELECT_MESSAGE, sectionId, fieldKey: fieldKey || null },
    window.location.origin,
  );
}

export function CmsSection({
  as = "section",
  sectionId,
  label,
  className,
  children,
}: {
  as?: "section" | "div";
  sectionId: string;
  label: string;
  className?: string;
  children: ReactNode;
}) {
  const { previewMode, selectedSection } = useContentRuntime();
  const Component = as;
  const selected = previewMode && selectedSection === sectionId;

  return (
    <Component
      data-cms-section={sectionId}
      data-cms-selected={selected ? "true" : undefined}
      className={[
        className,
        previewMode
          ? "cms-preview-section relative cursor-pointer outline outline-2 -outline-offset-2 outline-transparent transition-[outline-color] hover:outline-cyan-500/60"
          : "",
        selected ? "!outline-cyan-600" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClickCapture={
        previewMode ? (event) => selectSection(event, sectionId) : undefined
      }
      onKeyDown={
        previewMode
          ? (event) => {
              if (event.key !== "Enter" && event.key !== " ") return;
              event.preventDefault();
              window.parent.postMessage(
                { type: CMS_SELECT_MESSAGE, sectionId },
                window.location.origin,
              );
            }
          : undefined
      }
      tabIndex={previewMode ? 0 : undefined}
      aria-label={previewMode ? `Edit ${label} section` : undefined}
    >
      {previewMode ? (
        <span
          aria-hidden="true"
          className={[
            "pointer-events-none absolute left-3 top-3 z-[60] rounded-full bg-cyan-700 px-3 py-1 text-[11px] font-bold text-white shadow-lg transition-opacity",
            selected ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          ].join(" ")}
        >
          {label}
        </span>
      ) : null}
      {children}
    </Component>
  );
}

export function CmsText({
  as = "span",
  field,
  fallback,
  className,
}: {
  as?: ElementType;
  field: string;
  fallback: string;
  className?: string;
}) {
  const { content, previewMode } = useContentRuntime();
  const Component = as;
  return (
    <Component
      className={className}
      data-cms-field={previewMode ? field : undefined}
    >
      {content[field] ?? fallback}
    </Component>
  );
}

export function CmsLink({
  labelField,
  hrefField,
  fallbackLabel,
  fallbackHref,
  className,
  children,
  target,
  rel,
  showLabel = true,
}: {
  labelField: string;
  hrefField: string;
  fallbackLabel: string;
  fallbackHref: string;
  className?: string;
  children?: ReactNode;
  target?: string;
  rel?: string;
  showLabel?: boolean;
}) {
  const { content, previewMode } = useContentRuntime();
  return (
    <Link
      href={content[hrefField] ?? fallbackHref}
      data-cms-field={previewMode ? labelField : undefined}
      data-cms-link-field={previewMode ? hrefField : undefined}
      className={className}
      target={target}
      rel={rel}
    >
      {showLabel ? (content[labelField] ?? fallbackLabel) : null}
      {children}
    </Link>
  );
}

export function CmsImage({
  srcField,
  altField,
  fallbackSrc,
  fallbackAlt,
  unoptimized = true,
  ...props
}: Omit<ImageProps, "src" | "alt"> & {
  srcField: string;
  altField: string;
  fallbackSrc: string;
  fallbackAlt: string;
}) {
  const { content, previewMode } = useContentRuntime();
  return (
    <Image
      {...props}
      unoptimized={unoptimized}
      src={content[srcField] ?? fallbackSrc}
      alt={content[altField] ?? fallbackAlt}
      data-cms-field={previewMode ? srcField : undefined}
    />
  );
}

export const websiteCmsMessages = {
  update: CMS_UPDATE_MESSAGE,
  ready: CMS_READY_MESSAGE,
  selectSection: CMS_SELECT_MESSAGE,
} as const;
