"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { englishValidationMessage } from "@/components/forms/english-validation";

type ValidatableElement =
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement;

export type LiveFormValidator = (
  form: HTMLFormElement,
  changedFieldName?: string,
) => Record<string, string | null | undefined>;

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

function formField(form: HTMLFormElement, key: string) {
  const visibleField = Array.from(
    form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      "[data-field-name]",
    ),
  ).find((element) => validatable(element) && fieldKey(element) === key);
  if (visibleField) return visibleField;

  const named = form.elements.namedItem(key);
  if (named instanceof RadioNodeList) {
    return Array.from(named).find(validatable);
  }
  if (validatable(named)) return named;
  return undefined;
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
export function useFieldErrors(
  formRef: RefObject<HTMLFormElement | null>,
  validateForm?: LiveFormValidator,
) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const validatorRef = useRef(validateForm);

  useEffect(() => {
    const mountedForm = formRef.current;
    if (!mountedForm) return;
    const form: HTMLFormElement = mountedForm;
    const visited = new Set<string>();
    const customMessages = new Map<string, string>();
    const inlineMessages = new Map<string, string>();

    function applyCustomErrors(changedFieldName?: string) {
      const next = validatorRef.current?.(form, changedFieldName) ?? {};
      const nextMessages = new Map(
        Object.entries(next).filter(
          (entry): entry is [string, string] =>
            typeof entry[1] === "string" && entry[1].length > 0,
        ),
      );

      for (const [key, previousMessage] of customMessages) {
        if (nextMessages.has(key)) continue;
        const element = formField(form, key);
        if (
          element?.validity.customError &&
          element.validationMessage === previousMessage
        ) {
          element.setCustomValidity("");
        }
      }

      for (const [key, message] of nextMessages) {
        const element = formField(form, key);
        if (
          element &&
          (!element.validity.customError || element.validationMessage !== message)
        ) {
          element.setCustomValidity(message);
        }
      }

      customMessages.clear();
      nextMessages.forEach((message, key) => customMessages.set(key, message));
    }

    function update(element: ValidatableElement) {
      const key = fieldKey(element);
      const previousInlineMessage = inlineMessages.get(key);
      if (previousInlineMessage) {
        if (
          element.validity.customError &&
          element.validationMessage === previousInlineMessage
        ) {
          element.setCustomValidity("");
        }
        inlineMessages.delete(key);
        applyCustomErrors(key);
      }
      const alreadyCustom = element.validity.customError;
      const message = englishValidationMessage(element);
      if (message && !alreadyCustom && !element.validity.customError) {
        element.setCustomValidity(message);
        inlineMessages.set(key, message);
      }
      element.setAttribute("aria-invalid", message ? "true" : "false");
      setErrors((current) =>
        current[key] === message ? current : { ...current, [key]: message },
      );
    }

    function updateVisited() {
      for (const key of visited) {
        const element = formField(form, key);
        if (element) update(element);
      }
      setErrors((current) => {
        const mountedKeys = new Set(
          Array.from(form.elements)
            .filter(validatable)
            .map(fieldKey),
        );
        const staleKeys = Object.keys(current).filter(
          (key) => !mountedKeys.has(key),
        );
        if (staleKeys.length === 0) return current;
        const next = { ...current };
        staleKeys.forEach((key) => delete next[key]);
        return next;
      });
    }

    function onLeave(event: Event) {
      const element = event.target;
      if (!validatable(element)) return;
      visited.add(fieldKey(element));
      applyCustomErrors(fieldKey(element));
      updateVisited();
    }

    function onEdit(event: Event) {
      const element = event.target;
      if (!validatable(element)) {
        applyCustomErrors();
        updateVisited();
        return;
      }
      // Radio and checkbox groups have no meaningful "still typing" state.
      const immediate =
        element instanceof HTMLSelectElement ||
        (element instanceof HTMLInputElement &&
          ["checkbox", "file", "radio"].includes(element.type));
      if (immediate) visited.add(fieldKey(element));
      applyCustomErrors(fieldKey(element));
      if (!immediate && !visited.has(fieldKey(element))) {
        updateVisited();
        return;
      }
      updateVisited();
    }

    function onInvalid(event: Event) {
      const element = event.target;
      if (!validatable(element)) return;
      visited.add(fieldKey(element));
      // The document-level English handler runs first, so `validationMessage`
      // is already in English by the time this reads it.
      applyCustomErrors(fieldKey(element));
      updateVisited();
    }

    function onReset() {
      window.setTimeout(() => {
        visited.clear();
        for (const element of Array.from(form.elements)) {
          if (!validatable(element)) continue;
          element.setCustomValidity("");
          element.removeAttribute("aria-invalid");
        }
        customMessages.clear();
        inlineMessages.clear();
        setErrors({});
        applyCustomErrors();
      });
    }

    applyCustomErrors();
    form.addEventListener("focusout", onLeave);
    form.addEventListener("input", onEdit);
    form.addEventListener("change", onEdit);
    form.addEventListener("field-revalidate", onEdit);
    form.addEventListener("invalid", onInvalid, true);
    form.addEventListener("reset", onReset);

    return () => {
      form.removeEventListener("focusout", onLeave);
      form.removeEventListener("input", onEdit);
      form.removeEventListener("change", onEdit);
      form.removeEventListener("field-revalidate", onEdit);
      form.removeEventListener("invalid", onInvalid, true);
      form.removeEventListener("reset", onReset);
    };
  }, [formRef]);

  useEffect(() => {
    validatorRef.current = validateForm;
    formRef.current?.dispatchEvent(new Event("field-revalidate"));
  }, [formRef, validateForm]);

  return errors;
}
