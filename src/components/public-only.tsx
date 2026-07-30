"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function PublicOnly({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return pathname.startsWith("/admin") ||
    pathname.startsWith("/account") ||
    pathname.startsWith("/operations")
    ? null
    : children;
}
