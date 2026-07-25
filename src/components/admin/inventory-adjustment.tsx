"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, PencilLine, X } from "lucide-react";

export function InventoryAdjustment({
  variantId,
  locationId,
}: {
  variantId: number;
  locationId: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [delta, setDelta] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/inventory/${variantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationId,
          deltaOnHand: Number(delta),
          reason,
        }),
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(body.error ?? "Inventory could not be adjusted.");
      }
      setDelta("");
      setReason("");
      setOpen(false);
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Inventory could not be adjusted.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700"
      >
        <PencilLine aria-hidden="true" className="h-3.5 w-3.5" />
        Adjust
      </button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="min-w-[18rem] rounded-xl border border-slate-200 bg-slate-50 p-3"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
          Stock adjustment
        </p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close inventory adjustment"
        >
          <X aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-3 grid grid-cols-[6rem_1fr] gap-2">
        <input
          required
          type="number"
          step={1}
          value={delta}
          onChange={(event) => setDelta(event.target.value)}
          placeholder="+ / −"
          aria-label="Change in on-hand quantity"
          className="h-9 rounded-lg border border-slate-300 px-2 text-sm"
        />
        <input
          required
          minLength={2}
          maxLength={500}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Reason"
          aria-label="Adjustment reason"
          className="h-9 rounded-lg border border-slate-300 px-2 text-sm"
        />
      </div>
      {error ? <p className="mt-2 text-xs text-rose-700">{error}</p> : null}
      <button
        type="submit"
        disabled={saving}
        className="mt-2 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 text-xs font-bold text-white disabled:opacity-60"
      >
        {saving ? (
          <LoaderCircle aria-hidden="true" className="h-3.5 w-3.5 animate-spin" />
        ) : null}
        {saving ? "Saving…" : "Apply adjustment"}
      </button>
    </form>
  );
}
