"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  RefreshCw,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import type { Booking, BookingStatus } from "@/lib/booking-types";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const statusStyles: Record<BookingStatus, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-800",
  confirmed: "border-teal-200 bg-teal-50 text-teal-800",
  completed: "border-slate-200 bg-slate-100 text-slate-600",
  cancelled: "border-rose-200 bg-rose-50 text-rose-700",
};

function dayKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function toDateTimeLocal(value: string) {
  const date = new Date(value);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-CA", { hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

function monthGrid(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = new Date(first);
  start.setDate(1 - first.getDay());
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

async function api(session: Session, url: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
      ...init?.headers,
    },
  });
  const result = await response.json();
  if (!response.ok) {
    const error = new Error(result.error || "Request failed.") as Error & { status: number };
    error.status = response.status;
    throw error;
  }
  return result;
}

function BookingEditor({ booking, session, onClose, onSaved }: {
  booking: Booking;
  session: Session;
  onClose: () => void;
  onSaved: (booking: Booking) => void;
}) {
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = {
      customer_name: form.get("customer_name"),
      phone: form.get("phone"),
      email: form.get("email"),
      starts_at: new Date(String(form.get("starts_at"))).toISOString(),
      ends_at: new Date(String(form.get("ends_at"))).toISOString(),
      adult_bikes: Number(form.get("adult_bikes")),
      kids_bikes: Number(form.get("kids_bikes")),
      trailers: Number(form.get("trailers")),
      status: form.get("status"),
      notes: form.get("notes"),
    };
    try {
      const result = await api(session, `/api/booking-admin/bookings/${booking.id}`, { method: "PATCH", body: JSON.stringify(payload) });
      onSaved(result.booking as Booking);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save booking.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-5" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form onSubmit={submit} className="max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-t-[1.7rem] bg-white p-5 shadow-2xl sm:rounded-[1.7rem] sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-[.18em] text-teal-700">Edit booking</p><h2 className="mt-1 text-2xl font-bold text-slate-950">{booking.customer_name}</h2></div>
          <button type="button" onClick={onClose} className="rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-600">Close</button>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700 sm:col-span-2">Full name<input name="customer_name" required defaultValue={booking.customer_name} className="booking-input" /></label>
          <label className="text-sm font-semibold text-slate-700">Phone<input name="phone" required defaultValue={booking.phone} className="booking-input" /></label>
          <label className="text-sm font-semibold text-slate-700">Email<input name="email" required type="email" defaultValue={booking.email} className="booking-input" /></label>
          <label className="text-sm font-semibold text-slate-700">Pickup<input name="starts_at" required type="datetime-local" defaultValue={toDateTimeLocal(booking.starts_at)} className="booking-input" /></label>
          <label className="text-sm font-semibold text-slate-700">Return<input name="ends_at" required type="datetime-local" defaultValue={toDateTimeLocal(booking.ends_at)} className="booking-input" /></label>
          {(["adult_bikes", "kids_bikes", "trailers"] as const).map((key) => (
            <label key={key} className="text-sm font-semibold capitalize text-slate-700">{key.replace("_", " ")}<input name={key} required type="number" min="0" max="20" defaultValue={booking[key]} className="booking-input" /></label>
          ))}
          <label className="text-sm font-semibold text-slate-700">Status
            <select name="status" defaultValue={booking.status} className="booking-input">
              <option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
            </select>
          </label>
          <label className="text-sm font-semibold text-slate-700 sm:col-span-2">Notes<textarea name="notes" rows={4} defaultValue={booking.notes ?? ""} className="booking-input resize-y" /></label>
        </div>
        {error && <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-full border border-slate-300 px-5 py-3 font-semibold text-slate-700">Cancel</button>
          <button disabled={saving} className="rounded-full bg-teal-700 px-6 py-3 font-semibold text-white disabled:opacity-60">{saving ? "Saving…" : "Save changes"}</button>
        </div>
      </form>
    </div>
  );
}

export default function BookingAdmin() {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [view, setView] = useState<"month" | "agenda">("month");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selected, setSelected] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [access, setAccess] = useState<"checking" | "granted" | "denied">("checking");
  const days = useMemo(() => monthGrid(month), [month]);
  const agendaBookings = useMemo(
    () =>
      [...bookings].sort(
        (left, right) =>
          new Date(left.starts_at).getTime() - new Date(right.starts_at).getTime(),
      ),
    [bookings],
  );

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | undefined;
    void Promise.resolve().then(async () => {
      try {
        const client = getSupabaseBrowser();
        subscription = client.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession)).data.subscription;
        const { data } = await client.auth.getSession();
        setSession(data.session);
        setAuthReady(true);
      } catch (authError) {
        setError(authError instanceof Error ? authError.message : "Supabase is not configured.");
        setAuthReady(true);
      }
    });
    return () => subscription?.unsubscribe();
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (window.matchMedia("(max-width: 639px)").matches) {
        setView("agenda");
      }
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  const loadBookings = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setError("");
    const from = new Date(days[0]);
    const to = new Date(days[days.length - 1]);
    to.setDate(to.getDate() + 1);
    try {
      const result = await api(session, `/api/booking-admin/bookings?from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`);
      setBookings(result.bookings as Booking[]);
      setAccess("granted");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load bookings.");
      if (loadError instanceof Error && "status" in loadError && loadError.status === 403) setAccess("denied");
    } finally {
      setLoading(false);
    }
  }, [session, days]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void loadBookings(), 0);
    return () => window.clearTimeout(timeout);
  }, [loadBookings]);

  if (!authReady) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
        <RefreshCw
          aria-hidden="true"
          className="mx-auto h-5 w-5 animate-spin text-teal-700"
        />
        <p className="mt-3 text-sm font-medium text-slate-600">
          Loading rental calendar…
        </p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
        <h1 className="text-xl font-bold text-slate-950">Your session has expired</h1>
        <p className="mt-2 text-sm text-slate-600">
          Sign in again to reopen the private rental calendar.
        </p>
        <Link
          href="/auth?next=/admin/rentals"
          className="mt-5 inline-flex h-10 items-center rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white"
        >
          Sign in
        </Link>
      </div>
    );
  }

  if (access === "denied") {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6">
        <h1 className="text-xl font-bold text-slate-950">Staff access required</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          This session no longer has permission to load rental bookings.
        </p>
        <Link
          href="/admin"
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Back to admin
        </Link>
      </div>
    );
  }

  const byDay = new Map<string, Booking[]>();
  bookings.forEach((booking) => {
    const key = dayKey(new Date(booking.starts_at));
    byDay.set(key, [...(byDay.get(key) ?? []), booking]);
  });

  const changeMonth = (amount: number) => setMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-800 transition hover:text-teal-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Back to admin
          </Link>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Rentals
          </h1>
          <p className="mt-1 text-sm text-slate-500">Booking calendar</p>
        </div>
        <div className="flex rounded-lg border border-slate-200 bg-white p-1">
          {(["month", "agenda"] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={view === option}
              onClick={() => setView(option)}
              className={`h-8 rounded-md px-3 text-sm font-semibold capitalize transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
                view === option
                  ? "bg-teal-50 text-teal-900"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => changeMonth(-1)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
            >
              <ChevronLeft aria-hidden="true" className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() =>
                setMonth(
                  new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                )
              }
              className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
            >
              Today
            </button>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => changeMonth(1)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
            >
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
          <h2 className="text-xl font-bold text-slate-950 sm:text-center sm:text-2xl">
            {new Intl.DateTimeFormat("en-CA", {
              month: "long",
              year: "numeric",
            }).format(month)}
          </h2>
          <button
            type="button"
            onClick={() => void loadBookings()}
            disabled={loading}
            className="inline-flex h-10 min-w-28 items-center justify-center gap-2 justify-self-start rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 disabled:cursor-wait disabled:opacity-70 sm:justify-self-end"
          >
            <RefreshCw
              aria-hidden="true"
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
        {error ? (
          <p
            role="alert"
            className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
          >
            {error}
          </p>
        ) : null}

        {view === "month" ? (
          <>
            <p className="mb-2 text-xs text-slate-500 sm:hidden">
              Swipe horizontally to see the full week.
            </p>
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <div className="min-w-[880px]">
                <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/80">
                  {weekdays.map((day) => (
                    <div
                      key={day}
                      className="p-3 text-center text-xs font-bold uppercase tracking-wider text-slate-500"
                    >
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7">
                  {days.map((date) => {
                    const items = byDay.get(dayKey(date)) ?? [];
                    const outside = date.getMonth() !== month.getMonth();
                    const today = dayKey(date) === dayKey(new Date());
                    return (
                      <div
                        key={date.toISOString()}
                        className={`min-h-32 border-b border-r border-slate-200 p-2 ${
                          outside ? "bg-slate-50/70" : "bg-white"
                        }`}
                      >
                        <div
                          className={`mb-2 flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                            today
                              ? "bg-teal-700 text-white"
                              : outside
                                ? "text-slate-400"
                                : "text-slate-700"
                          }`}
                        >
                          {date.getDate()}
                        </div>
                        <div className="space-y-1.5">
                          {items.map((booking) => (
                            <button
                              key={booking.id}
                              type="button"
                              onClick={() => setSelected(booking)}
                              className={`block w-full rounded-md border px-2 py-1.5 text-left text-xs leading-4 transition hover:border-current focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${statusStyles[booking.status]}`}
                            >
                              <span className="block truncate font-bold">
                                {formatTime(booking.starts_at)} ·{" "}
                                {booking.customer_name}
                              </span>
                              <span className="block opacity-80">
                                {booking.adult_bikes}A · {booking.kids_bikes}K ·{" "}
                                {booking.trailers}T
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-200 px-4 py-3 text-xs text-slate-500">
                  {(Object.keys(statusStyles) as BookingStatus[]).map((status) => (
                    <span
                      key={status}
                      className="inline-flex items-center gap-2 capitalize"
                    >
                      <span
                        aria-hidden="true"
                        className={`h-2 w-2 rounded-full ${
                          status === "pending"
                            ? "bg-amber-500"
                            : status === "confirmed"
                              ? "bg-teal-600"
                              : status === "completed"
                                ? "bg-slate-500"
                                : "bg-rose-500"
                        }`}
                      />
                      {status}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-4 py-3">
              <h3 className="font-semibold text-slate-950">Bookings in this view</h3>
              <p className="mt-0.5 text-xs text-slate-500">
                {agendaBookings.length}{" "}
                {agendaBookings.length === 1 ? "booking" : "bookings"}
              </p>
            </div>
            <div className="divide-y divide-slate-100">
              {agendaBookings.map((booking) => (
                <button
                  key={booking.id}
                  type="button"
                  onClick={() => setSelected(booking)}
                  className="grid w-full gap-3 px-4 py-4 text-left transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-600 sm:grid-cols-[11rem_1fr_auto] sm:items-center"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {new Intl.DateTimeFormat("en-CA", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }).format(new Date(booking.starts_at))}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {formatTime(booking.starts_at)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {booking.customer_name}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {booking.adult_bikes} adult · {booking.kids_bikes} kids ·{" "}
                      {booking.trailers} trailer
                    </p>
                  </div>
                  <span
                    className={`w-fit rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[booking.status]}`}
                  >
                    {booking.status}
                  </span>
                </button>
              ))}
              {agendaBookings.length === 0 ? (
                <div className="px-5 py-14 text-center">
                  <CalendarDays
                    aria-hidden="true"
                    className="mx-auto h-7 w-7 text-slate-400"
                  />
                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    No bookings in this calendar range
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Change month or refresh to check again.
                  </p>
                </div>
              ) : null}
            </div>
          </section>
        )}
      </div>
      {selected ? (
        <BookingEditor
          booking={selected}
          session={session}
          onClose={() => setSelected(null)}
          onSaved={(updated) => {
            setBookings((current) =>
              current.map((item) => (item.id === updated.id ? updated : item)),
            );
            setSelected(null);
          }}
        />
      ) : null}
    </div>
  );
}
