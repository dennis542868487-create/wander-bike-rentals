"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useConfirm } from "@/components/confirm-dialog";
import { FieldHint } from "@/components/forms/field-hint";
import type { RequestStatus } from "@/lib/marketplace/types";

const DONE_MESSAGE: Partial<Record<RequestStatus, string>> = {
  accepted: "Request accepted — the rider gets the pickup details",
  declined: "Request declined",
  cancelled: "Request cancelled",
  completed: "Marked completed",
  no_show: "Marked as a no-show",
};

export function RequestActions({
  requestId,
  status,
  viewer,
}: {
  requestId: string;
  status: RequestStatus;
  viewer: "renter" | "owner" | "admin";
}) {
  const router = useRouter();
  const confirm = useConfirm();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [showDecline, setShowDecline] = useState(false);

  async function update(nextStatus: RequestStatus) {
    if (nextStatus === "cancelled") {
      const confirmed = await confirm({
        title: "Cancel this request?",
        description:
          "The other person is notified straight away. You would need to send a new request to pick this up again.",
        confirmLabel: "Cancel request",
        cancelLabel: "Keep it",
        tone: "danger",
      });
      if (!confirmed) return;
    }
    setBusy(true);
    try {
      const response = await fetch(`/api/marketplace/requests/${requestId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          responseNote: note || undefined,
        }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Could not update request.");
      toast.success(DONE_MESSAGE[nextStatus] ?? "Request updated");
      router.refresh();
    } catch (updateError) {
      toast.error(
        updateError instanceof Error
          ? updateError.message
          : "Could not update request.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (viewer === "renter" && ["pending", "accepted"].includes(status)) {
    return (
      <button
        type="button"
        disabled={busy}
        onClick={() => void update("cancelled")}
        className="btn-secondary min-h-10 px-3 py-2 text-sm"
      >
        {busy ? "Cancelling…" : "Cancel request"}
      </button>
    );
  }

  if ((viewer === "owner" || viewer === "admin") && status === "pending") {
    return (
      <div className="w-full">
        {showDecline ? (
          <label className="inline-reveal field-label mb-3">
            Note to the rider
            <textarea
              value={note}
              maxLength={1000}
              onChange={(event) => setNote(event.target.value)}
              className="market-textarea min-h-20"
              placeholder="Optional context about availability"
            />
            <FieldHint length={note.trim().length} max={1000} optional />
          </label>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => void update("accepted")}
            className="btn-primary min-h-10 px-3 py-2 text-sm"
          >
            {busy ? "Saving…" : "Accept"}
          </button>
          {showDecline ? (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={() => void update("declined")}
                className="btn-danger min-h-10 px-3 py-2 text-sm"
              >
                {busy ? "Declining…" : "Confirm decline"}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => setShowDecline(false)}
                className="btn-quiet min-h-10 px-3 py-2 text-sm"
              >
                Back
              </button>
            </>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={() => setShowDecline(true)}
              className="btn-secondary min-h-10 px-3 py-2 text-sm"
            >
              Decline
            </button>
          )}
        </div>
      </div>
    );
  }

  if ((viewer === "owner" || viewer === "admin") && status === "accepted") {
    return (
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => void update("completed")}
          className="btn-primary min-h-10 px-3 py-2 text-sm"
        >
          {busy ? "Saving…" : "Mark completed"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void update("no_show")}
          className="btn-secondary min-h-10 px-3 py-2 text-sm"
        >
          {busy ? "Saving…" : "Mark no-show"}
        </button>
      </div>
    );
  }

  return null;
}
