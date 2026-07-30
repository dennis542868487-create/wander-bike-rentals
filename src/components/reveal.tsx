"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function Reveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = document.documentElement;
    root.classList.add("reveal-ready");

    const targets = new Set<Element>();
    document.querySelectorAll("main > section:not(.hero)").forEach((section) => {
      section.setAttribute("data-reveal", "");
      section.querySelectorAll(".grid").forEach((grid) => {
        if (grid.children.length > 1) {
          grid.setAttribute("data-reveal-cascade", "");
        }
      });
      targets.add(section);
    });
    document.querySelectorAll("[data-reveal]").forEach((element) => {
      targets.add(element);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 },
    );

    targets.forEach((target) => {
      const rect = target.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92) {
        target.classList.add("is-visible");
      } else {
        observer.observe(target);
      }
    });

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
