"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { FieldError } from "@/components/forms/field-error";
import { useFieldErrors } from "@/components/forms/use-field-errors";
import type { ListingStatus } from "@/lib/marketplace/types";

export function ListingManagementActions({
  listingId,
  listingTitle,
  status,
  featured,
  endpointBase = "/api/admin/marketplace/listings",
}: {
  listingId: string;
  listingTitle?: string;
  status: ListingStatus;
  featured: boolean;
  endpointBase?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [pausing, setPausing] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const fieldErrors = useFieldErrors(formRef);

  async function update(
    nextStatus: ListingStatus | undefined,
    nextFeatured = featured,
  ) {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(
        `${endpointBase}/${listingId}`,
        {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            ...(nextStatus ? { status: nextStatus } : {}),
            managementNote: note || undefined,
            featured: nextFeatured,
          }),
        },
      );
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Could not update listing.");
      router.refresh();
      setPausing(false);
      setNote("");
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Could not update listing.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    const confirmed = window.confirm(
      "Permanently delete “" +
        (listingTitle ?? "this bike") +
        "”? This cannot be undone.",
    );
    if (!confirmed) return;

    setBusy(true);
    setError("");
    try {
      const response = await fetch(endpointBase + "/" + listingId, {
        method: "DELETE",
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Could not delete listing.");
      }
      router.refresh();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Could not delete listing.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      ref={formRef}
      className="min-w-0"
      onSubmit={(event) => {
        event.preventDefault();
        void update("paused");
      }}
    >
      {pausing ? (
        <label className="field-label mb-2 block">
          Reason shown to the owner
          <textarea
            name="management_note"
            required
            maxLength={1000}
            data-trim-length="true"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className="market-textarea min-h-20"
            placeholder="Explain why this listing is being paused."
          />
          <FieldError message={fieldErrors.management_note} />
        </label>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {status === "active" ? (
          pausing ? (
            <>
              <button
                type="submit"
                disabled={busy}
                className="inline-flex min-h-9 items-center rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-700 disabled:opacity-50"
              >
                Confirm pause
              </button>
              <button
                type="button"
                onClick={() => setPausing(false)}
                className="btn-quiet min-h-9 px-3 py-1.5 text-xs"
              >
                Back
              </button>
            </>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={() => setPausing(true)}
              className="btn-secondary min-h-9 px-3 py-1.5 text-xs"
            >
              Pause listing
            </button>
          )
        ) : null}
        {status === "paused" ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void update("active")}
            className="btn-primary min-h-9 px-3 py-1.5 text-xs"
          >
            Reactivate
          </button>
        ) : null}
        {!["archived", "sold"].includes(status) ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void update(undefined, !featured)}
            className="btn-quiet min-h-9 px-3 py-1.5 text-xs"
          >
            {featured ? "Unfeature" : "Feature"}
          </button>
        ) : null}
        <button
          type="button"
          disabled={busy}
          onClick={() => void remove()}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-700 transition hover:border-rose-300 hover:bg-rose-50 disabled:opacity-50"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          {busy ? "Working…" : "Delete"}
        </button>
      </div>
      {error ? (
        <p className="mt-2 text-xs text-rose-700" aria-live="polite">
          {error}
        </p>
      ) : null}
    </form>
  );
}
