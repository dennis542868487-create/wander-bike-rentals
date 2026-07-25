"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bike,
  Boxes,
  LayoutDashboard,
  PackageSearch,
  Settings,
  ShoppingBag,
} from "lucide-react";

const items = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Sales orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: PackageSearch },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/booking-admin", label: "Rentals", icon: Bike },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function activePath(pathname: string, href: string) {
  return href === "/admin"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Admin navigation"
      className="flex gap-1 overflow-x-auto p-2 lg:block lg:space-y-1 lg:overflow-visible lg:p-3"
    >
      {items.map((item) => {
        const active = activePath(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
              active
                ? "bg-teal-700 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
            }`}
          >
            <item.icon aria-hidden="true" className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
