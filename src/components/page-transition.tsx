"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Replays a short fade-and-rise whenever the route changes, so moving between
 * dashboard pages does not snap. Keying on the pathname remounts the subtree,
 * which is what restarts the CSS animation.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="page-transition">
      {children}
    </div>
  );
}
