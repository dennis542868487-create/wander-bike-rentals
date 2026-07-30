"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ListingStatus } from "@/lib/marketplace/types";

export function ListingManagementActions({
  listingId,
  status,
  featured,
  endpointBase = "/api/admin/marketplace/listings",
}: {
  listingId: string;
  status: ListingStatus;
  featured: boolean;
  endpointBase?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [pausing, setPausing] = useState(false);
  const [error, setError] = useState("");

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

  return (
    <div className="min-w-0">
      {pausing ? (
        <label className="field-label mb-2 block">
          Reason shown to the owner
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className="market-textarea min-h-20"
            placeholder="Explain why this listing is being paused."
          />
        </label>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {status === "active" ? (
          pausing ? (
            <>
              <button
                type="button"
                disabled={busy || note.trim().length === 0}
                onClick={() => void update("paused")}
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
      </div>
      {error ? <p className="mt-2 text-xs text-rose-700">{error}</p> : null}
    </div>
  );
}
