# 009 — Remove the permanent `will-change` on every revealed section

- **Status**: DONE
- **Commit**: 0ef34a6
- **Severity**: MEDIUM
- **Category**: Performance
- **Estimated scope**: 1 file (`src/app/globals.css`), 1 line deleted

## Problem

```css
/* src/app/globals.css:951 — current */
.reveal-ready [data-reveal] {
  opacity: 0;
  transform: translateY(24px);
  transition:
    opacity 700ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 700ms cubic-bezier(0.22, 1, 0.36, 1);
  will-change: opacity, transform;
}
```

`will-change` is a hint that tells the browser to promote an element to its own compositor
layer **in advance** because it is about to animate. It is meant to be applied shortly before
an animation and removed afterwards.

Here it is applied to `[data-reveal]`, which `src/components/reveal.tsx:17` sets on **every**
`main > section:not(.hero)` on **every** route, and it is never removed — not after the reveal
finishes, not on navigation. So for the entire session the browser holds a separate composited
layer for every content section of every page the visitor has scrolled through, each consuming
GPU memory for an animation that already ran once and will never run again.

On the low-end phones this site's visitors actually use, this is a straight memory and
compositing cost with no benefit. MDN's guidance is explicit that `will-change` should not be
applied to large numbers of elements or left on permanently — doing so is a pessimisation, not
an optimisation.

> Note: if plan `002` has already been applied, the two `700ms` values above read
> `var(--dur-reveal)` and the curve reads `var(--ease-ui)`. Only the `will-change` line
> matters for this plan; ignore the rest.

## Target

```css
/* target — src/app/globals.css:951 */
.reveal-ready [data-reveal] {
  opacity: 0;
  transform: translateY(24px);
  transition:
    opacity var(--dur-reveal) var(--ease-ui),
    transform var(--dur-reveal) var(--ease-ui);
}
```

The line is simply deleted. No JS-side just-in-time `will-change` management is added: opacity
and transform transitions are already composited by every current browser without the hint,
and adding add/remove logic to `src/components/reveal.tsx` would buy nothing measurable while
adding a `transitionend` listener per section.

## Repo conventions to follow

- `will-change` appears exactly once in the codebase. There is no convention to preserve — the
  goal is for it to appear zero times.
- The cascade rule below it (`src/app/globals.css:965`) already transitions opacity and
  transform **without** `will-change` and animates fine. That rule is the exemplar: this plan
  makes the parent match its own child.

## Steps

1. `src/app/globals.css:957` — delete the line `will-change: opacity, transform;`, including
   its trailing newline. Leave every other declaration in the rule untouched.

## Boundaries

- Do NOT touch `src/components/reveal.tsx`.
- Do NOT change the `opacity`, `transform`, or `transition` declarations in this rule — plan
  `002` owns their timing.
- Do NOT add `will-change` anywhere else as "compensation".
- Do NOT add new dependencies.
- If line 957 does not read `will-change: opacity, transform;`, STOP and report.

## Verification

- **Mechanical**:
  - `npm run lint` and `npm run build` succeed.
  - `grep -c "will-change" src/app/globals.css` returns `0`.
- **Feel check**: `npm run dev`, open `/` and `/how-it-works`.
  - Scroll through the whole page: sections still fade and rise exactly as before. This change
    must be visually undetectable — if anything looks different, something else was edited.
  - Open DevTools → Rendering → enable **Layer borders**, then scroll the home page. Before the
    change, every content section is outlined as its own layer; after, only genuinely animating
    or promoted elements are. Fewer persistent layers is the result you want.
  - In DevTools → Performance, record a scroll through the home page on a 4× CPU throttle and
    confirm frame rate is unchanged or better — never worse.
- **Done when**: `grep -c "will-change" src/app/globals.css` is `0`, reveals look identical,
  and the layer count while scrolling has dropped.
