"use client";

import { useState } from "react";

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * Formats without `Date` or `Intl` so the text is identical on the server and
 * the client, and never picks up the visitor's timezone or browser language.
 */
export function formatDateValue(value: string) {
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!parts) return value;
  const month = months[Number(parts[2]) - 1];
  if (!month) return value;
  return `${month} ${Number(parts[3])}, ${parts[1]}`;
}

export function formatDateTimeValue(value: string) {
  const parts = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value);
  if (!parts) return value;
  const month = months[Number(parts[2]) - 1];
  if (!month) return value;
  const hour = Number(parts[4]);
  const suffix = hour < 12 ? "AM" : "PM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${month} ${Number(parts[3])}, ${parts[1]}, ${hour12}:${parts[5]} ${suffix}`;
}

type DateFieldProps = {
  name: string;
  type?: "date" | "datetime-local";
  required?: boolean;
  defaultValue?: string;
  className?: string;
  min?: string;
  max?: string;
  id?: string;
};

/**
 * Chrome and Safari render `date` / `datetime-local` fields in the browser's UI
 * language, so a Chinese browser shows a Chinese date placeholder on this
 * English-only site, and the `lang` attribute cannot override it — Chromium
 * keeps that behind a flag. While the field is idle its native text is hidden
 * and this English rendering is shown instead; the native editor comes back on
 * focus so typing and the calendar picker still work normally.
 */
export function DateField({
  name,
  type = "date",
  required,
  defaultValue = "",
  className = "market-input",
  min,
  max,
  id,
}: DateFieldProps) {
  const [value, setValue] = useState(defaultValue);
  const [editing, setEditing] = useState(false);
  const idle = !editing;

  const display = value
    ? type === "date"
      ? formatDateValue(value)
      : formatDateTimeValue(value)
    : type === "date"
      ? "YYYY-MM-DD"
      : "YYYY-MM-DD, HH:MM";

  return (
    <span className="date-field" data-idle={idle ? "true" : "false"}>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        min={min}
        max={max}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onFocus={() => setEditing(true)}
        onBlur={() => setEditing(false)}
        className={className}
      />
      {idle ? (
        <span
          className={`date-field__display${value ? "" : " date-field__display--empty"}`}
          aria-hidden="true"
        >
          {display}
        </span>
      ) : null}
    </span>
  );
}
