"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/bike-rental-richmond", label: "Richmond" },
  { href: "/bike-rental-steveston", label: "Steveston" },
  { href: "/adult-bike-rental-richmond", label: "Adult Bikes" },
  { href: "/kids-bike-rental-richmond", label: "Kids Bikes" },
  { href: "/bike-trailer-rental-richmond", label: "Trailers" },
  { href: "/location", label: "Location" },
  { href: "/faq", label: "FAQ" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href;
}

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur-2xl supports-[backdrop-filter]:bg-white/72">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-2.5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-3.5">
        <div className="flex items-center gap-3 lg:gap-3.5">
          <Link href="/" className="overflow-hidden rounded-[1.2rem] border border-[var(--card-border)] bg-white p-1 shadow-[0_14px_35px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5">
            <Image
              src="/assets/wander-logo.jpg"
              alt="Wander Bike Rentals logo"
              width={72}
              height={72}
              className="h-10 w-10 rounded-[0.95rem] object-cover sm:h-12 sm:w-12 lg:h-14 lg:w-14"
              priority
            />
          </Link>
          <div className="min-w-0">
            <Link href="/" className="block truncate text-[15px] font-bold tracking-tight text-slate-950 sm:text-base lg:text-lg">
              Wander Bike Rentals
            </Link>
            <p className="text-[11px] leading-4 text-slate-500 lg:text-xs">Steveston, Richmond</p>
          </div>
        </div>

        <nav className="grid grid-cols-4 gap-1 text-center text-xs font-medium text-slate-600 sm:flex sm:flex-nowrap sm:items-center sm:gap-1.5 sm:text-sm lg:gap-2 lg:text-sm">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "rounded-xl px-2 py-2 transition sm:rounded-full sm:px-3 sm:py-2 lg:px-4 lg:py-2.5",
                  active
                    ? "bg-[var(--brand-soft)] text-[var(--brand)] shadow-[inset_0_0_0_1px_rgba(13,148,136,0.16)]"
                    : "hover:bg-[var(--brand-soft)] hover:text-[var(--brand)]",
                ].join(" ")}
              >
                <span className="relative inline-flex items-center">
                  {item.label}
                  {active ? (
                    <span className="absolute -bottom-1 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-[var(--brand)] sm:-bottom-1.5" />
                  ) : null}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
