"use client";

import { useEffect, useState, type RefObject } from "react";

type MeasurableElement = HTMLInputElement | HTMLTextAreaElement;

const skippedTypes = new Set(["file", "hidden", "radio", "checkbox", "submit"]);

function measurable(element: Element): element is MeasurableElement {
  if (
    !(element instanceof HTMLInputElement) &&
    !(element instanceof HTMLTextAreaElement)
  ) {
    return false;
  }
  const name = element.dataset.fieldName || element.name;
  if (!name) return false;
  return !(element instanceof HTMLInputElement && skippedTypes.has(element.type));
}

function sameLengths(a: Record<string, number>, b: Record<string, number>) {
  const keys = Object.keys(b);
  if (keys.length !== Object.keys(a).length) return false;
  return keys.every((key) => a[key] === b[key]);
}

/**
 * Current character count of every text field in the form, keyed by name.
 *
 * Feeds `FieldHint` so a length rule is visible while the person types instead
 * of only after the server rejects the submit. Reading from the DOM keeps every
 * field uncontrolled, so no input needs its own `useState`.
 */
export function useFieldLengths(formRef: RefObject<HTMLFormElement | null>) {
  const [lengths, setLengths] = useState<Record<string, number>>({});

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    function read() {
      const currentForm = formRef.current;
      if (!currentForm) return;
      const next: Record<string, number> = {};
      currentForm
        .querySelectorAll("input[name], input[data-field-name], textarea[name]")
        .forEach((element) => {
          if (!measurable(element)) return;
          const key = element.dataset.fieldName || element.name;
          next[key] = element.value.trim().length;
        });
      setLengths((current) => (sameLengths(current, next) ? current : next));
    }

    read();
    form.addEventListener("input", read);
    form.addEventListener("change", read);
    form.addEventListener("field-revalidate", read);
    return () => {
      form.removeEventListener("input", read);
      form.removeEventListener("change", read);
      form.removeEventListener("field-revalidate", read);
    };
  }, [formRef]);

  return lengths;
}
