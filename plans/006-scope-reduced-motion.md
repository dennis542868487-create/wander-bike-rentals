# 006 — Stop reduced-motion from deleting all feedback

- **Status**: DONE
- **Commit**: 0ef34a6
- **Severity**: MEDIUM
- **Category**: Accessibility
- **Estimated scope**: 1 file (`src/app/globals.css`), 1 rule rewritten

## Problem

```css
/* src/app/globals.css:1260 — current */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
```

This is the widely-copied "nuke everything" reset, and it overshoots. `transition-duration:
0.01ms !important` on `*` removes **every** transition on the site, including the ones that
carry no movement at all and exist purely to make state legible:

- button background/border colour on hover and press (`src/app/globals.css:84–88`)
- input border and focus ring (`src/app/globals.css:197–199`, `218–223`)
- invalid-field red border (`src/app/globals.css:444–455`)
- calendar day hover (`src/app/globals.css:340–343`)

`prefers-reduced-motion` is a **vestibular** accommodation: users who set it are asking not to
be moved, not to be denied feedback. AUDIT §6 states it directly — reduced motion means fewer
and gentler animations, *not zero*; keep transitions that aid comprehension, remove position
changes. Today a reduced-motion visitor on this site gets a UI where nothing ever
acknowledges anything, which is measurably harder to use than the default experience.

## Target

Keep killing keyframe animations and movement. Keep colour, opacity, shadow and filter
transitions at a short, calm duration.

```css
/* target — src/app/globals.css:1260, replacing the whole block */
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto !important;
  }

  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-delay: 0ms !important;
    animation-iteration-count: 1 !important;
    transition-delay: 0ms !important;
  }

  /*
   * Movement is dropped, but colour and opacity feedback is kept: this setting
   * is a vestibular accommodation, not a request for a UI that never responds.
   * Restricting transition-property is what removes transform/translate motion.
   */
  *,
  *::before,
  *::after {
    transition-property:
      opacity, background-color, border-color, color, box-shadow, filter,
      outline-color !important;
    transition-duration: 150ms !important;
  }
}
```

Why this shape:

- `transition-property` restricted to non-spatial properties is what actually removes motion.
  Anything transitioning `transform` now applies its transform instantly — no travel, no
  intermediate frames — while colour still eases.
- `scroll-behavior` moves to `html`, the only element it meaningfully applies to (it is set on
  `html` at `src/app/globals.css:33`). Applying it to `*` was harmless but meaningless.
- `animation-*` overrides are kept as-is: keyframe animations on this site are all entrances
  and the pulse, none of which should play.
- `150ms` is short enough to read as immediate and long enough to be perceived as feedback.

## Repo conventions to follow

- This block is the last rule in `src/app/globals.css`. Keep it there.
- Two other reduced-motion gates already exist and must keep working:
  `src/app/globals.css:427` (`.page-transition { animation: none; }`) and the
  `@media (prefers-reduced-motion: no-preference)` wrappers at lines 934 and 1209. This plan
  does not touch them — they are the exemplar for how the codebase gates motion, and they
  already do the right thing.
- `src/components/reveal.tsx:10` bails out entirely under reduced motion, so the scroll-reveal
  system is already correctly excluded and needs no handling here.

## Steps

1. `src/app/globals.css` — replace the entire block at lines 1260–1269 with the **Target**
   block above, comment included.

2. Do not add or remove any other rule in the file.

## Boundaries

- Do NOT touch any `.tsx` file.
- Do NOT modify the reduced-motion gates at lines 427, 934, or 1209.
- Do NOT remove the `animation-*` overrides — keyframe animations must still be suppressed.
- Do NOT add `transform` or `translate` to the allowed `transition-property` list; that would
  reintroduce exactly the movement this setting exists to remove.
- Do NOT add new dependencies.
- If the block at lines 1260–1269 does not match the excerpt above, STOP and report.

## Verification

- **Mechanical**:
  - `npm run lint` and `npm run build` succeed.
  - `grep -n "transition-property" src/app/globals.css` returns exactly one hit, inside the
    reduced-motion block.
- **Feel check**: `npm run dev`, then DevTools → Rendering → *Emulate CSS media feature
  prefers-reduced-motion: reduce*. With that on:
  - Hover a `.btn-primary` on `/`: the background colour **still** eases to the darker shade,
    but the button does **not** lift.
  - Press it (touch simulation): the colour changes; after plan `005` the scale does **not**
    apply as visible motion.
  - Focus an input on `/booking`: the teal border and focus ring **still** fade in.
  - Submit a form with an empty required field: the red invalid border **still** transitions.
  - Scroll the home page: all sections are fully visible with no fade-and-rise, and no content
    is stuck at `opacity: 0`.
  - The chat FAB is present with **no** entrance animation and **no** pulsing ring.
  - Click an in-page anchor link: the page jumps instantly rather than smooth-scrolling.
  - Now turn the emulation **off** and confirm the normal experience is unchanged — this block
    must have no effect at all without the media query.
- **Done when**: under reduced motion nothing on the site translates, scales, or scroll-eases,
  while hover/focus/invalid colour feedback all still visibly transition.
