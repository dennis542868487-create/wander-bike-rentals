"use client";

import {
  ArrowLeft,
  Bike,
  BookOpen,
  ChevronDown,
  CircleHelp,
  ExternalLink,
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
  Search,
  Send,
  Smartphone,
  Store,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import type {
  CmsSiteNavigationItem,
  SiteNavigationLink,
} from "@/lib/site-navigation";

type PreviewDevice = "desktop" | "mobile";
type SaveState = "idle" | "saving" | "saved" | "publishing" | "error";

const AUTOSAVE_DELAY_MS = 700;

const PAGE_ICONS: Record<string, typeof Home> = {
  home: Home,
  services: Store,
  "find-bike": Search,
  "list-bike": Bike,
  guides: BookOpen,
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
  navigation,
  otherPages,
  pageDefinition,
  initialDocument,
  demoMode = false,
}: {
  navigation: CmsSiteNavigationItem[];
  otherPages: SiteNavigationLink[];
  pageDefinition: WebsitePageDefinition;
  initialDocument: WebsitePageDocument;
  demoMode?: boolean;
}) {
  const router = useRouter();
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
  const [navigationQuery, setNavigationQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    const activeGroup = navigation.find(
      (item) =>
        item.kind === "group" &&
        item.sections.some((section) =>
          section.links.some((link) => link.cmsSlug === pageDefinition.slug),
        ),
    );
    return new Set(activeGroup ? [activeGroup.id] : []);
  });
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const contentRef = useRef(initialDocument.draftContent);
  const savedContentRef = useRef(initialDocument.draftContent);
  const saveQueueRef = useRef<Promise<boolean>>(Promise.resolve(true));
  const savingRequestsRef = useRef(0);
  const publishingRef = useRef(false);

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

  const sendPreviewSnapshot = useCallback(
    (nextContent: typeof content) => {
      iframeRef.current?.contentWindow?.postMessage(
        {
          type: websiteCmsMessages.update,
          content: nextContent,
          selectedSection: visibleSection?.id ?? null,
        },
        window.location.origin,
      );
    },
    [visibleSection?.id],
  );

  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  useEffect(() => {
    const receivePreviewMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data as {
        type?: string;
        sectionId?: unknown;
        fieldKey?: unknown;
      };
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
          setSelectedFieldKey(
            typeof data.fieldKey === "string" &&
              section.fields.some((field) => field.key === data.fieldKey)
              ? data.fieldKey
              : null,
          );
        }
      }
    };
    window.addEventListener("message", receivePreviewMessage);
    return () => window.removeEventListener("message", receivePreviewMessage);
  }, [pageDefinition, sendPreviewUpdate]);

  useEffect(() => {
    if (previewReady) sendPreviewUpdate();
  }, [previewReady, sendPreviewUpdate]);

  useEffect(() => {
    if (!selectedFieldKey) return;
    const frame = window.requestAnimationFrame(() => {
      const selector = `[data-inspector-field="${CSS.escape(selectedFieldKey)}"]`;
      const field = document.querySelector<HTMLElement>(selector);
      field?.scrollIntoView({ block: "center", behavior: "auto" });
      field
        ?.querySelector<HTMLElement>("input, textarea, button")
        ?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [selectedFieldKey]);

  useEffect(() => {
    if (!isDirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);

  const persistDraft = useCallback(
    (nextContent: typeof content) => {
      const snapshot = { ...nextContent };
      const snapshotJson = JSON.stringify(snapshot);
      if (snapshotJson === JSON.stringify(savedContentRef.current)) {
        return Promise.resolve(true);
      }

      const performSave = async () => {
        savingRequestsRef.current += 1;
        if (!publishingRef.current) setSaveState("saving");
        setMessage(null);

        if (demoMode) {
          savedContentRef.current = snapshot;
          setSavedContent(snapshot);
          savingRequestsRef.current -= 1;
          if (!publishingRef.current && savingRequestsRef.current === 0) {
            setSaveState("saved");
          }
          return true;
        }

        try {
          const response = await fetch(
            `/api/admin/website/pages/${pageDefinition.slug}`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ content: snapshot }),
            },
          );
          const body = (await response.json()) as { error?: string };
          if (!response.ok) {
            throw new Error(body.error || "Could not save changes.");
          }

          savedContentRef.current = snapshot;
          setSavedContent(snapshot);
          savingRequestsRef.current -= 1;
          if (!publishingRef.current && savingRequestsRef.current === 0) {
            setSaveState("saved");
          }
          return true;
        } catch (error) {
          savingRequestsRef.current -= 1;
          if (!publishingRef.current) setSaveState("error");
          setMessage(
            error instanceof Error ? error.message : "Could not save changes.",
          );
          return false;
        }
      };

      const queuedSave = saveQueueRef.current.then(performSave, performSave);
      saveQueueRef.current = queuedSave;
      return queuedSave;
    },
    [demoMode, pageDefinition.slug],
  );

  useEffect(() => {
    if (!isDirty || publishingRef.current) return;
    const timer = window.setTimeout(() => {
      void persistDraft(contentRef.current);
    }, AUTOSAVE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [content, isDirty, persistDraft]);

  const updateField = (fieldKey: string, value: string) => {
    setContent((current) => {
      const next = { ...current, [fieldKey]: value };
      contentRef.current = next;
      sendPreviewSnapshot(next);
      return next;
    });
    setSaveState("idle");
    setMessage(null);
  };

  const publish = async () => {
    publishingRef.current = true;
    setSaveState("publishing");
    setMessage(null);
    if (demoMode) {
      savedContentRef.current = contentRef.current;
      setSavedContent(contentRef.current);
      setPublishedAt(new Date().toISOString());
      setSaveState("saved");
      setMessage(`${pageDefinition.label} published in this local preview.`);
      publishingRef.current = false;
      return;
    }
    try {
      const saved = await persistDraft(contentRef.current);
      if (!saved) throw new Error("Could not save the latest changes.");

      const response = await fetch(
        `/api/admin/website/pages/${pageDefinition.slug}/publish`,
        { method: "POST" },
      );
      const body = (await response.json()) as {
        error?: string;
        page?: { publishedAt?: string };
      };
      if (!response.ok)
        throw new Error(body.error || "Could not publish page.");
      setPublishedAt(body.page?.publishedAt ?? new Date().toISOString());
      setSaveState("saved");
      setMessage(`${pageDefinition.label} published.`);
    } catch (error) {
      setSaveState("error");
      setMessage(
        error instanceof Error ? error.message : "Could not publish page.",
      );
    } finally {
      publishingRef.current = false;
    }
  };

  const openPage = async (slug: string) => {
    const destination = `/admin/website?page=${encodeURIComponent(slug)}`;
    if (slug === pageDefinition.slug) return;
    if (isDirty) {
      const saved = await persistDraft(contentRef.current);
      if (!saved) return;
    }
    router.push(destination);
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
    setMessage("Image replaced. Saving automatically…");
  };

  const chooseSection = (section: WebsiteSectionDefinition) => {
    setSelectedSectionId(section.id);
    setSelectedFieldKey(null);
    setMobileSidebarOpen(false);
  };

  const normalizedNavigationQuery = navigationQuery.trim().toLowerCase();
  const filteredNavigation = useMemo(
    () =>
      navigation
        .map((item) => {
          if (!normalizedNavigationQuery) return item;
          if (item.kind !== "group") {
            return item.label.toLowerCase().includes(normalizedNavigationQuery)
              ? item
              : null;
          }
          const sections = item.sections
            .map((section) => ({
              ...section,
              links: section.links.filter((link) =>
                link.label.toLowerCase().includes(normalizedNavigationQuery),
              ),
            }))
            .filter((section) => section.links.length > 0);
          return sections.length > 0 ||
            item.label.toLowerCase().includes(normalizedNavigationQuery)
            ? { ...item, sections }
            : null;
        })
        .filter((item): item is CmsSiteNavigationItem => Boolean(item)),
    [navigation, normalizedNavigationQuery],
  );

  const filteredOtherPages = useMemo(
    () =>
      otherPages.filter(
        (page) =>
          !normalizedNavigationQuery ||
          page.label.toLowerCase().includes(normalizedNavigationQuery),
      ),
    [normalizedNavigationQuery, otherPages],
  );

  const toggleNavigationGroup = (id: string) => {
    setExpandedGroups((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const busy = saveState === "publishing";
  const statusLabel =
    saveState === "saving"
      ? "Saving…"
      : saveState === "publishing"
        ? "Publishing…"
        : isDirty
          ? "Saving automatically…"
          : "All changes saved";

  return (
    <div className="flex h-dvh min-h-[44rem] overflow-hidden bg-[#f5f7f9] text-slate-900">
      <aside
        className={[
          "z-40 shrink-0 border-r border-slate-200 bg-white transition-[width] duration-200",
          sidebarCollapsed ? "w-[4.5rem]" : "w-[17rem]",
          mobileSidebarOpen
            ? "fixed inset-y-0 left-0 block shadow-2xl md:relative"
            : "hidden md:block",
        ].join(" ")}
      >
        <div className="flex h-full flex-col overflow-hidden">
          <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-4">
            <Image
              src="/favicon.png"
              alt="Wander Bike"
              width={42}
              height={42}
              unoptimized
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

          <nav
            aria-label="Admin workspaces"
            className="border-b border-slate-200 p-2"
          >
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
            <div className="cms-sidebar-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-5">
              <p className="px-3 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-slate-500">
                Site navigation
              </p>
              <label className="relative mt-3 block px-1">
                <span className="sr-only">Search website pages</span>
                <Search
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={navigationQuery}
                  onChange={(event) => setNavigationQuery(event.target.value)}
                  placeholder="Search all pages"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-600 focus:bg-white focus:ring-2 focus:ring-cyan-600/10"
                />
              </label>
              <div className="mt-2 space-y-1">
                {filteredNavigation.map((item) => {
                  const Icon = PAGE_ICONS[item.id] ?? FileText;
                  if (item.kind === "group") {
                    const active = item.sections.some((section) =>
                      section.links.some(
                        (link) => link.cmsSlug === pageDefinition.slug,
                      ),
                    );
                    const expanded =
                      Boolean(normalizedNavigationQuery) ||
                      expandedGroups.has(item.id);
                    return (
                      <div key={item.id}>
                        <button
                          type="button"
                          aria-expanded={expanded}
                          onClick={() => toggleNavigationGroup(item.id)}
                          className={[
                            "flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-sm transition",
                            active
                              ? "bg-cyan-50 font-bold text-cyan-800"
                              : "font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                          ].join(" ")}
                        >
                          <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                          <span className="min-w-0 flex-1 truncate">
                            {item.label}
                          </span>
                          <ChevronDown
                            className={`h-4 w-4 shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
                            aria-hidden="true"
                          />
                        </button>
                        {expanded ? (
                          <div className="ml-5 border-l border-slate-200 pb-1 pl-2 pt-1">
                            {item.sections.map((section, sectionIndex) => (
                              <div
                                key={`${item.id}-${section.label ?? sectionIndex}`}
                                className={sectionIndex > 0 ? "mt-3" : ""}
                              >
                                {section.label ? (
                                  <p className="px-2 pb-1 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-slate-400">
                                    {section.label}
                                  </p>
                                ) : null}
                                {section.links.map((link) => {
                                  const childActive =
                                    link.cmsSlug === pageDefinition.slug;
                                  if (link.cmsSlug) {
                                    return (
                                      <Link
                                        key={`${link.href}-${link.label}`}
                                        href={`/admin/website?page=${encodeURIComponent(link.cmsSlug)}`}
                                        prefetch={false}
                                        onClick={(event) => {
                                          event.preventDefault();
                                          void openPage(link.cmsSlug!);
                                        }}
                                        className={[
                                          "flex min-h-9 items-center gap-2 rounded-md px-2 text-[0.8rem] transition",
                                          childActive
                                            ? "bg-cyan-50 font-bold text-cyan-800"
                                            : "font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-950",
                                        ].join(" ")}
                                      >
                                        <FileText
                                          className="h-3.5 w-3.5 shrink-0"
                                          aria-hidden="true"
                                        />
                                        <span className="min-w-0 flex-1 truncate">
                                          {link.label}
                                        </span>
                                      </Link>
                                    );
                                  }
                                  return (
                                    <a
                                      key={`${link.href}-${link.label}`}
                                      href={link.href}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="flex min-h-9 items-center gap-2 rounded-md px-2 text-[0.8rem] font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
                                    >
                                      <ExternalLink
                                        className="h-3.5 w-3.5 shrink-0"
                                        aria-hidden="true"
                                      />
                                      <span className="min-w-0 flex-1 truncate">
                                        {link.label}
                                      </span>
                                    </a>
                                  );
                                })}
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    );
                  }

                  if (item.kind === "workspace") {
                    return (
                      <Link
                        key={item.id}
                        href="/admin"
                        className="flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
                        title="Managed in the Marketplace workspace"
                      >
                        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span className="min-w-0 flex-1 truncate">
                          {item.label}
                        </span>
                        <span className="text-[0.58rem] font-bold uppercase tracking-wide text-teal-700">
                          Market
                        </span>
                      </Link>
                    );
                  }

                  const active = item.cmsSlug === pageDefinition.slug;
                  return (
                    <Link
                      key={item.id}
                      href={`/admin/website?page=${encodeURIComponent(item.cmsSlug)}`}
                      prefetch={false}
                      onClick={(event) => {
                        event.preventDefault();
                        void openPage(item.cmsSlug);
                      }}
                      className={[
                        "flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-sm transition",
                        active
                          ? "bg-cyan-50 font-bold text-cyan-800"
                          : "font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                      ].join(" ")}
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="min-w-0 flex-1 truncate">
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>

              {filteredOtherPages.length > 0 ? (
                <>
                  <p className="mb-2 mt-6 px-3 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-slate-500">
                    Other website pages
                  </p>
                  <div className="space-y-1">
                    {filteredOtherPages.map((page) => {
                      const active = page.cmsSlug === pageDefinition.slug;
                      return (
                        <Link
                          key={page.href}
                          href={`/admin/website?page=${encodeURIComponent(page.cmsSlug ?? "home")}`}
                          prefetch={false}
                          onClick={(event) => {
                            event.preventDefault();
                            void openPage(page.cmsSlug ?? "home");
                          }}
                          className={[
                            "flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm transition",
                            active
                              ? "bg-cyan-50 font-bold text-cyan-800"
                              : "font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                          ].join(" ")}
                        >
                          <List className="h-4 w-4" aria-hidden="true" />
                          {page.label}
                        </Link>
                      );
                    })}
                  </div>
                </>
              ) : null}

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
              prefetch={false}
              onClick={(event) => {
                event.preventDefault();
                void openPage("home");
              }}
              className="hidden min-h-10 items-center gap-2 rounded-lg border border-slate-300 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 xl:flex"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              All pages
            </Link>
            <button
              type="button"
              onClick={publish}
              disabled={busy}
              className="flex min-h-10 items-center gap-2 rounded-lg bg-[#0798aa] px-4 text-xs font-bold text-white shadow-sm transition hover:bg-[#087f91] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {saveState === "publishing" ? (
                <LoaderCircle
                  className="h-4 w-4 animate-spin"
                  aria-hidden="true"
                />
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
                <Pencil
                  className="mt-1 h-4 w-4 text-cyan-700"
                  aria-hidden="true"
                />
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                {visibleSection?.description}
              </p>
            </div>

            <div className="space-y-6 px-5 py-6">
              {visibleSection?.fields.map((field) => (
                <div
                  key={field.key}
                  data-inspector-field={field.key}
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
          <span className="truncate">
            Published {formatTimestamp(publishedAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
