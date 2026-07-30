"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function UserRoleSelect({
  userId,
  role,
  disabled,
}: {
  userId: string;
  role: "customer" | "staff" | "admin";
  disabled: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function change(nextRole: string) {
    if (
      !window.confirm(
        `Change this account from ${role} to ${nextRole}?`,
      )
    ) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/marketplace/users/${userId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role: nextRole }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Could not change role.");
      router.refresh();
    } catch (updateError) {
      setError(
        updateError instanceof Error ? updateError.message : "Could not change role.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <select
        value={role}
        disabled={disabled || busy}
        onChange={(event) => void change(event.target.value)}
        aria-label="Account role"
        className="min-h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold disabled:bg-slate-100 disabled:text-slate-500"
      >
        <option value="customer">Customer</option>
        <option value="staff">Staff</option>
        <option value="admin">Admin</option>
      </select>
      {error ? <p className="mt-1 max-w-48 text-xs text-rose-700">{error}</p> : null}
    </div>
  );
}
