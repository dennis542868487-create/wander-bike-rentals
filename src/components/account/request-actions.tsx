"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { FieldError } from "@/components/forms/field-error";
import { useFieldErrors } from "@/components/forms/use-field-errors";
import type { RequestStatus } from "@/lib/marketplace/types";

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
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [showDecline, setShowDecline] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const fieldErrors = useFieldErrors(formRef);

  async function update(nextStatus: RequestStatus) {
    if (
      nextStatus === "cancelled" &&
      !window.confirm("Cancel this request? The other person will be notified.")
    ) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/marketplace/requests/${requestId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          responseNote: note.trim() || undefined,
        }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Could not update request.");
      router.refresh();
    } catch (updateError) {
      setError(
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
      <div>
        <button
          type="button"
          disabled={busy}
          onClick={() => void update("cancelled")}
          className="btn-secondary min-h-10 px-3 py-2 text-sm"
        >
          {busy ? "Cancelling…" : "Cancel request"}
        </button>
        {error ? <p className="mt-2 text-sm text-rose-700">{error}</p> : null}
      </div>
    );
  }

  if ((viewer === "owner" || viewer === "admin") && status === "pending") {
    return (
      <form
        ref={formRef}
        className="w-full"
        onSubmit={(event) => {
          event.preventDefault();
          const submitter = (event.nativeEvent as SubmitEvent)
            .submitter as HTMLButtonElement | null;
          void update(submitter?.value === "declined" ? "declined" : "accepted");
        }}
      >
        <label className="field-label mb-3">
          Note to the rider{" "}
          <span className="font-normal text-slate-400">(optional)</span>
          <textarea
            name="response_note"
            value={note}
            maxLength={1000}
            data-trim-length="true"
            onChange={(event) => setNote(event.target.value)}
            className="market-textarea min-h-20"
            placeholder="Pickup instructions, availability details, or a short reply"
          />
          <span className="mt-1.5 block text-xs font-normal text-slate-500">
            This note is saved and included in the acceptance or decline email.
          </span>
          <FieldError message={fieldErrors.response_note} />
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            name="request_status"
            value="accepted"
            disabled={busy}
            className="btn-primary min-h-10 px-3 py-2 text-sm"
          >
            {busy ? "Saving…" : "Accept"}
          </button>
          {showDecline ? (
            <>
              <button
                type="submit"
                name="request_status"
                value="declined"
                disabled={busy}
                className="inline-flex min-h-10 items-center justify-center rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-bold text-rose-700 hover:bg-rose-50"
              >
                Confirm decline
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setShowDecline(false);
                  setError("");
                }}
                className="btn-quiet min-h-10 px-3 py-2 text-sm"
              >
                Back
              </button>
            </>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setShowDecline(true);
                setError("");
              }}
              className="btn-secondary min-h-10 px-3 py-2 text-sm"
            >
              Decline
            </button>
          )}
        </div>
        {error ? <p className="mt-2 text-sm text-rose-700">{error}</p> : null}
      </form>
    );
  }

  if ((viewer === "owner" || viewer === "admin") && status === "accepted") {
    return (
      <div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => void update("completed")}
            className="btn-primary min-h-10 px-3 py-2 text-sm"
          >
            Mark completed
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void update("no_show")}
            className="btn-secondary min-h-10 px-3 py-2 text-sm"
          >
            Mark no-show
          </button>
        </div>
        {error ? <p className="mt-2 text-sm text-rose-700">{error}</p> : null}
      </div>
    );
  }

  return null;
}
