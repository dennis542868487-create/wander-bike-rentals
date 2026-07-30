import { AlertCircle } from "lucide-react";

/** Inline message for one field, fed by `useFieldErrors`. */
export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <span role="alert" className="field-error">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {message}
    </span>
  );
}
