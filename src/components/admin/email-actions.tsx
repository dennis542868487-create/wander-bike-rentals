"use client";

import { RefreshCw, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function ProcessEmailButton({
  notificationId,
}: {
  notificationId?: number;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function process() {
    setBusy(true);
    try {
      const response = await fetch("/api/admin/marketplace/email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Could not process email.");
      toast.success(notificationId ? "Email resent" : "Queue processed");
      router.refresh();
    } catch (processError) {
      toast.error(
        processError instanceof Error
          ? processError.message
          : "Could not process email.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => void process()}
      className={notificationId ? "btn-secondary min-h-9 px-3 py-1.5 text-xs" : "btn-primary"}
    >
      {notificationId ? (
        <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
      ) : (
        <Send className="h-4 w-4" aria-hidden="true" />
      )}
      {busy ? "Processing…" : notificationId ? "Retry" : "Process queue"}
    </button>
  );
}
