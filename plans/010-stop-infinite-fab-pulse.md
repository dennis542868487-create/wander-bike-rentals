# 010 — Stop the chat FAB pulsing forever

- **Status**: DONE
- **Commit**: 0ef34a6
- **Severity**: MEDIUM
- **Category**: Purpose & frequency / Cohesion
- **Estimated scope**: 1 file (`src/app/globals.css`), 1 edit

## Problem

```css
/* src/app/globals.css:1214 — current */
  .wbr-fab-ring {
    animation: wbr-pulse 2.6s ease-out infinite;
  }
```

```css
/* src/app/globals.css:1234 — current */
  @keyframes wbr-pulse {
    0% {
      opacity: 0.6;
      transform: scale(1);
    }

    70%,
    100% {
      opacity: 0;
      transform: scale(1.7);
    }
  }
```

The ring behind the support button expands to 1.7× and fades, **every 2.6 seconds, forever,
on every page, for the entire visit**. Two costs:

1. **Attention.** AUDIT §1: motion must justify itself against how often it is seen. A visitor
   reading the FAQ or filling in a booking form sees this roughly 23 times per minute in their
   peripheral vision. Its only message — "support exists" — is fully delivered the first time.
   After that it is a permanent distraction competing with the content the visitor came for.
2. **Power.** An infinite compositor animation prevents the browser from ever settling into an
   idle state. On a phone that is continuous battery drain for the whole session, on a page
   that is otherwise completely static.

## Target

Pulse a few times to draw the eye on arrival, then stop.

```css
/* target — src/app/globals.css:1214 */
  .wbr-fab-ring {
    animation: wbr-pulse 2.6s ease-out 3;
  }
```

`3` iterations ≈ 7.8 seconds of attention-drawing after page load, then permanent stillness.
The keyframes are already correct — `scale(1)` → `scale(1.7)` with a fade is a legitimate
attention pulse, and `ease-out` is right for expanding-outward motion (AUDIT §2). Nothing about
the ring's appearance changes; only its persistence.

The element ends at `opacity: 0` (the `100%` keyframe), so when the animation stops the ring is
invisible with no `forwards` fill needed — `.wbr-fab-ring` is already declared
`opacity: 0` at `src/app/globals.css:1155`.

## Repo conventions to follow

- This rule lives inside the `@media (prefers-reduced-motion: no-preference)` block opening at
  `src/app/globals.css:1209`. **Keep it there** — the gating is already correct.
- Iteration counts are otherwise unused in this file; `3` is written bare, matching the
  `animation` shorthand style already in use on the surrounding rules.

## Steps

1. `src/app/globals.css:1215` — change `animation: wbr-pulse 2.6s ease-out infinite;` to
   `animation: wbr-pulse 2.6s ease-out 3;`.

2. Do not modify the `@keyframes wbr-pulse` block at lines 1234–1245.

## Boundaries

- Do NOT touch any `.tsx` file. In particular, do not add JS to re-trigger the pulse on idle or
  on scroll — that reintroduces the distraction this plan removes.
- Do NOT remove `.wbr-fab-ring` or the keyframes; the pulse is wanted, just not forever.
- Do NOT change `wbr-pop-in` (plan `004` owns it) or `wbr-teaser-in`.
- Do NOT move the rule out of the `prefers-reduced-motion: no-preference` wrapper.
- Do NOT add new dependencies.
- If line 1215 does not match the excerpt above, STOP and report.

## Verification

- **Mechanical**:
  - `npm run lint` and `npm run build` succeed.
  - `grep -c "infinite" src/app/globals.css` returns `0`.
- **Feel check**: `npm run dev`, load `/` and leave the tab focused without interacting.
  - The ring pulses three times over roughly the first 8 seconds, then stops completely.
  - Wait a further 30 seconds: nothing in the bottom-right corner moves again.
  - Navigate to `/faq` via a client-side link: because the widget is not remounted, the pulse
    should **not** restart. Confirm this — if it does restart on every route change, report it
    rather than patching, since that is a component-lifecycle question outside this plan.
  - Hard-reload: the three pulses play again from the start. That is correct.
  - Open DevTools → Performance and record 20 seconds of an idle page **after** the pulses have
    finished: there should be no recurring compositing work.
  - Toggle `prefers-reduced-motion: reduce`: the ring never animates at all.
- **Done when**: the corner is completely still ~10 seconds after load, and an idle recording
  shows no periodic frames.
