"use client";

import {
  Bike,
  CalendarCheck,
  ExternalLink,
  FileSignature,
  LayoutDashboard,
  Menu,
  MessagesSquare,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AdminSignOut } from "@/components/admin/admin-sign-out";
import {
  COMMUNITY_DASHBOARD_LABEL,
  PLATFORM_DASHBOARD_LABEL,
  WANDER_DASHBOARD_LABEL,
} from "@/lib/marketplace/workspace-labels";

const items = [
  { href: "/operations", label: "Overview", icon: LayoutDashboard },
  { href: "/operations/bikes", label: "Wander Bikes", icon: Bike },
  { href: "/operations/requests", label: "Requests", icon: MessagesSquare },
  { href: "/operations/pickups", label: "Pickups", icon: CalendarCheck },
  {
    href: "/operations/rental-agreement",
    label: "Rental Form",
    icon: FileSignature,
  },
];

function activePath(pathname: string, href: string) {
  return href === "/operations"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

function OperationsNavigation({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label={WANDER_DASHBOARD_LABEL} className="space-y-1">
      {items.map((item) => {
        const active = activePath(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
              active
                ? "bg-teal-600 text-white"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <item.icon className="h-4 w-4" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function OperationsShell({
  children,
  email,
  role,
}: {
  children: ReactNode;
  email: string;
  role: "staff" | "admin";
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
              aria-label={`Open ${WANDER_DASHBOARD_LABEL} navigation`}
              aria-expanded={drawerOpen}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 lg:hidden"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-950">
                {WANDER_DASHBOARD_LABEL}
              </p>
              <p className="truncate text-xs capitalize text-slate-500">
                {email} · {role}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/account"
              aria-label={COMMUNITY_DASHBOARD_LABEL}
              className="btn-secondary min-h-10 px-3 py-2 text-sm"
            >
              <UserRound className="h-4 w-4" aria-hidden="true" />
              <span className="hidden xl:inline">
                {COMMUNITY_DASHBOARD_LABEL}
              </span>
            </Link>
            {role === "admin" ? (
              <Link
                href="/admin"
                aria-label={PLATFORM_DASHBOARD_LABEL}
                className="btn-secondary min-h-10 px-3 py-2 text-sm"
              >
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                <span className="hidden 2xl:inline">
                  {PLATFORM_DASHBOARD_LABEL}
                </span>
              </Link>
            ) : null}
            <Link
              href="/"
              className="btn-secondary min-h-10 px-3 py-2 text-sm"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              <span className="hidden xl:inline">Marketplace</span>
            </Link>
          </div>
        </div>
      </header>

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[17rem] bg-slate-950 text-white lg:block">
        <div className="flex h-full flex-col p-4">
          <Link href="/operations" className="px-3 py-3">
            <p className="font-bold tracking-tight">Wander Bike</p>
            <p className="text-xs text-slate-400">Rental & sales operations</p>
          </Link>
          <div className="mt-4 flex-1 overflow-y-auto">
            <OperationsNavigation pathname={pathname} />
          </div>
          <div className="border-t border-slate-800 pt-4">
            <AdminSignOut nextPath="/operations" />
          </div>
        </div>
      </aside>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="presentation">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/55"
            onClick={() => setDrawerOpen(false)}
            aria-label={`Close ${WANDER_DASHBOARD_LABEL} navigation`}
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label={`${WANDER_DASHBOARD_LABEL} navigation`}
            className="relative flex h-full w-[min(86vw,20rem)] flex-col bg-slate-950 p-4 text-white shadow-2xl"
          >
            <div className="flex items-center justify-between gap-4 px-2 py-2">
              <div>
                <p className="font-bold">Wander Bike</p>
                <p className="text-xs text-slate-400">
                  {WANDER_DASHBOARD_LABEL}
                </p>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close navigation"
                className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-white"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-5 flex-1 overflow-y-auto">
              <OperationsNavigation
                pathname={pathname}
                onNavigate={() => setDrawerOpen(false)}
              />
            </div>
            <div className="border-t border-slate-800 pt-4">
              <AdminSignOut nextPath="/operations" />
            </div>
          </aside>
        </div>
      ) : null}

      <main className="px-4 py-6 sm:px-6 sm:py-8 lg:ml-[17rem] lg:px-8">
        <div className="mx-auto max-w-[88rem]">{children}</div>
      </main>
    </div>
  );
}
