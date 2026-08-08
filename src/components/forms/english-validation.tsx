"use client";

import { useEffect } from "react";

type ValidatableElement =
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement;

function isValidatable(target: EventTarget | null): target is ValidatableElement {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLSelectElement ||
    target instanceof HTMLTextAreaElement
  );
}

function fieldName(element: ValidatableElement) {
  const label = element.labels?.[0];
  if (!label) return "";

  const textBeforeControl: string[] = [];
  for (const child of label.childNodes) {
    if (child === element || child.contains(element)) break;
    textBeforeControl.push(child.textContent ?? "");
  }
  return textBeforeControl.join(" ").trim().replace(/\s+/g, " ");
}

function missingMessage(element: ValidatableElement) {
  if (element instanceof HTMLSelectElement) return "Please choose an option.";
  if (element instanceof HTMLInputElement) {
    if (element.type === "checkbox") return "Please tick this box to continue.";
    if (element.type === "radio") return "Please choose one of these options.";
    if (element.type === "file") return "Please choose a file.";
    if (element.type === "date") return "Please enter a date (YYYY-MM-DD).";
    if (element.type === "datetime-local") {
      return "Please enter a date and time (YYYY-MM-DD, HH:MM).";
    }
  }
  return "Please fill in this field.";
}

/**
 * Browsers write their own constraint-validation bubbles in the browser UI
 * language, so a Chinese or Japanese Chrome shows Chinese warnings on this
 * English-only site. Replacing the text with `setCustomValidity` keeps every
 * message in English no matter how the visitor's browser is configured.
 */
export function englishValidationMessage(element: ValidatableElement) {
  const validity = element.validity;
  const label = fieldName(element);
  const value =
    element.dataset.trimLength === "true"
      ? element.value.trim()
      : element.value;

  if (validity.customError && element.validationMessage) {
    return element.validationMessage;
  }

  if (
    validity.valueMissing ||
    (element.required &&
      !(element instanceof HTMLInputElement &&
        ["checkbox", "file", "radio"].includes(element.type)) &&
      value.length === 0)
  ) {
    return missingMessage(element);
  }

  if (validity.typeMismatch && element instanceof HTMLInputElement) {
    if (element.type === "email") {
      return "Enter a valid email address, like name@example.com.";
    }
    if (element.type === "url") {
      return "Enter a full web address, starting with https://.";
    }
    return "Enter a value in the requested format.";
  }

  // Chromium does not always update `validity.tooShort` for values inserted by
  // autofill or automation until submit. Checking the declared length directly
  // keeps the inline blur validation reliable for every input path.
  if (
    "minLength" in element &&
    element.minLength > 0 &&
    value.length > 0 &&
    value.length < element.minLength
  ) {
    const used = value.length;
    return `${label || "This field"} needs at least ${element.minLength} characters (you have ${used}).`;
  }

  if (
    "maxLength" in element &&
    element.maxLength >= 0 &&
    value.length > element.maxLength
  ) {
    return `${label || "This field"} can be at most ${element.maxLength} characters.`;
  }

  if (validity.rangeUnderflow && element instanceof HTMLInputElement) {
    return `Enter ${element.min} or more.`;
  }

  if (validity.rangeOverflow && element instanceof HTMLInputElement) {
    return `Enter ${element.max} or less.`;
  }

  if (validity.stepMismatch && element instanceof HTMLInputElement) {
    return element.step && element.step !== "any"
      ? `Enter a value in steps of ${element.step}.`
      : "Enter a valid value.";
  }

  if (validity.patternMismatch) {
    return element.title
      ? element.title
      : "Enter a value in the requested format.";
  }

  if (validity.badInput && element instanceof HTMLInputElement) {
    if (element.type === "date") return "Enter a complete date (YYYY-MM-DD).";
    if (element.type === "datetime-local") {
      return "Enter a complete date and time (YYYY-MM-DD, HH:MM).";
    }
    return "Enter a valid value.";
  }

  return validity.valid ? "" : "Check this field and try again.";
}

/**
 * Mounted once in the root layout. `invalid` does not bubble, so the listener
 * runs in the capture phase to reach fields anywhere in the tree, including
 * forms rendered by server components.
 */
export function EnglishValidationMessages() {
  useEffect(() => {
    function handleInvalid(event: Event) {
      const element = event.target;
      if (!isValidatable(element)) return;
      // A component that set its own message (DateField, for one) already wrote
      // something more specific than anything derivable here.
      if (element.validity.customError) return;
      element.setCustomValidity(englishValidationMessage(element));
    }

    function handleEdit(event: Event) {
      const element = event.target;
      if (!isValidatable(element)) return;
      element.setCustomValidity("");
    }

    document.addEventListener("invalid", handleInvalid, true);
    document.addEventListener("input", handleEdit, true);
    document.addEventListener("change", handleEdit, true);

    return () => {
      document.removeEventListener("invalid", handleInvalid, true);
      document.removeEventListener("input", handleEdit, true);
      document.removeEventListener("change", handleEdit, true);
    };
  }, []);

  return null;
}
