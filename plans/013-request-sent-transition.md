# 013 — Give "Request sent" an entrance

- **Status**: DONE
- **Commit**: 0ef34a6
- **Severity**: LOW (additive — a missed opportunity, not a defect)
- **Category**: Missed opportunities
- **Estimated scope**: 2 files, ~10 lines

## Problem

When a visitor submits a rental request, the entire form is replaced by a success panel with
no transition at all:

```tsx
// src/components/marketplace/request-panel.tsx:114 — current
if (complete) {
  return (
    <aside className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-5 sm:p-6">
      <CheckCircle2 className="h-7 w-7 text-emerald-700" aria-hidden="true" />
      <h2 className="mt-4 text-xl font-bold text-slate-950">Request sent</h2>
      <p className="mt-2 text-sm leading-6 text-slate-700">
        This is not charged or confirmed yet. The owner will review it and
        you’ll get an email when the status changes.
      </p>
      <Link href="/account/rentals" className="btn-secondary mt-5 w-full">
        View My Rentals
      </Link>
    </aside>
  );
}
```

The form disappears and a green panel occupies the same space in a single frame. AUDIT §8
names both halves of this: a **state change that teleports**, and a **rare, high-emotion
moment** rendered with none of the delight budget it is allowed. This is the conversion event
of the whole product — the moment a visitor commits to renting a bike — and it is the only
significant state change on the site with no motion whatsoever.

It is also the one place where a slightly generous animation is unambiguously correct: it
happens once per booking, never on a hot path, and it confirms something the user cares about.

## Target

Fade and lift the success panel in as it mounts, using the same `@starting-style` technique as
plan `008`. No exit animation on the form — the two panels occupy the same slot, and
cross-fading them would need the form kept mounted in a dying state for no perceptible gain.

```tsx
/* target — src/components/marketplace/request-panel.tsx:116 */
<aside className="request-complete-panel rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-5 sm:p-6">
```

```css
/* target — new block in src/app/globals.css, added at file scope immediately
   after the .surface rule that ends at line 461 */

/*
 * The booking-request success panel replaces the form in place. It is the
 * conversion moment of the product, so it arrives rather than appearing.
 */
.request-complete-panel {
  transition:
    opacity var(--dur-panel) var(--ease-ui),
    transform var(--dur-panel) var(--ease-ui);
}

@starting-style {
  .request-complete-panel {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
  }
}
```

`--dur-panel` (260ms) and `--ease-ui` come from plan `001`; without plan 001, substitute
`260ms` and `cubic-bezier(0.23, 1, 0.32, 1)`. `scale(0.98)` is inside AUDIT's `0.9–0.97`+
physicality band and deliberately subtle — this should read as the panel settling into place,
not as a celebration animation. The 8px lift gives it a direction of arrival.

Deliberately **not** included: confetti, a checkmark draw-on, or a scale bounce. The panel
already carries a `CheckCircle2` icon and clear copy; the motion's job is to prevent the
teleport and mark the moment, not to perform.

## Repo conventions to follow

- Component-specific classes are declared in `src/app/globals.css` at file scope and referenced
  by name from the component — see `.surface` (line 457) and `.field-error` (line 433) used by
  `src/components/forms/field-error.tsx`. Follow that split; do not add inline styles.
- `@starting-style` is introduced by plan `008` for `.date-popover`. If plan 008 has already
  run, this is the second use of the same pattern — keep them formatted identically.
- Class name ordering in this file's JSX puts the semantic class first, Tailwind utilities
  after — see `src/components/marketplace/browse-listings.tsx:146`
  (`"marketplace-browse-grid mx-auto grid …"`). Match it.

## Steps

1. `src/components/marketplace/request-panel.tsx:116` — add `request-complete-panel ` as the
   first token of the `<aside>` `className`. Change nothing else in the component: not the
   `complete` state, not the copy, not the `Link`.

2. `src/app/globals.css` — add the CSS from **Target** at file scope, immediately after the
   `.surface` rule that ends at line 461.

## Boundaries

- Do NOT add an exit animation to the form, and do NOT keep the form mounted after submit.
- Do NOT animate the `busy` / submitting state — that is a separate concern and is out of
  scope for this plan.
- Do NOT touch the `error` branch or the signed-out branch at lines 96–112.
- Do NOT add confetti, sound, haptics, or any celebration effect.
- Do NOT add new dependencies.
- This repo runs a Next.js version with breaking changes from common training data; consult
  `node_modules/next/dist/docs/` before changing anything structural.
- If the code at line 116 does not match the excerpt above, STOP and report.

## Verification

- **Mechanical**:
  - `npm run lint` and `npm run build` succeed.
  - `npm run test:e2e` passes.
  - `grep -c "request-complete-panel" src/app/globals.css src/components/marketplace/request-panel.tsx`
    returns `2` and `1` respectively.
- **Feel check**: `npm run dev`, sign in, open any listing under `/bikes/…`, and submit a
  rental request.
  - The success panel **fades and settles in** over roughly a quarter second. It should feel
    like an acknowledgement, not a page change.
  - It must not bounce or overshoot — at 10% playback in the Animations panel, no frame shows
    the panel larger than its resting size.
  - Submit a second request from another listing: the animation plays again (fresh mount).
  - Check the panel is fully readable and correctly positioned at 390px width — the 8px lift
    must not cause a scroll jump on mobile.
  - Toggle `prefers-reduced-motion: reduce`: after plan `006`, the panel fades in with no lift
    or scale.
  - On a browser without `@starting-style` support, the panel simply appears instantly —
    degraded, never broken. Confirm nothing is stuck at `opacity: 0`.
- **Done when**: the success panel visibly arrives rather than snapping in, with no overshoot
  and no layout jump.
