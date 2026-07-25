"use client";

import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  LoaderCircle,
  LockKeyhole,
  Package,
  Store,
  Truck,
} from "lucide-react";
import {
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { useCart } from "@/components/commerce/cart-provider";
import { formatCad } from "@/lib/commerce/money";
import {
  checkoutRequestSchema,
  formatCanadianPostalCode,
  shippingRateRequestSchema,
} from "@/lib/commerce/schemas";
import { calculateManualTax } from "@/lib/commerce/pricing";
import { getCartFulfillmentAvailability } from "@/lib/commerce/fulfillment-availability";
import type {
  CanadianProvinceCode,
  PublicCheckoutSettings,
} from "@/lib/commerce/settings-types";
import type { FulfillmentMethod } from "@/lib/commerce/types";

type ShippingRate = {
  id: string;
  serviceCode: string;
  serviceName: string;
  amountCents: number;
  currency: string;
  estimatedTransitDays: number | null;
  expectedDeliveryDate: string | null;
  expiresAt: string;
};

type LocalDeliveryQuote = {
  eligible: boolean;
  postalCode: string;
  postalCodePrefix: string;
  feeCents: number;
  reason: string | null;
};

type ShippingFallback = {
  requestKey: string;
  reason: string;
};

type ContactState = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
};

type AddressState = {
  addressLine1: string;
  addressLine2: string;
  city: string;
  province: CanadianProvinceCode;
  postalCode: string;
  country: "CA";
};

const initialContact: ContactState = {
  email: "",
  firstName: "",
  lastName: "",
  phone: "",
};

const initialAddress: AddressState = {
  addressLine1: "",
  addressLine2: "",
  city: "",
  province: "BC",
  postalCode: "",
  country: "CA",
};

function InputField({
  label,
  children,
  optional = false,
}: {
  label: string;
  children: ReactNode;
  optional?: boolean;
}) {
  return (
    <label className="block text-sm font-semibold text-slate-800">
      <span className="flex items-center justify-between gap-2">
        {label}
        {optional ? (
          <span className="text-xs font-normal text-slate-400">Optional</span>
        ) : null}
      </span>
      {children}
    </label>
  );
}

function FulfillmentCard({
  checked,
  disabled = false,
  icon,
  title,
  detail,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  icon: ReactNode;
  title: string;
  detail: string;
  onChange: () => void;
}) {
  return (
    <label
      className={`relative flex gap-4 border p-4 transition ${
        checked
          ? "border-teal-700 bg-teal-50"
          : "border-slate-200 bg-white hover:border-slate-400"
      } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
    >
      <input
        type="radio"
        name="fulfillment"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className="mt-1 h-4 w-4 accent-teal-700"
      />
      <span className="mt-0.5 text-teal-800">{icon}</span>
      <span>
        <span className="block font-semibold text-slate-950">{title}</span>
        <span className="mt-1 block text-sm leading-5 text-slate-600">{detail}</span>
      </span>
    </label>
  );
}

export function CheckoutForm({
  checkoutEnabled,
  checkoutSettings,
  cancelled,
}: {
  checkoutEnabled: boolean;
  checkoutSettings: PublicCheckoutSettings;
  cancelled: boolean;
}) {
  const { lines, ready, subtotalCents } = useCart();
  const [contact, setContact] = useState<ContactState>(initialContact);
  const [address, setAddress] = useState<AddressState>(initialAddress);
  const [fulfillmentMethod, setFulfillmentMethod] =
    useState<FulfillmentMethod>(
      checkoutSettings.pickupEnabled
        ? "pickup"
        : checkoutSettings.localDelivery.enabled
          ? "local_delivery"
          : "canada_post",
    );
  const [customerNote, setCustomerNote] = useState("");
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [rateRequestKey, setRateRequestKey] = useState("");
  const [selectedRateId, setSelectedRateId] = useState("");
  const [rateLoading, setRateLoading] = useState(false);
  const [shippingFallback, setShippingFallback] =
    useState<ShippingFallback | null>(null);
  const [localDeliveryQuote, setLocalDeliveryQuote] =
    useState<LocalDeliveryQuote | null>(null);
  const [localDeliveryRequestKey, setLocalDeliveryRequestKey] = useState("");
  const [localDeliveryLoading, setLocalDeliveryLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const checkoutAttempt = useRef<{
    fingerprint: string;
    requestId: string;
  } | null>(null);

  const items = useMemo(
    () =>
      lines.map((line) => ({
        variantId: line.variantId,
        quantity: line.quantity,
      })),
    [lines],
  );
  const currentRateKey = JSON.stringify({
    postalCode: address.postalCode.replace(/\s/g, "").toUpperCase(),
    province: address.province,
    items,
  });
  const activeRates = rateRequestKey === currentRateKey ? rates : [];
  const activeSelectedRate = activeRates.find(
    (rate) => rate.id === selectedRateId,
  );
  const activeShippingFallback =
    shippingFallback?.requestKey === currentRateKey ? shippingFallback : null;
  const productFulfillment = getCartFulfillmentAvailability(lines);
  const pickupUnavailable =
    !checkoutSettings.pickupEnabled || !productFulfillment.pickup.available;
  const localDeliveryUnavailable =
    !checkoutSettings.localDelivery.enabled ||
    !productFulfillment.localDelivery.available;
  const canadaPostUnavailable =
    !checkoutSettings.canadaPostEnabled ||
    !productFulfillment.canadaPost.available;
  const selectedFulfillmentUnavailable =
    (fulfillmentMethod === "pickup" && pickupUnavailable) ||
    (fulfillmentMethod === "local_delivery" && localDeliveryUnavailable) ||
    (fulfillmentMethod === "canada_post" && canadaPostUnavailable);
  const activeLocalDeliveryQuote =
    localDeliveryRequestKey === currentRateKey ? localDeliveryQuote : null;
  const shippingCents =
    fulfillmentMethod === "canada_post"
      ? activeSelectedRate?.amountCents ?? 0
      : fulfillmentMethod === "local_delivery"
        ? activeLocalDeliveryQuote?.feeCents ?? 0
        : 0;
  const taxProvince =
    fulfillmentMethod === "pickup"
      ? checkoutSettings.profile.province
      : address.province;
  const taxCents = calculateManualTax({
    subtotalCents,
    shippingCents,
    province: taxProvince,
    rates: checkoutSettings.tax.rates,
    enabled: checkoutSettings.tax.enabled,
  });

  async function requestRates() {
    setError("");
    setShippingFallback(null);
    const requestBody = {
      postalCode: address.postalCode,
      province: address.province,
      items,
    };
    const parsed = shippingRateRequestSchema.safeParse(requestBody);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the postal code.");
      return;
    }

    setRateLoading(true);
    const requestedKey = currentRateKey;
    try {
      const response = await fetch("/api/shipping/rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = (await response.json()) as {
        code?: string;
        error?: string;
        rates?: ShippingRate[];
      };
      if (!response.ok || !data.rates) {
        throw new Error(data.error ?? "Shipping rates are unavailable.");
      }
      if (data.rates.length === 0) {
        throw new Error(
          "Canada Post did not return a service for this package and postal code.",
        );
      }

      setRates(data.rates);
      setRateRequestKey(requestedKey);
      setSelectedRateId(data.rates[0]?.id ?? "");
    } catch (rateError) {
      setRates([]);
      setSelectedRateId("");
      setRateRequestKey(requestedKey);
      setShippingFallback({
        requestKey: requestedKey,
        reason:
          rateError instanceof Error
            ? rateError.message
            : "Shipping rates are unavailable.",
      });
    } finally {
      setRateLoading(false);
    }
  }

  async function requestLocalDelivery() {
    setError("");
    const requestBody = {
      postalCode: address.postalCode,
      province: address.province,
      items,
    };
    const parsed = shippingRateRequestSchema.safeParse(requestBody);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the delivery address.");
      return;
    }

    setLocalDeliveryLoading(true);
    const requestedKey = currentRateKey;
    try {
      const response = await fetch("/api/shipping/local-delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = (await response.json()) as LocalDeliveryQuote & {
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data.error ?? "Local delivery could not be checked.");
      }

      setLocalDeliveryQuote(data);
      setLocalDeliveryRequestKey(requestedKey);
      if (!data.eligible) {
        setError(
          data.reason ??
            "This address is outside the configured local delivery area.",
        );
      }
    } catch (deliveryError) {
      setLocalDeliveryQuote(null);
      setLocalDeliveryRequestKey("");
      setError(
        deliveryError instanceof Error
          ? deliveryError.message
          : "Local delivery could not be checked.",
      );
    } finally {
      setLocalDeliveryLoading(false);
    }
  }

  async function submitCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (selectedFulfillmentUnavailable) {
      setError("Choose a fulfillment method available for every item in this cart.");
      return;
    }

    const checkoutDetails = {
      ...contact,
      fulfillmentMethod,
      shippingAddress:
        fulfillmentMethod === "pickup"
          ? undefined
          : {
              ...address,
              postalCode: formatCanadianPostalCode(address.postalCode),
            },
      shippingQuoteId:
        fulfillmentMethod === "canada_post" ? selectedRateId || undefined : undefined,
      customerNote,
      items,
    };
    const fingerprint = JSON.stringify(checkoutDetails);
    if (checkoutAttempt.current?.fingerprint !== fingerprint) {
      checkoutAttempt.current = {
        fingerprint,
        requestId: crypto.randomUUID(),
      };
    }
    const payload = {
      ...checkoutDetails,
      checkoutRequestId: checkoutAttempt.current.requestId,
    };
    const parsed = checkoutRequestSchema.safeParse(payload);

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check your checkout details.");
      return;
    }
    if (
      fulfillmentMethod === "local_delivery" &&
      !activeLocalDeliveryQuote?.eligible
    ) {
      setError("Check that this address is eligible for local delivery.");
      return;
    }
    if (!checkoutEnabled) {
      setError(
        "Test checkout is waiting for the remaining sandbox payment configuration.",
      );
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/commerce/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = (await response.json()) as {
        code?: string;
        error?: string;
        url?: string;
      };

      if (!response.ok || !data.url) {
        if (data.code !== "STRIPE_SESSION_RECONCILIATION_REQUIRED") {
          checkoutAttempt.current = null;
        }
        throw new Error(data.error ?? "Checkout could not be started.");
      }

      window.location.assign(data.url);
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Checkout could not be started.",
      );
      setSubmitting(false);
    }
  }

  if (!ready) {
    return (
      <div className="grid animate-pulse gap-8 lg:grid-cols-[1fr_23rem]">
        <div className="h-[42rem] bg-white" />
        <div className="h-96 bg-white" />
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="border border-slate-200 bg-white px-6 py-16 text-center">
        <Package aria-hidden="true" className="mx-auto h-10 w-10 text-teal-700" />
        <h2 className="mt-5 font-[Georgia] text-3xl text-slate-950">
          Your cart is empty.
        </h2>
        <p className="mt-3 text-sm text-slate-600">
          Add a sandbox product before starting test checkout.
        </p>
        <Link href="/shop" className="btn-primary mt-7 px-6 py-3.5">
          Browse the shop
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={submitCheckout}
      className="grid gap-8 lg:grid-cols-[1fr_23rem] lg:items-start"
    >
      <div className="space-y-6">
        {cancelled ? (
          <div className="border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
            Stripe Checkout was cancelled. Your cart is unchanged and the test
            inventory reservation will be released.
          </div>
        ) : null}

        {!checkoutEnabled ? (
          <div className="border border-sky-300 bg-sky-50 p-4 text-sm leading-6 text-sky-950">
            <strong>Setup gate is on.</strong> Browsing and cart testing work now.
            Stripe test checkout will unlock after the remaining sandbox payment
            configuration is valid.
          </div>
        ) : null}

        <section className="border border-slate-200 bg-white p-5 sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
            Step 1
          </p>
          <h2 className="mt-2 font-[Georgia] text-2xl text-slate-950">
            Contact information
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <InputField label="First name">
              <input
                required
                autoComplete="given-name"
                value={contact.firstName}
                onChange={(event) =>
                  setContact((current) => ({
                    ...current,
                    firstName: event.target.value,
                  }))
                }
                className="booking-input"
              />
            </InputField>
            <InputField label="Last name">
              <input
                required
                autoComplete="family-name"
                value={contact.lastName}
                onChange={(event) =>
                  setContact((current) => ({
                    ...current,
                    lastName: event.target.value,
                  }))
                }
                className="booking-input"
              />
            </InputField>
            <InputField label="Email">
              <input
                required
                type="email"
                autoComplete="email"
                value={contact.email}
                onChange={(event) =>
                  setContact((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                className="booking-input"
              />
            </InputField>
            <InputField label="Phone" optional>
              <input
                type="tel"
                autoComplete="tel"
                value={contact.phone}
                onChange={(event) =>
                  setContact((current) => ({
                    ...current,
                    phone: event.target.value,
                  }))
                }
                className="booking-input"
              />
            </InputField>
          </div>
        </section>

        <section className="border border-slate-200 bg-white p-5 sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
            Step 2
          </p>
          <h2 className="mt-2 font-[Georgia] text-2xl text-slate-950">
            Fulfillment
          </h2>
          <div className="mt-6 grid gap-3">
            <FulfillmentCard
              checked={fulfillmentMethod === "pickup"}
              disabled={pickupUnavailable}
              icon={<Store aria-hidden="true" className="h-5 w-5" />}
              title="Pickup in Steveston · Free"
              detail={
                !checkoutSettings.pickupEnabled
                  ? "Store pickup is not currently available."
                  : !productFulfillment.pickup.available
                    ? "One or more cart items are not available for store pickup."
                    : `${checkoutSettings.profile.addressLine1} ${checkoutSettings.profile.addressLine2}. ${checkoutSettings.pickupInstructions}`
              }
              onChange={() => {
                setFulfillmentMethod("pickup");
                setError("");
              }}
            />
            <FulfillmentCard
              checked={fulfillmentMethod === "canada_post"}
              disabled={canadaPostUnavailable}
              icon={<Package aria-hidden="true" className="h-5 w-5" />}
              title="Canada Post sandbox rate"
              detail={
                !checkoutSettings.canadaPostEnabled
                  ? "Canada Post shipping is not currently enabled."
                  : productFulfillment.canadaPost.restriction ===
                      "no_shippable_items"
                    ? "This cart does not contain an item that requires shipping."
                    : productFulfillment.canadaPost.restriction ===
                        "special_handling_required"
                      ? "A special-handling item requires staff fulfillment."
                      : productFulfillment.canadaPost.restriction ===
                          "large_item_separate_shipment"
                        ? "Large items must ship alone; use separate orders, pickup, or local delivery."
                        : productFulfillment.canadaPost.restriction ===
                            "item_not_canada_post_eligible"
                          ? "One or more cart items are not available for Canada Post."
                          : "Live sandbox rates based on your postal code and package."
              }
              onChange={() => {
                setFulfillmentMethod("canada_post");
                setError("");
              }}
            />
            <FulfillmentCard
              checked={fulfillmentMethod === "local_delivery"}
              disabled={localDeliveryUnavailable}
              icon={<Truck aria-hidden="true" className="h-5 w-5" />}
              title="Local delivery"
              detail={
                !checkoutSettings.localDelivery.enabled
                  ? "Local delivery is not currently enabled."
                  : !productFulfillment.localDelivery.available
                    ? "One or more cart items are not available for local delivery."
                    : "Enter your address and check whether it is inside the configured delivery area."
              }
              onChange={() => {
                setFulfillmentMethod("local_delivery");
                setError("");
              }}
            />
          </div>

          {fulfillmentMethod !== "pickup" ? (
            <div className="mt-7 border-t border-slate-200 pt-7">
              <h3 className="font-semibold text-slate-950">
                {fulfillmentMethod === "local_delivery"
                  ? "Delivery address"
                  : "Shipping address"}
              </h3>
              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <InputField label="Address">
                    <input
                      required
                      autoComplete="address-line1"
                      value={address.addressLine1}
                      onChange={(event) =>
                        setAddress((current) => ({
                          ...current,
                          addressLine1: event.target.value,
                        }))
                      }
                      className="booking-input"
                    />
                  </InputField>
                </div>
                <div className="sm:col-span-2">
                  <InputField label="Apartment, suite, etc." optional>
                    <input
                      autoComplete="address-line2"
                      value={address.addressLine2}
                      onChange={(event) =>
                        setAddress((current) => ({
                          ...current,
                          addressLine2: event.target.value,
                        }))
                      }
                      className="booking-input"
                    />
                  </InputField>
                </div>
                <InputField label="City">
                  <input
                    required
                    autoComplete="address-level2"
                    value={address.city}
                    onChange={(event) =>
                      setAddress((current) => ({
                        ...current,
                        city: event.target.value,
                      }))
                    }
                    className="booking-input"
                  />
                </InputField>
                <InputField label="Province">
                  <select
                    required
                    autoComplete="address-level1"
                    value={address.province}
                    onChange={(event) =>
                      setAddress((current) => ({
                        ...current,
                        province: event.target.value as CanadianProvinceCode,
                      }))
                    }
                    className="booking-input"
                  >
                    {["BC", "AB", "SK", "MB", "ON", "QC", "NB", "NS", "PE", "NL", "YT", "NT", "NU"].map(
                      (province) => (
                        <option key={province} value={province}>
                          {province}
                        </option>
                      ),
                    )}
                  </select>
                </InputField>
                <InputField label="Postal code">
                  <input
                    required
                    autoComplete="postal-code"
                    placeholder="V7E 3M1"
                    value={address.postalCode}
                    onBlur={() =>
                      setAddress((current) => ({
                        ...current,
                        postalCode: formatCanadianPostalCode(
                          current.postalCode,
                        ),
                      }))
                    }
                    onChange={(event) =>
                      setAddress((current) => ({
                        ...current,
                        postalCode: event.target.value.toUpperCase(),
                      }))
                    }
                    className="booking-input uppercase"
                  />
                </InputField>
                <InputField label="Country">
                  <input
                    readOnly
                    value="Canada"
                    className="booking-input bg-slate-50 text-slate-600"
                  />
                </InputField>
              </div>

              {fulfillmentMethod === "canada_post" ? (
                <>
                  <button
                    type="button"
                    disabled={rateLoading}
                    onClick={requestRates}
                    className="btn-secondary mt-5 h-11 rounded-none border-teal-700 px-5 text-teal-900 disabled:opacity-50"
                  >
                    {rateLoading ? (
                      <>
                        <LoaderCircle
                          aria-hidden="true"
                          className="mr-2 h-4 w-4 animate-spin"
                        />
                        Getting sandbox rates
                      </>
                    ) : (
                      "Get Canada Post rates"
                    )}
                  </button>

                  {activeRates.length > 0 ? (
                    <fieldset className="mt-5">
                      <legend className="text-sm font-semibold text-slate-800">
                        Choose a service
                      </legend>
                      <div className="mt-3 grid gap-2">
                        {activeRates.map((rate) => (
                          <label
                            key={rate.id}
                            className={`flex cursor-pointer items-center justify-between gap-4 border p-4 ${
                              selectedRateId === rate.id
                                ? "border-teal-700 bg-teal-50"
                                : "border-slate-200"
                            }`}
                          >
                            <span className="flex items-start gap-3">
                              <input
                                type="radio"
                                name="shippingRate"
                                checked={selectedRateId === rate.id}
                                onChange={() => setSelectedRateId(rate.id)}
                                className="mt-1 accent-teal-700"
                              />
                              <span>
                                <span className="block text-sm font-semibold text-slate-950">
                                  {rate.serviceName}
                                </span>
                                <span className="mt-1 block text-xs text-slate-500">
                                  {rate.expectedDeliveryDate
                                    ? `Expected ${rate.expectedDeliveryDate}`
                                    : rate.estimatedTransitDays != null
                                      ? `${rate.estimatedTransitDays} business day(s)`
                                      : rate.serviceCode}
                                </span>
                              </span>
                            </span>
                            <span className="font-semibold text-slate-950">
                              {formatCad(rate.amountCents)}
                            </span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  ) : null}

                  {activeShippingFallback ? (
                    <div
                      role="alert"
                      className="mt-5 border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950"
                    >
                      <p className="font-bold">
                        Canada Post could not return a safe rate.
                      </p>
                      <p className="mt-2 leading-6">
                        {activeShippingFallback.reason} No Canada Post charge has
                        been added. Choose another available fulfillment method
                        or contact Wander Bike for a manual shipping quote.
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {!pickupUnavailable ? (
                          <button
                            type="button"
                            onClick={() => {
                              setFulfillmentMethod("pickup");
                              setError("");
                            }}
                            className="rounded-full bg-slate-950 px-4 py-2 text-xs font-bold text-white"
                          >
                            Switch to free pickup
                          </button>
                        ) : null}
                        {!localDeliveryUnavailable ? (
                          <button
                            type="button"
                            onClick={() => {
                              setFulfillmentMethod("local_delivery");
                              setError("");
                            }}
                            className="rounded-full border border-amber-500 bg-white px-4 py-2 text-xs font-bold text-amber-950"
                          >
                            Check local delivery
                          </button>
                        ) : null}
                        <Link
                          href="/location"
                          className="rounded-full border border-amber-500 bg-white px-4 py-2 text-xs font-bold text-amber-950"
                        >
                          Contact Wander Bike
                        </Link>
                      </div>
                    </div>
                  ) : null}
                </>
              ) : (
                <>
                  <button
                    type="button"
                    disabled={localDeliveryLoading}
                    onClick={requestLocalDelivery}
                    className="btn-secondary mt-5 h-11 rounded-none border-teal-700 px-5 text-teal-900 disabled:opacity-50"
                  >
                    {localDeliveryLoading ? (
                      <>
                        <LoaderCircle
                          aria-hidden="true"
                          className="mr-2 h-4 w-4 animate-spin"
                        />
                        Checking delivery area
                      </>
                    ) : (
                      "Check local delivery"
                    )}
                  </button>
                  {activeLocalDeliveryQuote?.eligible ? (
                    <div className="mt-4 flex items-center justify-between gap-4 border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                      <span>
                        This address is inside the local delivery area.
                      </span>
                      <strong>
                        {activeLocalDeliveryQuote.feeCents > 0
                          ? formatCad(activeLocalDeliveryQuote.feeCents)
                          : "Free"}
                      </strong>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          ) : null}
        </section>

        <section className="border border-slate-200 bg-white p-5 sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
            Step 3
          </p>
          <h2 className="mt-2 font-[Georgia] text-2xl text-slate-950">
            Order note
          </h2>
          <InputField label="Note for the shop" optional>
            <textarea
              rows={4}
              maxLength={500}
              value={customerNote}
              onChange={(event) => setCustomerNote(event.target.value)}
              className="booking-input resize-y"
              placeholder="Fit, pickup, or delivery instructions"
            />
          </InputField>
        </section>
      </div>

      <aside className="border border-slate-200 bg-white p-6 lg:sticky lg:top-28">
        <h2 className="font-[Georgia] text-2xl text-slate-950">Order summary</h2>
        <ul className="mt-5 space-y-4 border-b border-slate-200 pb-5">
          {lines.map((line) => (
            <li key={line.variantId} className="flex justify-between gap-4 text-sm">
              <span className="text-slate-600">
                {line.productName}{" "}
                <span className="text-slate-400">× {line.quantity}</span>
              </span>
              <span className="shrink-0 font-medium text-slate-900">
                {formatCad(line.unitPriceCents * line.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600">Cart estimate</dt>
            <dd className="font-semibold">{formatCad(subtotalCents)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600">Shipping</dt>
            <dd className="font-semibold">
              {fulfillmentMethod === "pickup"
                ? "Free pickup"
                : fulfillmentMethod === "canada_post" && !activeSelectedRate
                  ? "Choose a rate"
                  : fulfillmentMethod === "local_delivery" &&
                      !activeLocalDeliveryQuote?.eligible
                    ? "Check address"
                    : shippingCents > 0
                      ? formatCad(shippingCents)
                      : "Free"}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600">Tax</dt>
            <dd className="text-right text-slate-500">
              {checkoutSettings.tax.enabled
                ? formatCad(taxCents)
                : "Not configured in sandbox"}
            </dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-slate-200 pt-4 text-base">
            <dt className="font-semibold">Estimated total</dt>
            <dd className="font-bold">
              {formatCad(subtotalCents + shippingCents + taxCents)}
            </dd>
          </div>
        </dl>

        {error ? (
          <div
            role="alert"
            className="mt-5 flex gap-2 border border-rose-200 bg-rose-50 p-3 text-sm leading-5 text-rose-800"
          >
            <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={
            submitting ||
            !checkoutEnabled ||
            selectedFulfillmentUnavailable ||
            (fulfillmentMethod === "canada_post" && !activeSelectedRate) ||
            (fulfillmentMethod === "local_delivery" &&
              !activeLocalDeliveryQuote?.eligible)
          }
          className="btn-primary mt-6 h-12 w-full gap-2 rounded-none px-5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? (
            <>
              <LoaderCircle aria-hidden="true" className="h-5 w-5 animate-spin" />
              Opening Stripe
            </>
          ) : (
            <>
              <LockKeyhole aria-hidden="true" className="h-4 w-4" />
              Continue to Stripe test checkout
            </>
          )}
        </button>
        <p className="mt-4 flex gap-2 text-xs leading-5 text-slate-500">
          <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />
          Server-priced order, atomic stock reservation, and Stripe-hosted payment.
        </p>
        <p className="mt-3 text-xs leading-5 text-slate-500">
          By continuing, you can review our{" "}
          <Link href="/policies/shipping" className="underline">
            shipping
          </Link>
          ,{" "}
          <Link href="/policies/refund" className="underline">
            refund
          </Link>
          , and{" "}
          <Link href="/policies/returns" className="underline">
            return
          </Link>{" "}
          policies.
        </p>
        <Link
          href="/cart"
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-teal-800 underline"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Return to cart
        </Link>
      </aside>
    </form>
  );
}
