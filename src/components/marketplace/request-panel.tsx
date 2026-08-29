"use client";

import { CalendarClock, CheckCircle2, HandCoins, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { useCallback, useRef, useState, type FormEvent } from "react";
import { DateField } from "@/components/forms/date-field";
import { FieldError } from "@/components/forms/field-error";
import { useFieldErrors } from "@/components/forms/use-field-errors";
import { RentalPauseNotice } from "@/components/marketplace/rental-pause-notice";
import { requestLiveErrors } from "@/lib/forms/live-validation";
import { formatCad } from "@/lib/marketplace/format";
import { RENTAL_REQUEST_STATUS } from "@/lib/marketplace/rental-request-status";
import type { BikeListing, RequestIntent } from "@/lib/marketplace/types";

type RequestListing = Pick<
  BikeListing,
  | "id"
  | "slug"
  | "offerMode"
  | "rentalHourlyCents"
  | "rentalDailyCents"
  | "salePriceCents"
  | "minimumRentalHours"
  | "availableQuantity"
  | "availableFrom"
  | "availableUntil"
>;

function toIso(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export function RequestPanel({
  listing,
  signedIn,
  userEmail,
  isOwner,
}: {
  listing: RequestListing;
  signedIn: boolean;
  userEmail: string | null;
  isOwner: boolean;
}) {
  const supportsRent =
    listing.offerMode === "rent" || listing.offerMode === "rent_sale";
  const rentalRequestsPaused =
    supportsRent && !RENTAL_REQUEST_STATUS.enabled;
  const canRent = supportsRent && RENTAL_REQUEST_STATUS.enabled;
  const canBuy = listing.offerMode === "sale" || listing.offerMode === "rent_sale";
  const [intent, setIntent] = useState<RequestIntent>(canRent ? "rent" : "buy");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const validateRequest = useCallback(
    (formElement: HTMLFormElement, changedFieldName?: string) => {
      const values = Object.fromEntries(
        [...new FormData(formElement).entries()].filter(
          (entry): entry is [string, string] => typeof entry[1] === "string",
        ),
      );
      return requestLiveErrors(
        { ...values, intent },
        {
          minimumRentalHours: listing.minimumRentalHours,
          availableFrom: listing.availableFrom,
          availableUntil: listing.availableUntil,
        },
        changedFieldName,
      );
    },
    [intent, listing.availableFrom, listing.availableUntil, listing.minimumRentalHours],
  );
  const fieldErrors = useFieldErrors(formRef, validateRequest);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/marketplace/requests", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          listingId: listing.id,
          intent,
          startsAt: intent === "rent" ? toIso(form.get("starts_at")) : undefined,
          endsAt: intent === "rent" ? toIso(form.get("ends_at")) : undefined,
          renterName: form.get("renter_name"),
          renterPhone: form.get("renter_phone"),
          message: form.get("message"),
          website: form.get("website"),
        }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Could not send this request.");
      setComplete(true);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not send this request.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (isOwner) {
    return (
      <aside className="rounded-[1.5rem] border border-slate-200 bg-white p-5 sm:p-6">
        <p className="text-sm font-bold text-teal-800">This is your listing</p>
        <h2 className="mt-2 text-xl font-bold text-slate-950">
          Manage it from your dashboard
        </h2>
        <Link href="/account/bikes" className="btn-primary mt-5 w-full">
          Open My Bikes
        </Link>
      </aside>
    );
  }

  if (listing.availableQuantity < 1) {
    return (
      <aside className="rounded-[1.5rem] border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-xl font-bold text-slate-950">
          Currently unavailable
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          This bike is still listed, but there are no units available right now.
        </p>
      </aside>
    );
  }

  if (rentalRequestsPaused && !canBuy) {
    return (
      <aside className="rounded-[1.5rem] border border-slate-200 bg-white p-5 sm:p-6">
        <RentalPauseNotice detail="You can still browse this bike while rental requests are unavailable." />
      </aside>
    );
  }

  if (!signedIn) {
    return (
      <aside className="rounded-[1.5rem] border border-slate-200 bg-white p-5 sm:p-6">
        {rentalRequestsPaused ? (
          <RentalPauseNotice detail="Purchase inquiries remain available for this bike." />
        ) : null}
        <LockKeyhole
          className={`h-6 w-6 text-teal-700 ${rentalRequestsPaused ? "mt-5" : ""}`}
          aria-hidden="true"
        />
        <h2 className="mt-4 text-xl font-bold text-slate-950">
          {rentalRequestsPaused
            ? "Sign in to ask about buying"
            : "Sign in to send a request"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          One free account lets you contact the owner and publish your own bike.
        </p>
        <Link
          href={`/auth?next=${encodeURIComponent(`/bikes/${listing.slug}`)}`}
          className="btn-primary mt-5 w-full"
        >
          Continue to sign in
        </Link>
      </aside>
    );
  }

  if (complete) {
    return (
      <aside className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-5 sm:p-6">
        <CheckCircle2 className="h-7 w-7 text-emerald-700" aria-hidden="true" />
        <h2 className="mt-4 text-xl font-bold text-slate-950">Request sent</h2>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          This is not charged or confirmed yet. The owner will review it and
          you’ll get an email when the status changes.
        </p>
        <Link href="/account/rentals" className="btn-secondary mt-5 w-full">
          View My Rentals
        </Link>
      </aside>
    );
  }

  return (
    <aside className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_12px_34px_rgba(15,34,56,0.07)] sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-slate-950">
            {intent === "rent" ? "Request this bike" : "Ask to buy this bike"}
          </p>
          <p className="mt-1 text-xs text-slate-500">{userEmail}</p>
        </div>
        {intent === "rent" ? (
          <CalendarClock className="h-5 w-5 text-teal-700" aria-hidden="true" />
        ) : (
          <HandCoins className="h-5 w-5 text-teal-700" aria-hidden="true" />
        )}
      </div>

      {supportsRent && canBuy ? (
        <div className="mt-5 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setIntent("rent")}
            disabled={rentalRequestsPaused}
            className={`rounded-lg px-3 py-2.5 text-sm font-bold ${
              intent === "rent" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"
            } disabled:cursor-not-allowed disabled:text-slate-400`}
          >
            {rentalRequestsPaused ? "Rent · Paused" : "Rent"}
          </button>
          <button
            type="button"
            onClick={() => setIntent("buy")}
            className={`rounded-lg px-3 py-2.5 text-sm font-bold ${
              intent === "buy" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"
            }`}
          >
            Buy
          </button>
        </div>
      ) : null}

      {rentalRequestsPaused ? (
        <RentalPauseNotice
          className="mt-5"
          detail="Purchase inquiries remain available for this bike."
        />
      ) : null}

      <div className="mt-5 rounded-xl bg-teal-50 p-4 text-sm text-teal-950">
        {intent === "rent" ? (
          <p>
            {formatCad(listing.rentalDailyCents)
              ? `${formatCad(listing.rentalDailyCents)} per day`
              : `${formatCad(listing.rentalHourlyCents)} per hour`}
            {" · "}
            {listing.minimumRentalHours}-hour minimum
          </p>
        ) : (
          <p>{formatCad(listing.salePriceCents)} asking price</p>
        )}
      </div>

      <form ref={formRef} onSubmit={submit} className="mt-5">
        {intent === "rent" ? (
          <div className="grid gap-4">
            <label className="field-label">
              Pickup
              <DateField name="starts_at" type="datetime-local" required />
              <FieldError message={fieldErrors.starts_at} />
            </label>
            <label className="field-label">
              Return
              <DateField name="ends_at" type="datetime-local" required />
              <FieldError message={fieldErrors.ends_at} />
            </label>
          </div>
        ) : null}
        <label className="field-label mt-4">
          Your name
          <input
            name="renter_name"
            required
            minLength={2}
            maxLength={120}
            data-trim-length="true"
            autoComplete="name"
            className="market-input"
          />
          <FieldError message={fieldErrors.renter_name} />
        </label>
        <label className="field-label mt-4">
          Phone <span className="font-normal text-slate-400">(optional)</span>
          <input
            name="renter_phone"
            type="tel"
            minLength={7}
            maxLength={40}
            data-trim-length="true"
            autoComplete="tel"
            className="market-input"
          />
          <FieldError message={fieldErrors.renter_phone} />
        </label>
        <label className="field-label mt-4">
          Message <span className="font-normal text-slate-400">(optional)</span>
          <textarea
            name="message"
            maxLength={1000}
            data-trim-length="true"
            className="market-textarea min-h-24"
            placeholder={
              intent === "rent"
                ? "Tell the owner anything useful about your plans."
                : "Ask a question or suggest a time to see the bike."
            }
          />
          <FieldError message={fieldErrors.message} />
        </label>
        <label className="sr-only" aria-hidden="true">
          Website
          <input name="website" maxLength={200} tabIndex={-1} autoComplete="off" />
        </label>
        {error ? (
          <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </p>
        ) : null}
        <button type="submit" disabled={busy} className="btn-primary mt-5 w-full">
          {busy
            ? "Sending…"
            : intent === "rent"
              ? "Request to rent"
              : "Ask to buy"}
        </button>
        <p className="mt-3 text-center text-xs leading-5 text-slate-500">
          No payment is collected. The exchange happens in person.
        </p>
      </form>
    </aside>
  );
}
