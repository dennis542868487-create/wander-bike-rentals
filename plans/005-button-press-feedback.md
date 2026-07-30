# 005 — Give every button a press state

- **Status**: DONE
- **Commit**: 0ef34a6
- **Severity**: HIGH
- **Category**: Physicality & origin / Purpose & frequency
- **Estimated scope**: 1 file (`src/app/globals.css`), ~5 edits

## Problem

Every button class in the design system has a **hover** state and **no press state**:

```css
/* src/app/globals.css:73 — current */
.btn-primary,
.btn-secondary,
.btn-quiet {
  /* …layout… */
  transition:
    background-color 160ms ease,
    border-color 160ms ease,
    color 160ms ease,
    transform 160ms ease;
}
```

```css
/* src/app/globals.css:98 — current */
.btn-primary:hover {
  border-color: #1e293b;
  background: #1e293b;
  transform: translateY(-1px);
  box-shadow: 0 14px 30px rgba(7, 59, 92, 0.17);
}
```

The only `:active` rule in the entire stylesheet is on the chat widget:

```css
/* src/app/globals.css:1140 — current, the ONLY press feedback on the site */
.wbr-fab:active {
  transform: scale(0.96);
}
```

This is a bike-rental site whose visitors are overwhelmingly on phones. **Phones have no
hover.** So on the primary device, tapping "Book Now", "Call Now", or any form submit produces
*zero* visual acknowledgement until the network responds — while the support chat bubble in
the corner responds instantly to touch. The one control that doesn't need to feel good is the
only one that does.

AUDIT §3: pressable elements with no press feedback are a finding; the prescribed treatment is
`transform: scale(0.97)` on `:active` with a 100–160ms ease-out transition.

## Target

Add one press rule covering every button class, and align the `transform` leg of each
transition with the press timing.

```css
/* target — src/app/globals.css, inserted immediately after the :disabled block
   that ends at line 139 */

/*
 * Press feedback. Most visitors are on touch devices where :hover never fires,
 * so :active is the only tactile acknowledgement a tap ever gets.
 */
.btn-primary:not(:disabled):active,
.btn-secondary:not(:disabled):active,
.btn-quiet:not(:disabled):active,
.btn-brand:not(:disabled):active,
.btn-outline-light:not(:disabled):active,
.pricing-glass-button:not(:disabled):active,
.hero-glass-button:not(:disabled):active {
  transform: scale(0.97);
}
```

`:not(:disabled)` is required so the rule cannot resurrect a press on a disabled button
regardless of where it lands in the cascade relative to the `:disabled` block at line 133.
It is harmless on `<a>` elements, which cannot be disabled.

`scale(0.97)` is AUDIT's exact value and deliberately replaces the hover `translateY(-1px)`
while held — the button drops out of its lift and shrinks, which is what a press looks like.

## Repo conventions to follow

- Button classes are declared as one grouped selector list with a shared `transition`
  shorthand — see `src/app/globals.css:73`. Follow that grouping style.
- The existing exemplar for press feedback is `src/app/globals.css:1140` (`.wbr-fab:active`).
  This plan generalises exactly that treatment.
- `--dur-press` (160ms) and `--ease-ui` come from plan `001`. If plan 001 has not been
  applied, substitute `160ms` and `cubic-bezier(0.23, 1, 0.32, 1)` literally everywhere they
  appear below.

## Steps

1. `src/app/globals.css:88` — in the `.btn-primary, .btn-secondary, .btn-quiet` transition
   list, change the last leg from `transform 160ms ease` to
   `transform var(--dur-press) var(--ease-ui)`. Leave the three colour legs as `160ms ease`
   (AUDIT: colour changes correctly use plain `ease`).

2. `src/app/globals.css:155` — in the `.btn-brand` transition list, change
   `transform 160ms ease` to `transform var(--dur-press) var(--ease-ui)`. Leave the `filter`
   and `box-shadow` legs unchanged.

3. `src/app/globals.css:678` — in the `.pricing-glass-button, .hero-glass-button` transition
   list, change `transform 180ms ease` to `transform var(--dur-press) var(--ease-ui)`. Leave
   the `background-color` and `box-shadow` legs at `180ms ease`.

4. `src/app/globals.css:165` — `.btn-outline-light` has **no** `transition` declaration at
   all. Add one as the last declaration in the rule, before the closing brace:
   ```css
     transition:
       background-color var(--dur-press) ease,
       transform var(--dur-press) var(--ease-ui);
   ```

5. Insert the press-feedback block from **Target** immediately after the closing brace of the
   `.btn-primary:disabled, .btn-secondary:disabled, .btn-quiet:disabled` rule, which ends at
   line 139.

## Boundaries

- Do NOT touch any `.tsx` file — every button already uses these classes.
- Do NOT change any `:hover` rule. Plan `007` owns hover behaviour; changing both here would
  make that plan fail to match.
- Do NOT add press feedback to `.wbr-fab` — it already has it at line 1140.
- Do NOT change the `:disabled` block at lines 133–139.
- Do NOT change border-radius, padding, min-height, or any other layout property.
- Do NOT add new dependencies.
- If the code at any cited line does not match the excerpts above, STOP and report.

## Verification

- **Mechanical**:
  - `npm run lint` and `npm run build` succeed.
  - `grep -c ":active" src/app/globals.css` returns `8` (the seven new selectors plus the
    pre-existing `.wbr-fab:active`).
- **Feel check**: `npm run dev`, DevTools device toolbar at 390×844 with **touch simulation
  on** (this matters — mouse hover masks the bug).
  - Press and hold the primary CTA on `/`: it visibly shrinks slightly and holds while your
    finger is down, then springs back on release. The effect should be felt more than seen.
  - Do the same on `/pricing` (glass buttons) and `/faq` (`.hero-glass-button`) — all button
    variants respond identically. Inconsistency here is the whole point of the fix.
  - Find a disabled button (submit a form with empty required fields, or inspect any
    `disabled` button): pressing it must produce **no** scale change.
  - With a mouse: hover a `.btn-primary` (it lifts 1px), then press without moving — it should
    drop and shrink, not fight the lift or jitter.
  - In DevTools → Animations at 10% playback, the press settles in ~160ms with no bounce.
  - Toggle `prefers-reduced-motion: reduce`: after plan `006` the scale is dropped but the
    background-colour change on press/hover remains.
- **Done when**: every button variant visibly acknowledges a touch press, disabled buttons do
  not, and the timing matches `.wbr-fab`.
