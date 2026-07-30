"use client";

import {
  Bike,
  BriefcaseBusiness,
  CalendarCheck,
  ClipboardList,
  ExternalLink,
  FileSignature,
  LayoutDashboard,
  Menu,
  Settings,
  ShieldCheck,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { PageTransition } from "@/components/page-transition";
import { AccountSignOut } from "@/components/account-sign-out";
import type { MarketplaceAccessStatus } from "@/lib/marketplace/types";
import {
  COMMUNITY_DASHBOARD_LABEL,
  PLATFORM_DASHBOARD_LABEL,
  WANDER_DASHBOARD_LABEL,
} from "@/lib/marketplace/workspace-labels";

const accountItems = [
  { href: "/account", label: "Overview", icon: LayoutDashboard },
  { href: "/account/rentals", label: "My Rentals", icon: CalendarCheck },
  { href: "/account/bikes", label: "My Bikes", icon: Bike },
  { href: "/account/requests", label: "Booking Requests", icon: ClipboardList },
  {
    href: "/account/rental-agreement",
    label: "Rental Form",
    icon: FileSignature,
  },
  { href: "/account/profile", label: "Profile", icon: Settings },
];

function activePath(pathname: string, href: string) {
  return href === "/account"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

function AccountNavigation({
  pathname,
  role,
  onNavigate,
}: {
  pathname: string;
  role: "customer" | "staff" | "admin";
  onNavigate?: () => void;
}) {
  return (
    <>
      <nav aria-label={COMMUNITY_DASHBOARD_LABEL} className="space-y-1">
        {accountItems.map((item) => {
          const active = activePath(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                active
                  ? "bg-teal-50 text-teal-900"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      {role === "staff" || role === "admin" ? (
        <div className="mt-5 border-t border-slate-200 pt-5">
          <Link
            href="/operations"
            onClick={onNavigate}
            className="workspace-switch-link-dark flex min-h-11 items-center gap-3 rounded-xl bg-slate-950 px-3 py-2.5 text-sm font-semibold hover:bg-slate-800"
          >
            <BriefcaseBusiness className="h-4 w-4" aria-hidden="true" />
            {WANDER_DASHBOARD_LABEL}
          </Link>
          {role === "admin" ? (
            <Link
              href="/admin"
              onClick={onNavigate}
              className="mt-2 flex min-h-11 items-center gap-3 rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-100"
            >
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              {PLATFORM_DASHBOARD_LABEL}
            </Link>
          ) : null}
        </div>
      ) : null}
    </>
  );
}

export function AccountShell({
  children,
  email,
  name,
  role,
  marketplaceAccessStatus,
  marketplaceAccessReason,
}: {
  children: ReactNode;
  email: string;
  name: string | null;
  role: "customer" | "staff" | "admin";
  marketplaceAccessStatus: MarketplaceAccessStatus;
  marketplaceAccessReason: string | null;
}) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!drawerOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [drawerOpen]);

  return (
    <div className="min-h-screen bg-[#f5f7f9]">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:pl-[18.5rem] lg:pr-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open account navigation"
              aria-expanded={drawerOpen}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 lg:hidden"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-950">
                {name || COMMUNITY_DASHBOARD_LABEL}
              </p>
              <p className="truncate text-xs text-slate-500">{email}</p>
            </div>
          </div>
          <Link href="/" className="btn-secondary min-h-10 px-3 py-2 text-sm">
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">View marketplace</span>
            <span className="sm:hidden">Marketplace</span>
          </Link>
        </div>
      </header>

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[17rem] border-r border-slate-200 bg-white lg:block">
        <div className="flex h-full flex-col p-4">
          <Link href="/" className="px-3 py-3">
            <p className="font-bold tracking-tight text-slate-950">Wander Bike</p>
            <p className="text-xs text-slate-500">
              {COMMUNITY_DASHBOARD_LABEL}
            </p>
          </Link>
          <div className="mt-4 flex-1 overflow-y-auto">
            <AccountNavigation pathname={pathname} role={role} />
          </div>
          <div className="border-t border-slate-200 pt-4">
            <AccountSignOut />
          </div>
        </div>
      </aside>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="presentation">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/45"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close account navigation"
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Account navigation"
            className="relative flex h-full w-[min(86vw,20rem)] flex-col bg-white p-4 shadow-2xl"
          >
            <div className="flex items-center justify-between gap-4 px-2 py-2">
              <div>
                <p className="font-bold text-slate-950">Wander Bike</p>
                <p className="text-xs text-slate-500">
                  {COMMUNITY_DASHBOARD_LABEL}
                </p>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close navigation"
                className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-5 flex-1 overflow-y-auto">
              <AccountNavigation
                pathname={pathname}
                role={role}
                onNavigate={() => setDrawerOpen(false)}
              />
            </div>
            <div className="border-t border-slate-200 pt-4">
              <AccountSignOut />
            </div>
          </aside>
        </div>
      ) : null}

      <main className="px-4 py-6 sm:px-6 sm:py-8 lg:ml-[17rem] lg:px-8">
        <div className="mx-auto max-w-6xl">
          {marketplaceAccessStatus === "suspended" ? (
            <div
              role="status"
              className="mb-6 rounded-[0.9rem] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900"
            >
              <strong>Marketplace access is suspended.</strong> You can still
              view your account and resolve existing requests, but you cannot
              publish, edit, or request bikes.
              {marketplaceAccessReason ? (
                <span className="mt-1 block">
                  Site Admin note: {marketplaceAccessReason}
                </span>
              ) : null}
            </div>
          ) : null}
          <PageTransition>{children}</PageTransition>
        </div>
      </main>
    </div>
  );
}
