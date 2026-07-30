"use client";

import { Archive } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ArchiveListingButton({
  listingId,
}: {
  listingId: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function archive() {
    if (!window.confirm("Archive this listing? It will disappear from public browsing.")) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/marketplace/listings/${listingId}`, {
        method: "DELETE",
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Could not archive listing.");
      router.refresh();
    } catch (archiveError) {
      setError(
        archiveError instanceof Error
          ? archiveError.message
          : "Could not archive listing.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        disabled={busy}
        onClick={() => void archive()}
        className="btn-quiet min-h-10 px-3 py-2 text-sm"
      >
        <Archive className="h-4 w-4" aria-hidden="true" />
        {busy ? "Archiving…" : "Archive"}
      </button>
      {error ? <p className="mt-1 text-xs text-rose-700">{error}</p> : null}
    </div>
  );
}
