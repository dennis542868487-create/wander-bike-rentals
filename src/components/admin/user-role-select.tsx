"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useConfirm } from "@/components/confirm-dialog";

const ROLE_LABEL = {
  customer: "Customer",
  staff: "Staff",
  admin: "Admin",
} as const;

type Role = keyof typeof ROLE_LABEL;

export function UserRoleSelect({
  userId,
  role,
  disabled,
}: {
  userId: string;
  role: Role;
  disabled: boolean;
}) {
  const router = useRouter();
  const confirm = useConfirm();
  const [busy, setBusy] = useState(false);
  /*
   * The select is driven by local state rather than the role prop. Confirmation
   * is asynchronous now, so between the change event and the answer the browser
   * is already showing the new option — declining has to put it back, and a
   * prop that never changed cannot do that on its own.
   */
  const [selected, setSelected] = useState<Role>(role);

  async function change(nextRole: Role) {
    setSelected(nextRole);
    const confirmed = await confirm({
      title: `Change this account to ${ROLE_LABEL[nextRole]}?`,
      description: `It is currently ${ROLE_LABEL[role]}. The new role applies the next time the account loads a dashboard.`,
      confirmLabel: "Change role",
    });
    if (!confirmed) {
      setSelected(role);
      return;
    }
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/marketplace/users/${userId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role: nextRole }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Could not change role.");
      toast.success(`Role changed to ${ROLE_LABEL[nextRole]}`);
      router.refresh();
    } catch (updateError) {
      setSelected(role);
      toast.error(
        updateError instanceof Error ? updateError.message : "Could not change role.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <select
      value={selected}
      disabled={disabled || busy}
      onChange={(event) => void change(event.target.value as Role)}
      aria-label="Account role"
      className="dash-pressable min-h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold disabled:bg-slate-100 disabled:text-slate-500"
    >
      {(Object.keys(ROLE_LABEL) as Role[]).map((value) => (
        <option key={value} value={value}>
          {ROLE_LABEL[value]}
        </option>
      ))}
    </select>
  );
}
