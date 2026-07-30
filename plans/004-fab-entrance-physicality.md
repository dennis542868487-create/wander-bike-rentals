# 004 — Stop the chat FAB from appearing out of nothing

- **Status**: DONE
- **Commit**: 0ef34a6
- **Severity**: HIGH
- **Category**: Physicality & origin
- **Estimated scope**: 1 file (`src/app/globals.css`), 2 edits

## Problem

```css
/* src/app/globals.css:1210 — current */
  .wbr-fab {
    animation: wbr-pop-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }
```

```css
/* src/app/globals.css:1222 — current */
  @keyframes wbr-pop-in {
    from {
      opacity: 0;
      transform: scale(0) translateY(8px);
    }

    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
```

Two problems:

1. **`scale(0)`.** AUDIT §3 is unconditional: never animate from `scale(0)` — nothing in the
   physical world appears from nothing, and the eye reads it as fake. The target range is
   `scale(0.9–0.97)` paired with `opacity: 0`.
2. **`cubic-bezier(0.34, 1.56, 0.64, 1)` over 500ms** is a large overshoot (the `1.56`
   control point sends it 20%+ past its final size) on an element that appears on **every
   page load, on every page**. AUDIT §4: keep bounce subtle and reserve visible overshoot for
   drag-to-dismiss and genuinely playful moments. A support widget announcing itself with a
   half-second bounce on every page is decorative motion on a high-frequency surface.

## Target

```css
/* target — src/app/globals.css:1210 */
  .wbr-fab {
    animation: wbr-pop-in 300ms var(--ease-ui) both;
  }
```

```css
/* target — src/app/globals.css:1222 */
  @keyframes wbr-pop-in {
    from {
      opacity: 0;
      transform: scale(0.92) translateY(8px);
    }

    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
```

`var(--ease-ui)` = `cubic-bezier(0.23, 1, 0.32, 1)`, added by plan `001`. If plan 001 has not
been applied, write the literal `cubic-bezier(0.23, 1, 0.32, 1)` instead.

`0.92` is inside AUDIT's `0.9–0.97` band and reads as "moved closer" rather than "inflated
from a point". 300ms is a rare, non-blocking entrance — comfortably inside budget while still
feeling deliberate.

## Repo conventions to follow

- Both rules live inside the `@media (prefers-reduced-motion: no-preference)` block that opens
  at `src/app/globals.css:1209`. **Keep them there** — the FAB entrance is correctly gated
  already, and that gating is the exemplar to preserve.
- Durations elsewhere in this file are written in `ms`, not `s` (e.g. `160ms` at line 85,
  `220ms` at line 1129). The existing `0.5s` is the outlier; the target uses `300ms` to match
  the majority convention.

## Steps

1. `src/app/globals.css:1211` — change
   `animation: wbr-pop-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;` to
   `animation: wbr-pop-in 300ms var(--ease-ui) both;`.

2. `src/app/globals.css:1225` — change `transform: scale(0) translateY(8px);` to
   `transform: scale(0.92) translateY(8px);`.

3. Leave everything else in the block alone — `.wbr-fab-ring` / `wbr-pulse` (lines 1214,
   1234) belong to plan `010`, and `.wbr-teaser` / `wbr-teaser-in` (lines 1218, 1247) are
   already correct: `translateX(12px) scale(0.96)` is exactly the physicality this plan is
   applying to the FAB.

## Boundaries

- Do NOT touch any `.tsx` file.
- Do NOT modify `wbr-pulse`, `.wbr-fab-ring`, `wbr-teaser-in`, or the `.wbr-fab` `transition`
  declaration at line 1128 (that one governs hover/press, not entrance).
- Do NOT move these rules out of the `prefers-reduced-motion: no-preference` wrapper.
- Do NOT add new dependencies.
- If the code at lines 1211 and 1225 does not match the excerpts above, STOP and report.

## Verification

- **Mechanical**:
  - `npm run lint` and `npm run build` succeed.
  - `grep -c "scale(0)" src/app/globals.css` returns `0`.
  - `grep -c "cubic-bezier" src/app/globals.css` returns `3` if plan `001` has already run —
    only the three token definitions in `:root` remain, and no literal curve is left in any
    rule. Otherwise it returns the pre-existing count minus one.
- **Feel check**: `npm run dev`, load any page, watch the bottom-right chat button appear.
  - It should read as **fading and settling into place**, not inflating from a dot.
  - It must **not** overshoot past its final size. In DevTools → Animations at 10% playback,
    the button never appears larger than its resting size at any frame.
  - Hard-reload several times: the entrance should feel unremarkable — you notice the button
    is there, not that it performed.
  - Toggle `prefers-reduced-motion: reduce`: the entrance animation does not run at all and
    the button is simply present.
- **Done when**: `grep -c "scale(0)" src/app/globals.css` is `0`, and the FAB entrance shows
  no frame larger than its resting size.
