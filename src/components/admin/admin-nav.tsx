"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bike,
  Boxes,
  House,
  PackageSearch,
  Settings,
  ShoppingBag,
} from "lucide-react";

const items = [
  { href: "/admin", label: "Home", icon: House },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: PackageSearch },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/rentals", label: "Rentals", icon: Bike },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function activePath(pathname: string, href: string) {
  return href === "/admin"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Admin navigation"
      className="space-y-1"
    >
      {items.map((item) => {
        const active = activePath(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            onClick={onNavigate}
            className={`relative flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 ${
              active
                ? "bg-teal-50 text-teal-900 before:absolute before:bottom-2 before:left-0 before:top-2 before:w-0.5 before:rounded-full before:bg-teal-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
            }`}
          >
            <item.icon
              aria-hidden="true"
              className={`h-[18px] w-[18px] ${active ? "text-teal-700" : "text-slate-500"}`}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
