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
  { href: "/pricing", label: "Pricing" },
  { href: "/adult-bike-rental-richmond", label: "Adult Bikes" },
  { href: "/kids-bike-rental-richmond", label: "Kids Bikes" },
  { href: "/bike-trailer-rental-richmond", label: "Bike Trailers" },
  { href: "/quick-bike-repair-richmond", label: "Quick Repair" },
];

const guideLinks: NavLink[] = [
  { href: "/bike-rental-richmond", label: "Richmond Ride Ideas" },
  { href: "/bike-rental-steveston", label: "Steveston Ride Ideas" },
  {
    href: "/guides/best-places-to-bike-in-steveston",
    label: "Best Bike Routes",
  },
  {
    href: "/guides/family-bike-rental-richmond",
    label: "Things to Do in Richmond",
  },
  {
    href: "/guides/steveston-bike-ride-guide",
    label: "Things to Do in Steveston Village",
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/bikes") return pathname === href || pathname.startsWith("/bikes/");
  return pathname === href;
}

function groupIsActive(pathname: string, links: NavLink[]) {
  return links.some((link) => isActive(pathname, link.href));
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
            <DesktopDropdown
              label="Guides"
              links={guideLinks}
              pathname={pathname}
            />
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
          inert={!menuOpen}
          className={[
            "absolute inset-x-0 top-full origin-top overscroll-contain overflow-y-auto",
            "max-h-[calc(100dvh-4.5rem)] sm:max-h-[calc(100dvh-6rem)]",
            "border-t border-slate-200 bg-white/95 shadow-[0_18px_40px_rgba(15,23,42,0.12)] backdrop-blur-2xl",
            "transition-[translate,opacity] duration-[220ms] ease-[var(--ease-ui)] xl:hidden",
            menuOpen
              ? "translate-y-0 py-3 opacity-100 sm:py-4"
              : "pointer-events-none -translate-y-2 py-3 opacity-0 sm:py-4",
          ].join(" ")}
        >
          <nav aria-label="Mobile primary" className="space-y-2 pb-2">
            <Link href="/" className={mobileLinkClass(isActive(pathname, "/"))}>
              Home
            </Link>
            {[
              { label: "Our Services", links: serviceLinks },
              { label: "Guides", links: guideLinks },
            ].map((group) => {
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
                  <div
                    className={[
                      "grid transition-[grid-template-rows,opacity] duration-200 ease-[var(--ease-ui)]",
                      expanded
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0",
                    ].join(" ")}
                  >
                    <div className="overflow-hidden">
                      <div className="mt-1 space-y-1 border-t border-slate-100 pt-2">
                        {group.links.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={closeMenu}
                            tabIndex={expanded ? undefined : -1}
                            className="block rounded-xl px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
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
