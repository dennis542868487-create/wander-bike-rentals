"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { FieldError } from "@/components/forms/field-error";
import { useFieldErrors } from "@/components/forms/use-field-errors";
import type { MarketplaceAccessStatus } from "@/lib/marketplace/types";

export function UserAccessActions({
  userId,
  status,
  disabled,
}: {
  userId: string;
  status: MarketplaceAccessStatus;
  disabled: boolean;
}) {
  const router = useRouter();
  const [showReason, setShowReason] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const fieldErrors = useFieldErrors(formRef);

  async function update(nextStatus: MarketplaceAccessStatus) {
    if (
      nextStatus === "active" &&
      !window.confirm(
        "Restore this user’s marketplace access? Previously paused listings stay paused.",
      )
    ) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await fetch(
        `/api/admin/marketplace/users/${userId}/access`,
        {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            status: nextStatus,
            reason: nextStatus === "suspended" ? reason : undefined,
          }),
        },
      );
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Could not update marketplace access.");
      }
      setShowReason(false);
      setReason("");
      router.refresh();
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Could not update marketplace access.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (status === "suspended") {
    return (
      <div>
        <button
          type="button"
          disabled={disabled || busy}
          onClick={() => void update("active")}
          className="btn-secondary min-h-9 px-3 py-1.5 text-xs"
        >
          Restore access
        </button>
        {error ? <p className="mt-2 text-xs text-rose-700">{error}</p> : null}
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={(event) => {
        event.preventDefault();
        void update("suspended");
      }}
    >
      {showReason ? (
        <label className="field-label mb-2 block">
          Suspension reason
          <textarea
            name="reason"
            required
            maxLength={1000}
            data-trim-length="true"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className="market-textarea min-h-20"
            placeholder="Explain the account restriction for the audit record."
          />
          <FieldError message={fieldErrors.reason} />
        </label>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {showReason ? (
          <>
            <button
              type="submit"
              disabled={disabled || busy}
              className="inline-flex min-h-9 items-center rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-700 disabled:opacity-50"
            >
              Suspend and pause listings
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setShowReason(false)}
              className="btn-quiet min-h-9 px-3 py-1.5 text-xs"
            >
              Back
            </button>
          </>
        ) : (
          <button
            type="button"
            disabled={disabled || busy}
            onClick={() => setShowReason(true)}
            className="btn-secondary min-h-9 px-3 py-1.5 text-xs"
          >
            Suspend access
          </button>
        )}
      </div>
      {error ? <p className="mt-2 text-xs text-rose-700">{error}</p> : null}
    </form>
  );
}
