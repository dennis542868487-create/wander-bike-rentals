"use client";

import {
  ArrowLeft,
  CircleHelp,
  FileText,
  Globe2,
  Home,
  Laptop,
  List,
  LoaderCircle,
  Menu,
  Monitor,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Save,
  Send,
  Smartphone,
  Store,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { websiteCmsMessages } from "@/components/website-cms/content-runtime";
import type {
  WebsiteFieldDefinition,
  WebsitePageDefinition,
  WebsiteSectionDefinition,
} from "@/lib/website-cms/config";
import type { WebsitePageDocument } from "@/lib/website-cms/server";

type PageSummary = {
  slug: string;
  label: string;
  path: string;
  description: string;
  editable: boolean;
};

type PreviewDevice = "desktop" | "mobile";
type SaveState = "idle" | "saving" | "saved" | "publishing" | "error";

const PAGE_ICONS: Record<string, typeof Home> = {
  home: Home,
  about: FileText,
  pricing: FileText,
  "how-it-works": List,
  "quick-repair": Store,
  location: Globe2,
  faq: CircleHelp,
};

function formatTimestamp(value: string | null) {
  if (!value) return "Not published yet";
  return new Intl.DateTimeFormat("en-CA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getSectionForField(
  definition: WebsitePageDefinition,
  fieldKey: string | null,
) {
  if (!fieldKey) return null;
  return (
    definition.sections.find((section) =>
      section.fields.some((field) => field.key === fieldKey),
    ) ?? null
  );
}

function fieldLabel(field: WebsiteFieldDefinition) {
  return field.kind === "image" ? "Image" : field.label;
}

function InspectorField({
  field,
  value,
  disabled,
  onChange,
  onUpload,
}: {
  field: WebsiteFieldDefinition;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
  onUpload: (file: File) => Promise<void>;
}) {
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      await onUpload(file);
    } finally {
      setUploading(false);
    }
  };

  if (field.kind === "image") {
    return (
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-slate-700">
          {fieldLabel(field)}
        </label>
        <div className="relative aspect-[16/6] overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
          <Image
            src={value}
            alt="Current website content"
            fill
            unoptimized
            sizes="18rem"
            className="object-cover"
          />
        </div>
        <input
          ref={fileInput}
          className="sr-only"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={handleFile}
          disabled={disabled || uploading}
        />
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={disabled || uploading}
          className="flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-bold text-slate-800 transition hover:border-teal-600 hover:text-teal-800 disabled:opacity-50"
        >
          {uploading ? (
            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Upload className="h-4 w-4" aria-hidden="true" />
          )}
          {uploading ? "Uploading…" : "Replace image"}
        </button>
        {field.help ? (
          <p className="text-xs leading-5 text-slate-500">{field.help}</p>
        ) : null}
      </div>
    );
  }

  const inputClass =
    "mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm leading-6 text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 disabled:bg-slate-50 disabled:text-slate-500";
  const control =
    field.kind === "textarea" ? (
      <textarea
        value={value}
        maxLength={field.maxLength}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        rows={Math.min(6, Math.max(3, Math.ceil(field.maxLength / 90)))}
        className={`${inputClass} resize-y`}
      />
    ) : (
      <div className="relative">
        {field.kind === "link" ? (
          <Globe2
            className="pointer-events-none absolute left-3 top-[1.05rem] h-4 w-4 text-slate-400"
            aria-hidden="true"
          />
        ) : null}
        <input
          value={value}
          maxLength={field.maxLength}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className={`${inputClass} ${field.kind === "link" ? "pl-9" : ""}`}
        />
      </div>
    );

  return (
    <label className="block">
      <span className="text-xs font-bold text-slate-700">{field.label}</span>
      {control}
      <span className="mt-1.5 flex justify-between gap-3 text-[11px] leading-4 text-slate-500">
        <span>{field.help}</span>
        <span className="shrink-0">
          {value.length} / {field.maxLength}
        </span>
      </span>
    </label>
  );
}

export function WebsiteManager({
  pages,
  pageDefinition,
  initialDocument,
  demoMode = false,
}: {
  pages: PageSummary[];
  pageDefinition: WebsitePageDefinition;
  initialDocument: WebsitePageDocument;
  demoMode?: boolean;
}) {
  const [content, setContent] = useState(initialDocument.draftContent);
  const [savedContent, setSavedContent] = useState(
    initialDocument.draftContent,
  );
  const [selectedSectionId, setSelectedSectionId] = useState(
    pageDefinition.sections[0]?.id ?? "",
  );
  const [selectedFieldKey, setSelectedFieldKey] = useState<string | null>(null);
  const [device, setDevice] = useState<PreviewDevice>("desktop");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [publishedAt, setPublishedAt] = useState(initialDocument.publishedAt);
  const [previewReady, setPreviewReady] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const selectedSection = useMemo(
    () =>
      pageDefinition.sections.find(
        (section) => section.id === selectedSectionId,
      ) ?? pageDefinition.sections[0],
    [pageDefinition.sections, selectedSectionId],
  );
  const selectedFieldSection = getSectionForField(
    pageDefinition,
    selectedFieldKey,
  );
  const visibleSection = selectedFieldSection ?? selectedSection;
  const isDirty = useMemo(
    () => JSON.stringify(content) !== JSON.stringify(savedContent),
    [content, savedContent],
  );

  const sendPreviewUpdate = useCallback(() => {
    iframeRef.current?.contentWindow?.postMessage(
      {
        type: websiteCmsMessages.update,
        content,
        selectedSection: visibleSection?.id ?? null,
      },
      window.location.origin,
    );
  }, [content, visibleSection?.id]);

  useEffect(() => {
    const receivePreviewMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data as { type?: string; sectionId?: unknown };
      if (data.type === websiteCmsMessages.ready) {
        setPreviewReady(true);
        window.setTimeout(sendPreviewUpdate, 0);
      }
      if (
        data.type === websiteCmsMessages.selectSection &&
        typeof data.sectionId === "string"
      ) {
        const section = pageDefinition.sections.find(
          (candidate) => candidate.id === data.sectionId,
        );
        if (section) {
          setSelectedSectionId(section.id);
          setSelectedFieldKey(null);
        }
      }
    };
    window.addEventListener("message", receivePreviewMessage);
    return () => window.removeEventListener("message", receivePreviewMessage);
  }, [pageDefinition.sections, sendPreviewUpdate]);

  useEffect(() => {
    if (previewReady) sendPreviewUpdate();
  }, [previewReady, sendPreviewUpdate]);

  useEffect(() => {
    if (!isDirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);

  const updateField = (fieldKey: string, value: string) => {
    setContent((current) => ({ ...current, [fieldKey]: value }));
    setSaveState("idle");
    setMessage(null);
  };

  const saveDraft = async () => {
    setSaveState("saving");
    setMessage(null);
    if (demoMode) {
      setSavedContent(content);
      setSaveState("saved");
      setMessage("Draft saved for this local preview.");
      return;
    }
    try {
      const response = await fetch(
        `/api/admin/website/pages/${pageDefinition.slug}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        },
      );
      const body = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(body.error || "Could not save draft.");
      setSavedContent(content);
      setSaveState("saved");
      setMessage("Draft saved.");
    } catch (error) {
      setSaveState("error");
      setMessage(
        error instanceof Error ? error.message : "Could not save draft.",
      );
    }
  };

  const publish = async () => {
    if (isDirty) {
      setMessage("Save the draft before publishing.");
      setSaveState("error");
      return;
    }
    setSaveState("publishing");
    setMessage(null);
    if (demoMode) {
      setPublishedAt(new Date().toISOString());
      setSaveState("saved");
      setMessage(`${pageDefinition.label} published in this local preview.`);
      return;
    }
    try {
      const response = await fetch(
        `/api/admin/website/pages/${pageDefinition.slug}/publish`,
        { method: "POST" },
      );
      const body = (await response.json()) as {
        error?: string;
        page?: { publishedAt?: string };
      };
      if (!response.ok) throw new Error(body.error || "Could not publish page.");
      setPublishedAt(body.page?.publishedAt ?? new Date().toISOString());
      setSaveState("saved");
      setMessage(`${pageDefinition.label} published.`);
    } catch (error) {
      setSaveState("error");
      setMessage(
        error instanceof Error ? error.message : "Could not publish page.",
      );
    }
  };

  const uploadImage = async (field: WebsiteFieldDefinition, file: File) => {
    setMessage(null);
    if (demoMode) {
      updateField(field.key, URL.createObjectURL(file));
      setMessage("Image replaced for this local preview.");
      return;
    }
    const formData = new FormData();
    formData.set("file", file);
    formData.set("pageSlug", pageDefinition.slug);
    formData.set("fieldKey", field.key);
    const response = await fetch("/api/admin/website/media", {
      method: "POST",
      body: formData,
    });
    const body = (await response.json()) as {
      error?: string;
      image?: { url: string };
    };
    if (!response.ok || !body.image) {
      const error = body.error || "Could not upload image.";
      setMessage(error);
      setSaveState("error");
      throw new Error(error);
    }
    updateField(field.key, body.image.url);
    setMessage("Image replaced. Save the draft when you are ready.");
  };

  const chooseSection = (section: WebsiteSectionDefinition) => {
    setSelectedSectionId(section.id);
    setSelectedFieldKey(null);
    setMobileSidebarOpen(false);
  };

  const busy = saveState === "saving" || saveState === "publishing";
  const statusLabel =
    saveState === "saving"
      ? "Saving…"
      : saveState === "publishing"
        ? "Publishing…"
        : isDirty
          ? "Unsaved changes"
          : "All changes saved";

  return (
    <div className="flex h-dvh min-h-[44rem] overflow-hidden bg-[#f5f7f9] text-slate-900">
      <aside
        className={[
          "z-40 shrink-0 border-r border-slate-200 bg-white transition-[width] duration-200",
          sidebarCollapsed ? "w-[4.5rem]" : "w-[15rem]",
          mobileSidebarOpen
            ? "fixed inset-y-0 left-0 block shadow-2xl md:relative"
            : "hidden md:block",
        ].join(" ")}
      >
        <div className="flex h-full flex-col overflow-hidden">
          <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-4">
            <Image
              src="/assets/wander-logo.jpg"
              alt="Wander Bike"
              width={42}
              height={42}
              className="h-10 w-10 rounded-full object-cover"
            />
            {!sidebarCollapsed ? (
              <span className="whitespace-nowrap text-base font-bold text-[#063c59]">
                Wander Bike
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              className="ml-auto flex h-10 w-10 items-center justify-center rounded-lg hover:bg-slate-100 md:hidden"
              aria-label="Close pages"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <nav aria-label="Admin workspaces" className="border-b border-slate-200 p-2">
            <Link
              href="/admin/website"
              className="flex min-h-11 items-center gap-3 rounded-lg bg-cyan-50 px-3 text-sm font-bold text-cyan-800"
            >
              <Globe2 className="h-4 w-4 shrink-0" aria-hidden="true" />
              {!sidebarCollapsed ? "Website" : null}
            </Link>
            <Link
              href="/admin"
              className="mt-1 flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <Store className="h-4 w-4 shrink-0" aria-hidden="true" />
              {!sidebarCollapsed ? "Marketplace" : null}
            </Link>
          </nav>

          {!sidebarCollapsed ? (
            <div className="min-h-0 flex-1 overflow-y-auto px-2 py-5">
              <p className="px-3 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-slate-500">
                Pages
              </p>
              <div className="mt-2 space-y-1">
                {pages.map((page) => {
                  const Icon = PAGE_ICONS[page.slug] ?? FileText;
                  const active = page.slug === pageDefinition.slug;
                  return (
                    <Link
                      key={page.slug}
                      href={`/admin/website?page=${encodeURIComponent(page.slug)}`}
                      onClick={(event) => {
                        if (
                          isDirty &&
                          !window.confirm(
                            "You have unsaved changes. Leave this page without saving?",
                          )
                        ) {
                          event.preventDefault();
                        }
                      }}
                      className={[
                        "flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-sm transition",
                        active
                          ? "bg-cyan-50 font-bold text-cyan-800"
                          : "font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                      ].join(" ")}
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="min-w-0 flex-1 truncate">{page.label}</span>
                    </Link>
                  );
                })}
              </div>

              <p className="mb-2 mt-7 px-3 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-slate-500">
                Sections
              </p>
              <div className="space-y-1">
                {pageDefinition.sections.map((section) => (
                  <button
                    type="button"
                    key={section.id}
                    onClick={() => chooseSection(section)}
                    className={[
                      "flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-sm transition",
                      visibleSection?.id === section.id
                        ? "bg-cyan-50 font-bold text-cyan-800"
                        : "font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                    ].join(" ")}
                  >
                    <Menu className="h-4 w-4" aria-hidden="true" />
                    {section.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-1 justify-center pt-5 text-slate-400">
              <FileText className="h-5 w-5" aria-hidden="true" />
            </div>
          )}

          <div className="border-t border-slate-200 p-2">
            <button
              type="button"
              onClick={() => setSidebarCollapsed((value) => !value)}
              className="hidden min-h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-slate-500 hover:bg-slate-100 md:flex"
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
              ) : (
                <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
              )}
              {!sidebarCollapsed ? "Collapse" : null}
            </button>
          </div>
        </div>
      </aside>

      {mobileSidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-slate-950/40 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
          aria-label="Close pages"
        />
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="z-20 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-2 text-sm">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 md:hidden"
              aria-label="Open pages"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
            <span className="hidden font-bold text-slate-900 sm:inline">
              Website
            </span>
            <span className="hidden text-slate-400 sm:inline">/</span>
            <span className="truncate font-semibold text-slate-600">
              {pageDefinition.label}
            </span>
          </div>

          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 text-xs font-medium text-slate-600 lg:flex">
              <span
                className={[
                  "h-2 w-2 rounded-full",
                  isDirty ? "bg-amber-500" : "bg-emerald-500",
                ].join(" ")}
              />
              {statusLabel}
            </div>
            <div className="hidden rounded-lg border border-slate-200 p-0.5 sm:flex">
              <button
                type="button"
                onClick={() => setDevice("desktop")}
                className={[
                  "flex min-h-9 items-center gap-2 rounded-md px-3 text-xs font-bold transition",
                  device === "desktop"
                    ? "bg-slate-100 text-slate-950"
                    : "text-slate-500 hover:text-slate-900",
                ].join(" ")}
                aria-pressed={device === "desktop"}
              >
                <Monitor className="h-4 w-4" aria-hidden="true" />
                Desktop
              </button>
              <button
                type="button"
                onClick={() => setDevice("mobile")}
                className={[
                  "flex min-h-9 items-center gap-2 rounded-md px-3 text-xs font-bold transition",
                  device === "mobile"
                    ? "bg-slate-100 text-slate-950"
                    : "text-slate-500 hover:text-slate-900",
                ].join(" ")}
                aria-pressed={device === "mobile"}
              >
                <Smartphone className="h-4 w-4" aria-hidden="true" />
                Mobile
              </button>
            </div>
            <Link
              href="/admin/website"
              className="hidden min-h-10 items-center gap-2 rounded-lg border border-slate-300 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 xl:flex"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              All pages
            </Link>
            <button
              type="button"
              onClick={saveDraft}
              disabled={!isDirty || busy}
              className="flex min-h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-xs font-bold text-slate-800 transition hover:border-teal-600 disabled:cursor-not-allowed disabled:opacity-45 sm:px-4"
            >
              {saveState === "saving" ? (
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Save className="h-4 w-4" aria-hidden="true" />
              )}
              <span className="hidden sm:inline">Save draft</span>
              <span className="sm:hidden">Save</span>
            </button>
            <button
              type="button"
              onClick={publish}
              disabled={busy || isDirty}
              className="flex min-h-10 items-center gap-2 rounded-lg bg-[#0798aa] px-4 text-xs font-bold text-white shadow-sm transition hover:bg-[#087f91] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {saveState === "publishing" ? (
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="h-4 w-4" aria-hidden="true" />
              )}
              Publish
            </button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 overflow-hidden">
          <main className="min-w-0 flex-1 overflow-auto bg-[#edf1f4] p-3 sm:p-4">
            <div className="mb-3 flex items-center justify-between gap-3 sm:hidden">
              <div className="flex rounded-lg border border-slate-200 bg-white p-0.5">
                <button
                  type="button"
                  onClick={() => setDevice("desktop")}
                  className={`flex h-9 w-10 items-center justify-center rounded-md ${device === "desktop" ? "bg-slate-100 text-slate-950" : "text-slate-500"}`}
                  aria-label="Desktop preview"
                >
                  <Laptop className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setDevice("mobile")}
                  className={`flex h-9 w-10 items-center justify-center rounded-md ${device === "mobile" ? "bg-slate-100 text-slate-950" : "text-slate-500"}`}
                  aria-label="Mobile preview"
                >
                  <Smartphone className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <p className="truncate text-xs font-medium text-slate-500">
                {statusLabel}
              </p>
            </div>
            <div
              className={[
                "mx-auto h-full min-h-[38rem] overflow-auto border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.12)] transition-[max-width,border-radius] duration-300",
                device === "desktop"
                  ? "max-w-[90rem] rounded-xl"
                  : "max-w-[27rem] rounded-[1.6rem]",
              ].join(" ")}
            >
              <div
                className="origin-top-left transition-transform duration-300"
                style={
                  device === "desktop"
                    ? {
                        width: "1440px",
                        height: "1400px",
                        transform: "scale(var(--cms-preview-scale, 0.62))",
                      }
                    : { width: "100%", height: "100%" }
                }
              >
                <iframe
                  ref={iframeRef}
                  title={`${pageDefinition.label} live preview`}
                  src={`${pageDefinition.path}?websitePreview=1`}
                  className={[
                    "bg-white",
                    device === "desktop"
                      ? "h-[1400px] w-[1440px]"
                      : "h-full min-h-[38rem] w-full",
                  ].join(" ")}
                  onLoad={() => {
                    setPreviewReady(true);
                    window.setTimeout(sendPreviewUpdate, 50);
                  }}
                />
              </div>
            </div>
          </main>

          <aside className="hidden w-[20.5rem] shrink-0 overflow-y-auto border-l border-slate-200 bg-white lg:block xl:w-[22rem]">
            <div className="sticky top-0 z-10 border-b border-slate-200 bg-white px-5 py-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-cyan-700">
                    Editing section
                  </p>
                  <h2 className="mt-1 text-lg font-bold text-slate-950">
                    {visibleSection?.label}
                  </h2>
                </div>
                <Pencil className="mt-1 h-4 w-4 text-cyan-700" aria-hidden="true" />
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                {visibleSection?.description}
              </p>
            </div>

            <div className="space-y-6 px-5 py-6">
              {visibleSection?.fields.map((field) => (
                <div
                  key={field.key}
                  onFocus={() => setSelectedFieldKey(field.key)}
                  className={
                    selectedFieldKey === field.key
                      ? "rounded-xl bg-cyan-50/70 p-3 ring-1 ring-cyan-200"
                      : ""
                  }
                >
                  <InspectorField
                    field={field}
                    value={content[field.key] ?? ""}
                    disabled={busy}
                    onChange={(value) => updateField(field.key, value)}
                    onUpload={(file) => uploadImage(field, file)}
                  />
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 px-5 py-5">
              <p className="text-xs font-bold text-slate-700">Published</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {formatTimestamp(publishedAt)}
              </p>
              {!initialDocument.persistenceReady && !demoMode ? (
                <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-900">
                  Preview is ready. Apply the CMS migration to enable saving and
                  publishing.
                </p>
              ) : null}
              {message ? (
                <p
                  role="status"
                  className={[
                    "mt-3 rounded-lg p-3 text-xs leading-5",
                    saveState === "error"
                      ? "bg-rose-50 text-rose-800"
                      : "bg-emerald-50 text-emerald-800",
                  ].join(" ")}
                >
                  {message}
                </p>
              ) : null}
            </div>
          </aside>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-2 text-[11px] text-slate-500 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="flex min-h-9 items-center gap-2 font-bold text-cyan-800"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
            Edit {visibleSection?.label}
          </button>
          <span className="truncate">Published {formatTimestamp(publishedAt)}</span>
        </div>
      </div>
    </div>
  );
}
