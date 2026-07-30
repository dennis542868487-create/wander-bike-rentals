# 001 — Introduce motion tokens and replace hand-typed easing curves

- **Status**: DONE
- **Commit**: 0ef34a6
- **Severity**: LOW (but foundational — run this first)
- **Category**: Cohesion & tokens
- **Estimated scope**: 1 file (`src/app/globals.css`), ~12 small edits

## Problem

The project has a complete colour token set in `:root` but **zero motion tokens**. Every
curve is hand-typed, and three near-identical curves are in play across 10 occurrences:

| Curve | Occurrences | Lines |
| --- | --- | --- |
| `cubic-bezier(0.22, 1, 0.36, 1)` | 8 | 912, 955, 956, 969, 970, 1021, 1129, 1219 |
| `cubic-bezier(0.22, 0.61, 0.36, 1)` | 1 | 412 |
| `cubic-bezier(0.34, 1.56, 0.64, 1)` | 1 | 1211 |

Durations are equally ad hoc: 130ms, 150ms, 160ms, 180ms, 220ms, 280ms, 560ms, 600ms, 700ms.

```css
/* src/app/globals.css:3 — current, colour tokens only */
:root {
  --background: #f0fdf9;
  --foreground: #0f172a;
  --brand: #0f766e;
  /* … no motion tokens … */
  --muted: #64748b;
}
```

```css
/* src/app/globals.css:411 — current */
.page-transition {
  animation: page-enter 280ms cubic-bezier(0.22, 0.61, 0.36, 1) both;
}
```

```css
/* src/app/globals.css:911 — current */
.motion-rise {
  animation: motion-rise 560ms cubic-bezier(0.22, 1, 0.36, 1) both;
}
```

Why it matters: every component's rhythm is a few milliseconds off from every other one.
Nothing is individually wrong, but the site does not read as one system — and every future
animation fix has to re-type a curve from memory.

## Target

Add a motion block to the existing `:root` and replace the two easing literals that are
already correct-ish with tokens.

```css
/* target — src/app/globals.css, inside the existing :root block, after --muted */
  /* Motion. --ease-ui is the strong ease-out used for all entering/exiting UI. */
  --ease-ui: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-ui-inout: cubic-bezier(0.77, 0, 0.175, 1);
  --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
  --dur-press: 160ms;
  --dur-popover: 180ms;
  --dur-dropdown: 220ms;
  --dur-panel: 260ms;
  --dur-page: 280ms;
  --dur-reveal: 400ms;
```

**Naming is deliberate — do NOT name these `--ease-out` / `--duration-*`.** Tailwind v4
emits its own theme variables (including `--ease-out`) into `:root`, and the `ease-out`
utility resolves through `var(--ease-out)`. Redefining that name would silently retarget
every Tailwind easing utility site-wide. The `--ease-ui` / `--dur-*` namespace cannot collide.

Verified at this commit: no `ease-linear` / `ease-in` / `ease-out` / `ease-in-out` Tailwind
utility appears in any `.tsx` file, so nothing depends on the framework defaults today —
the namespacing is future-proofing, not a workaround.

## Repo conventions to follow

- All tokens live in the single `:root` block at `src/app/globals.css:3`. Add motion tokens
  there, at the end, after `--muted: #64748b;`.
- The `@theme inline` block (`src/app/globals.css:22`) is only for values Tailwind must turn
  into utilities. **Do not add the motion tokens there** — they are consumed by hand-written
  CSS via `var()`, not by utility classes.
- Exemplar of the pattern already in use: `src/app/globals.css:221` uses
  `border-color: var(--teal);` — plain `var()` reference to a `:root` token. Do the same.

## Steps

1. In `src/app/globals.css`, inside the `:root` block that begins at line 3, after the line
   `--muted: #64748b;`, insert the motion block from **Target** above (comment included).

2. Replace the curve at line 412 (`.page-transition`):
   ```css
   /* from */
   animation: page-enter 280ms cubic-bezier(0.22, 0.61, 0.36, 1) both;
   /* to */
   animation: page-enter var(--dur-page) var(--ease-ui) both;
   ```

3. Replace the curve at line 912 (`.motion-rise`). Keep the 560ms duration — this is a
   marketing hero entrance and is allowed to be longer than the 300ms UI budget:
   ```css
   /* from */
   animation: motion-rise 560ms cubic-bezier(0.22, 1, 0.36, 1) both;
   /* to */
   animation: motion-rise 560ms var(--ease-ui) both;
   ```

4. Replace the remaining six `cubic-bezier(0.22, 1, 0.36, 1)` literals with `var(--ease-ui)`,
   leaving every duration exactly as it is. They are at lines 955, 956 (`.reveal-ready
   [data-reveal]`), 969, 970 (`[data-reveal-cascade] > *`), 1021 (`.site-header-anim`),
   1129 (`.wbr-fab`), 1219 (`.wbr-teaser`). A global find-and-replace of the exact string
   `cubic-bezier(0.22, 1, 0.36, 1)` → `var(--ease-ui)` is correct here.

5. **Leave line 1211 alone.** `cubic-bezier(0.34, 1.56, 0.64, 1)` on `wbr-pop-in` is an
   overshoot curve that plan `004` removes entirely. Touching it here creates a conflict.

## Boundaries

- Do NOT touch any `.tsx` file.
- Do NOT change any duration value in this plan. Durations are retimed by plans 002 and 008;
  changing them here would make those plans fail to match.
- Do NOT add the tokens to `@theme inline`.
- Do NOT add new dependencies.
- If a line number does not contain the code quoted above (drift since commit `0ef34a6`),
  STOP and report rather than guessing which rule was meant.

## Verification

- **Mechanical**:
  - `npm run lint` — passes with no new warnings.
  - `npm run build` — succeeds.
  - `grep -c "cubic-bezier(0.22" src/app/globals.css` — must output `0`.
  - `grep -c "cubic-bezier" src/app/globals.css` — must output `4`: the three token
    definitions in `:root`, plus the overshoot curve at line 1211 owned by plan 004.
- **Feel check**: `npm run dev`, then load `/` and `/account`.
  - The hero blocks still rise on load and the dashboard route change still fades — i.e. the
    swap is visually near-identical, only very slightly snappier at the start.
  - Nothing became instant or janky. If any animation disappeared, a `var()` name is
    misspelled — a bad custom property makes the whole shorthand invalid.
- **Done when**: both greps return the numbers above, `npm run build` succeeds, and the home
  page and dashboard animations still play.
