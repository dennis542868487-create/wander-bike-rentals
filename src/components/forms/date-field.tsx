"use client";

import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const weekdayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

type FieldType = "date" | "datetime-local";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

/** Splits a canonical `YYYY-MM-DD` / `YYYY-MM-DDTHH:MM` value. */
function readCanonical(value: string) {
  const parts = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?$/.exec(value);
  if (!parts) return null;
  return {
    year: Number(parts[1]),
    month: Number(parts[2]) - 1,
    day: Number(parts[3]),
    hour: parts[4] === undefined ? 9 : Number(parts[4]),
    minute: parts[5] === undefined ? 0 : Number(parts[5]),
    hasTime: parts[4] !== undefined,
  };
}

function toCanonical(
  type: FieldType,
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
) {
  const date = `${year}-${pad(month + 1)}-${pad(day)}`;
  return type === "date" ? date : `${date}T${pad(hour)}:${pad(minute)}`;
}

/** The text the user sees and can type. Never locale-dependent. */
export function toTypedText(type: FieldType, canonical: string) {
  if (!canonical) return "";
  const parsed = readCanonical(canonical);
  if (!parsed) return canonical;
  const date = `${parsed.year}-${pad(parsed.month + 1)}-${pad(parsed.day)}`;
  if (type === "date") return date;
  return `${date} ${pad(parsed.hour)}:${pad(parsed.minute)}`;
}

/**
 * Accepts what a person would reasonably type. Returns the canonical value, or
 * null when the text is not a usable date so the caller can flag it.
 */
export function parseTypedText(type: FieldType, text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return "";
  const pattern =
    type === "date"
      ? /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/
      : /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[ T,]+(\d{1,2}):(\d{2}))?$/;
  const parts = pattern.exec(trimmed);
  if (!parts) return null;

  const year = Number(parts[1]);
  const month = Number(parts[2]) - 1;
  const day = Number(parts[3]);
  const hour = parts[4] === undefined ? 9 : Number(parts[4]);
  const minute = parts[5] === undefined ? 0 : Number(parts[5]);

  if (year < 1900 || year > 2999) return null;
  if (month < 0 || month > 11) return null;
  if (day < 1 || day > daysInMonth(year, month)) return null;
  if (hour > 23 || minute > 59) return null;

  return toCanonical(type, year, month, day, hour, minute);
}

/**
 * Canonical values keep the exact shape a native `date` / `datetime-local`
 * input submits, so everything reading the form data stays unchanged.
 */
export function dateTimeToDate(canonical: string) {
  const parsed = readCanonical(canonical);
  if (!parsed) return null;
  const date = new Date(
    parsed.year,
    parsed.month,
    parsed.day,
    parsed.hour,
    parsed.minute,
  );
  return Number.isNaN(date.getTime()) ? null : date;
}

type DateFieldProps = {
  name: string;
  type?: FieldType;
  required?: boolean;
  defaultValue?: string;
  className?: string;
  id?: string;
};

/**
 * Browsers paint their own date editor and calendar popup in the browser UI
 * language, which puts Chinese text inside this English-only site and cannot be
 * overridden from the page. This is a plain text input plus a calendar written
 * here, so every visitor sees the same English UI, and the submitted value
 * keeps the native `YYYY-MM-DD` / `YYYY-MM-DDTHH:MM` shape.
 */
export function DateField({
  name,
  type = "date",
  required,
  defaultValue = "",
  className = "market-input",
  id,
}: DateFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? `${generatedId}-date`;
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [text, setText] = useState(() => toTypedText(type, defaultValue));
  const [canonical, setCanonical] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => {
    const parsed = readCanonical(defaultValue);
    return parsed
      ? { year: parsed.year, month: parsed.month }
      : { year: 0, month: 0 };
  });

  // `open` gates every use of today's date, so the first render stays identical
  // on the server and the client.
  function openCalendar() {
    const parsed = readCanonical(canonical);
    const today = new Date();
    setView(
      parsed
        ? { year: parsed.year, month: parsed.month }
        : { year: today.getFullYear(), month: today.getMonth() },
    );
    setOpen(true);
  }

  // Runs after the input holds the new text, so a value picked from the
  // calendar clears any inline error the form is already showing.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    inputRef.current?.dispatchEvent(
      new CustomEvent("field-revalidate", { bubbles: true }),
    );
  }, [text]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        inputRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function commit(nextCanonical: string) {
    setCanonical(nextCanonical);
    setText(toTypedText(type, nextCanonical));
    inputRef.current?.setCustomValidity("");
  }

  /**
   * Half-typed text is normal, so it only blocks submitting while the field is
   * focused. On the way out the field falls back to the last usable value, so
   * a blurred field never holds text that is not a real date.
   */
  function handleBlur() {
    const normalized = toTypedText(type, canonical);
    if (normalized !== text) setText(normalized);
    inputRef.current?.setCustomValidity("");
  }

  function handleTyping(nextText: string) {
    setText(nextText);
    const parsed = parseTypedText(type, nextText);
    if (parsed === null) {
      setCanonical("");
      inputRef.current?.setCustomValidity(
        type === "date"
          ? "Enter a date as YYYY-MM-DD, for example 2026-07-29."
          : "Enter a date and time as YYYY-MM-DD HH:MM, for example 2026-07-29 14:30.",
      );
      return;
    }
    inputRef.current?.setCustomValidity("");
    setCanonical(parsed);
  }

  const selected = readCanonical(canonical);
  const parsedTime = selected ?? { hour: 9, minute: 0 };

  function selectDay(day: number) {
    commit(
      toCanonical(
        type,
        view.year,
        view.month,
        day,
        parsedTime.hour,
        parsedTime.minute,
      ),
    );
    if (type === "date") {
      setOpen(false);
      inputRef.current?.focus();
    }
  }

  function setTime(hour: number, minute: number) {
    const base = selected ?? (() => {
      const today = new Date();
      return {
        year: today.getFullYear(),
        month: today.getMonth(),
        day: today.getDate(),
      };
    })();
    commit(toCanonical(type, base.year, base.month, base.day, hour, minute));
  }

  function shiftMonth(delta: number) {
    setView((current) => {
      const month = current.month + delta;
      if (month < 0) return { year: current.year - 1, month: 11 };
      if (month > 11) return { year: current.year + 1, month: 0 };
      return { year: current.year, month };
    });
  }

  const leadingBlanks = open
    ? new Date(view.year, view.month, 1).getDay()
    : 0;
  const totalDays = open ? daysInMonth(view.year, view.month) : 0;
  const today = open ? new Date() : null;

  const hour12 = parsedTime.hour % 12 === 0 ? 12 : parsedTime.hour % 12;
  const meridiem = parsedTime.hour < 12 ? "AM" : "PM";

  return (
    <div className="date-field" ref={wrapperRef}>
      {/*
        The field the form reads keeps the exact `YYYY-MM-DD` /
        `YYYY-MM-DDTHH:MM` shape a native date input submits, so nothing
        downstream has to change. The visible input is what people read and
        type into, and carries `required` so an empty field still blocks submit.
      */}
      <input type="hidden" name={name} value={canonical} />
      <input
        ref={inputRef}
        id={fieldId}
        data-field-name={name}
        type="text"
        required={required}
        value={text}
        onChange={(event) => handleTyping(event.target.value)}
        onBlur={handleBlur}
        className={className}
        placeholder={type === "date" ? "YYYY-MM-DD" : "YYYY-MM-DD HH:MM"}
        autoComplete="off"
        inputMode="numeric"
        spellCheck={false}
      />
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openCalendar())}
        className="date-field__trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? `${fieldId}-calendar` : undefined}
        aria-label={open ? "Close the calendar" : "Open the calendar"}
      >
        <CalendarDays className="h-4 w-4" aria-hidden="true" />
      </button>

      {open ? (
        <div
          id={`${fieldId}-calendar`}
          role="dialog"
          aria-label="Choose a date"
          className="date-popover"
        >
          <div className="date-popover__header">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              className="date-popover__nav"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="date-popover__title">
              {monthNames[view.month]} {view.year}
            </span>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              className="date-popover__nav"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="date-popover__weekdays" aria-hidden="true">
            {weekdayNames.map((weekday) => (
              <span key={weekday}>{weekday}</span>
            ))}
          </div>

          <div className="date-popover__grid">
            {Array.from({ length: leadingBlanks }, (_, index) => (
              <span key={`blank-${index}`} />
            ))}
            {Array.from({ length: totalDays }, (_, index) => {
              const day = index + 1;
              const isSelected =
                selected?.year === view.year &&
                selected?.month === view.month &&
                selected?.day === day;
              const isToday =
                today?.getFullYear() === view.year &&
                today?.getMonth() === view.month &&
                today?.getDate() === day;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => selectDay(day)}
                  className="date-popover__day"
                  data-selected={isSelected ? "true" : undefined}
                  data-today={isToday ? "true" : undefined}
                  aria-current={isToday ? "date" : undefined}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {type === "datetime-local" ? (
            <div className="date-popover__time">
              <span className="date-popover__time-label">Time</span>
              <select
                value={hour12}
                onChange={(event) => {
                  const next = Number(event.target.value) % 12;
                  setTime(
                    meridiem === "AM" ? next : next + 12,
                    parsedTime.minute,
                  );
                }}
                className="date-popover__select"
                aria-label="Hour"
              >
                {Array.from({ length: 12 }, (_, index) => index + 1).map(
                  (value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ),
                )}
              </select>
              <span aria-hidden="true">:</span>
              <select
                value={pad(parsedTime.minute)}
                onChange={(event) =>
                  setTime(parsedTime.hour, Number(event.target.value))
                }
                className="date-popover__select"
                aria-label="Minutes"
              >
                {Array.from({ length: 12 }, (_, index) => index * 5).map(
                  (value) => (
                    <option key={value} value={value}>
                      {pad(value)}
                    </option>
                  ),
                )}
              </select>
              <select
                value={meridiem}
                onChange={(event) => {
                  const base = parsedTime.hour % 12;
                  setTime(
                    event.target.value === "AM" ? base : base + 12,
                    parsedTime.minute,
                  );
                }}
                className="date-popover__select"
                aria-label="AM or PM"
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          ) : null}

          <div className="date-popover__footer">
            <button
              type="button"
              onClick={() => {
                commit("");
                setOpen(false);
              }}
              className="date-popover__action"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                setView({ year: now.getFullYear(), month: now.getMonth() });
                commit(
                  toCanonical(
                    type,
                    now.getFullYear(),
                    now.getMonth(),
                    now.getDate(),
                    parsedTime.hour,
                    parsedTime.minute,
                  ),
                );
                if (type === "date") setOpen(false);
              }}
              className="date-popover__action date-popover__action--strong"
            >
              Today
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
