"use client";

import { useEffect, useRef, type RefObject } from "react";

function labelFor(element: HTMLElement & { labels?: NodeListOf<HTMLLabelElement> | null }) {
  const label = element.labels?.[0]?.textContent?.trim();
  if (!label) return "";
  return label.split("\n")[0].trim().replace(/\s+/g, " ");
}

/**
 * When a browser blocks a submit it jumps to the first invalid field and shows
 * a tooltip that disappears on the next click, which reads as "the button does
 * nothing". This reports the same reason into the form's own error banner so it
 * stays on screen.
 *
 * `EnglishValidationMessages` in the root layout listens on `document`, so it
 * has already replaced `validationMessage` with English text by the time this
 * form-level listener runs.
 */
export function useBlockedSubmitMessage(
  formRef: RefObject<HTMLFormElement | null>,
  onBlocked: (message: string) => void,
) {
  const callbackRef = useRef(onBlocked);

  useEffect(() => {
    callbackRef.current = onBlocked;
  }, [onBlocked]);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    let reported = false;

    function handleInvalid(event: Event) {
      const element = event.target;
      if (
        !(element instanceof HTMLInputElement) &&
        !(element instanceof HTMLSelectElement) &&
        !(element instanceof HTMLTextAreaElement)
      ) {
        return;
      }
      // Every invalid field fires in the same task; only the first one (the
      // field the browser scrolls to) is worth reporting.
      if (reported) return;
      reported = true;
      queueMicrotask(() => {
        reported = false;
      });

      const label = labelFor(element);
      const reason = element.validationMessage || "Check this field.";
      callbackRef.current(label ? `${label}: ${reason}` : reason);
    }

    form.addEventListener("invalid", handleInvalid, true);
    return () => form.removeEventListener("invalid", handleInvalid, true);
  }, [formRef]);
}
