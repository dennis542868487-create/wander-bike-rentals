# Animation improvement plans — Wander Bike Rentals

Produced by the `improve-animations` skill against commit `0ef34a6`, working tree clean.

**Stack:** Next.js 16.2.11 · React 19.2.8 · Tailwind CSS v4.3.3 · no animation library — all
motion is hand-written CSS in `src/app/globals.css` plus Tailwind utilities in components.

Every plan is self-contained: exact file paths, current code verbatim, exact target values, and
a feel check. An executor with no context should be able to run any one of them alone.

## Plans

| # | Title | Severity | Category | Files | Status |
| --- | --- | --- | --- | --- | --- |
| [001](001-motion-tokens.md) | Introduce motion tokens, replace hand-typed curves | LOW (foundational) | Cohesion & tokens | 1 | DONE |
| [002](002-unblock-browse-results.md) | Stop the reveal cascade delaying browse results | **HIGH** | Purpose & frequency | 3 | DONE |
| [003](003-mobile-menu-compositor-motion.md) | Stop the mobile nav animating layout | **HIGH** | Performance | 1 | DONE |
| [004](004-fab-entrance-physicality.md) | Stop the chat FAB appearing out of nothing | **HIGH** | Physicality & origin | 1 | DONE |
| [005](005-button-press-feedback.md) | Give every button a press state | **HIGH** | Physicality & origin | 1 | DONE |
| [006](006-scope-reduced-motion.md) | Stop reduced-motion deleting all feedback | MEDIUM | Accessibility | 1 | DONE |
| [007](007-gate-hover-motion-to-pointer-devices.md) | Gate hover movement behind a real pointer | MEDIUM | Accessibility | 1 | DONE |
| [008](008-date-popover-entrance.md) | Give the date popover an entrance from its field | MEDIUM | Physicality & origin | 1 | DONE |
| [009](009-remove-permanent-will-change.md) | Remove the permanent `will-change` | MEDIUM | Performance | 1 | DONE |
| [010](010-stop-infinite-fab-pulse.md) | Stop the chat FAB pulsing forever | MEDIUM | Purpose & frequency | 1 | DONE |
| [011](011-restore-guide-hero-motion.md) | Restore guide-page hero motion (58 dead classes) | MEDIUM | Cohesion | 5 | DONE |
| [012](012-mobile-accordion-transition.md) | Animate the mobile nav accordion | LOW | Interruptibility | 1 | DONE |
| [013](013-request-sent-transition.md) | Give "Request sent" an entrance | LOW | Missed opportunity | 2 | DONE |

## Recommended execution order

Run **001 first**. Every other plan references `var(--ease-ui)` / `var(--dur-*)`; each one
also states its literal fallback, so they are not strictly blocked — but running 001 first
avoids thirteen chances to hand-type a curve.

1. **001** — motion tokens (foundation)
2. **002, 003, 004, 005** — the four HIGH findings, in any order
3. **006, 007** — the accessibility pair; run **006 before 007** (007's new media block must sit
   above the reduced-motion block that 006 rewrites)
4. **008, 009, 010, 011** — independent, any order
5. **012, 013** — polish, any order

## Dependencies and collision notes

| Relationship | Detail |
| --- | --- |
| 001 → all | Defines `--ease-ui`, `--ease-ui-inout`, `--ease-drawer`, `--dur-press/popover/dropdown/panel/page/reveal`. Every plan states its literal fallback if 001 is skipped. |
| 001 ⇄ 004 | 001 deliberately leaves the overshoot curve at `globals.css:1211` alone; 004 removes it. Do not "finish the job" in 001. |
| 001 ⇄ 002 | 001 swaps curve literals only, never durations; 002 owns the reveal durations and delays. Running 001 first changes what 002's excerpts look like — 002 documents both forms. |
| 002 ⇄ 009 | Both edit `.reveal-ready [data-reveal]` (`globals.css:951`). 002 changes durations, 009 deletes the `will-change` line. Non-overlapping lines, either order. |
| 003 → 012 | 012's accordion lives inside 003's panel. Either order works; running 003 first makes 012's feel check more meaningful. |
| 003 ⇄ 006 | Once 003 uses transform + opacity, 006's `transition-property` restriction is what strips the slide under reduced motion. Verify 003's reduced-motion check only after 006 has run. |
| 005 ⇄ 007 | 005 owns `:active`, 007 owns `:hover`. Both touch the same button rules — do not let either edit the other's selector. |
| 006 → 007 | Ordering matters: 007 inserts a `@media (hover: hover)` block that must sit **before** the reduced-motion block so reduced-motion still wins. |
| 008 ⇄ 013 | Both introduce `@starting-style`. Whichever runs second should match the first's formatting. |

## Behavioural changes a human should sign off on

- **003** converts the mobile menu from *pushing* the page down to *overlaying* it. This is
  required to get it off the layout thread, and it is the point of the plan — but it is a
  visible product decision, not a pure refactor.
- **011** deletes `hero-img-anim` / `hero-grad-anim` rather than implementing them, because
  those sit on the LCP hero image. The guide hero photos will never fade in. That is intended.
- **010** changes the chat FAB ring from pulsing forever to pulsing three times.

## Not reported (checked and judged correct)

Recorded so a future audit does not re-litigate them:

- Hover and colour transitions use plain `ease` at 130–180ms — AUDIT's decision order says
  `ease` is correct for hover/colour.
- `.page-transition` at 280ms is inside the UI budget.
- `scroll-behavior: auto` is correctly restored under reduced motion.
- `animate-spin` (`auth-callback.tsx:40`) and `animate-pulse` (`auth-form.tsx:78`) are
  appropriate for loading states.
- `wbr-teaser-in` (`globals.css:1247`) already animates from `translateX(12px) scale(0.96)` —
  correct physicality, left alone.
- `transform-origin: center` was not found on any trigger-anchored element, and modals are
  exempt from that rule anyway.

## Status legend

`TODO` → not started · `IN PROGRESS` → executor running · `DONE` → applied and feel-checked ·
`SKIPPED` → deliberately declined (record why in the plan file)
