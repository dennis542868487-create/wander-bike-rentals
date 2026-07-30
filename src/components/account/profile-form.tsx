"use client";

import { CheckCircle2 } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { FieldError } from "@/components/forms/field-error";
import { FieldHint } from "@/components/forms/field-hint";
import { useBlockedSubmitMessage } from "@/components/forms/use-blocked-submit";
import { useFieldErrors } from "@/components/forms/use-field-errors";
import { useFieldLengths } from "@/components/forms/use-field-lengths";
import type { MarketplaceProfile } from "@/lib/marketplace/server-data";

const inputNameBySchemaField: Record<string, string> = {
  fullName: "full_name",
  phone: "phone",
  bio: "bio",
};

export function ProfileForm({ profile }: { profile: MarketplaceProfile }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const liveErrors = useFieldErrors(formRef);
  const lengths = useFieldLengths(formRef);

  const fieldErrors: Record<string, string> = { ...serverErrors };
  for (const [name, message] of Object.entries(liveErrors)) {
    if (message) fieldErrors[name] = message;
  }

  useBlockedSubmitMessage(formRef, (message) => {
    setSaved(false);
    setError(`Profile not saved. ${message}`);
  });

  function clearServerError(event: FormEvent<HTMLFormElement>) {
    const target = event.target;
    if (
      !(target instanceof HTMLInputElement) &&
      !(target instanceof HTMLTextAreaElement)
    ) {
      return;
    }
    setServerErrors((current) => {
      if (!target.name || !(target.name in current)) return current;
      const next = { ...current };
      delete next[target.name];
      return next;
    });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSaved(false);
    setServerErrors({});
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
      const payload = (await response.json()) as {
        error?: string;
        fieldErrors?: Record<string, string>;
      };
      if (!response.ok) {
        const mapped: Record<string, string> = {};
        for (const [key, message] of Object.entries(payload.fieldErrors ?? {})) {
          const inputName = inputNameBySchemaField[key];
          if (inputName) mapped[inputName] = message;
        }
        setServerErrors(mapped);
        throw new Error(payload.error ?? "Could not save profile.");
      }
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
    <form
      ref={formRef}
      onSubmit={submit}
      onInput={clearServerError}
      onChange={clearServerError}
      className="max-w-2xl rounded-[0.9rem] border border-slate-200 bg-white p-6 sm:p-8"
    >
      <label className="field-label">
        Full name
        <input
          name="full_name"
          required
          maxLength={120}
          autoComplete="name"
          defaultValue={profile.fullName ?? ""}
          className="market-input"
        />
        <FieldHint length={lengths.full_name} max={120} />
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
        Phone <span className="font-normal text-slate-400">(optional)</span>
        <input
          name="phone"
          type="tel"
          maxLength={40}
          autoComplete="tel"
          defaultValue={profile.phone ?? ""}
          className="market-input"
        />
        <FieldHint length={lengths.phone} max={40} optional />
        <FieldError message={fieldErrors.phone} />
      </label>
      <label className="field-label mt-5">
        Short bio <span className="font-normal text-slate-400">(optional)</span>
        <textarea
          name="bio"
          maxLength={500}
          defaultValue={profile.bio ?? ""}
          className="market-textarea"
          placeholder="A little context for people you exchange bikes with."
        />
        <FieldHint length={lengths.bio} max={500} optional />
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
