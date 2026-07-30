# 008 — Give the date popover an entrance from its field

- **Status**: DONE
- **Commit**: 0ef34a6
- **Severity**: MEDIUM
- **Category**: Physicality & origin
- **Estimated scope**: 1 file (`src/app/globals.css`), 1 rule extended

## Problem

The date popover is conditionally mounted with no motion of any kind:

```tsx
// src/components/forms/date-field.tsx:319 — current
{open ? (
  <div
    id={`${fieldId}-calendar`}
    role="dialog"
    aria-label="Choose a date"
    className="date-popover"
  >
```

```css
/* src/app/globals.css:268 — current, no transition and no transform-origin */
.date-popover {
  position: absolute;
  top: calc(100% + 0.4rem);
  left: 0;
  z-index: 40;
  width: 17.5rem;
  max-width: calc(100vw - 2rem);
  border: 1px solid var(--border);
  border-radius: 0.9rem;
  background: #fff;
  padding: 0.75rem;
  box-shadow: 0 18px 40px rgba(15, 34, 56, 0.16);
}
```

A 280px panel materialises next to the field with no transition. AUDIT §8: spatially-connected
UI that appears with no motion explaining where it came from is a defect — the eye needs a
beat to work out that this new object belongs to the field that was just clicked. This is the
core control of the booking flow (`/booking`), which makes it the wrong place to save 180ms.

AUDIT §3 additionally requires trigger-anchored elements to scale **from their anchor**, not
from centre. The popover is positioned `top: calc(100% + 0.4rem); left: 0` relative to
`.date-field`, i.e. it hangs from the field's bottom-left corner — so `top left` is its
true anchor.

## Target

Animate the entrance with `@starting-style` — the CSS-native way to transition an element that
appears in the DOM, and AUDIT §4's prescribed approach for entry without JS. Because it is a
`transition` rather than a keyframe animation, it retargets correctly if the popover is
toggled rapidly.

```css
/* target — src/app/globals.css:268, additions to the existing .date-popover rule */
.date-popover {
  /* …all existing declarations, unchanged… */
  transform-origin: top left;
  transition:
    opacity var(--dur-popover) var(--ease-ui),
    transform var(--dur-popover) var(--ease-ui);
}

@starting-style {
  .date-popover {
    opacity: 0;
    transform: scale(0.96) translateY(-4px);
  }
}
```

`--dur-popover` (180ms) and `--ease-ui` come from plan `001`; if plan 001 has not been applied,
substitute `180ms` and `cubic-bezier(0.23, 1, 0.32, 1)`. 180ms is inside AUDIT's 125–200ms
band for small popovers. `scale(0.96)` is inside the required `0.9–0.97` range.

**Exit stays instant, by design.** Animating the close would require keeping the popover
mounted through an exit state, which means a state machine in `date-field.tsx`. Closing is a
deliberate, confirmed action (pick a date, press Escape, click away) and an instant dismissal
reads as responsive, not abrupt — AUDIT §4's asymmetric-timing principle: the deliberate phase
animates, the system's response snaps.

## Repo conventions to follow

- All `.date-popover*` styling lives in `src/app/globals.css` starting at line 268; the
  component carries only class names. Keep it that way — do not add inline styles or a new
  CSS file.
- The transition shorthand style used throughout this file is a multi-line list of explicit
  properties, never `all` — see `src/app/globals.css:197` and `258`. Match that formatting.

## Steps

1. `src/app/globals.css` — in the existing `.date-popover` rule (lines 268–280), add two
   declarations before the closing brace:
   ```css
     transform-origin: top left;
     transition:
       opacity var(--dur-popover) var(--ease-ui),
       transform var(--dur-popover) var(--ease-ui);
   ```
   Do not reorder or alter the existing declarations.

2. Immediately after the closing brace of `.date-popover`, add the `@starting-style` block from
   **Target**.

3. Do not modify `src/components/forms/date-field.tsx` at all — `@starting-style` works on
   conditionally mounted elements without any JS change.

## Boundaries

- Do NOT touch `src/components/forms/date-field.tsx` or any other `.tsx` file.
- Do NOT convert the popover to a keyframe animation — keyframes restart from zero and will
  not retarget when the calendar button is clicked rapidly.
- Do NOT add exit-animation state to the component.
- Do NOT change the popover's position, width, z-index, or shadow.
- Do NOT touch `.date-popover__day`, `__nav`, `__action`, or any child rule.
- Do NOT add new dependencies.
- If the `.date-popover` rule does not match the excerpt above, STOP and report.

## Verification

- **Mechanical**:
  - `npm run lint` and `npm run build` succeed.
  - `npm run test:e2e` passes — the booking form is covered by Playwright; if a test fails on
    popover timing, report it rather than editing the test.
  - `grep -n "@starting-style" src/app/globals.css` returns exactly one hit.
- **Feel check**: `npm run dev`, go to `/booking`.
  - Click the calendar icon: the panel **grows from the field's top-left corner** while fading
    in. It must not grow from its own centre, and it must not appear at full size instantly.
  - In DevTools → Animations at 10% playback, confirm the first frame is visibly smaller than
    the last and anchored at the top-left, not the middle.
  - Click the icon rapidly, five or six times: the panel never flickers at full size and never
    restarts from scratch mid-animation — it picks up from wherever it is.
  - Pick a date: the popover closes **instantly**. This is intended.
  - Check the second date field on the same form behaves identically.
  - Toggle `prefers-reduced-motion: reduce`: after plan `006` the popover appears with an
    opacity fade only, no scale.
  - Confirm in a non-Chromium browser if available (Safari 17.5+ / Firefox 129+ support
    `@starting-style`). On an older browser the popover simply appears instantly — degraded,
    never broken.
- **Done when**: the popover visibly scales up from the field's top-left corner on open,
  closes instantly, and survives rapid toggling without restarting.
