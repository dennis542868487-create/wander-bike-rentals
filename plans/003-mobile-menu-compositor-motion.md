# 003 — Stop the mobile nav from animating layout

- **Status**: DONE
- **Commit**: 0ef34a6
- **Severity**: HIGH
- **Category**: Performance / Easing & duration
- **Estimated scope**: 1 file (`src/components/site-header.tsx`), ~10 lines

> **Behavioural change — read before executing.** This plan converts the mobile menu from
> *pushing* the page down to *overlaying* it. That is the only way to get the panel off the
> layout thread. The change is intentional and is the point of the plan, but a human should
> eyeball it once (see Feel check).

## Problem

```tsx
// src/components/site-header.tsx:330 — current
<div
  id="mobile-primary-navigation"
  className={[
    "overscroll-contain overflow-y-auto border-t border-slate-200 transition-all duration-300 xl:hidden",
    menuOpen
      ? "max-h-[calc(100dvh-4.5rem)] py-3 opacity-100 sm:max-h-[calc(100dvh-6rem)] sm:py-4"
      : "max-h-0 py-0 opacity-0",
  ].join(" ")}
>
```

Three defects stacked on the single highest-frequency interaction a mobile visitor has with
this site:

1. **`transition-all`** animates every animatable property that differs between the two class
   sets — `max-height`, `padding-top`, `padding-bottom`, and `opacity` — plus anything added
   later. AUDIT §5: `transition: all` is always a finding.
2. **`max-height` and `padding` are layout properties.** Every frame triggers layout → paint →
   composite for the header *and* everything below it, because the header sits in normal flow
   and expanding it pushes the page down. AUDIT §5: animate `transform` and `opacity` only.
3. **`max-h-0` → `max-h-[calc(100dvh-4.5rem)]` produces a timing artifact.** The menu's real
   content is far shorter than `100dvh`, so the visible edge reaches full height early and the
   remaining animation runs invisibly. The perceived open is faster and more abrupt than the
   declared 300ms, and the close appears to hang before anything moves.

## Target

An absolutely-positioned panel that translates and fades — compositor-only, correct timing,
no reflow of the page beneath.

```tsx
/* target — src/components/site-header.tsx, replacing the opening tag at line 330 */
<div
  id="mobile-primary-navigation"
  inert={!menuOpen}
  className={[
    "absolute inset-x-0 top-full origin-top overscroll-contain overflow-y-auto",
    "max-h-[calc(100dvh-4.5rem)] sm:max-h-[calc(100dvh-6rem)]",
    "border-t border-slate-200 bg-white/95 shadow-[0_18px_40px_rgba(15,23,42,0.12)] backdrop-blur-2xl",
    "transition-[translate,opacity] duration-[220ms] ease-[var(--ease-ui)] xl:hidden",
    menuOpen
      ? "translate-y-0 py-3 opacity-100 sm:py-4"
      : "pointer-events-none -translate-y-2 py-3 opacity-0 sm:py-4",
  ].join(" ")}
>
```

Key points, all deliberate:

- `transition-[translate,opacity]` — explicit property list, never `all`. It must name
  **`translate`**, not `transform`: Tailwind v4 implements `-translate-y-2` with the
  standalone `translate` CSS property, so a transition list naming `transform` animates
  nothing and the panel snaps into place while only the opacity fades. Verified in the
  browser — computed `translate` is `0px -8px` while computed `transform` is `none`.
- `220ms` sits in AUDIT's 150–250ms dropdown budget. `var(--ease-ui)` comes from plan `001`;
  if plan 001 has not been applied, write `ease-[cubic-bezier(0.23,1,0.32,1)]` instead.
- **Padding is now identical in both states** (`py-3 sm:py-4`). It must not differ, or it
  re-enters the transition as a layout property.
- `max-h` is now a static clamp for tall menus, not an animated value.
- The panel needs its own `bg-white/95 backdrop-blur-2xl` and a shadow, because as an overlay
  it no longer inherits the header's painted background.
- `inert={!menuOpen}` keeps the hidden panel out of tab order and the accessibility tree. The
  previous `max-h-0` version left its links focusable — this fixes that as a side effect of
  the panel becoming visually invisible rather than clipped.

## Repo conventions to follow

- Class lists in this file are built with an array joined by a space and a
  `menuOpen ? … : …` ternary for state classes — see `src/components/site-header.tsx:332`
  and the `actionClass` / `mobileLinkClass` helpers at lines 55–80. Preserve that shape.
- Arbitrary Tailwind values in square brackets are already used throughout this file, e.g.
  `shadow-[0_10px_30px_rgba(15,23,42,0.05)]` at `src/components/site-header.tsx:179`.
- The parent `<header>` at `src/components/site-header.tsx:179` is already
  `sticky top-0 z-50` and establishes the containing block for `absolute` — no positioning
  change is needed on it. Verify it during the edit; do not modify it.

## Steps

1. Open `src/components/site-header.tsx` and locate the `<div id="mobile-primary-navigation">`
   opening tag beginning at line 330.

2. Replace that opening tag (lines 330–338, up to and including the `>`) with the **Target**
   block above. The children — the `<nav aria-label="Mobile primary">` element and everything
   inside it — are untouched.

3. Confirm the parent `<header>` element at line 179 still carries `sticky top-0 z-50`. If it
   does not, STOP and report; the absolute positioning depends on it.

4. Do not change the toggle button at lines 313–326 or the `menuOpen` state logic.

## Boundaries

- Do NOT touch any other component or any CSS file.
- Do NOT change the menu's contents, links, or the accordion groups inside it — plan `012`
  owns the accordion.
- Do NOT change the toggle button, `closeMenu`, or `setMenuOpen`.
- Do NOT add new dependencies.
- This repo runs a Next.js version with breaking changes from common training data. If the
  `inert` prop or any JSX API behaves unexpectedly, consult `node_modules/next/dist/docs/`
  and the installed React version before improvising.
- If the code at lines 330–338 does not match the excerpt above, STOP and report.

## Verification

- **Mechanical**:
  - `npm run lint` and `npm run build` succeed.
  - `npm run test:e2e` passes — the mobile nav is exercised by the Playwright suite; if a test
    fails because it asserted on `max-h-0`, report it rather than editing the test.
  - `grep -n "transition-all" src/components/site-header.tsx` returns nothing.
- **Feel check**: `npm run dev`, DevTools device toolbar at 390×844, CPU 4× slowdown.
  - Open the menu: it **slides down over** the page content; the content behind does **not**
    shift. This is the intended behavioural change — confirm it looks right.
  - Open DevTools → Performance, record an open/close cycle: there should be **no purple
    "Layout" bars** during the animation, only compositing.
  - Spam the hamburger rapidly: the panel reverses smoothly from wherever it is. It never
    jumps to fully-open or fully-closed before reversing (transitions retarget; this is the
    interruptibility check).
  - With the menu closed, press Tab repeatedly from the hamburger: focus **skips** the hidden
    menu links entirely.
  - At 10% playback in the Animations panel, the open reads as one continuous 220ms slide —
    no early stop with invisible tail.
  - Toggle `prefers-reduced-motion: reduce`: after plan `006`, the panel should still appear
    and disappear with an opacity change but no slide. Before plan 006, it will be instant —
    that is expected at this stage.
- **Done when**: no Layout bars during open/close, page content does not shift, rapid toggling
  reverses smoothly, and hidden menu links are not focusable.
