"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  BellRing,
  FileDown,
  LoaderCircle,
  PackageCheck,
  PackageOpen,
  Plus,
  Trash2,
  Undo2,
} from "lucide-react";

async function jsonRequest(url: string, init: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init.headers },
  });
  const body = (await response.json()) as {
    error?: string;
    code?: string;
    shipment?: Record<string, unknown>;
  };
  if (!response.ok) throw new Error(body.error ?? "The operation failed.");
  return body;
}

function Message({ value, error }: { value: string; error?: boolean }) {
  if (!value) return null;
  return (
    <p
      role={error ? "alert" : "status"}
      className={`mt-3 rounded-xl px-3 py-2 text-xs ${
        error ? "bg-rose-50 text-rose-800" : "bg-emerald-50 text-emerald-800"
      }`}
    >
      {value}
    </p>
  );
}

export function CanadaPostLabelAction({
  orderId,
  paymentStatus,
  serviceCode,
  serviceName,
  packageDetails,
  existingShipments,
}: {
  orderId: number;
  paymentStatus: string;
  serviceCode: string;
  serviceName: string;
  packageDetails: {
    weightKg: number;
    lengthCm: number;
    widthCm: number;
    heightCm: number;
  };
  existingShipments: Array<{
    id: number;
    status: string;
    idempotencyKey: string;
    labelStoragePath: string;
    trackingPin: string;
    refundTicket: string;
    packageDetails: {
      packageNumber: number;
      packageCount: number;
      weightKg: number;
      lengthCm: number;
      widthCm: number;
      heightCm: number;
    };
  }>;
}) {
  const router = useRouter();
  const [packages, setPackages] = useState(() => {
    const desiredCount = Math.max(
      1,
      ...existingShipments.map(
        (shipment) => shipment.packageDetails.packageCount || 1,
      ),
    );
    return Array.from({ length: desiredCount }, (_, index) => {
      const packageNumber = index + 1;
      const existing = existingShipments.find(
        (shipment) =>
          shipment.packageDetails.packageNumber === packageNumber,
      );
      return {
        idempotencyKey: existing?.idempotencyKey || crypto.randomUUID(),
        packageNumber,
        weightKg:
          existing?.packageDetails.weightKg || packageDetails.weightKg,
        lengthCm:
          existing?.packageDetails.lengthCm || packageDetails.lengthCm,
        widthCm: existing?.packageDetails.widthCm || packageDetails.widthCm,
        heightCm:
          existing?.packageDetails.heightCm || packageDetails.heightCm,
      };
    });
  });
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const packageStructureLocked = existingShipments.length > 0;

  async function createLabel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("create");
    setError("");
    setSuccess("");
    try {
      for (const parcel of packages) {
        await jsonRequest(`/api/admin/orders/${orderId}/shipping-label`, {
          method: "POST",
          body: JSON.stringify({
            idempotencyKey: parcel.idempotencyKey,
            package: {
              packageNumber: parcel.packageNumber,
              packageCount: packages.length,
              weightKg: parcel.weightKg,
              lengthCm: parcel.lengthCm,
              widthCm: parcel.widthCm,
              heightCm: parcel.heightCm,
            },
          }),
        });
      }
      setSuccess(
        `${packages.length} Canada Post sandbox label(s) created and stored privately.`,
      );
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Label creation failed.");
    } finally {
      setBusy("");
    }
  }

  async function cancelLabel(
    event: FormEvent<HTMLFormElement>,
    shipmentId: number,
  ) {
    event.preventDefault();
    setBusy(`cancel-${shipmentId}`);
    setError("");
    setSuccess("");
    const form = new FormData(event.currentTarget);
    try {
      const result = await jsonRequest(
        `/api/admin/shipments/${shipmentId}/cancel`,
        {
          method: "POST",
          body: JSON.stringify({
            email: form.get("email"),
            confirmation: form.get("confirmation"),
          }),
        },
      );
      const status =
        typeof result.shipment?.status === "string"
          ? result.shipment.status
          : "updated";
      setSuccess(
        status === "refund_pending"
          ? "Canada Post refund request submitted."
          : "Canada Post sandbox label voided.",
      );
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Label cancellation failed.",
      );
    } finally {
      setBusy("");
    }
  }

  return (
    <section className="rounded-2xl border border-sky-200 bg-white p-5">
      <div className="flex items-center gap-2">
        <PackageCheck aria-hidden="true" className="h-5 w-5 text-sky-700" />
        <h2 className="font-semibold text-slate-950">Canada Post test label</h2>
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-500">
        {serviceName || serviceCode}. Confirm the packed parcel before creating
        sandbox labels. Each parcel receives its own tracking number and private
        PDF. Full bicycles remain pickup-only.
      </p>

      <form onSubmit={createLabel} className="mt-4">
        <div className="space-y-3">
          {packages.map((parcel, index) => {
            const existing = existingShipments.find(
              (shipment) =>
                shipment.packageDetails.packageNumber === parcel.packageNumber,
            );
            const labelReady =
              existing?.status === "label_created" &&
              Boolean(existing.labelStoragePath);
            return (
              <div
                key={parcel.idempotencyKey}
                className="rounded-xl border border-sky-100 bg-sky-50/50 p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold text-slate-900">
                    Parcel {index + 1} of {packages.length}
                  </p>
                  {!packageStructureLocked && packages.length > 1 ? (
                    <button
                      type="button"
                      onClick={() =>
                        setPackages((current) =>
                          current
                            .filter((_, packageIndex) => packageIndex !== index)
                            .map((item, packageIndex) => ({
                              ...item,
                              packageNumber: packageIndex + 1,
                            })),
                        )
                      }
                      className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700"
                    >
                      <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  ) : null}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {(
                    [
                      ["weightKg", "Weight (kg)", "0.001", "30", "0.001"],
                      ["lengthCm", "Length (cm)", "0.1", "300", "0.1"],
                      ["widthCm", "Width (cm)", "0.1", "300", "0.1"],
                      ["heightCm", "Height (cm)", "0.1", "300", "0.1"],
                    ] as const
                  ).map(([field, label, min, max, step]) => (
                    <label
                      key={field}
                      className="text-xs font-semibold text-slate-600"
                    >
                      {label}
                      <input
                        type="number"
                        min={min}
                        max={max}
                        step={step}
                        value={parcel[field]}
                        disabled={labelReady}
                        onChange={(inputEvent) =>
                          setPackages((current) =>
                            current.map((item, packageIndex) =>
                              packageIndex === index
                                ? {
                                    ...item,
                                    [field]: Number(inputEvent.target.value),
                                  }
                                : item,
                            ),
                          )
                        }
                        required
                        className="booking-input disabled:bg-slate-100"
                      />
                    </label>
                  ))}
                </div>
                {existing ? (
                  <div className="mt-3 border-t border-sky-100 pt-3">
                    <p className="text-xs font-semibold text-emerald-800">
                      {labelReady
                        ? `Label ready · ${
                            existing.trackingPin || "tracking pending"
                          }`
                        : `Label state: ${existing.status}`}
                    </p>
                    {labelReady ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        <a
                          href={`/api/admin/shipments/${existing.id}/label`}
                          className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white"
                        >
                          <FileDown aria-hidden="true" className="h-3.5 w-3.5" />
                          Download PDF
                        </a>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        {!packageStructureLocked && packages.length < 50 ? (
          <button
            type="button"
            onClick={() =>
              setPackages((current) => [
                ...current,
                {
                  idempotencyKey: crypto.randomUUID(),
                  packageNumber: current.length + 1,
                  ...packageDetails,
                },
              ])
            }
            className="mt-3 inline-flex items-center gap-2 rounded-lg border border-sky-300 bg-white px-3 py-2 text-xs font-bold text-sky-800"
          >
            <Plus aria-hidden="true" className="h-3.5 w-3.5" />
            Add another parcel
          </button>
        ) : null}

        {existingShipments.some(
          (shipment) => shipment.status !== "label_created",
        ) ||
        existingShipments.length < packages.length ? (
          <button
            disabled={
              busy !== "" ||
              !["paid", "partially_refunded"].includes(paymentStatus)
            }
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-sky-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy === "create" ? (
              <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
            ) : null}
            {busy === "create"
              ? "Creating…"
              : `Create ${packages.length} sandbox label${
                  packages.length === 1 ? "" : "s"
                }`}
          </button>
        ) : null}
      </form>

      {existingShipments
        .filter((shipment) => shipment.status === "label_created")
        .map((shipment) => (
          <form
            key={`cancel-${shipment.id}`}
            onSubmit={(event) => cancelLabel(event, shipment.id)}
            className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3"
          >
            <div className="flex items-center gap-2">
              <Undo2 aria-hidden="true" className="h-4 w-4 text-rose-700" />
              <p className="text-xs font-bold text-rose-900">
                Void / refund parcel{" "}
                {shipment.packageDetails.packageNumber || 1}
              </p>
            </div>
            <p className="mt-1 text-xs leading-5 text-rose-800">
              Contract labels are voided before transmit; eligible paid labels
              use Canada Post&apos;s refund request workflow.
            </p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <input
                name="email"
                type="email"
                maxLength={60}
                required
                placeholder="Refund contact email"
                className="h-10 rounded-lg border border-rose-200 px-3 text-xs"
              />
              <input
                name="confirmation"
                required
                pattern="VOID"
                placeholder="Type VOID"
                className="h-10 rounded-lg border border-rose-200 px-3 text-xs"
              />
            </div>
            <button
              disabled={busy !== ""}
              className="mt-2 inline-flex items-center gap-2 rounded-lg bg-rose-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
            >
              {busy === `cancel-${shipment.id}` ? (
                <LoaderCircle
                  aria-hidden="true"
                  className="h-3.5 w-3.5 animate-spin"
                />
              ) : null}
              Submit cancellation
            </button>
            {shipment.refundTicket ? (
              <p className="mt-2 text-xs text-rose-800">
                Refund ticket: {shipment.refundTicket}
              </p>
            ) : null}
          </form>
        ))}
      <Message value={error} error />
      <Message value={success} />
    </section>
  );
}

type ReturnItem = {
  orderItemId: number;
  productName: string;
  variantTitle: string;
  quantity: number;
};

type ReturnRecord = {
  id: number;
  returnNumber: string;
  status: string;
  reason: string;
  resolution: string;
};

function nextReturnStatuses(status: string) {
  if (status === "requested") return ["approved", "rejected", "cancelled"];
  if (status === "approved") return ["received", "cancelled"];
  if (status === "received") return ["completed"];
  return [];
}

export function ReturnActions({
  orderId,
  items,
  returns,
}: {
  orderId: number;
  items: ReturnItem[];
  returns: ReturnRecord[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function createReturn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("create");
    setError("");
    setSuccess("");
    const form = new FormData(event.currentTarget);
    const selectedItems = items
      .map((item) => ({
        orderItemId: item.orderItemId,
        quantity: Number(form.get(`item-${item.orderItemId}`)),
      }))
      .filter((item) => item.quantity > 0);

    try {
      await jsonRequest(`/api/admin/orders/${orderId}/returns`, {
        method: "POST",
        body: JSON.stringify({
          reason: form.get("reason"),
          items: selectedItems,
        }),
      });
      setSuccess("Return opened and customer notification queued.");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Return creation failed.");
    } finally {
      setBusy("");
    }
  }

  async function updateReturn(
    event: FormEvent<HTMLFormElement>,
    returnId: number,
  ) {
    event.preventDefault();
    setBusy(`return-${returnId}`);
    setError("");
    setSuccess("");
    const form = new FormData(event.currentTarget);
    try {
      await jsonRequest(`/api/admin/returns/${returnId}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: form.get("status"),
          resolution: form.get("resolution"),
        }),
      });
      setSuccess("Return status updated and notification queued.");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Return update failed.");
    } finally {
      setBusy("");
    }
  }

  return (
    <section className="rounded-2xl border border-amber-200 bg-white p-5">
      <div className="flex items-center gap-2">
        <PackageOpen aria-hidden="true" className="h-5 w-5 text-amber-700" />
        <h2 className="font-semibold text-slate-950">Returns</h2>
      </div>

      {returns.length > 0 ? (
        <div className="mt-4 space-y-4">
          {returns.map((entry) => {
            const nextStatuses = nextReturnStatuses(entry.status);
            return (
              <form
                key={entry.id}
                onSubmit={(event) => updateReturn(event, entry.id)}
                className="rounded-xl bg-amber-50 p-3"
              >
                <p className="text-sm font-bold text-slate-900">
                  {entry.returnNumber}
                </p>
                <p className="mt-1 text-xs text-slate-600">{entry.reason}</p>
                {nextStatuses.length > 0 ? (
                  <>
                    <select name="status" className="booking-input">
                      {nextStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <input
                      name="resolution"
                      defaultValue={entry.resolution}
                      placeholder="Resolution or inspection note"
                      className="booking-input"
                    />
                    <button
                      disabled={busy !== ""}
                      className="mt-3 rounded-lg bg-amber-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                    >
                      {busy === `return-${entry.id}` ? "Saving…" : "Update return"}
                    </button>
                  </>
                ) : (
                  <p className="mt-2 text-xs font-semibold capitalize text-amber-800">
                    {entry.status}
                    {entry.resolution ? ` · ${entry.resolution}` : ""}
                  </p>
                )}
              </form>
            );
          })}
        </div>
      ) : null}

      <form onSubmit={createReturn} className="mt-5 border-t border-amber-100 pt-4">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
          Open a return
        </p>
        <div className="mt-3 space-y-2">
          {items.map((item) => (
            <label
              key={item.orderItemId}
              className="grid grid-cols-[1fr_4.5rem] items-center gap-3 text-xs text-slate-700"
            >
              <span>
                <strong className="block text-slate-900">{item.productName}</strong>
                {item.variantTitle} · ordered {item.quantity}
              </span>
              <input
                name={`item-${item.orderItemId}`}
                type="number"
                min={0}
                max={item.quantity}
                defaultValue={0}
                aria-label={`Return quantity for ${item.productName}`}
                className="h-9 rounded-lg border border-slate-300 px-2"
              />
            </label>
          ))}
        </div>
        <textarea
          name="reason"
          required
          minLength={2}
          maxLength={1000}
          rows={3}
          placeholder="Reason for return"
          className="booking-input"
        />
        <button
          disabled={busy !== ""}
          className="mt-3 rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
        >
          {busy === "create" ? "Opening…" : "Open return"}
        </button>
      </form>
      <Message value={error} error />
      <Message value={success} />
    </section>
  );
}

export function OrderNotificationAction({ orderId }: { orderId: number }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function queue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");
    const form = new FormData(event.currentTarget);
    try {
      await jsonRequest(`/api/admin/orders/${orderId}/notifications`, {
        method: "POST",
        body: JSON.stringify({ templateKey: form.get("templateKey") }),
      });
      setSuccess("Email queued for delivery.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Email could not be queued.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={queue}
      className="rounded-2xl border border-violet-200 bg-white p-5"
    >
      <div className="flex items-center gap-2">
        <BellRing aria-hidden="true" className="h-5 w-5 text-violet-700" />
        <h2 className="font-semibold text-slate-950">Resend notification</h2>
      </div>
      <select name="templateKey" className="booking-input">
        <option value="order_confirmation">Order confirmation</option>
        <option value="payment_failed">Payment failed</option>
        <option value="order_preparing">Preparing</option>
        <option value="order_ready_for_pickup">Ready for pickup</option>
        <option value="order_ready_to_ship">Ready to ship</option>
        <option value="tracking_created">Tracking created</option>
        <option value="order_shipped">Shipped</option>
        <option value="order_delivered">Delivered</option>
        <option value="order_picked_up">Picked up</option>
        <option value="order_cancelled">Cancelled</option>
        <option value="refund_partial">Partial refund</option>
        <option value="refund_full">Full refund</option>
        <option value="return_status_updated">Return update</option>
      </select>
      <button
        disabled={busy}
        className="mt-3 rounded-lg bg-violet-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
      >
        {busy ? "Queueing…" : "Queue email"}
      </button>
      <Message value={error} error />
      <Message value={success} />
    </form>
  );
}
