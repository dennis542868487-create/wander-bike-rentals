"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useConfirm, type ConfirmOptions } from "@/components/confirm-dialog";
import { FieldHint } from "@/components/forms/field-hint";
import type {
  ListingStatus,
  SafetyFlagStatus,
} from "@/lib/marketplace/types";
import type { SensitiveTermRow } from "@/lib/marketplace/server-data";

type FlagAction = "dismiss" | "mark_handled" | "pause_listing";

/*
 * mark_handled is deliberately absent: it records a decision already taken and
 * is reversible, so a dialog there would be the kind of reflex confirmation
 * that teaches people to click straight through the ones that matter.
 */
const FLAG_CONFIRM: Partial<Record<FlagAction, ConfirmOptions>> = {
  pause_listing: {
    title: "Pause this listing?",
    description:
      "It comes off public browsing and the owner sees the management note. The account itself is not suspended.",
    confirmLabel: "Pause listing",
    tone: "danger",
  },
  dismiss: {
    title: "Dismiss this signal?",
    description:
      "The listing is left exactly as it is and the signal drops off the open queue.",
    confirmLabel: "Dismiss",
  },
};

const FLAG_DONE: Record<FlagAction, string> = {
  pause_listing: "Listing paused",
  dismiss: "Signal dismissed",
  mark_handled: "Signal marked handled",
};

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
  const confirm = useConfirm();
  const [busy, setBusy] = useState(false);

  async function act(action: FlagAction) {
    const question = FLAG_CONFIRM[action];
    if (question && !(await confirm(question))) return;
    setBusy(true);
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
      toast.success(FLAG_DONE[action]);
      router.refresh();
    } catch (actionError) {
      toast.error(
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
    <div className="flex flex-wrap gap-2">
      {listingStatus === "active" ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => void act("pause_listing")}
          className="btn-danger min-h-9 px-3 py-1.5 text-xs"
        >
          {busy ? "Pausing…" : "Pause listing"}
        </button>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={() => void act("mark_handled")}
          className="btn-secondary min-h-9 px-3 py-1.5 text-xs"
        >
          {busy ? "Saving…" : "Mark handled"}
        </button>
      )}
      <button
        type="button"
        disabled={busy}
        onClick={() => void act("dismiss")}
        className="btn-quiet min-h-9 px-3 py-1.5 text-xs"
      >
        {busy ? "Dismissing…" : "Dismiss signal"}
      </button>
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

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const form_ = event.currentTarget;
    setBusyId("new");
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
      form_.reset();
      toast.success("Term added");
      router.refresh();
    } catch (addError) {
      toast.error(
        addError instanceof Error ? addError.message : "Could not add this term.",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function toggle(term: SensitiveTermRow) {
    setBusyId(term.id);
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
      toast.success(term.active ? "Term disabled" : "Term enabled");
      router.refresh();
    } catch (toggleError) {
      toast.error(
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
        <div>
          <input
            id="new-sensitive-term"
            name="term"
            required
            minLength={2}
            maxLength={80}
            className="market-input mt-0 bg-white"
            placeholder="Add a word or phrase"
          />
          <FieldHint min={2} max={80} />
        </div>
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
          {busyId === "new" ? "Adding…" : "Add term"}
        </button>
      </form>
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
              aria-pressed={term.active}
              /* The colour swap is the whole state indication here, so it gets
                 a transition rather than a hard cut. */
              className={`dash-pressable min-h-9 rounded-lg border px-3 text-xs font-bold transition-colors duration-[160ms] ease-[var(--ease-ui)] disabled:opacity-50 ${
                term.active
                  ? "border-emerald-200 text-emerald-800 hover:bg-emerald-50"
                  : "border-slate-200 text-slate-500 hover:bg-slate-50"
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
