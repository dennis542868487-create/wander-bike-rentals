export type HintRule = {
  /** Current length. Omit for a static rule with no live counter. */
  length?: number;
  min?: number;
  max?: number;
  optional?: boolean;
  unit?: string;
};

/**
 * The sentence a field shows to state its rule, and whether it should read as a
 * warning. Pure so the exact wording a person reads is unit-testable; `FieldHint`
 * only renders what this returns.
 */
export function hintText({
  length,
  min,
  max,
  optional,
  unit = "characters",
}: HintRule): { text: string; short: boolean } {
  const typed = length ?? 0;
  const counting = length !== undefined;
  const short = counting && min !== undefined && typed > 0 && typed < min;
  const empty = counting && typed === 0;

  let rule: string;
  if (short) {
    rule = `At least ${min} ${unit} needed · ${typed} so far`;
  } else if (counting && !empty && max !== undefined) {
    rule = `${typed} / ${max} ${unit}`;
  } else if (min !== undefined && max !== undefined) {
    rule = `${min}–${max} ${unit}`;
  } else if (min !== undefined) {
    rule = `At least ${min} ${unit}`;
  } else if (max !== undefined) {
    rule = `Up to ${max} ${unit}`;
  } else {
    rule = "";
  }

  const prefix = optional && (empty || !counting) ? "Optional · " : "";
  return { text: `${prefix}${rule}`.trim(), short };
}
