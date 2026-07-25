"use client";

import {
  AlertCircle,
  CheckCircle2,
  PackagePlus,
  RotateCcw,
  Save,
  Truck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { formatCad } from "@/lib/commerce/money";

type ActionItem = {
  variantId: number | null;
  productName: string;
  variantTitle: string;
  quantity: number;
};

async function adminRequest(url: string, init: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init.headers },
  });
  const data = (await response.json()) as {
    error?: string;
    result?: unknown;
  };
  if (!response.ok) throw new Error(data.error ?? "The admin action failed.");
  return data;
}

function ActionMessage({
  error,
  success,
}: {
  error: string;
  success: string;
}) {
  if (!error && !success) return null;
  return (
    <div
      role={error ? "alert" : "status"}
      className={`mt-4 flex gap-2 rounded-xl border p-3 text-sm ${
        error
          ? "border-rose-200 bg-rose-50 text-rose-800"
          : "border-emerald-200 bg-emerald-50 text-emerald-800"
      }`}
    >
      {error ? (
        <AlertCircle aria-hidden="true" className="h-4 w-4 shrink-0" />
      ) : (
        <CheckCircle2 aria-hidden="true" className="h-4 w-4 shrink-0" />
      )}
      {error || success}
    </div>
  );
}

export function OrderActions({
  order,
  items,
  role,
}: {
  order: {
    id: number;
    paymentStatus: string;
    fulfillmentStatus: string;
    fulfillmentMethod: string;
    totalCents: number;
    refundedTotalCents: number;
    internalNote: string;
  };
  items: ActionItem[];
  role: "staff" | "admin";
}) {
  const router = useRouter();
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [trackingKey, setTrackingKey] = useState(() => crypto.randomUUID());
  const [refundKey, setRefundKey] = useState(() => crypto.randomUUID());
  const refundableCents = Math.max(
    order.totalCents - order.refundedTotalCents,
    0,
  );

  function resetMessages() {
    setError("");
    setSuccess("");
  }

  async function updateFulfillment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetMessages();
    setBusy("fulfillment");
    const form = new FormData(event.currentTarget);
    try {
      await adminRequest(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          fulfillmentStatus: form.get("fulfillmentStatus"),
          internalNote: form.get("internalNote"),
        }),
      });
      setSuccess("Fulfillment and internal note updated.");
      router.refresh();
    } catch (actionError) {
      setError(
        actionError instanceof Error ? actionError.message : "Update failed.",
      );
    } finally {
      setBusy("");
    }
  }

  async function addTracking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetMessages();
    setBusy("tracking");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      await adminRequest(`/api/admin/orders/${order.id}/tracking`, {
        method: "POST",
        body: JSON.stringify({
          provider: form.get("provider"),
          serviceName: form.get("serviceName"),
          trackingPin: form.get("trackingPin"),
          trackingUrl: form.get("trackingUrl"),
          idempotencyKey: trackingKey,
        }),
      });
      setSuccess("Tracking saved and shipment notification queued.");
      setTrackingKey(crypto.randomUUID());
      formElement.reset();
      router.refresh();
    } catch (actionError) {
      setError(
        actionError instanceof Error ? actionError.message : "Tracking failed.",
      );
    } finally {
      setBusy("");
    }
  }

  async function issueRefund(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetMessages();
    setBusy("refund");
    const form = new FormData(event.currentTarget);
    const amountCents = Math.round(Number(form.get("amount")) * 100);
    const restockItems = form.get("restockItems") === "on";
    try {
      await adminRequest(`/api/admin/orders/${order.id}/refunds`, {
        method: "POST",
        body: JSON.stringify({
          amountCents,
          reason: form.get("reason"),
          restockItems,
          items: restockItems
            ? items
                .filter(
                  (item): item is ActionItem & { variantId: number } =>
                    item.variantId != null,
                )
                .map((item) => ({
                  variantId: item.variantId,
                  quantity: item.quantity,
                }))
            : [],
          idempotencyKey: refundKey,
        }),
      });
      setSuccess("Stripe test refund completed or queued for reconciliation.");
      setRefundKey(crypto.randomUUID());
      router.refresh();
    } catch (actionError) {
      setError(
        actionError instanceof Error ? actionError.message : "Refund failed.",
      );
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="space-y-5">
      <ActionMessage error={error} success={success} />

      <form
        onSubmit={updateFulfillment}
        className="rounded-2xl border border-slate-200 bg-white p-5"
      >
        <div className="flex items-center gap-2">
          <PackagePlus aria-hidden="true" className="h-5 w-5 text-teal-800" />
          <h2 className="font-semibold text-slate-950">Fulfillment & notes</h2>
        </div>
        <label className="mt-4 block text-sm font-semibold text-slate-700">
          Fulfillment status
          <select
            name="fulfillmentStatus"
            defaultValue={order.fulfillmentStatus}
            className="booking-input"
          >
            {[
              "reserved",
              "preparing",
              order.fulfillmentMethod === "pickup"
                ? "ready_for_pickup"
                : "ready_to_ship",
              ...(order.fulfillmentMethod === "pickup"
                ? ["picked_up"]
                : ["shipped", "delivered"]),
              "returned",
              "cancelled",
            ].map((status) => (
              <option key={status} value={status}>
                {status.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>
        <label className="mt-4 block text-sm font-semibold text-slate-700">
          Internal note
          <textarea
            name="internalNote"
            rows={4}
            maxLength={2000}
            defaultValue={order.internalNote}
            className="booking-input resize-y"
          />
        </label>
        <button
          disabled={busy !== ""}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          <Save aria-hidden="true" className="h-4 w-4" />
          {busy === "fulfillment" ? "Saving" : "Save order"}
        </button>
      </form>

      {order.fulfillmentMethod !== "pickup" ? (
        <form
          onSubmit={addTracking}
          className="rounded-2xl border border-slate-200 bg-white p-5"
        >
          <div className="flex items-center gap-2">
            <Truck aria-hidden="true" className="h-5 w-5 text-teal-800" />
            <h2 className="font-semibold text-slate-950">Manual tracking</h2>
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Use this for an external or manually created shipment. Canada Post
            label creation is handled separately.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold text-slate-700">
              Provider
              <select name="provider" className="booking-input">
                <option value="canada_post">Canada Post</option>
                <option value="local_delivery">Local delivery</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Service
              <input
                name="serviceName"
                required
                placeholder="Expedited Parcel"
                className="booking-input"
              />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Tracking number
              <input name="trackingPin" required className="booking-input" />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Tracking URL
              <input
                name="trackingUrl"
                type="url"
                placeholder="https://..."
                className="booking-input"
              />
            </label>
          </div>
          <button
            disabled={busy !== ""}
            className="mt-4 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy === "tracking" ? "Saving" : "Save tracking"}
          </button>
        </form>
      ) : null}

      {role === "admin" && refundableCents > 0 ? (
        <form
          onSubmit={issueRefund}
          className="rounded-2xl border border-rose-200 bg-white p-5"
        >
          <div className="flex items-center gap-2">
            <RotateCcw aria-hidden="true" className="h-5 w-5 text-rose-700" />
            <h2 className="font-semibold text-slate-950">Stripe test refund</h2>
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Remaining refundable balance: {formatCad(refundableCents)}. This
            action is idempotent and recorded in the audit log.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold text-slate-700">
              Amount (CAD)
              <input
                name="amount"
                type="number"
                min="0.01"
                max={(refundableCents / 100).toFixed(2)}
                step="0.01"
                defaultValue={(refundableCents / 100).toFixed(2)}
                required
                className="booking-input"
              />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Reason
              <input
                name="reason"
                required
                placeholder="Customer requested return"
                className="booking-input"
              />
            </label>
          </div>
          <label className="mt-4 flex items-start gap-3 text-sm text-slate-700">
            <input
              name="restockItems"
              type="checkbox"
              className="mt-1 h-4 w-4 accent-teal-700"
            />
            <span>
              <strong className="block text-slate-900">
                Return all order items to sellable inventory
              </strong>
              Only select this after the items are physically received and
              inspected.
            </span>
          </label>
          <button
            disabled={busy !== "" || order.paymentStatus === "pending"}
            className="mt-4 rounded-xl bg-rose-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy === "refund" ? "Refunding" : "Issue test refund"}
          </button>
        </form>
      ) : null}
    </div>
  );
}
