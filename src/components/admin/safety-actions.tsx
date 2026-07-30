"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type {
  ListingStatus,
  SafetyFlagStatus,
} from "@/lib/marketplace/types";
import type { SensitiveTermRow } from "@/lib/marketplace/server-data";

export function SafetyFlagActions({
  flagId,
  flagStatus,
  listingStatus,
}: {
  flagId: string;
  flagStatus: SafetyFlagStatus;
  listingStatus: ListingStatus;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function act(
    action: "dismiss" | "mark_handled" | "pause_listing",
  ) {
    const prompt =
      action === "pause_listing"
        ? "Pause this listing? The owner will see the management note. The account will not be suspended."
        : action === "dismiss"
          ? "Dismiss this automatic signal without changing the listing?"
          : null;
    if (prompt && !window.confirm(prompt)) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(
        `/api/admin/marketplace/safety/flags/${flagId}`,
        {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ action }),
        },
      );
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Could not resolve this signal.");
      }
      router.refresh();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Could not resolve this signal.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (flagStatus !== "open") return null;
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {listingStatus === "active" ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void act("pause_listing")}
            className="inline-flex min-h-9 items-center rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-700 disabled:opacity-50"
          >
            Pause listing
          </button>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => void act("mark_handled")}
            className="btn-secondary min-h-9 px-3 py-1.5 text-xs"
          >
            Mark handled
          </button>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={() => void act("dismiss")}
          className="btn-quiet min-h-9 px-3 py-1.5 text-xs"
        >
          Dismiss signal
        </button>
      </div>
      {error ? <p className="mt-2 text-xs text-rose-700">{error}</p> : null}
    </div>
  );
}

export function SensitiveTermManager({
  terms,
}: {
  terms: SensitiveTermRow[];
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<number | "new" | null>(null);
  const [error, setError] = useState("");

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusyId("new");
    setError("");
    try {
      const response = await fetch("/api/admin/marketplace/safety/terms", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          term: form.get("term"),
          category: form.get("category"),
        }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Could not add this term.");
      }
      event.currentTarget.reset();
      router.refresh();
    } catch (addError) {
      setError(
        addError instanceof Error ? addError.message : "Could not add this term.",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function toggle(term: SensitiveTermRow) {
    setBusyId(term.id);
    setError("");
    try {
      const response = await fetch(
        `/api/admin/marketplace/safety/terms/${term.id}`,
        {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ active: !term.active }),
        },
      );
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Could not update this term.");
      }
      router.refresh();
    } catch (toggleError) {
      setError(
        toggleError instanceof Error
          ? toggleError.message
          : "Could not update this term.",
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <form
        onSubmit={add}
        className="grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-[minmax(10rem,1fr)_13rem_auto]"
      >
        <label className="sr-only" htmlFor="new-sensitive-term">
          New sensitive term
        </label>
        <input
          id="new-sensitive-term"
          name="term"
          required
          minLength={2}
          maxLength={80}
          className="market-input mt-0 bg-white"
          placeholder="Add a word or phrase"
        />
        <select
          name="category"
          className="market-select mt-0 bg-white"
          aria-label="Sensitive term category"
          defaultValue="sensitive_term"
        >
          <option value="sensitive_term">General sensitive term</option>
          <option value="contact_details">Public contact redirect</option>
          <option value="external_payment">Risky payment wording</option>
        </select>
        <button
          disabled={busyId === "new"}
          className="btn-primary min-h-11 px-4"
        >
          Add term
        </button>
      </form>
      {error ? (
        <p className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </p>
      ) : null}
      <div className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200">
        {terms.map((term) => (
          <div
            key={term.id}
            className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
          >
            <div>
              <p className="font-semibold text-slate-950">{term.term}</p>
              <p className="mt-0.5 text-xs text-slate-500">
                {term.category.replaceAll("_", " ")}
              </p>
            </div>
            <button
              type="button"
              disabled={busyId === term.id}
              onClick={() => void toggle(term)}
              className={`min-h-9 rounded-lg border px-3 text-xs font-bold ${
                term.active
                  ? "border-emerald-200 text-emerald-800"
                  : "border-slate-200 text-slate-500"
              }`}
            >
              {term.active ? "Active" : "Disabled"}
            </button>
          </div>
        ))}
        {terms.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-slate-500">
            No sensitive terms configured.
          </p>
        ) : null}
      </div>
    </div>
  );
}
