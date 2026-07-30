# 012 — Animate the mobile nav accordion instead of teleporting it

- **Status**: DONE
- **Commit**: 0ef34a6
- **Severity**: LOW
- **Category**: Interruptibility
- **Estimated scope**: 1 file (`src/components/site-header.tsx`), ~10 lines

## Problem

Inside the mobile menu, each nav group ("Our Services", "Guides") conditionally mounts its
sublist:

```tsx
// src/components/site-header.tsx:371 — current
{expanded ? (
  <div className="mt-1 space-y-1 border-t border-slate-100 pt-2">
    {group.links.map((link) => (
      <Link
        key={link.href}
        href={link.href}
        onClick={closeMenu}
        className="block rounded-xl px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
      >
        {link.label}
      </Link>
    ))}
  </div>
) : null}
```

The sublist appears and disappears instantly while its own chevron rotates smoothly
(`src/components/site-header.tsx:367`) and — after plan `003` — the panel containing it slides.
Three motion behaviours in one component: one animated, one instant, one sliding. AUDIT §7:
mismatched motion within a single surface is a cohesion finding.

There is also an interruptibility problem. Conditional mounting means rapid toggling produces
hard cuts with no state to retarget from; AUDIT §4 requires anything rapidly triggered to use
transitions rather than mount/unmount or keyframes.

## Target

Keep the sublist mounted and transition `grid-template-rows` between `0fr` and `1fr` — the
standard CSS-only technique for animating to an element's natural height without hardcoding a
pixel value or overshooting with `max-height`.

```tsx
/* target — src/components/site-header.tsx, replacing the block at line 371 */
<div
  className={[
    "grid transition-[grid-template-rows,opacity] duration-200 ease-[var(--ease-ui)]",
    expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
  ].join(" ")}
>
  <div className="overflow-hidden">
    <div className="mt-1 space-y-1 border-t border-slate-100 pt-2">
      {group.links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={closeMenu}
          tabIndex={expanded ? undefined : -1}
          className="block rounded-xl px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
        >
          {link.label}
        </Link>
      ))}
    </div>
  </div>
</div>
```

Notes on the shape, all load-bearing:

- The **`overflow-hidden` wrapper is mandatory** — without it the row collapses to `0fr` but the
  content overflows and stays visible.
- `duration-200` sits in AUDIT's 150–250ms dropdown band. `var(--ease-ui)` comes from plan
  `001`; without it, write `ease-[cubic-bezier(0.23,1,0.32,1)]`.
- `tabIndex={expanded ? undefined : -1}` keeps collapsed links out of tab order now that they
  are always mounted. Without it, this change would introduce an accessibility regression.
- This animates `grid-template-rows`, which is a layout property. That is a deliberate
  trade-off: the alternative (`max-height`) produces the timing artifact described in plan
  `003`, and a transform-based approach cannot size to content. The animating subtree is a
  handful of links inside an already-composited overlay panel, so the cost is small and bounded
  — unlike the whole-page reflow plan 003 removes.

## Repo conventions to follow

- State-dependent class lists in this file use an array joined by a space with a ternary — see
  `src/components/site-header.tsx:332` and the `mobileLinkClass` helper at line 74. Match it.
- Arbitrary Tailwind values in square brackets are used throughout this file, e.g.
  `rounded-[1.4rem]` at line 351.
- The chevron at line 366 already transitions correctly (`transition` + conditional
  `rotate-180`). Leave it exactly as it is — it is the exemplar this plan brings the sublist
  in line with.

## Steps

1. `src/components/site-header.tsx` — replace the `{expanded ? ( … ) : null}` block beginning
   at line 371 with the **Target** markup above.

2. Do not change the toggle `<button>` at lines 353–370, the `openGroup` state, or the
   `mobileLinkClass` helper.

## Boundaries

- Do NOT touch any CSS file.
- Do NOT touch the outer mobile panel — plan `003` owns it. If plan 003 has already run, this
  sublist now lives inside an absolutely-positioned overlay; that is expected and requires no
  adjustment here.
- Do NOT change link hrefs, labels, `onClick={closeMenu}`, or the `key` prop.
- Do NOT convert this to a keyframe animation.
- Do NOT add new dependencies.
- This repo runs a Next.js version with breaking changes from common training data; consult
  `node_modules/next/dist/docs/` if any JSX or routing API behaves unexpectedly.
- If the code at line 371 does not match the excerpt above, STOP and report.

## Verification

- **Mechanical**:
  - `npm run lint` and `npm run build` succeed.
  - `npm run test:e2e` passes.
  - `grep -n "grid-rows-\[0fr\]" src/components/site-header.tsx` returns one hit.
- **Feel check**: `npm run dev`, DevTools device toolbar at 390×844, touch simulation on.
  - Open the hamburger menu, tap "Our Services": the sublist **grows smoothly to its natural
    height** — no jump, no overshoot, no clipped final frame.
  - Tap it closed: it collapses just as smoothly, and no link text spills outside the collapsing
    box at any frame (that would mean the `overflow-hidden` wrapper is missing).
  - Tap "Our Services" and "Guides" alternately, fast: each reverses smoothly from its current
    height. Nothing snaps to fully-open before collapsing.
  - With a group collapsed, press Tab repeatedly: focus **skips** its links.
  - The chevron rotation and the sublist growth should now finish at about the same time —
    check at 10% playback in the Animations panel.
  - Toggle `prefers-reduced-motion: reduce`: after plan `006`, the sublist appears and
    disappears with an opacity change only, no height animation.
- **Done when**: the sublist animates open and closed at its natural height, survives rapid
  toggling, and collapsed links are not focusable.
