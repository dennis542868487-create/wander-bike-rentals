"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useAuthSession } from "@/hooks/use-auth-session";

type QuantityKey = "adult_bikes" | "kids_bikes" | "trailers";

const quantityOptions: Array<{ key: QuantityKey; title: string; description: string }> = [
  { key: "adult_bikes", title: "Adult bikes", description: "Helmet and lock included" },
  { key: "kids_bikes", title: "Kids bikes", description: "For younger riders" },
  { key: "trailers", title: "Bike trailers", description: "Family-friendly add-on" },
];

function localDate(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

export default function BookingForm() {
  const { session, ready } = useAuthSession();
  const [quantities, setQuantities] = useState<Record<QuantityKey, number>>({
    adult_bikes: 1,
    kids_bikes: 0,
    trailers: 0,
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const minDate = useMemo(() => localDate(), []);

  const updateQuantity = (key: QuantityKey, amount: number) => {
    setQuantities((current) => ({ ...current, [key]: Math.max(0, Math.min(20, current[key] + amount)) }));
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");

    const form = new FormData(event.currentTarget);
    const date = String(form.get("date"));
    const pickupTime = String(form.get("pickup_time"));
    const returnTime = String(form.get("return_time"));
    const startsAt = new Date(`${date}T${pickupTime}`);
    const endsAt = new Date(`${date}T${returnTime}`);
    if (endsAt <= startsAt && returnTime !== pickupTime) endsAt.setDate(endsAt.getDate() + 1);

    const payload = {
      customer_name: form.get("customer_name"),
      phone: form.get("phone"),
      email: form.get("email"),
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      notes: form.get("notes"),
      website: form.get("website"),
      ...quantities,
    };

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token ?? ""}`,
        },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Could not send your request.");

      event.currentTarget.reset();
      setQuantities({ adult_bikes: 1, kids_bikes: 0, trailers: 0 });
      setStatus("success");
      setMessage("Thanks! Your booking request has been received. We’ll contact you to confirm availability.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Could not send your request.");
    }
  }

  if (!ready) {
    return <div className="min-h-[34rem] animate-pulse rounded-[2rem] border border-teal-100 bg-white/70" />;
  }

  if (!session) {
    return (
      <div className="self-start rounded-[2rem] border border-teal-100 bg-white p-7 text-center shadow-[0_24px_70px_rgba(15,23,42,.09)] sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-100 text-2xl">🔐</div>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[.18em] text-teal-700">Account required</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Sign in before requesting a bike.</h2>
        <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-slate-600">Your account lets you return later to update, review, or cancel your booking request.</p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/auth?next=/booking" className="btn-primary px-6 py-3.5">Sign in</Link>
          <Link href="/auth?mode=signup&next=/booking" className="btn-secondary px-6 py-3.5">Create account</Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.09)] sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-sm font-semibold text-slate-800">Full name *</span>
          <input name="customer_name" required autoComplete="name" defaultValue={String(session.user.user_metadata.full_name ?? session.user.user_metadata.name ?? "")} className="booking-input" placeholder="Your full name" />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Phone number *</span>
          <input name="phone" required type="tel" autoComplete="tel" className="booking-input" placeholder="(604) 555-0123" />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Email address *</span>
          <input name="email" required type="email" autoComplete="email" defaultValue={session.user.email ?? ""} className="booking-input" placeholder="you@example.com" />
        </label>
      </div>

      <div className="my-7 h-px bg-slate-200" />

      <fieldset>
        <legend className="text-base font-bold text-slate-950">Rental time</legend>
        <p className="mt-1 text-sm text-slate-500">Choose when you would like to pick up and return your rental.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="text-sm font-semibold text-slate-800">Date *</span>
            <input name="date" required type="date" min={minDate} defaultValue={localDate(1)} className="booking-input" />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-800">Pickup *</span>
            <input name="pickup_time" required type="time" min="09:00" max="22:00" defaultValue="10:00" step="900" className="booking-input" />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-800">Return *</span>
            <input name="return_time" required type="time" min="09:00" max="23:59" defaultValue="14:00" step="900" className="booking-input" />
          </label>
        </div>
      </fieldset>

      <div className="my-7 h-px bg-slate-200" />

      <fieldset>
        <legend className="text-base font-bold text-slate-950">What do you need?</legend>
        <p className="mt-1 text-sm text-slate-500">Select the quantity for each rental type.</p>
        <div className="mt-4 grid gap-3">
          {quantityOptions.map((option) => (
            <div key={option.key} className="flex items-center justify-between gap-4 rounded-2xl border border-teal-100 bg-[#f0fdf9] p-4">
              <div>
                <p className="font-semibold text-slate-950">{option.title}</p>
                <p className="mt-0.5 text-sm text-slate-500">{option.description}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2" aria-label={`${option.title} quantity`}>
                <button type="button" onClick={() => updateQuantity(option.key, -1)} className="quantity-button" aria-label={`Remove one ${option.title}`}>−</button>
                <output className="w-8 text-center text-lg font-bold tabular-nums text-slate-950">{quantities[option.key]}</output>
                <button type="button" onClick={() => updateQuantity(option.key, 1)} className="quantity-button" aria-label={`Add one ${option.title}`}>+</button>
              </div>
            </div>
          ))}
        </div>
      </fieldset>

      <label className="mt-6 block">
        <span className="text-sm font-semibold text-slate-800">Notes or special requests</span>
        <textarea name="notes" rows={4} className="booking-input resize-y" placeholder="Rider heights, child ages, accessibility needs, or anything else we should know…" />
      </label>

      <label className="pointer-events-none absolute -left-[9999px]" aria-hidden="true">
        Website<input name="website" tabIndex={-1} autoComplete="off" />
      </label>

      <button type="submit" disabled={status === "sending"} className="btn-brand mt-6 w-full px-6 py-4 text-base disabled:cursor-wait disabled:opacity-60">
        {status === "sending" ? "Sending request…" : "Request a booking"}
      </button>

      {message && (
        <div role="status" className={`mt-4 rounded-2xl border px-4 py-3 text-sm leading-6 ${status === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-700"}`}>
          {message}
        </div>
      )}

      {status === "success" && <Link href="/account/bookings" className="mt-3 flex justify-center text-sm font-semibold text-teal-700 hover:text-teal-900">View my bookings →</Link>}

      <p className="mt-4 text-center text-xs leading-5 text-slate-500">
        This is a booking request, not an automatic confirmation. We will confirm availability by phone or email.
      </p>
    </form>
  );
}
