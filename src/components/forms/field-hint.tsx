import { hintText, type HintRule } from "@/components/forms/hint-text";

/**
 * States a field's rule up front, and counts toward it while the person types.
 *
 * Every field with a length, range, or format rule should carry one. Rules that
 * only exist server-side are invisible until a submit fails, which is what
 * makes a rejected form feel arbitrary. The wording lives in `hintText`.
 */
export function FieldHint({
  children,
  ...rule
}: HintRule & {
  /** Extra guidance shown after the rule, e.g. "Separate items with commas." */
  children?: React.ReactNode;
}) {
  const { text, short } = hintText(rule);
  if (!text && !children) return null;

  return (
    <span
      className={`mt-1.5 block text-xs font-normal ${
        short ? "text-amber-700" : "text-slate-500"
      }`}
    >
      {text}
      {text && children ? " · " : null}
      {children}
    </span>
  );
}
