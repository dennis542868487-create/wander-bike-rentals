# 011 — Restore the guide-page hero entrance (58 dead class names)

- **Status**: DONE
- **Commit**: 0ef34a6
- **Severity**: MEDIUM
- **Category**: Cohesion
- **Estimated scope**: 5 files (1 CSS + 4 pages), ~30 lines added, 10 class names removed

## Problem

Four guide pages apply animation class names that are **defined nowhere in the codebase**:

```tsx
// src/app/guides/best-places-to-bike-in-steveston/page.tsx:61 — current
className="hero-img-anim object-cover object-center"
// :63
<div className="hero-grad-anim absolute inset-0 bg-gradient-to-br …" />
// :68
<div className="hero-anim hero-d1 inline-flex rounded-full …">
// :72
<h1 className="hero-anim hero-d2 text-4xl font-bold …">
```

Confirmed at this commit: `src/app/globals.css` is the only stylesheet in the project, there
are no `<style>` blocks or styled-jsx anywhere, and none of these names appears in it. They
resolve to nothing.

Exact counts across the four files:

| Class | Occurrences |
| --- | --- |
| `hero-anim` | 24 |
| `hero-grad-anim` | 7 |
| `hero-d3` | 8 |
| `hero-d4` | 8 |
| `hero-d1` | 4 |
| `hero-d2` | 4 |
| `hero-img-anim` | 3 |
| **Total** | **58** |

Affected files:

- `src/app/guides/best-places-to-bike-in-steveston/page.tsx`
- `src/app/guides/bike-trailer-rental-richmond-guide/page.tsx`
- `src/app/guides/family-bike-rental-richmond/page.tsx`
- `src/app/guides/steveston-bike-ride-guide/page.tsx`

Almost certainly the CSS was dropped during the marketplace rebuild (commit `420a16b`,
"Rebuild as the Wander Bike marketplace") while the markup kept its class names. The visible
consequence: every other page on the site opens with a staggered `motion-rise` entrance
(`src/app/page.tsx:57`, `src/app/faq/page.tsx:119`, `src/app/how-it-works/page.tsx:49`, …)
while the four guide pages open completely static. AUDIT §7: mismatched motion personality
across a product is a finding — and this one is invisible in code review because nothing is
broken, it just silently does nothing.

## Target

**A. Define the copy-entrance classes**, reusing the existing `motion-rise` keyframe and the
site's established 80ms delay step.

```css
/* target — new block in src/app/globals.css, added inside the existing
   @media (prefers-reduced-motion: no-preference) block that opens at line 934,
   immediately after the .motion-rise rules */

  /*
   * Guide-page hero copy. Shares the motion-rise keyframe so guides open with the
   * same entrance as every other landing page.
   */
  .hero-anim {
    animation: motion-rise 560ms var(--ease-ui) both;
  }

  .hero-d1 {
    animation-delay: 0ms;
  }

  .hero-d2 {
    animation-delay: 80ms;
  }

  .hero-d3 {
    animation-delay: 160ms;
  }

  .hero-d4 {
    animation-delay: 240ms;
  }
```

**B. Delete `hero-img-anim` and `hero-grad-anim` from the markup** rather than defining them.

These sit on the full-bleed hero background image and its gradient overlays
(`src/app/guides/best-places-to-bike-in-steveston/page.tsx:61,63,64`). The image is rendered
with `priority` and is the **Largest Contentful Paint element** on each of these pages. Fading
in your LCP element delays the metric and the perceived load for no design benefit — the
background should simply be there. Removing the class names is the correct resolution, not an
omission.

`var(--ease-ui)` comes from plan `001`; if plan 001 has not been applied, substitute
`cubic-bezier(0.23, 1, 0.32, 1)`.

## Repo conventions to follow

- `motion-rise` and its delay classes are defined at `src/app/globals.css:911–932` using
  exactly this pattern — a base class with the animation, separate classes carrying only
  `animation-delay`. The 80ms step matches `.motion-rise-delay-1` (80ms) and
  `.motion-rise-delay-2` (160ms). Follow it precisely.
- Entrance animations on this site are gated inside
  `@media (prefers-reduced-motion: no-preference)` — see `src/app/globals.css:934` and `1209`.
  The new block must go **inside** that existing wrapper, not beside it.
- The `@keyframes motion-rise` block at line 923 is at file scope, outside the media query.
  Do not duplicate or move it — just reference it by name.

## Steps

1. `src/app/globals.css` — locate the `@media (prefers-reduced-motion: no-preference)` block
   that opens at line 934. Insert the CSS from **Target A** inside it, immediately after the
   `.liquid-glass-panel::before` / `@keyframes liquid-glass-shimmer` rules and before the
   `.reveal-ready` rules. Indentation is two spaces deeper than file scope, matching its
   siblings.

2. In each of the four guide page files, remove **only** the tokens `hero-img-anim` and
   `hero-grad-anim` from their `className` strings, along with the single space that separated
   them. For example:
   ```tsx
   /* from */
   className="hero-img-anim object-cover object-center"
   /* to */
   className="object-cover object-center"
   ```
   ```tsx
   /* from */
   <div className="hero-grad-anim absolute inset-0 bg-gradient-to-br from-slate-950/85 via-slate-950/68 to-slate-900/50" />
   /* to */
   <div className="absolute inset-0 bg-gradient-to-br from-slate-950/85 via-slate-950/68 to-slate-900/50" />
   ```

3. Leave every `hero-anim` and `hero-d1`–`hero-d4` occurrence in the markup exactly as it is —
   step 1 gives them meaning.

## Boundaries

- Do NOT rename, reorder, or restructure any markup. Only the two dead tokens are removed.
- Do NOT add an entrance animation to the hero background image or gradients in any form.
- Do NOT touch `.motion-rise`, `.motion-rise-delay-1/2`, or `@keyframes motion-rise`.
- Do NOT add a `hero-d5` or any class not already present in the markup.
- Do NOT touch pages outside `src/app/guides/`.
- Do NOT add new dependencies.
- This repo runs a Next.js version with breaking changes from common training data; consult
  `node_modules/next/dist/docs/` before changing anything about `next/image` usage.
- If a file does not contain the class names described, STOP and report.

## Verification

- **Mechanical**:
  - `npm run lint` and `npm run build` succeed.
  - `grep -ro "hero-img-anim\|hero-grad-anim" src/ | wc -l` returns `0`.
  - `grep -ro "hero-anim" src/app/guides/ | wc -l` still returns `24`.
  - `grep -c "\.hero-anim" src/app/globals.css` returns `1`.
- **Feel check**: `npm run dev`, hard-reload each of the four guide pages:
  - `/guides/best-places-to-bike-in-steveston`
  - `/guides/bike-trailer-rental-richmond-guide`
  - `/guides/family-bike-rental-richmond`
  - `/guides/steveston-bike-ride-guide`
  - The badge, heading, paragraphs and button row rise and fade in sequence, roughly 80ms
    apart. Two elements share `hero-d3` and two share `hero-d4` in each page — they are meant
    to arrive together; confirm that reads as intentional grouping, not a stutter.
  - The **background photo and gradients are fully painted from the first frame** — they must
    never fade in. This is the LCP check; if the photo fades, step 2 was not applied.
  - Open `/` in another tab and compare: the guide hero entrance should feel like the same
    product as the home hero, not faster or slower.
  - Toggle `prefers-reduced-motion: reduce`: all guide hero copy is immediately visible at full
    opacity with no movement.
- **Done when**: all three greps return the numbers above, guide heroes animate like the home
  page, and the hero photo never fades.
