"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Menu, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { AdminNav } from "@/components/admin/admin-nav";
import { AdminSignOut } from "@/components/admin/admin-sign-out";

export function AdminShell({
  children,
  email,
  role,
}: {
  children: ReactNode;
  email: string;
  role: "staff" | "admin";
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  return (
    <div className="min-h-screen bg-[#f5f7f9] text-slate-950">
      <header className="sticky top-0 z-40 h-16 border-b border-slate-200 bg-white">
        <div className="flex h-full items-center justify-between gap-3 px-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              aria-controls="admin-sidebar"
              aria-expanded={menuOpen}
              aria-hidden={menuOpen}
              aria-label={menuOpen ? "Close admin navigation" : "Open admin navigation"}
              tabIndex={menuOpen ? -1 : 0}
              onClick={() => setMenuOpen((current) => !current)}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 lg:hidden"
            >
              {menuOpen ? (
                <X aria-hidden="true" className="h-5 w-5" />
              ) : (
                <Menu aria-hidden="true" className="h-5 w-5" />
              )}
            </button>

            <Link
              href="/admin"
              className="flex min-w-0 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
            >
              <Image
                src="/assets/wander-logo.jpg"
                alt=""
                width={36}
                height={36}
                className="h-9 w-9 shrink-0 rounded-lg border border-slate-200 object-contain"
                priority
              />
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold tracking-tight">
                  Wander Bike
                </span>
                <span className="block truncate text-xs text-slate-500">
                  Sandbox store
                </span>
              </span>
            </Link>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link
              href="/"
              target="_blank"
              className="hidden h-9 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 sm:inline-flex"
            >
              View store
              <ExternalLink aria-hidden="true" className="h-4 w-4" />
            </Link>
            <span aria-hidden="true" className="hidden h-6 w-px bg-slate-200 sm:block" />
            <div className="hidden max-w-64 text-right md:block">
              <p className="truncate text-sm font-semibold text-slate-800">{email}</p>
              <p className="text-xs capitalize text-slate-500">{role}</p>
            </div>
            <AdminSignOut />
          </div>
        </div>
      </header>

      <div className="lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
        <button
          type="button"
          aria-label="Close admin navigation"
          aria-hidden={!menuOpen}
          tabIndex={menuOpen ? 0 : -1}
          onClick={() => setMenuOpen(false)}
          className={`fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-[1px] transition-opacity duration-200 lg:hidden ${
            menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
          }`}
        />

        <aside
          id="admin-sidebar"
          className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white pt-16 transition-[transform,visibility] duration-200 ease-out lg:visible lg:sticky lg:top-16 lg:z-20 lg:h-[calc(100vh-4rem)] lg:translate-x-0 lg:pt-0 ${
            menuOpen ? "visible translate-x-0" : "invisible -translate-x-full"
          }`}
        >
          <div className="absolute inset-x-0 top-0 flex h-16 items-center justify-between border-b border-slate-200 px-3 lg:hidden">
            <span className="text-sm font-bold text-slate-900">Navigation</span>
            <button
              type="button"
              aria-label="Close admin navigation"
              onClick={() => setMenuOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
            >
              <X aria-hidden="true" className="h-5 w-5" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
            <AdminNav onNavigate={() => setMenuOpen(false)} />
          </div>
          <div className="border-t border-slate-200 p-3">
            <div className="rounded-xl bg-slate-50 px-3 py-2.5">
              <p className="truncate text-sm font-semibold text-slate-800">{email}</p>
              <p className="mt-0.5 text-xs capitalize text-slate-500">{role} access</p>
            </div>
          </div>
        </aside>

        <main className="min-w-0 px-4 py-5 sm:px-6 sm:py-7 xl:px-8">
          <div className="admin-page-enter mx-auto w-full max-w-[1480px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
