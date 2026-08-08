"use client";

import { CheckCircle2 } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { FieldError } from "@/components/forms/field-error";
import { useFieldErrors } from "@/components/forms/use-field-errors";
import type { MarketplaceProfile } from "@/lib/marketplace/server-data";

export function ProfileForm({ profile }: { profile: MarketplaceProfile }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const fieldErrors = useFieldErrors(formRef);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSaved(false);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          fullName: form.get("full_name"),
          phone: form.get("phone"),
          bio: form.get("bio"),
        }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Could not save profile.");
      setSaved(true);
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Could not save profile.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={submit} className="max-w-2xl rounded-[0.9rem] border border-slate-200 bg-white p-6 sm:p-8">
      <label className="field-label">
        Full name
        <input
          name="full_name"
          required
          maxLength={120}
          data-trim-length="true"
          autoComplete="name"
          defaultValue={profile.fullName ?? ""}
          className="market-input"
        />
        <FieldError message={fieldErrors.full_name} />
      </label>
      <label className="field-label mt-5">
        Email
        <input
          value={profile.email}
          readOnly
          className="market-input bg-slate-50 text-slate-500"
        />
        <span className="mt-1.5 block text-xs font-normal text-slate-500">
          Email is managed by your sign-in provider.
        </span>
      </label>
      <label className="field-label mt-5">
        Phone
        <input
          name="phone"
          type="tel"
          minLength={7}
          maxLength={40}
          data-trim-length="true"
          autoComplete="tel"
          defaultValue={profile.phone ?? ""}
          className="market-input"
        />
        <FieldError message={fieldErrors.phone} />
      </label>
      <label className="field-label mt-5">
        Short bio <span className="font-normal text-slate-400">(optional)</span>
        <textarea
          name="bio"
          maxLength={500}
          data-trim-length="true"
          defaultValue={profile.bio ?? ""}
          className="market-textarea"
          placeholder="A little context for people you exchange bikes with."
        />
        <FieldError message={fieldErrors.bio} />
      </label>
      {saved ? (
        <p className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          Profile saved
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-5 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </p>
      ) : null}
      <button type="submit" disabled={busy} className="btn-primary mt-6">
        {busy ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
