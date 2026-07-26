"use client";

import {
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  RotateCcw,
  Save,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import {
  canadianProvinceCodes,
  type CanadianProvinceCode,
  type CommerceStoreSettings,
  type ManualTaxRate,
  type StoreDayKey,
} from "@/lib/commerce/settings-types";

type EnvironmentStatus = {
  sandboxMode: boolean;
  checkoutGateConfigured: boolean;
  canadaPostRatesConfigured: boolean;
  canadaPostLabelsConfigured: boolean;
  emailConfigured: boolean;
};

const provinceNames: Record<CanadianProvinceCode, string> = {
  BC: "British Columbia",
  AB: "Alberta",
  SK: "Saskatchewan",
  MB: "Manitoba",
  ON: "Ontario",
  QC: "Quebec",
  NB: "New Brunswick",
  NS: "Nova Scotia",
  PE: "Prince Edward Island",
  NL: "Newfoundland and Labrador",
  YT: "Yukon",
  NT: "Northwest Territories",
  NU: "Nunavut",
};

const dayNames: Record<StoreDayKey, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-32 rounded-xl border border-slate-200 bg-white p-5 sm:p-6"
    >
      <h2 className="text-lg font-bold text-slate-950">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
  note,
}: {
  label: string;
  children: ReactNode;
  note?: string;
}) {
  return (
    <label className="block text-sm font-semibold text-slate-800">
      {label}
      {children}
      {note ? (
        <span className="mt-1 block text-xs font-normal leading-5 text-slate-500">
          {note}
        </span>
      ) : null}
    </label>
  );
}

function Status({
  ok,
  label,
}: {
  ok: boolean;
  label: string;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
        ok
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-amber-200 bg-amber-50 text-amber-900"
      }`}
    >
      {ok ? (
        <CheckCircle2 aria-hidden="true" className="h-4 w-4 shrink-0" />
      ) : (
        <AlertCircle aria-hidden="true" className="h-4 w-4 shrink-0" />
      )}
      {label}
    </div>
  );
}

function dollarsToCents(value: string) {
  if (value.trim() === "") return null;
  const dollars = Number(value);
  return Number.isFinite(dollars) && dollars >= 0
    ? Math.round(dollars * 100)
    : null;
}

function moneyValue(cents: number | null) {
  return cents === null ? "" : (cents / 100).toFixed(2);
}

export function StoreSettingsForm({
  initialSettings,
  canEdit,
  environmentStatus,
}: {
  initialSettings: CommerceStoreSettings;
  canEdit: boolean;
  environmentStatus: EnvironmentStatus;
}) {
  const router = useRouter();
  const [settings, setSettings] =
    useState<CommerceStoreSettings>(initialSettings);
  const [savedSettings, setSavedSettings] =
    useState<CommerceStoreSettings>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const isDirty = useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(savedSettings),
    [savedSettings, settings],
  );

  function toggleSalesProvince(province: CanadianProvinceCode) {
    setSettings((current) => {
      const selected = current.salesProvinces.includes(province);
      const salesProvinces = selected
        ? current.salesProvinces.filter((value) => value !== province)
        : [...current.salesProvinces, province];
      return {
        ...current,
        salesProvinces:
          salesProvinces.length > 0 ? salesProvinces : current.salesProvinces,
      };
    });
  }

  function updateTaxRate(
    province: CanadianProvinceCode,
    update: Partial<ManualTaxRate> | null,
  ) {
    setSettings((current) => {
      const existing = current.tax.rates.find(
        (rate) => rate.province === province,
      );
      const rates =
        update === null
          ? current.tax.rates.filter((rate) => rate.province !== province)
          : existing
            ? current.tax.rates.map((rate) =>
                rate.province === province ? { ...rate, ...update } : rate,
              )
            : [
                ...current.tax.rates,
                {
                  province,
                  label: `${province} sales tax`,
                  rateBps: 0,
                  appliesToShipping: true,
                  ...update,
                },
              ];
      return { ...current, tax: { ...current.tax, rates } };
    });
  }

  async function save() {
    setError("");
    setMessage("");
    setSaving(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Settings could not be saved.");
      }
      setSavedSettings(settings);
      setMessage("Store settings saved and recorded in the audit log.");
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Settings could not be saved.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-5 grid gap-5">
      <nav
        aria-label="Settings sections"
        className="sticky top-[4.75rem] z-20 -mx-1 flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white/95 p-1.5 shadow-sm backdrop-blur"
      >
        {[
          ["profile", "Profile"],
          ["hours", "Hours"],
          ["fulfillment", "Fulfillment"],
          ["delivery", "Delivery"],
          ["origin", "Shipping origin"],
          ["taxes", "Taxes"],
          ["notifications", "Notifications"],
        ].map(([href, label]) => (
          <a
            key={href}
            href={`#${href}`}
            className="shrink-0 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
          >
            {label}
          </a>
        ))}
      </nav>

      <section className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 xl:grid-cols-4">
        <Status
          ok={environmentStatus.sandboxMode}
          label={
            environmentStatus.sandboxMode
              ? "Commerce is locked to sandbox"
              : "Sandbox safety gate is off"
          }
        />
        <Status
          ok={environmentStatus.checkoutGateConfigured}
          label={
            environmentStatus.checkoutGateConfigured
              ? "Stripe test checkout configured"
              : "Stripe checkout environment incomplete"
          }
        />
        <Status
          ok={environmentStatus.canadaPostRatesConfigured}
          label={
            environmentStatus.canadaPostLabelsConfigured
              ? "Canada Post rates and labels configured"
              : environmentStatus.canadaPostRatesConfigured
                ? "Canada Post rates configured; label account incomplete"
                : "Canada Post environment incomplete"
          }
        />
        <Status
          ok={environmentStatus.emailConfigured}
          label={
            environmentStatus.emailConfigured
              ? "Transactional email configured"
              : "Transactional email environment incomplete"
          }
        />
      </section>

      {!canEdit ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          Staff members can review these settings. An administrator is required to
          save changes.
        </div>
      ) : null}

      <Section
        id="profile"
        title="Store profile"
        description="Customer-facing identity, contact details, and main store address."
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Field label="Display name">
            <input
              value={settings.profile.displayName}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  profile: {
                    ...current.profile,
                    displayName: event.target.value,
                  },
                }))
              }
              className="booking-input"
            />
          </Field>
          <Field label="Phone">
            <input
              type="tel"
              value={settings.profile.phone}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  profile: { ...current.profile, phone: event.target.value },
                }))
              }
              className="booking-input"
            />
          </Field>
          <Field label="Customer email">
            <input
              type="email"
              value={settings.profile.customerEmail}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  profile: {
                    ...current.profile,
                    customerEmail: event.target.value,
                  },
                }))
              }
              className="booking-input"
            />
          </Field>
          <Field label="Address line 1">
            <input
              value={settings.profile.addressLine1}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  profile: {
                    ...current.profile,
                    addressLine1: event.target.value,
                  },
                }))
              }
              className="booking-input"
            />
          </Field>
          <Field label="Unit / suite">
            <input
              value={settings.profile.addressLine2}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  profile: {
                    ...current.profile,
                    addressLine2: event.target.value,
                  },
                }))
              }
              className="booking-input"
            />
          </Field>
          <Field label="City">
            <input
              value={settings.profile.city}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  profile: { ...current.profile, city: event.target.value },
                }))
              }
              className="booking-input"
            />
          </Field>
          <Field label="Province">
            <select
              value={settings.profile.province}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  profile: {
                    ...current.profile,
                    province: event.target.value as CanadianProvinceCode,
                  },
                }))
              }
              className="booking-input"
            >
              {canadianProvinceCodes.map((province) => (
                <option key={province} value={province}>
                  {provinceNames[province]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Postal code">
            <input
              value={settings.profile.postalCode}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  profile: {
                    ...current.profile,
                    postalCode: event.target.value.toUpperCase(),
                  },
                }))
              }
              className="booking-input uppercase"
            />
          </Field>
        </div>
      </Section>

      <Section
        id="hours"
        title="Business hours"
        description="Weekly hours use the America/Vancouver time zone."
      >
        <div className="overflow-x-auto">
          <div className="grid min-w-[620px] gap-2">
            {settings.hours.days.map((schedule, index) => (
              <div
                key={schedule.day}
                className="grid grid-cols-[9rem_7rem_1fr_1fr] items-center gap-3 rounded-xl bg-slate-50 p-3"
              >
                <p className="text-sm font-semibold text-slate-800">
                  {dayNames[schedule.day]}
                </p>
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={schedule.closed}
                    onChange={(event) =>
                      setSettings((current) => ({
                        ...current,
                        hours: {
                          ...current.hours,
                          days: current.hours.days.map((day, dayIndex) =>
                            dayIndex === index
                              ? { ...day, closed: event.target.checked }
                              : day,
                          ),
                        },
                      }))
                    }
                    className="accent-teal-700"
                  />
                  Closed
                </label>
                <input
                  aria-label={`${dayNames[schedule.day]} opening time`}
                  type="time"
                  disabled={schedule.closed}
                  value={schedule.open}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      hours: {
                        ...current.hours,
                        days: current.hours.days.map((day, dayIndex) =>
                          dayIndex === index
                            ? { ...day, open: event.target.value }
                            : day,
                        ),
                      },
                    }))
                  }
                  className="booking-input disabled:bg-slate-100"
                />
                <input
                  aria-label={`${dayNames[schedule.day]} closing time`}
                  type="time"
                  disabled={schedule.closed}
                  value={schedule.close}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      hours: {
                        ...current.hours,
                        days: current.hours.days.map((day, dayIndex) =>
                          dayIndex === index
                            ? { ...day, close: event.target.value }
                            : day,
                        ),
                      },
                    }))
                  }
                  className="booking-input disabled:bg-slate-100"
                />
              </div>
            ))}
          </div>
        </div>
        <Field label="Hours note">
          <input
            value={settings.hours.note}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                hours: { ...current.hours, note: event.target.value },
              }))
            }
            placeholder="Holiday or seasonal note"
            className="booking-input"
          />
        </Field>
      </Section>

      <Section
        id="fulfillment"
        title="Checkout and fulfillment"
        description="Database switches are combined with deployment safety gates. Enabling a switch here never bypasses sandbox credentials."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <label className="rounded-xl border border-slate-200 p-4">
            <span className="flex items-center justify-between gap-3">
              <span className="font-semibold text-slate-900">Checkout</span>
              <input
                type="checkbox"
                checked={settings.checkoutEnabled}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    checkoutEnabled: event.target.checked,
                  }))
                }
                className="h-5 w-5 accent-teal-700"
              />
            </span>
            <span className="mt-2 block text-xs leading-5 text-slate-500">
              Also requires the Stripe test environment gate.
            </span>
          </label>
          <label className="rounded-xl border border-slate-200 p-4">
            <span className="flex items-center justify-between gap-3">
              <span className="font-semibold text-slate-900">Store pickup</span>
              <input
                type="checkbox"
                checked={settings.pickupEnabled}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    pickupEnabled: event.target.checked,
                  }))
                }
                className="h-5 w-5 accent-teal-700"
              />
            </span>
            <span className="mt-2 block text-xs leading-5 text-slate-500">
              Free pickup at the store profile address.
            </span>
          </label>
          <label className="rounded-xl border border-slate-200 p-4">
            <span className="flex items-center justify-between gap-3">
              <span className="font-semibold text-slate-900">Canada Post</span>
              <input
                type="checkbox"
                checked={settings.canadaPostEnabled}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    canadaPostEnabled: event.target.checked,
                  }))
                }
                className="h-5 w-5 accent-teal-700"
              />
            </span>
            <span className="mt-2 block text-xs leading-5 text-slate-500">
              Requires sandbox credentials; production requests remain blocked.
            </span>
          </label>
        </div>

        <div className="mt-5">
          <Field label="Pickup instructions">
            <textarea
              rows={3}
              value={settings.pickupInstructions}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  pickupInstructions: event.target.value,
                }))
              }
              className="booking-input resize-y"
            />
          </Field>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-slate-800">
            Sales and shipping provinces
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {canadianProvinceCodes.map((province) => {
              const selected = settings.salesProvinces.includes(province);
              return (
                <button
                  key={province}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleSalesProvince(province)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                    selected
                      ? "border-teal-700 bg-teal-50 text-teal-900"
                      : "border-slate-200 text-slate-500"
                  }`}
                >
                  {province}
                </button>
              );
            })}
          </div>
        </fieldset>
      </Section>

      <Section
        id="delivery"
        title="Local delivery and shipping prices"
        description="Local delivery is matched by the first three characters of a Canadian postal code. Shipping promotions are recalculated on the server."
      >
        <label className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-4">
          <span>
            <span className="block font-semibold text-slate-900">
              Enable local delivery
            </span>
            <span className="mt-1 block text-xs text-slate-500">
              At least one postal prefix is required.
            </span>
          </span>
          <input
            type="checkbox"
            checked={settings.localDelivery.enabled}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                localDelivery: {
                  ...current.localDelivery,
                  enabled: event.target.checked,
                },
              }))
            }
            className="h-5 w-5 accent-teal-700"
          />
        </label>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Local delivery fee (CAD)">
            <input
              type="number"
              min="0"
              step="0.01"
              value={moneyValue(settings.localDelivery.feeCents)}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  localDelivery: {
                    ...current.localDelivery,
                    feeCents: dollarsToCents(event.target.value) ?? 0,
                  },
                }))
              }
              className="booking-input"
            />
          </Field>
          <Field
            label="Eligible postal prefixes"
            note="Comma-separated FSAs, for example V7E, V7C, V6X."
          >
            <input
              value={settings.localDelivery.postalCodePrefixes.join(", ")}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  localDelivery: {
                    ...current.localDelivery,
                    postalCodePrefixes: event.target.value
                      .toUpperCase()
                      .split(/[\s,]+/)
                      .map((value) => value.trim())
                      .filter(Boolean),
                  },
                }))
              }
              className="booking-input uppercase"
            />
          </Field>
          <Field
            label="Free shipping threshold (CAD)"
            note="Leave blank to disable. Applies to local delivery and Canada Post."
          >
            <input
              type="number"
              min="0"
              step="0.01"
              value={moneyValue(
                settings.shippingRules.freeShippingThresholdCents,
              )}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  shippingRules: {
                    ...current.shippingRules,
                    freeShippingThresholdCents: dollarsToCents(
                      event.target.value,
                    ),
                  },
                }))
              }
              className="booking-input"
            />
          </Field>
          <Field
            label="Fixed Canada Post fee (CAD)"
            note="Leave blank to charge the carrier sandbox rate."
          >
            <input
              type="number"
              min="0"
              step="0.01"
              value={moneyValue(settings.shippingRules.fixedCanadaPostFeeCents)}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  shippingRules: {
                    ...current.shippingRules,
                    fixedCanadaPostFeeCents: dollarsToCents(event.target.value),
                  },
                }))
              }
              className="booking-input"
            />
          </Field>
        </div>
      </Section>

      <Section
        id="origin"
        title="Shipping origin"
        description="Used for Canada Post rates and label sender details. It can differ from the public pickup address."
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {(
            [
              ["company", "Company"],
              ["contact", "Contact"],
              ["phone", "Phone"],
              ["addressLine1", "Address line 1"],
              ["addressLine2", "Unit / suite"],
              ["city", "City"],
            ] as const
          ).map(([key, label]) => (
            <Field key={key} label={label}>
              <input
                value={settings.shippingOrigin[key]}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    shippingOrigin: {
                      ...current.shippingOrigin,
                      [key]: event.target.value,
                    },
                  }))
                }
                className="booking-input"
              />
            </Field>
          ))}
          <Field label="Province">
            <select
              value={settings.shippingOrigin.province}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  shippingOrigin: {
                    ...current.shippingOrigin,
                    province: event.target.value as CanadianProvinceCode,
                  },
                }))
              }
              className="booking-input"
            >
              {canadianProvinceCodes.map((province) => (
                <option key={province} value={province}>
                  {provinceNames[province]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Postal code">
            <input
              value={settings.shippingOrigin.postalCode}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  shippingOrigin: {
                    ...current.shippingOrigin,
                    postalCode: event.target.value.toUpperCase(),
                  },
                }))
              }
              className="booking-input uppercase"
            />
          </Field>
        </div>
      </Section>

      <Section
        id="taxes"
        title="Manual tax rules"
        description="Tax is disabled until the merchant confirms registration and rates. Configure each applicable province; the server calculates and stores the final tax."
      >
        <label className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-4">
          <span>
            <span className="block font-semibold text-slate-900">
              Enable manual tax calculation
            </span>
            <span className="mt-1 block text-xs text-slate-500">
              Merchant or accountant approval is required before live launch.
            </span>
          </span>
          <input
            type="checkbox"
            checked={settings.tax.enabled}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                tax: { ...current.tax, enabled: event.target.checked },
              }))
            }
            className="h-5 w-5 accent-teal-700"
          />
        </label>
        {settings.tax.enabled ? (
          <>
            <div className="mt-4">
              <Field label="Tax registration number">
                <input
                  value={settings.tax.registrationNumber}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      tax: {
                        ...current.tax,
                        registrationNumber: event.target.value,
                      },
                    }))
                  }
                  className="booking-input"
                />
              </Field>
            </div>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="pb-3">Use</th>
                    <th className="pb-3">Province</th>
                    <th className="pb-3">Label</th>
                    <th className="pb-3">Combined rate</th>
                    <th className="pb-3">Tax shipping</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {canadianProvinceCodes.map((province) => {
                    const rate = settings.tax.rates.find(
                      (candidate) => candidate.province === province,
                    );
                    return (
                      <tr key={province}>
                        <td className="py-3">
                          <input
                            type="checkbox"
                            checked={Boolean(rate)}
                            onChange={(event) =>
                              updateTaxRate(
                                province,
                                event.target.checked ? {} : null,
                              )
                            }
                            className="accent-teal-700"
                          />
                        </td>
                        <td className="py-3 font-semibold">{province}</td>
                        <td className="py-3 pr-3">
                          <input
                            disabled={!rate}
                            value={rate?.label ?? ""}
                            onChange={(event) =>
                              updateTaxRate(province, {
                                label: event.target.value,
                              })
                            }
                            className="booking-input disabled:bg-slate-100"
                          />
                        </td>
                        <td className="py-3 pr-3">
                          <div className="relative">
                            <input
                              disabled={!rate}
                              type="number"
                              min="0"
                              max="50"
                              step="0.01"
                              value={rate ? (rate.rateBps / 100).toFixed(2) : ""}
                              onChange={(event) =>
                                updateTaxRate(province, {
                                  rateBps: Math.round(
                                    Math.max(0, Number(event.target.value) || 0) *
                                      100,
                                  ),
                                })
                              }
                              className="booking-input pr-8 disabled:bg-slate-100"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                              %
                            </span>
                          </div>
                        </td>
                        <td className="py-3">
                          <input
                            disabled={!rate}
                            type="checkbox"
                            checked={rate?.appliesToShipping ?? false}
                            onChange={(event) =>
                              updateTaxRate(province, {
                                appliesToShipping: event.target.checked,
                              })
                            }
                            className="accent-teal-700 disabled:opacity-40"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p className="mt-4 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
            Manual tax is off. Province rates stay hidden until this setting is
            enabled.
          </p>
        )}
      </Section>

      <Section
        id="notifications"
        title="Notifications and policies"
        description="The notification inbox receives order copies and customer replies. Policies are stored for customer-facing checkout and order communications."
      >
        <Field label="Order notification email">
          <input
            type="email"
            value={settings.notificationEmail}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                notificationEmail: event.target.value,
              }))
            }
            className="booking-input"
          />
        </Field>
        <div className="mt-5 grid gap-4">
          {(
            [
              ["shipping", "Shipping policy"],
              ["refund", "Refund policy"],
              ["returns", "Return policy"],
            ] as const
          ).map(([key, label]) => (
            <Field key={key} label={label}>
              <textarea
                rows={5}
                value={settings.policies[key]}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    policies: {
                      ...current.policies,
                      [key]: event.target.value,
                    },
                  }))
                }
                className="booking-input resize-y"
              />
            </Field>
          ))}
        </div>
      </Section>

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
        >
          {error}
        </div>
      ) : null}
      {message ? (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          {message}
        </div>
      ) : null}

      {isDirty ? (
        <div className="sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-300 bg-slate-950 px-4 py-3 text-white shadow-xl">
          <p className="text-sm font-semibold">Unsaved settings changes</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                setSettings(savedSettings);
                setError("");
                setMessage("");
              }}
              className="inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
            >
              <RotateCcw aria-hidden="true" className="h-4 w-4" />
              Discard
            </button>
            <button
              type="button"
              disabled={!canEdit || saving}
              onClick={save}
              className="inline-flex h-10 min-w-36 items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-bold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
              ) : (
                <Save aria-hidden="true" className="h-4 w-4" />
              )}
              {saving ? "Saving settings" : "Save settings"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
