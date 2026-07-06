"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import type { Booking, BookingStatus } from "@/lib/booking-types";
import { useAuthSession } from "@/hooks/use-auth-session";
import { getSupabaseBrowser } from "@/lib/supabase";

const statusStyle: Record<BookingStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-teal-100 text-teal-800",
  completed: "bg-slate-200 text-slate-700",
  cancelled: "bg-rose-100 text-rose-700",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-CA", { weekday: "short", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

function localDateTime(value: string) {
  const date = new Date(value);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

async function bookingApi(session: Session, url: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}`, ...init?.headers },
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Request failed.");
  return result;
}

function CustomerBookingEditor({ booking, session, onClose, onSaved }: { booking: Booking; session: Session; onClose: () => void; onSaved: (booking: Booking) => void }) {
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const result = await bookingApi(session, `/api/bookings/${booking.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          customer_name: form.get("customer_name"), phone: form.get("phone"), email: form.get("email"),
          starts_at: new Date(String(form.get("starts_at"))).toISOString(), ends_at: new Date(String(form.get("ends_at"))).toISOString(),
          adult_bikes: Number(form.get("adult_bikes")), kids_bikes: Number(form.get("kids_bikes")), trailers: Number(form.get("trailers")), notes: form.get("notes"),
        }),
      });
      onSaved(result.booking as Booking);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save your changes.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/55 backdrop-blur-sm sm:items-center sm:p-5" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form onSubmit={submit} className="max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-t-[1.8rem] bg-white p-5 shadow-2xl sm:rounded-[1.8rem] sm:p-7">
        <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-teal-700">Update request</p><h2 className="mt-1 text-2xl font-bold text-slate-950">Your booking details</h2></div><button type="button" onClick={onClose} className="rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-600">Close</button></div>
        <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-800">Saving changes returns this booking to Pending so our team can confirm the updated availability.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700 sm:col-span-2">Full name<input name="customer_name" required defaultValue={booking.customer_name} className="booking-input" /></label>
          <label className="text-sm font-semibold text-slate-700">Phone<input name="phone" required defaultValue={booking.phone} className="booking-input" /></label>
          <label className="text-sm font-semibold text-slate-700">Email<input name="email" required type="email" defaultValue={booking.email} className="booking-input" /></label>
          <label className="text-sm font-semibold text-slate-700">Pickup<input name="starts_at" required type="datetime-local" defaultValue={localDateTime(booking.starts_at)} className="booking-input" /></label>
          <label className="text-sm font-semibold text-slate-700">Return<input name="ends_at" required type="datetime-local" defaultValue={localDateTime(booking.ends_at)} className="booking-input" /></label>
          {(["adult_bikes", "kids_bikes", "trailers"] as const).map((key) => <label key={key} className="text-sm font-semibold capitalize text-slate-700">{key.replace("_", " ")}<input name={key} type="number" min="0" max="20" required defaultValue={booking[key]} className="booking-input" /></label>)}
          <label className="text-sm font-semibold text-slate-700 sm:col-span-2">Notes<textarea name="notes" rows={4} defaultValue={booking.notes ?? ""} className="booking-input resize-y" /></label>
        </div>
        {error && <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
        <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={onClose} className="btn-secondary px-5 py-3">Cancel</button><button disabled={saving} className="btn-primary px-6 py-3 disabled:opacity-60">{saving ? "Saving…" : "Save changes"}</button></div>
      </form>
    </div>
  );
}
export default function MyBookings() {
  const { session, ready } = useAuthSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selected, setSelected] = useState<Booking | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setError("");
    try {
      const result = await bookingApi(session, "/api/bookings");
      setBookings(result.bookings as Booking[]);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load bookings.");
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);

  if (!ready) return <div className="h-72 animate-pulse rounded-[2rem] bg-white" />;
  if (!session) return <div className="rounded-[2rem] border border-teal-100 bg-white p-8 text-center shadow-sm"><h2 className="text-2xl font-bold text-slate-950">Sign in to see your bookings</h2><p className="mt-3 text-slate-600">Your booking history is private to your account.</p><Link href="/auth?next=/account/bookings" className="btn-primary mt-6 px-6 py-3">Sign in</Link></div>;

  async function cancelBooking(booking: Booking) {
    if (cancelId !== booking.id) { setCancelId(booking.id); return; }
    try {
      const result = await bookingApi(session!, `/api/bookings/${booking.id}`, { method: "DELETE" });
      setBookings((current) => current.map((item) => item.id === booking.id ? result.booking as Booking : item));
      setCancelId(null);
    } catch (cancelError) {
      setError(cancelError instanceof Error ? cancelError.message : "Could not cancel booking.");
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold uppercase tracking-[.18em] text-teal-700">Signed in as {session.user.email}</p><h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">My bookings</h1><p className="mt-3 text-slate-600">Review, change, or cancel upcoming rental requests.</p></div><div className="flex gap-3"><Link href="/booking" className="btn-primary px-5 py-3">New booking</Link><button onClick={async () => { await getSupabaseBrowser().auth.signOut(); }} className="btn-secondary px-5 py-3">Sign out</button></div></div>
      {error && <p className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}
      {loading ? <div className="mt-8 h-48 animate-pulse rounded-[2rem] bg-white" /> : bookings.length === 0 ? <div className="mt-8 rounded-[2rem] border border-dashed border-teal-200 bg-white/70 p-10 text-center"><div className="text-4xl">🚲</div><h2 className="mt-4 text-2xl font-bold text-slate-950">No bookings yet</h2><p className="mt-2 text-slate-600">When you request a rental, it will appear here.</p><Link href="/booking" className="btn-brand mt-6 px-6 py-3">Plan a ride</Link></div> : <div className="mt-8 grid gap-5">{bookings.map((booking) => {
        const editable = !["completed", "cancelled"].includes(booking.status) && new Date(booking.starts_at) > new Date();
        return <article key={booking.id} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg sm:p-6"><div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"><div><div className="flex flex-wrap items-center gap-3"><span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${statusStyle[booking.status]}`}>{booking.status}</span><span className="text-sm font-semibold text-slate-500">Requested {formatDate(booking.created_at)}</span></div><h2 className="mt-4 text-xl font-bold text-slate-950">{formatDate(booking.starts_at)}</h2><p className="mt-1 text-sm text-slate-500">Return: {formatDate(booking.ends_at)}</p><p className="mt-3 text-sm font-semibold text-slate-700">{booking.adult_bikes} adult · {booking.kids_bikes} kids · {booking.trailers} trailer</p></div>{editable && <div className="flex flex-wrap gap-2"><button onClick={() => setSelected(booking)} className="btn-secondary px-4 py-2.5 text-sm">Edit booking</button><button onClick={() => void cancelBooking(booking)} className={`rounded-full border px-4 py-2.5 text-sm font-semibold transition ${cancelId === booking.id ? "border-rose-600 bg-rose-600 text-white" : "border-rose-200 text-rose-700 hover:bg-rose-50"}`}>{cancelId === booking.id ? "Confirm cancel" : "Cancel"}</button></div>}</div></article>;
      })}</div>}
      {selected && <CustomerBookingEditor booking={selected} session={session} onClose={() => setSelected(null)} onSaved={(updated) => { setBookings((current) => current.map((item) => item.id === updated.id ? updated : item)); setSelected(null); }} />}
    </div>
  );
}
