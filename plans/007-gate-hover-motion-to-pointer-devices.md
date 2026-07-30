# 007 — Gate hover-driven movement behind a real pointer

- **Status**: DONE
- **Commit**: 0ef34a6
- **Severity**: MEDIUM
- **Category**: Accessibility / Cohesion
- **Estimated scope**: 1 file (`src/app/globals.css`), 4 rules edited + 1 block added

## Problem

Touch devices synthesise a `:hover` when you tap, and it **sticks** until you tap elsewhere.
Four hand-written rules apply a `transform` on `:hover` with no pointer gate:

```css
/* src/app/globals.css:98 — current */
.btn-primary:hover {
  border-color: #1e293b;
  background: #1e293b;
  transform: translateY(-1px);
  box-shadow: 0 14px 30px rgba(7, 59, 92, 0.17);
}
```

```css
/* src/app/globals.css:159 — current */
.btn-brand:hover {
  filter: brightness(1.06);
  transform: translateY(-1px);
  box-shadow: 0 18px 36px rgba(13, 148, 136, 0.42);
}
```

```css
/* src/app/globals.css:682 — current */
.pricing-glass-button:hover,
.hero-glass-button:hover {
  background: rgba(255, 255, 255, 0.5);
  box-shadow: /* … */;
  transform: translateY(-1px);
}
```

```css
/* src/app/globals.css:1134 — current */
.wbr-fab:hover {
  filter: brightness(1.05);
  transform: scale(1.08) translateY(-1px);
  box-shadow: 0 18px 38px rgba(13, 148, 136, 0.5);
}
```

Meanwhile the component-level hover motion written with Tailwind **is** already gated — this
project runs Tailwind v4.3.3, whose `hover` variant compiles to `@media (hover: hover)` by
default (confirmed in `node_modules/tailwindcss/dist/lib.js`). So on a phone:

- `hover:-translate-y-1` on the listing card (`src/components/marketplace/compact-listing-card.tsx:22`) → correctly does nothing.
- `.btn-primary:hover { transform: translateY(-1px) }` → fires on tap and **stays lifted**.

The result is an inconsistency inside a single viewport: tap a bike card, nothing sticks; tap
the button under it, it stays raised until you tap elsewhere. AUDIT §6 requires the
`@media (hover: hover) and (pointer: fine)` gate on hover motion.

Verified at this commit: no `.tsx` file uses a Tailwind `ease-*` utility, and none of these
four rules is overridden elsewhere.

## Target

Leave the colour, filter and shadow changes ungated — they are useful feedback on a tap.
Move **only the `transform` declarations** into a pointer-gated block.

```css
/* target — the four rules, with `transform` removed from each */
.btn-primary:hover {
  border-color: #1e293b;
  background: #1e293b;
  box-shadow: 0 14px 30px rgba(7, 59, 92, 0.17);
}

.btn-brand:hover {
  filter: brightness(1.06);
  box-shadow: 0 18px 36px rgba(13, 148, 136, 0.42);
}

.pricing-glass-button:hover,
.hero-glass-button:hover {
  background: rgba(255, 255, 255, 0.5);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.95),
    0 16px 38px rgba(8, 116, 123, 0.18);
}

.wbr-fab:hover {
  filter: brightness(1.05);
  box-shadow: 0 18px 38px rgba(13, 148, 136, 0.5);
}
```

```css
/* target — new block, added at the end of src/app/globals.css,
   immediately BEFORE the @media (prefers-reduced-motion: reduce) block */

/*
 * Hover-driven movement only on devices with a real pointer. Touch synthesises a
 * :hover on tap and leaves it stuck, so an ungated lift never resets.
 * Tailwind v4 already gates its own hover: utilities this way.
 */
@media (hover: hover) and (pointer: fine) {
  .btn-primary:hover {
    transform: translateY(-1px);
  }

  .btn-brand:hover {
    transform: translateY(-1px);
  }

  .pricing-glass-button:hover,
  .hero-glass-button:hover {
    transform: translateY(-1px);
  }

  .wbr-fab:hover {
    transform: scale(1.08) translateY(-1px);
  }
}
```

## Repo conventions to follow

- Media-query blocks in this file are placed at the end and wrap whole rules — see
  `src/app/globals.css:934`, `1037`, `1197`, `1209`. Follow that placement.
- The block must sit **before** the `prefers-reduced-motion: reduce` block (currently at line
  1260, rewritten by plan `006`) so the reduced-motion overrides still win.

## Steps

1. `src/app/globals.css:101` — delete the line `transform: translateY(-1px);` from
   `.btn-primary:hover`.
2. `src/app/globals.css:161` — delete the line `transform: translateY(-1px);` from
   `.btn-brand:hover`.
3. `src/app/globals.css:688` — delete the line `transform: translateY(-1px);` from
   `.pricing-glass-button:hover, .hero-glass-button:hover`.
4. `src/app/globals.css:1136` — delete the line `transform: scale(1.08) translateY(-1px);`
   from `.wbr-fab:hover`.
5. Add the new `@media (hover: hover) and (pointer: fine)` block from **Target**, positioned
   immediately before the `@media (prefers-reduced-motion: reduce)` block at the end of the file.

## Boundaries

- Do NOT touch any `.tsx` file. Tailwind `hover:` utilities are already gated correctly and
  must not be changed.
- Do NOT gate the colour, `filter`, or `box-shadow` changes — those are wanted on touch.
- Do NOT touch `:active` rules; plan `005` owns press feedback.
- Do NOT touch `.btn-secondary:hover` / `.btn-quiet:hover` / `.date-popover__day:hover` etc. —
  they change colour only and need no gate.
- Do NOT add new dependencies.
- If the code at any cited line does not match the excerpts above, STOP and report.

## Verification

- **Mechanical**:
  - `npm run lint` and `npm run build` succeed.
  - `grep -n "hover: hover" src/app/globals.css` returns exactly one hit.
  - `grep -c "translateY(-1px)" src/app/globals.css` returns `3` — all inside the new gated
    block.
- **Feel check**: `npm run dev`.
  - **With a mouse**, at desktop width: hover the primary CTA on `/`, the brand button on
    `/quick-bike-repair-richmond`, the glass buttons on `/pricing` and `/faq`, and the chat
    FAB — every one still lifts exactly as before. Nothing should have changed on desktop.
  - **With DevTools touch simulation on** (device toolbar, 390×844): tap the primary CTA and
    then look at it — it must sit flat, not raised. Tap a bike card on `/bikes` and then a
    button: both behave the same way now.
  - Tap the chat FAB: it must not stay enlarged at 1.08 after the tap.
  - On a **real phone** if available (this is the case the emulator approximates): tap any
    CTA, then scroll — no element should remain visually lifted.
- **Done when**: on touch, no element retains a raised/enlarged state after a tap; on a mouse,
  every hover lift is unchanged from before.
