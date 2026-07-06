"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthSession } from "@/hooks/use-auth-session";

type NavLink = {
  href: string;
  label: string;
};

type NavItem =
  | {
      type: "link";
      href: string;
      label: string;
    }
  | {
      type: "group";
      label: string;
      links: NavLink[];
    };

const rentalsLinks: NavLink[] = [
  { href: "/booking", label: "Book Online" },
  { href: "/pricing", label: "Pricing" },
  { href: "/adult-bike-rental-richmond", label: "Adult Bikes" },
  { href: "/kids-bike-rental-richmond", label: "Kids Bikes" },
  { href: "/bike-trailer-rental-richmond", label: "Bike Trailers" },
];

const guidesLinks: NavLink[] = [
  { href: "/bike-rental-richmond", label: "Richmond Ride Ideas" },
  { href: "/bike-rental-steveston", label: "Steveston Ride Ideas" },
  { href: "/guides/best-places-to-bike-in-steveston", label: "Best Bike Routes" },
  { href: "/guides/family-bike-rental-richmond", label: "Things to Do in Richmond" },
  { href: "/guides/steveston-bike-ride-guide", label: "Things to Do in Steveston Village" },
];

const navItems: NavItem[] = [
  { type: "link", href: "/", label: "Home" },
  { type: "group", label: "Rentals", links: rentalsLinks },
  { type: "link", href: "/quick-bike-repair-richmond", label: "Quick Repair" },
  { type: "group", label: "Guides", links: guidesLinks },
  { type: "link", href: "/location", label: "Location" },
  { type: "link", href: "/faq", label: "FAQ" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href.startsWith("/#")) return pathname === "/";
  return pathname === href;
}

function groupIsActive(pathname: string, links: NavLink[]) {
  return links.some((item) => isActive(pathname, item.href));
}

function desktopLinkClass(active: boolean) {
  return [
    "inline-flex items-center rounded-full px-3.5 py-2 text-sm font-medium transition",
    active
      ? "bg-[var(--brand-soft)] text-[var(--brand-strong)] shadow-[inset_0_0_0_1px_rgba(13,148,136,0.16)]"
      : "text-slate-700 hover:bg-[var(--brand-soft)] hover:text-[var(--brand)]",
  ].join(" ");
}

function mobileLinkClass(active: boolean) {
  return [
    "flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition",
    active
      ? "bg-[var(--brand-soft)] text-[var(--brand-strong)]"
      : "text-slate-800 hover:bg-slate-50",
  ].join(" ");
}

export default function SiteHeader() {
  const pathname = usePathname();
  const { session, ready: authReady } = useAuthSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const toggleGroup = (label: string) => {
    setOpenGroup((current) => (current === label ? null : label));
  };

  const closeMenu = () => {
    setMenuOpen(false);
    setOpenGroup(null);
  };

  return (
    <header className="site-header-anim sticky top-0 z-50 border-b border-slate-200/80 bg-white/92 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur-2xl supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 py-2.5 sm:gap-3 sm:py-3">
          <Link href="/" className="flex min-w-0 items-center gap-2.5 sm:gap-3" onClick={closeMenu}>
            <div className="overflow-hidden rounded-[1.2rem] border border-[var(--card-border)] bg-white p-1 shadow-[0_14px_35px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5">
              <Image
                src="/assets/wander-logo.jpg"
                alt="Wander Bike logo"
                width={64}
                height={64}
                className="h-10 w-10 rounded-[0.95rem] object-contain bg-white sm:h-12 sm:w-12"
                priority
              />
            </div>
            <div className="min-w-0">
              <span className="block truncate text-[14px] font-bold tracking-tight text-slate-950 sm:text-base">
                Wander Bike
              </span>
              <span className="block text-[11px] leading-4 text-slate-500 sm:text-xs">
                Steveston, Richmond
              </span>
            </div>
          </Link>

          <div className="hidden items-center gap-2 lg:flex">
            {navItems.map((item) => {
              if (item.type === "link") {
                const active = isActive(pathname, item.href);
                return (
                  <Link key={item.label} href={item.href} className={desktopLinkClass(active)}>
                    {item.label}
                  </Link>
                );
              }

              const active = groupIsActive(pathname, item.links);
              return (
                <div key={item.label} className="relative group">
                  <button
                    type="button"
                    className={desktopLinkClass(active)}
                  >
                    {item.label}
                    <span className="ml-1 text-xs transition duration-200 group-hover:rotate-180 group-focus-within:rotate-180">▼</span>
                  </button>
                  <div className="pointer-events-none absolute left-0 top-full z-40 w-72 pt-3 opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
                    <div className="overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white p-3 shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
                      <div className="mb-2 px-3 pt-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          {item.label}
                        </p>
                      </div>
                      <div className="space-y-1">
                        {item.links.map((link) => {
                          const childActive = isActive(pathname, link.href);
                          return (
                            <Link
                              key={link.href}
                              href={link.href}
                              className={[
                                "flex items-center justify-between rounded-2xl px-3 py-3 text-sm transition",
                                childActive
                                  ? "bg-[var(--brand-soft)] font-medium text-[var(--brand-strong)]"
                                  : "text-slate-700 hover:bg-slate-50 hover:text-slate-950",
                              ].join(" ")}
                            >
                              <span>{link.label}</span>
                              <span className="text-xs text-slate-400">→</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <Link
              href={session ? "/account/bookings" : "/auth"}
              className="btn-secondary px-4 py-2.5 text-sm"
            >
              {authReady && session ? "My Bookings" : "Sign in"}
            </Link>
            <a href="tel:+17789521389" className="btn-primary px-5 py-2.5 text-sm">Call Now</a>
          </div>

          <div className="flex items-center gap-1.5 lg:hidden">
            <a
              href="tel:+17789521389"
              className="btn-primary px-3 py-2 text-sm"
            >
              Call
            </a>
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((value) => !value)}
              className="btn-secondary px-3 py-2 text-sm"
            >
              {menuOpen ? "✕ Menu" : "☰ Menu"}
            </button>
          </div>
        </div>

        <div
          className={[
            "overflow-hidden border-t border-slate-200 transition-all duration-300 ease-out lg:hidden",
            menuOpen ? "max-h-[80vh] py-3.5 opacity-100" : "max-h-0 py-0 opacity-0",
          ].join(" ")}
        >
          <div className="space-y-2.5 pb-1">
            {navItems.map((item) => {
                if (item.type === "link") {
                  const active = isActive(pathname, item.href);
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={closeMenu}
                      className={mobileLinkClass(active)}
                    >
                      <span>{item.label}</span>
                    </Link>
                  );
                }

                const expanded = openGroup === item.label;
                const active = groupIsActive(pathname, item.links);

                return (
                  <div key={item.label} className="rounded-[1.4rem] border border-slate-200 bg-white p-2.5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
                    <button
                      type="button"
                      onClick={() => toggleGroup(item.label)}
                      className={[mobileLinkClass(active), "min-h-12 px-4 py-3.5"].join(" ")}
                    >
                      <span className="font-semibold">{item.label}</span>
                      <span className={["text-xs text-slate-500 transition duration-200", expanded ? "rotate-180 text-[var(--brand)]" : ""].join(" ")}>
                        ▼
                      </span>
                    </button>
                    <div
                      className={[
                        "overflow-hidden transition-all duration-300 ease-out",
                        expanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
                      ].join(" ")}
                    >
                      <div className="mt-2 space-y-2 rounded-[1.15rem] bg-slate-50/80 px-2.5 pb-2.5 pt-1.5">
                        {item.links.map((link) => {
                          const childActive = isActive(pathname, link.href);
                          return (
                            <Link
                              key={link.href}
                              href={link.href}
                              onClick={closeMenu}
                              className={[
                                "flex min-h-11 items-center justify-between rounded-xl px-3.5 py-3 text-sm transition",
                                childActive
                                  ? "bg-[var(--brand-soft)] font-medium text-[var(--brand-strong)]"
                                  : "text-slate-700 hover:bg-white hover:text-slate-950",
                              ].join(" ")}
                            >
                              <span>{link.label}</span>
                              <span className="text-xs text-slate-400">→</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}

            <Link
              href="/booking"
              onClick={closeMenu}
              className="btn-primary w-full rounded-2xl px-4 py-3.5 text-sm"
            >
              Book Online
            </Link>
            <Link href={session ? "/account/bookings" : "/auth"} onClick={closeMenu} className="btn-secondary w-full rounded-2xl px-4 py-3.5 text-sm">
              {authReady && session ? "My Bookings & Account" : "Sign in or create an account"}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
