"use client";

import { Archive } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useConfirm } from "@/components/confirm-dialog";

export function ArchiveListingButton({
  listingId,
}: {
  listingId: string;
}) {
  const router = useRouter();
  const confirm = useConfirm();
  const [busy, setBusy] = useState(false);

  async function archive() {
    const confirmed = await confirm({
      title: "Archive this listing?",
      description:
        "It disappears from public browsing straight away. Existing requests stay in your dashboard.",
      confirmLabel: "Archive",
      tone: "danger",
    });
    if (!confirmed) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/marketplace/listings/${listingId}`, {
        method: "DELETE",
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Could not archive listing.");
      toast.success("Listing archived");
      router.refresh();
    } catch (archiveError) {
      toast.error(
        archiveError instanceof Error
          ? archiveError.message
          : "Could not archive listing.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => void archive()}
      className="btn-quiet min-h-10 px-3 py-2 text-sm"
    >
      <Archive className="h-4 w-4" aria-hidden="true" />
      {busy ? "Archiving…" : "Archive"}
    </button>
  );
}
