"use client";

import { AlertCircle, CheckCircle2, PencilLine, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { canadianProvinceCodes } from "@/lib/commerce/settings-types";

type EditableAddress = {
  addressLine1: string;
  addressLine2: string;
  city: string;
  province: string;
  postalCode: string;
};

export function OrderDetailsEditor({
  orderId,
  canEdit,
  lockedReason,
  fulfillmentMethod,
  customer,
  shippingAddress,
}: {
  orderId: number;
  canEdit: boolean;
  lockedReason: string;
  fulfillmentMethod: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    note: string;
  };
  shippingAddress: EditableAddress;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const requiresAddress = fulfillmentMethod !== "pickup";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");

    const form = new FormData(event.currentTarget);
    const body = {
      firstName: form.get("firstName"),
      lastName: form.get("lastName"),
      email: form.get("email"),
      phone: form.get("phone"),
      customerNote: form.get("customerNote"),
      shippingAddress: requiresAddress
        ? {
            addressLine1: form.get("addressLine1"),
            addressLine2: form.get("addressLine2"),
            city: form.get("city"),
            province: form.get("province"),
            postalCode: form.get("postalCode"),
            country: "CA",
          }
        : null,
    };

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/details`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(result.error ?? "The order details could not be updated.");
      }

      setSuccess("Customer and delivery details updated.");
      router.refresh();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "The order details could not be updated.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <details className="rounded-2xl border border-slate-200 bg-white">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-5 py-4 font-semibold text-slate-950">
        <PencilLine aria-hidden="true" className="h-5 w-5 text-teal-800" />
        Edit unfulfilled order details
      </summary>
      <div className="border-t border-slate-200 p-5">
        {!canEdit ? (
          <div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
            {lockedReason}
          </div>
        ) : (
          <form onSubmit={submit}>
            <p className="text-sm leading-6 text-slate-600">
              Correct customer or delivery details before fulfillment. Payment
              amounts, items, and billing records are not changed.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold text-slate-700">
                First name
                <input
                  name="firstName"
                  required
                  maxLength={100}
                  defaultValue={customer.firstName}
                  className="booking-input"
                />
              </label>
              <label className="text-sm font-semibold text-slate-700">
                Last name
                <input
                  name="lastName"
                  required
                  maxLength={100}
                  defaultValue={customer.lastName}
                  className="booking-input"
                />
              </label>
              <label className="text-sm font-semibold text-slate-700">
                Email
                <input
                  name="email"
                  type="email"
                  required
                  maxLength={320}
                  defaultValue={customer.email}
                  className="booking-input"
                />
              </label>
              <label className="text-sm font-semibold text-slate-700">
                Phone
                <input
                  name="phone"
                  type="tel"
                  minLength={7}
                  maxLength={40}
                  defaultValue={customer.phone}
                  className="booking-input"
                />
              </label>
            </div>

            {requiresAddress ? (
              <fieldset className="mt-5 border-t border-slate-200 pt-5">
                <legend className="pr-3 text-sm font-semibold text-slate-900">
                  Delivery address
                </legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
                    Address
                    <input
                      name="addressLine1"
                      required
                      maxLength={160}
                      defaultValue={shippingAddress.addressLine1}
                      className="booking-input"
                    />
                  </label>
                  <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
                    Unit / suite
                    <input
                      name="addressLine2"
                      maxLength={160}
                      defaultValue={shippingAddress.addressLine2}
                      className="booking-input"
                    />
                  </label>
                  <label className="text-sm font-semibold text-slate-700">
                    City
                    <input
                      name="city"
                      required
                      maxLength={100}
                      defaultValue={shippingAddress.city}
                      className="booking-input"
                    />
                  </label>
                  <label className="text-sm font-semibold text-slate-700">
                    Province
                    <select
                      name="province"
                      required
                      defaultValue={shippingAddress.province}
                      className="booking-input"
                    >
                      {canadianProvinceCodes.map((province) => (
                        <option key={province} value={province}>
                          {province}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm font-semibold text-slate-700">
                    Postal code
                    <input
                      name="postalCode"
                      required
                      maxLength={7}
                      defaultValue={shippingAddress.postalCode}
                      className="booking-input"
                    />
                  </label>
                  <label className="text-sm font-semibold text-slate-700">
                    Country
                    <input
                      value="Canada"
                      readOnly
                      className="booking-input bg-slate-50"
                    />
                  </label>
                </div>
              </fieldset>
            ) : null}

            <label className="mt-5 block text-sm font-semibold text-slate-700">
              Customer note
              <textarea
                name="customerNote"
                rows={3}
                maxLength={500}
                defaultValue={customer.note}
                className="booking-input resize-y"
              />
            </label>

            {error || success ? (
              <div
                role={error ? "alert" : "status"}
                className={`mt-4 flex gap-2 rounded-xl border p-3 text-sm ${
                  error
                    ? "border-rose-200 bg-rose-50 text-rose-800"
                    : "border-emerald-200 bg-emerald-50 text-emerald-800"
                }`}
              >
                {error ? (
                  <AlertCircle
                    aria-hidden="true"
                    className="mt-0.5 h-4 w-4 shrink-0"
                  />
                ) : (
                  <CheckCircle2
                    aria-hidden="true"
                    className="mt-0.5 h-4 w-4 shrink-0"
                  />
                )}
                {error || success}
              </div>
            ) : null}

            <button
              disabled={busy}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              <Save aria-hidden="true" className="h-4 w-4" />
              {busy ? "Saving" : "Save details"}
            </button>
          </form>
        )}
      </div>
    </details>
  );
}
