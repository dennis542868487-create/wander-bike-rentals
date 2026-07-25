"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import type { Booking, BookingStatus } from "@/lib/booking-types";
import { useGoogleAuth } from "@/hooks/use-google-auth";

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

function Login({ onLogin }: { onLogin: (session: Session) => void }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const googleEnabled = useGoogleAuth();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const { data, error: authError } = await getSupabaseBrowser().auth.signInWithPassword({
        email: String(form.get("email")),
        password: String(form.get("password")),
      });
      if (authError || !data.session) throw authError || new Error("Could not sign in.");
      onLogin(data.session);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Could not sign in.");
    } finally {
      setLoading(false);
    }
  }

  async function googleLogin() {
    setLoading(true);
    setError("");
    const { error: authError } = await getSupabaseBrowser().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/booking-admin` },
    });
    if (authError) {
      setError(authError.message);
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,.22),transparent_38%),#020617] p-5">
      <form onSubmit={submit} className="hero-anim w-full max-w-sm rounded-[1.8rem] border border-white/10 bg-white p-7 shadow-2xl">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-600 text-2xl text-white">🚲</div>
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-950">Booking calendar</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">Private staff access for Wander Bike Rentals.</p>
        <button type="button" onClick={() => void googleLogin()} disabled={loading || !googleEnabled} className="mt-6 flex w-full items-center justify-center gap-3 rounded-full border border-slate-300 px-5 py-3 font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.4Z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 .9-3.4.9a5.8 5.8 0 0 1-5.5-4H3.2v2.6A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.5 14a6 6 0 0 1 0-4V7.4H3.2a10 10 0 0 0 0 9.2L6.5 14Z"/><path fill="#EA4335" d="M12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.8A9.6 9.6 0 0 0 3.2 7.4L6.5 10A5.8 5.8 0 0 1 12 6Z"/></svg>
          {googleEnabled === false ? "Google sign-in — setup needed" : "Continue with Google"}
        </button>
        <div className="my-5 flex items-center gap-3"><span className="h-px flex-1 bg-slate-200"/><span className="text-xs font-semibold uppercase tracking-wider text-slate-400">or email</span><span className="h-px flex-1 bg-slate-200"/></div>
        <label className="block text-sm font-semibold text-slate-700">Email
          <input name="email" type="email" autoComplete="email" required className="booking-input" />
        </label>
        <label className="mt-4 block text-sm font-semibold text-slate-700">Password
          <input name="password" type="password" autoComplete="current-password" required className="booking-input" />
        </label>
        {error && <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
        <button disabled={loading} className="mt-6 w-full rounded-full bg-slate-950 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60">
          {loading ? "Signing in…" : "Sign in"}
        </button>
        <p className="mt-4 text-center text-xs leading-5 text-slate-500">Only accounts granted the staff role can open the calendar.</p>
      </form>
    </div>
  );
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
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selected, setSelected] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [access, setAccess] = useState<"checking" | "granted" | "denied">("checking");
  const days = useMemo(() => monthGrid(month), [month]);

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

  if (!authReady) return <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">Loading…</div>;
  if (!session) return <Login onLogin={(nextSession) => { setAccess("checking"); setSession(nextSession); }} />;
  if (access === "denied") return <div className="flex min-h-screen items-center justify-center bg-slate-950 p-5"><div className="w-full max-w-md rounded-[1.8rem] bg-white p-8 text-center shadow-2xl"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-2xl">🔒</div><h1 className="mt-5 text-2xl font-bold text-slate-950">Staff access required</h1><p className="mt-3 text-sm leading-6 text-slate-600">You are signed in as {session.user.email}, but this account has not been granted a staff role.</p><button onClick={async () => { await getSupabaseBrowser().auth.signOut(); setSession(null); setAccess("checking"); }} className="mt-6 rounded-full bg-slate-950 px-6 py-3 font-semibold text-white">Sign out</button></div></div>;

  const byDay = new Map<string, Booking[]>();
  bookings.forEach((booking) => {
    const key = dayKey(new Date(booking.starts_at));
    byDay.set(key, [...(byDay.get(key) ?? []), booking]);
  });

  const changeMonth = (amount: number) => setMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4">
          <div><p className="font-bold text-slate-950">Wander Bike</p><p className="text-xs text-slate-500">Private booking calendar</p></div>
          <button onClick={async () => { await getSupabaseBrowser().auth.signOut(); setSession(null); }} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">Sign out</button>
        </div>
      </header>
      <main className="mx-auto max-w-[1500px] p-3 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button onClick={() => changeMonth(-1)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">←</button>
            <button onClick={() => setMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1))} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold shadow-sm">Today</button>
            <button onClick={() => changeMonth(1)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">→</button>
          </div>
          <h1 className="text-xl font-bold sm:text-2xl">{new Intl.DateTimeFormat("en-CA", { month: "long", year: "numeric" }).format(month)}</h1>
          <button onClick={() => void loadBookings()} className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">{loading ? "Loading…" : "Refresh"}</button>
        </div>
        {error && <p className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}

        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
              {weekdays.map((day) => <div key={day} className="p-3 text-center text-xs font-bold uppercase tracking-wider text-slate-500">{day}</div>)}
            </div>
            <div className="grid grid-cols-7">
              {days.map((date) => {
                const items = byDay.get(dayKey(date)) ?? [];
                const outside = date.getMonth() !== month.getMonth();
                const today = dayKey(date) === dayKey(new Date());
                return (
                  <div key={date.toISOString()} className={`min-h-32 border-b border-r border-slate-200 p-2 ${outside ? "bg-slate-50/70" : "bg-white"}`}>
                    <div className={`mb-2 flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${today ? "bg-teal-700 text-white" : outside ? "text-slate-400" : "text-slate-700"}`}>{date.getDate()}</div>
                    <div className="space-y-1.5">
                      {items.map((booking) => (
                        <button key={booking.id} onClick={() => setSelected(booking)} className={`block w-full rounded-lg border px-2 py-1.5 text-left text-xs leading-4 transition hover:-translate-y-0.5 hover:shadow-sm ${statusStyles[booking.status]}`}>
                          <span className="block font-bold">{formatTime(booking.starts_at)} · {booking.customer_name}</span>
                          <span className="block opacity-80">{booking.adult_bikes}A · {booking.kids_bikes}K · {booking.trailers}T</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
      {selected && <BookingEditor booking={selected} session={session} onClose={() => setSelected(null)} onSaved={(updated) => { setBookings((current) => current.map((item) => item.id === updated.id ? updated : item)); setSelected(null); }} />}
    </div>
  );
}
