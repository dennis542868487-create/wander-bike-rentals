"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Site-wide scroll reveal. Progressive enhancement:
 * - If JS is disabled, nothing is hidden and all content stays visible.
 * - If the user prefers reduced motion, we skip animation entirely.
 * - Otherwise we mark the document ready (which activates the hide state in
 *   CSS), auto-tag every `main > section` (except the hero) plus any explicit
 *   `[data-reveal]` element, and fade them up as they enter the viewport.
 */
export default function Reveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = document.documentElement;
    root.classList.add("reveal-ready");

    const targets = new Set<Element>();
    document.querySelectorAll("main > section:not(.hero)").forEach((section) => {
      section.setAttribute("data-reveal", "");
      // Let the first-level card grids inside each section cascade in.
      section.querySelectorAll(":scope .grid").forEach((grid) => {
        if (grid.children.length > 1) grid.setAttribute("data-reveal-cascade", "");
      });
    });
    document.querySelectorAll("[data-reveal]").forEach((el) => targets.add(el));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
    );

    targets.forEach((target) => {
      const rect = target.getBoundingClientRect();
      // Anything already on-screen at mount reveals immediately (no flash for
      // above-the-fold content on inner pages).
      if (rect.top < window.innerHeight * 0.9) {
        target.classList.add("is-visible");
      } else {
        observer.observe(target);
      }
    });

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
