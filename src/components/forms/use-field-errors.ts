"use client";

import { useEffect, useState, type RefObject } from "react";
import { englishValidationMessage } from "@/components/forms/english-validation";

type ValidatableElement =
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement;

/**
 * `DateField` submits through a hidden input, so its visible control carries
 * `data-field-name` instead of `name`. Everything else is keyed by `name`.
 */
function fieldKey(element: ValidatableElement) {
  return element.dataset.fieldName || element.name;
}

function validatable(target: EventTarget | null): target is ValidatableElement {
  return (
    (target instanceof HTMLInputElement ||
      target instanceof HTMLSelectElement ||
      target instanceof HTMLTextAreaElement) &&
    target.willValidate &&
    fieldKey(target) !== ""
  );
}

/**
 * Reports each field's problem as soon as the person leaves it, instead of
 * holding every rule back until they press submit. A field stays quiet until it
 * has been visited once, so an untouched form is not covered in red, and after
 * that it re-checks on every keystroke so the message clears the moment the
 * value becomes valid.
 *
 * Returns messages keyed by field name; render them with `FieldError`.
 */
export function useFieldErrors(formRef: RefObject<HTMLFormElement | null>) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const visited = new Set<string>();

    function update(element: ValidatableElement) {
      const key = fieldKey(element);
      const message = element.validity.valid
        ? ""
        : englishValidationMessage(element);
      element.setAttribute("aria-invalid", message ? "true" : "false");
      setErrors((current) =>
        current[key] === message ? current : { ...current, [key]: message },
      );
    }

    function onLeave(event: Event) {
      const element = event.target;
      if (!validatable(element)) return;
      visited.add(fieldKey(element));
      update(element);
    }

    function onEdit(event: Event) {
      const element = event.target;
      if (!validatable(element)) return;
      // Radio and checkbox groups have no meaningful "still typing" state.
      const immediate =
        element instanceof HTMLSelectElement ||
        (element instanceof HTMLInputElement &&
          (element.type === "checkbox" || element.type === "radio"));
      if (!immediate && !visited.has(fieldKey(element))) return;
      update(element);
    }

    function onInvalid(event: Event) {
      const element = event.target;
      if (!validatable(element)) return;
      visited.add(fieldKey(element));
      // The document-level English handler runs first, so `validationMessage`
      // is already in English by the time this reads it.
      update(element);
    }

    form.addEventListener("focusout", onLeave);
    form.addEventListener("input", onEdit);
    form.addEventListener("change", onEdit);
    form.addEventListener("field-revalidate", onEdit);
    form.addEventListener("invalid", onInvalid, true);

    return () => {
      form.removeEventListener("focusout", onLeave);
      form.removeEventListener("input", onEdit);
      form.removeEventListener("change", onEdit);
      form.removeEventListener("field-revalidate", onEdit);
      form.removeEventListener("invalid", onInvalid, true);
    };
  }, [formRef]);

  return errors;
}
