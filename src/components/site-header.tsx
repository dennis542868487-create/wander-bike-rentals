"use client";

import {
  ChevronDown,
  Menu,
  Phone,
  UserRound,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthSession } from "@/hooks/use-auth-session";
import {
  isSiteAdminEmail,
  isWanderOperatorEmail,
} from "@/lib/marketplace/privileged-accounts";
import {
  COMMUNITY_DASHBOARD_LABEL,
  PLATFORM_DASHBOARD_LABEL,
  WANDER_DASHBOARD_LABEL,
} from "@/lib/marketplace/workspace-labels";

type NavLink = {
  href: string;
  label: string;
};

const serviceLinks: NavLink[] = [
  { href: "/bike-rental-richmond", label: "Bike Rental in Richmond" },
  { href: "/bike-rental-steveston", label: "Bike Rental in Steveston" },
  { href: "/about", label: "About Wander Bike" },
  { href: "/about-marketplace", label: "About Marketplace" },
  { href: "/pricing", label: "Pricing" },
  { href: "/adult-bike-rental-richmond", label: "Adult Bikes" },
  { href: "/kids-bike-rental-richmond", label: "Kids Bikes" },
  { href: "/bike-trailer-rental-richmond", label: "Bike Trailers" },
  { href: "/quick-bike-repair-richmond", label: "Quick Repair" },
];

const guideHomeLink: NavLink = {
  href: "/guides",
  label: "All 160 B.C. Guides",
};

const practicalGuideLinks: NavLink[] = [
  {
    href: "/guides/metro-vancouver-route-map",
    label: "Metro Vancouver Route Map",
  },
  {
    href: "/guides/find-public-washroom-near-you",
    label: "Find a Public Washroom",
  },
];

const guideGroups: { label: string; links: NavLink[] }[] = [
  {
    label: "Start local",
    links: [
      { href: "/guides/richmond-bc-cycling-guide", label: "Richmond" },
      { href: "/guides/vancouver-bc-cycling-guide", label: "Vancouver" },
    ],
  },
  {
    label: "Across B.C.",
    links: [
      { href: "/guides/victoria-bc-cycling-guide", label: "Victoria" },
      { href: "/guides/kelowna-bc-cycling-guide", label: "Kelowna" },
      { href: "/guides/whistler-bc-cycling-guide", label: "Whistler" },
      { href: "/guides/tofino-bc-cycling-guide", label: "Tofino" },
      { href: "/guides/kamloops-bc-cycling-guide", label: "Kamloops" },
      {
        href: "/guides/prince-george-bc-cycling-guide",
        label: "Prince George",
      },
    ],
  },
  {
    label: "Browse by region",
    links: [
      {
        href: "/guides#region-metro-vancouver",
        label: "Metro Vancouver",
      },
      {
        href: "/guides#region-capital",
        label: "Capital Region",
      },
      {
        href: "/guides#region-thompson-nicola",
        label: "Thompson-Nicola",
      },
      {
        href: "/guides#region-central-kootenay",
        label: "Central Kootenay",
      },
      {
        href: "/guides#region-bulkley-nechako",
        label: "Bulkley-Nechako",
      },
      {
        href: "/guides#region-east-kootenay",
        label: "East Kootenay",
      },
    ],
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/bikes") return pathname === href || pathname.startsWith("/bikes/");
  if (href === "/guides") return pathname === href;
  return pathname === href;
}

function groupIsActive(pathname: string, links: NavLink[]) {
  return links.some((link) => isActive(pathname, link.href));
}

function guidesAreActive(pathname: string) {
  return (
    pathname === "/guides" ||
    pathname.startsWith("/guides/") ||
    pathname === "/bike-rental-richmond" ||
    pathname === "/bike-rental-steveston"
  );
}

function desktopLinkClass(active: boolean) {
  return [
    "inline-flex min-h-11 items-center rounded-full px-3.5 py-2 text-sm font-semibold transition",
    active
      ? "bg-[var(--brand-soft)] text-[var(--brand-strong)] shadow-[inset_0_0_0_1px_rgba(13,148,136,0.16)]"
      : "text-slate-700 hover:bg-[var(--brand-soft)] hover:text-[var(--brand-strong)]",
  ].join(" ");
}

function mobileLinkClass(active: boolean) {
  return [
    "flex min-h-12 items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition",
    active
      ? "bg-[var(--brand-soft)] text-[var(--brand-strong)]"
      : "text-slate-800 hover:bg-slate-50",
  ].join(" ");
}

function DesktopDropdown({
  label,
  links,
  pathname,
}: {
  label: string;
  links: NavLink[];
  pathname: string;
}) {
  return (
    <div className="group relative">
      <button
        type="button"
        className={desktopLinkClass(groupIsActive(pathname, links))}
      >
        {label}
        <ChevronDown
          className="ml-1 h-3.5 w-3.5 transition group-hover:rotate-180 group-focus-within:rotate-180"
          aria-hidden="true"
        />
      </button>
      <div className="pointer-events-none absolute left-0 top-full z-50 w-80 pt-3 opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
        <div className="rounded-[1.6rem] border border-slate-200 bg-white p-3 shadow-[0_24px_60px_rgba(15,23,42,0.14)]">
          <p className="px-3 pb-2 pt-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            {label}
          </p>
          <div className="space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={[
                  "flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition",
                  isActive(pathname, link.href)
                    ? "bg-[var(--brand-soft)] font-semibold text-[var(--brand-strong)]"
                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-950",
                ].join(" ")}
              >
                {link.label}
                <span className="text-xs text-slate-400">→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DesktopGuideDropdown({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocusCapture={() => setOpen(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setOpen(false);
        }
      }}
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        setOpen(false);
        (document.activeElement as HTMLElement | null)?.blur();
      }}
    >
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className={desktopLinkClass(guidesAreActive(pathname))}
      >
        Guides
        <ChevronDown
          className={`ml-1 h-3.5 w-3.5 transition ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      <div
        className={[
          "absolute left-1/2 top-full z-50 w-[min(56rem,calc(100vw-2rem))] -translate-x-1/2 pt-3 transition duration-200",
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        ].join(" ")}
      >
        <div className="border border-slate-200 bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.14)]">
          <div className="mb-5 flex items-center justify-between gap-6 border-b border-teal-500 pb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
                British Columbia
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Search 160 city and community cycling guides across B.C.
              </p>
            </div>
            <Link
              href={guideHomeLink.href}
              onClick={() => setOpen(false)}
              className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-slate-950 hover:text-teal-800"
            >
              {guideHomeLink.label}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="grid gap-x-8 gap-y-7 md:grid-cols-3">
            {guideGroups.map((group) => (
              <section key={group.label}>
                <p className="border-b border-slate-200 pb-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                  {group.label}
                </p>
                <div>
                  {group.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={[
                        "flex items-center justify-between gap-3 border-b border-slate-100 py-2.5 text-sm transition",
                        isActive(pathname, link.href)
                          ? "font-bold text-teal-800"
                          : "text-slate-700 hover:text-teal-800",
                      ].join(" ")}
                    >
                      {link.label}
                      <span className="text-xs text-teal-600" aria-hidden="true">
                        →
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
          <div className="mt-5 grid gap-3 border-t border-slate-200 pt-4 sm:grid-cols-[1fr_auto] sm:items-center">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">
              Ride essentials
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              {practicalGuideLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-2 text-sm font-bold text-slate-950 hover:text-teal-800"
                >
                  {link.label}
                  <span aria-hidden="true">→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileGuideGroup({
  expanded,
  pathname,
  onToggle,
  onNavigate,
}: {
  expanded: boolean;
  pathname: string;
  onToggle: () => void;
  onNavigate: () => void;
}) {
  return (
    <div className="rounded-[1.4rem] border border-slate-200 bg-white p-2">
      <button
        type="button"
        aria-expanded={expanded}
        onClick={onToggle}
        className={`${mobileLinkClass(guidesAreActive(pathname))} w-full`}
      >
        Guides
        <ChevronDown
          className={`h-4 w-4 transition ${expanded ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      {expanded ? (
        <div className="mt-1 border-t border-slate-100 px-2 pb-2 pt-3">
          <Link
            href={guideHomeLink.href}
            onClick={onNavigate}
            className="flex items-center justify-between border-b border-teal-500 px-2 pb-3 text-sm font-bold text-slate-950"
          >
            {guideHomeLink.label}
            <span aria-hidden="true">→</span>
          </Link>
          <section className="mt-5">
            <p className="px-2 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-teal-700">
              Ride essentials
            </p>
            <div className="mt-1">
              {practicalGuideLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onNavigate}
                  className={[
                    "flex items-center justify-between border-b border-slate-100 px-2 py-3 text-sm",
                    isActive(pathname, link.href)
                      ? "font-bold text-teal-800"
                      : "text-slate-700",
                  ].join(" ")}
                >
                  {link.label}
                  <span className="text-xs text-teal-600" aria-hidden="true">
                    →
                  </span>
                </Link>
              ))}
            </div>
          </section>
          {guideGroups.map((group) => (
            <section key={group.label} className="mt-5">
              <p className="px-2 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-teal-700">
                {group.label}
              </p>
              <div className="mt-1">
                {group.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onNavigate}
                    className={[
                      "flex items-center justify-between border-b border-slate-100 px-2 py-3 text-sm",
                      isActive(pathname, link.href)
                        ? "font-bold text-teal-800"
                        : "text-slate-700",
                    ].join(" ")}
                  >
                    {link.label}
                    <span className="text-xs text-teal-600" aria-hidden="true">
                      →
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function SiteHeader() {
  const pathname = usePathname();
  const { session } = useAuthSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const closeMenu = () => {
    setMenuOpen(false);
    setOpenGroup(null);
  };

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  const signedInEmail = session?.user.email?.toLowerCase();
  const dashboardHref = !session
    ? "/auth"
    : isSiteAdminEmail(signedInEmail)
      ? "/admin"
      : isWanderOperatorEmail(signedInEmail)
        ? "/operations"
        : "/account";
  const dashboardLinks: NavLink[] = session
    ? [
        { href: "/account", label: COMMUNITY_DASHBOARD_LABEL },
        { href: "/account/bikes", label: "My Bikes" },
        { href: "/account/rentals", label: "My Rentals" },
        { href: "/account/requests", label: "My Requests" },
        ...(isWanderOperatorEmail(signedInEmail)
          ? [{ href: "/operations", label: WANDER_DASHBOARD_LABEL }]
          : []),
        ...(isSiteAdminEmail(signedInEmail)
          ? [{ href: "/admin", label: PLATFORM_DASHBOARD_LABEL }]
          : []),
      ]
    : [
        { href: "/auth", label: "Sign in" },
        { href: "/auth?mode=signup", label: "Create account" },
      ];

  return (
    <header className="site-header-anim sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur-2xl">
      <div className="mx-auto max-w-[108rem] px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-16 items-center justify-between gap-3 py-2 sm:min-h-20 sm:gap-4 sm:py-3 2xl:min-h-24">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-2.5 sm:gap-3"
            onClick={closeMenu}
          >
            <span className="overflow-hidden rounded-[1rem] border border-[var(--card-border)] bg-white p-1 shadow-[0_14px_35px_rgba(15,23,42,0.08)] sm:rounded-[1.2rem]">
              <Image
                src="/assets/wander-logo.jpg"
                alt="Wander Bike logo"
                width={64}
                height={64}
                className="h-10 w-10 rounded-[0.8rem] bg-white object-contain sm:h-12 sm:w-12 sm:rounded-[0.95rem]"
                priority
              />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[0.94rem] font-bold tracking-tight text-slate-950 sm:text-base">
                Wander Bike
              </span>
              <span className="block text-[0.68rem] text-slate-500 sm:text-xs">
                Steveston, Richmond
              </span>
            </span>
          </Link>

          <nav
            aria-label="Primary"
            className="hidden items-center gap-0.5 xl:flex 2xl:gap-1"
          >
            <Link href="/" className={desktopLinkClass(isActive(pathname, "/"))}>
              Home
            </Link>
            <DesktopDropdown
              label="Our Services"
              links={serviceLinks}
              pathname={pathname}
            />
            <Link
              href="/bikes"
              className={desktopLinkClass(isActive(pathname, "/bikes"))}
            >
              Find a Bike
            </Link>
            <Link
              href="/list-your-bike"
              className={desktopLinkClass(isActive(pathname, "/list-your-bike"))}
            >
              List Your Bike
            </Link>
            <DesktopGuideDropdown pathname={pathname} />
            <Link
              href="/location"
              className={desktopLinkClass(isActive(pathname, "/location"))}
            >
              Location
            </Link>
            <Link
              href="/faq"
              className={desktopLinkClass(isActive(pathname, "/faq"))}
            >
              FAQ
            </Link>
            <div className="group relative ml-2">
              <Link
                href={dashboardHref}
                className="inline-flex min-h-12 items-center gap-2 rounded-full border border-slate-300 bg-white px-5 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 hover:border-slate-400"
              >
                <UserRound className="h-4 w-4" aria-hidden="true" />
                Dashboard
                <ChevronDown
                  className="h-4 w-4 transition group-hover:rotate-180 group-focus-within:rotate-180"
                  aria-hidden="true"
                />
              </Link>
              <div className="pointer-events-none absolute right-0 top-full z-50 w-64 pt-3 opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
                <div className="rounded-[1.5rem] border border-slate-200 bg-white p-3 shadow-[0_24px_60px_rgba(15,23,42,0.14)]">
                  <p className="px-3 pb-2 pt-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    {session ? "Your workspace" : "Dashboard"}
                  </p>
                  {dashboardLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
                    >
                      {link.label}
                      <span className="text-xs text-slate-400">→</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <a
              href="tel:+17789521389"
              className="site-header-call ml-1 inline-flex min-h-12 items-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-bold transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              Call Now
            </a>
          </nav>

          <div className="flex items-center gap-2 xl:hidden">
            <Link
              href="/bikes"
              className="hidden min-h-11 items-center rounded-full px-3.5 text-sm font-bold text-slate-800 transition hover:bg-[var(--brand-soft)] hover:text-[var(--brand-strong)] lg:inline-flex"
            >
              Find a Bike
            </Link>
            <Link
              href="/list-your-bike"
              className="hidden min-h-11 items-center rounded-full px-3.5 text-sm font-bold text-slate-800 transition hover:bg-[var(--brand-soft)] hover:text-[var(--brand-strong)] lg:inline-flex"
            >
              List Your Bike
            </Link>
            <Link
              href={dashboardHref}
              className="hidden min-h-11 items-center gap-2 rounded-full border border-slate-300 bg-white px-4 text-sm font-bold text-slate-950 transition hover:border-slate-400 lg:inline-flex"
            >
              <UserRound className="h-4 w-4" aria-hidden="true" />
              Dashboard
            </Link>
            <a
              href="tel:+17789521389"
              className="btn-primary min-h-10 px-3.5 text-xs sm:min-h-11 sm:px-4 sm:text-sm"
            >
              Call
            </a>
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-controls="mobile-primary-navigation"
              aria-label={menuOpen ? "Close navigation" : "Open navigation"}
              onClick={() => setMenuOpen((current) => !current)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-900"
            >
              {menuOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        <div
          id="mobile-primary-navigation"
          className={[
            "overscroll-contain overflow-y-auto border-t border-slate-200 transition-all duration-300 xl:hidden",
            menuOpen
              ? "max-h-[calc(100dvh-4.5rem)] py-3 opacity-100 sm:max-h-[calc(100dvh-6rem)] sm:py-4"
              : "max-h-0 py-0 opacity-0",
          ].join(" ")}
        >
          <nav aria-label="Mobile primary" className="space-y-2 pb-2">
            <Link href="/" className={mobileLinkClass(isActive(pathname, "/"))}>
              Home
            </Link>
            {[{ label: "Our Services", links: serviceLinks }].map((group) => {
              const expanded = openGroup === group.label;
              return (
                <div
                  key={group.label}
                  className="rounded-[1.4rem] border border-slate-200 bg-white p-2"
                >
                  <button
                    type="button"
                    aria-expanded={expanded}
                    onClick={() =>
                      setOpenGroup((current) =>
                        current === group.label ? null : group.label,
                      )
                    }
                    className={`${mobileLinkClass(
                      groupIsActive(pathname, group.links),
                    )} w-full`}
                  >
                    {group.label}
                    <ChevronDown
                      className={`h-4 w-4 transition ${expanded ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                  </button>
                  {expanded ? (
                    <div className="mt-1 space-y-1 border-t border-slate-100 pt-2">
                      {group.links.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={closeMenu}
                          className="block rounded-xl px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
            <MobileGuideGroup
              expanded={openGroup === "Guides"}
              pathname={pathname}
              onToggle={() =>
                setOpenGroup((current) =>
                  current === "Guides" ? null : "Guides",
                )
              }
              onNavigate={closeMenu}
            />
            {[
              { href: "/bikes", label: "Find a Bike" },
              { href: "/list-your-bike", label: "List Your Bike" },
              { href: "/location", label: "Location" },
              { href: "/faq", label: "FAQ" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className={mobileLinkClass(isActive(pathname, link.href))}
              >
                {link.label}
              </Link>
            ))}
            <div className="rounded-[1.4rem] border border-slate-200 bg-white p-2">
              <button
                type="button"
                aria-expanded={openGroup === "Dashboard"}
                onClick={() =>
                  setOpenGroup((current) =>
                    current === "Dashboard" ? null : "Dashboard",
                  )
                }
                className={`${mobileLinkClass(
                  pathname.startsWith("/account") ||
                    pathname.startsWith("/operations") ||
                    pathname.startsWith("/admin"),
                )} w-full`}
              >
                <UserRound className="h-4 w-4" aria-hidden="true" />
                Dashboard
                <ChevronDown
                  className={`ml-auto h-4 w-4 transition ${
                    openGroup === "Dashboard" ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>
              {openGroup === "Dashboard" ? (
                <div className="mt-1 space-y-1 border-t border-slate-100 pt-2">
                  {dashboardLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={closeMenu}
                      className="flex items-center justify-between rounded-xl px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      {link.label}
                      <span className="text-xs text-slate-400">→</span>
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="pt-2">
              <a
                href="tel:+17789521389"
                className="btn-primary min-h-12 w-full px-5 text-sm"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                Call Now
              </a>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
