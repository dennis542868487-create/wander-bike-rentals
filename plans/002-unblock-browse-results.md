# 002 — Stop the scroll-reveal cascade from delaying browse results

- **Status**: DONE
- **Commit**: 0ef34a6
- **Severity**: HIGH
- **Category**: Purpose & frequency / Cohesion
- **Estimated scope**: 3 files, ~30 lines

## Problem

`src/components/reveal.tsx` runs globally from `src/app/layout.tsx:62`. On every route it
walks the DOM, marks every `main > section:not(.hero)` as `[data-reveal]`, and marks **every
`.grid` with more than one child** as `[data-reveal-cascade]`:

```tsx
// src/components/reveal.tsx:16 — current
document.querySelectorAll("main > section:not(.hero)").forEach((section) => {
  section.setAttribute("data-reveal", "");
  section.querySelectorAll(".grid").forEach((grid) => {
    if (grid.children.length > 1) {
      grid.setAttribute("data-reveal-cascade", "");
    }
  });
  targets.add(section);
});
```

That rule catches the bike results grid on `/bikes`:

```tsx
// src/components/marketplace/browse-listings.tsx:337 — current
<div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
```

which is styled by:

```css
/* src/app/globals.css:951 — current */
.reveal-ready [data-reveal] {
  opacity: 0;
  transform: translateY(24px);
  transition:
    opacity 700ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 700ms cubic-bezier(0.22, 1, 0.36, 1);
  will-change: opacity, transform;
}
```

```css
/* src/app/globals.css:965 — current */
.reveal-ready [data-reveal] [data-reveal-cascade] > * {
  opacity: 0;
  transform: translateY(18px);
  transition:
    opacity 600ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 600ms cubic-bezier(0.22, 1, 0.36, 1);
}
/* …with transition-delay 40ms / 120ms / 200ms / 280ms / 360ms / 440ms
   for :nth-child(1…5) and (n + 6), at lines 978–1018 */
```

**Net effect on the site's most important page**: a visitor lands on `/bikes` to see which
bikes are available. The results are `opacity: 0` until scrolled into view, then fade in one
by one. The sixth card and everything after it carries a 440ms delay on top of a 600ms
transition — **1.04 seconds** before it is readable. This is decorative stagger placed in
front of content the user explicitly came for. AUDIT §7: *stagger must never block
interaction*; AUDIT §1: decorative motion on a high-frequency surface is a defect.

> Note: if plan `001` has already been applied, the literal `cubic-bezier(0.22, 1, 0.36, 1)`
> in the excerpts above reads `var(--ease-ui)` instead. Treat the two as equivalent when
> matching. This plan's edits are written to work either way.

## Target

Two changes, both narrow:

**A. Let a grid opt out of the cascade**, and opt the results grid out.

```tsx
/* target — src/components/reveal.tsx */
section.querySelectorAll(".grid:not([data-reveal-skip])").forEach((grid) => {
  if (grid.children.length > 1) {
    grid.setAttribute("data-reveal-cascade", "");
  }
});
```

```tsx
/* target — src/components/marketplace/browse-listings.tsx:337 */
<div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" data-reveal-skip>
```

**B. Bring the remaining reveal inside a defensible budget** — 400ms transitions and a 60ms
stagger step, so the last staggered item completes at 700ms instead of 1040ms.

```css
/* target — src/app/globals.css, replacing the transitions at 951–1018 */
.reveal-ready [data-reveal] {
  opacity: 0;
  transform: translateY(24px);
  transition:
    opacity var(--dur-reveal) var(--ease-ui),
    transform var(--dur-reveal) var(--ease-ui);
}

.reveal-ready [data-reveal] [data-reveal-cascade] > * {
  opacity: 0;
  transform: translateY(18px);
  transition:
    opacity var(--dur-reveal) var(--ease-ui),
    transform var(--dur-reveal) var(--ease-ui);
}

/* stagger steps: 0 / 60 / 120 / 180 / 240 / 300ms */
```

`--dur-reveal` (400ms) and `--ease-ui` come from plan `001`. If plan 001 has not been
applied, substitute `400ms` and `cubic-bezier(0.23, 1, 0.32, 1)` literally.

The `will-change` line is deliberately absent from the target — it is removed by plan `009`.
Leave it in place here; do not fight over it.

## Repo conventions to follow

- Reveal opt-in/opt-out is expressed with **data attributes**, not classes — see
  `data-reveal` and `data-reveal-cascade` in `src/components/reveal.tsx:17,20`. `data-reveal-skip`
  follows that convention.
- Boolean data attributes in this codebase are written bare in JSX (no `={true}`).
- Cascade delays are written as separate `:nth-child()` rules, one per step, at
  `src/app/globals.css:978`. Keep that structure — just change the numbers.

## Steps

1. `src/components/reveal.tsx:18` — change the selector from `".grid"` to
   `".grid:not([data-reveal-skip])"`. Nothing else in this file changes.

2. `src/components/marketplace/browse-listings.tsx:337` — add the `data-reveal-skip`
   attribute to the results grid div. Do not change its classes.

3. `src/app/globals.css:951–958` — change both `700ms` values in `.reveal-ready [data-reveal]`
   to `var(--dur-reveal)`. Leave `opacity`, `transform`, and `will-change` untouched.

4. `src/app/globals.css:965–971` — change both `600ms` values in
   `.reveal-ready [data-reveal] [data-reveal-cascade] > *` to `var(--dur-reveal)`.

5. `src/app/globals.css:978–1018` — retime the six stagger rules, keeping the existing
   selector formatting exactly as it is:

   | Selector | Current delay | New delay |
   | --- | --- | --- |
   | `:nth-child(1)` | `40ms` | `0ms` |
   | `:nth-child(2)` | `120ms` | `60ms` |
   | `:nth-child(3)` | `200ms` | `120ms` |
   | `:nth-child(4)` | `280ms` | `180ms` |
   | `:nth-child(5)` | `360ms` | `240ms` |
   | `:nth-child(n + 6)` | `440ms` | `300ms` |

## Boundaries

- Do NOT remove the reveal system. Marketing pages (`/`, `/how-it-works`, `/location`, the
  guides) legitimately use it; only the results grid is being exempted.
- Do NOT touch `will-change` (plan 009 owns it) or the overshoot curve at line 1211.
- Do NOT change the `IntersectionObserver` options at `src/components/reveal.tsx:37`.
- Do NOT change any markup or class names on the results grid beyond adding the attribute.
- This repo runs a Next.js version with breaking changes from common training data. Before
  editing any `.tsx`, consult `node_modules/next/dist/docs/` if an API is unclear.
- If the code at a cited line differs from the excerpts above, STOP and report.

## Verification

- **Mechanical**:
  - `npm run lint` and `npm run build` both succeed.
  - `npm run test:e2e` — Playwright suite still passes.
  - `grep -n "data-reveal-skip" src/components/reveal.tsx src/components/marketplace/browse-listings.tsx`
    returns exactly one hit in each file.
- **Feel check**: `npm run dev`, open `/bikes` on a **throttled mobile profile**
  (DevTools → Network: Fast 3G, CPU: 4× slowdown).
  - Scroll to the results grid: **every card is visible immediately as a block** — no
    one-by-one entry, no card still fading in after the user has arrived.
  - The section around the grid may still fade/rise as a whole; that is intended.
  - On `/` and `/how-it-works`, the staggered feature grids **still** cascade — confirm the
    opt-out did not leak. In the DevTools Animations panel at 10% playback, the last item in
    those grids should finish at roughly 0.7s, not 1.0s.
  - Toggle `prefers-reduced-motion: reduce` (DevTools → Rendering): the whole reveal system
    is bypassed (`src/components/reveal.tsx:10` returns early) and all content is visible at
    full opacity with no movement.
- **Done when**: results on `/bikes` are readable the moment they enter the viewport, marketing
  cascades still play at the shorter timing, and the e2e suite is green.
