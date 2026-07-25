import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CreditCard,
  Mail,
  MapPin,
  Package,
  ReceiptText,
} from "lucide-react";
import { OrderActions } from "@/components/admin/order-actions";
import { OrderDetailsEditor } from "@/components/admin/order-details-editor";
import {
  CanadaPostLabelAction,
  OrderNotificationAction,
  ReturnActions,
} from "@/components/admin/order-operations";
import { StatusBadge } from "@/components/admin/status-badge";
import { getAdminOrder } from "@/lib/admin/data";
import { formatCad } from "@/lib/commerce/money";
import { getCurrentStaff } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

type UnknownRecord = Record<string, unknown>;

function number(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function record(value: unknown): UnknownRecord {
  if (Array.isArray(value)) return (value[0] as UnknownRecord | undefined) ?? {};
  return value && typeof value === "object" ? (value as UnknownRecord) : {};
}

function dateTime(value: unknown) {
  if (typeof value !== "string") return "—";
  return new Intl.DateTimeFormat("en-CA", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Vancouver",
  }).format(new Date(value));
}

function addressLines(value: unknown) {
  if (!value || typeof value !== "object") return [];
  const address = value as UnknownRecord;
  return [
    address.addressLine1,
    address.addressLine2,
    [address.city, address.province].filter(Boolean).join(", "),
    address.postalCode,
    address.country === "CA" ? "Canada" : address.country,
  ].filter((line): line is string => typeof line === "string" && line.length > 0);
}

export default async function AdminOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isSafeInteger(orderId) || orderId <= 0) notFound();

  const [details, staff] = await Promise.all([
    getAdminOrder(orderId),
    getCurrentStaff(),
  ]);
  if (!details || !staff) notFound();

  const order = details.order;
  const shippingAddressRecord = record(order.shipping_address);
  const shippingAddress = addressLines(order.shipping_address);
  const items = details.items.map((item) => ({
    orderItemId: number(item.id),
    variantId: item.variant_id == null ? null : number(item.variant_id),
    productName: text(item.product_name),
    variantTitle: text(item.variant_title),
    quantity: number(item.quantity),
  }));
  const shippingQuote = record(order.shipping_quotes);
  const quotedPackage = record(shippingQuote.package_details);
  const canadaPostShipments =
    details.shipments.filter(
      (shipment) =>
        text(shipment.provider) === "canada_post" &&
        ![
          "cancelled",
          "voided",
          "refund_pending",
          "refunded",
          "exception",
        ].includes(
          text(shipment.status),
        ),
    );
  const firstShipmentPackage = record(
    canadaPostShipments[0]?.package_details,
  );
  const packageValue =
    Object.keys(firstShipmentPackage).length > 0
      ? firstShipmentPackage
      : quotedPackage;
  const returns = details.returns.map((entry) => ({
    id: number(entry.id),
    returnNumber: text(entry.return_number),
    status: text(entry.status),
    reason: text(entry.reason),
    resolution: text(entry.resolution),
  }));
  const fulfillmentStatus = text(order.fulfillment_status);
  const shipmentStarted = details.shipments.some((shipment) =>
    ["pending", "label_created", "ready", "in_transit", "delivered"].includes(
      text(shipment.status),
    ),
  );
  const orderDetailsStatusLocked = [
    "shipped",
    "delivered",
    "picked_up",
    "returned",
    "cancelled",
  ].includes(fulfillmentStatus);
  const canEditOrderDetails = !shipmentStarted && !orderDetailsStatusLocked;
  const orderDetailsLockedReason = shipmentStarted
    ? "Customer and address fields are locked because shipment creation has already started."
    : "Customer and address fields are locked after fulfillment or cancellation.";

  return (
    <div>
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-2 text-sm font-semibold text-teal-800"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        All orders
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
            Sales order
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            {text(order.order_number)}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Created {dateTime(order.created_at)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge value={text(order.payment_status)} />
          <StatusBadge value={text(order.fulfillment_status)} />
        </div>
      </div>

      <div className="mt-7 grid gap-6 xl:grid-cols-[1fr_24rem]">
        <div className="space-y-6">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-4">
              <ReceiptText aria-hidden="true" className="h-5 w-5 text-teal-800" />
              <h2 className="font-semibold text-slate-950">Items & totals</h2>
            </div>
            <ul className="divide-y divide-slate-100">
              {details.items.map((item) => (
                <li
                  key={number(item.id)}
                  className="flex justify-between gap-5 px-5 py-4 text-sm"
                >
                  <div>
                    <p className="font-semibold text-slate-950">
                      {text(item.product_name)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {text(item.variant_title)} · {text(item.sku)} · Qty{" "}
                      {number(item.quantity)}
                    </p>
                  </div>
                  <p className="font-semibold">
                    {formatCad(number(item.line_total_cents))}
                  </p>
                </li>
              ))}
            </ul>
            <dl className="space-y-3 border-t border-slate-200 bg-slate-50 px-5 py-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-600">Subtotal</dt>
                <dd>{formatCad(number(order.subtotal_cents))}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">Shipping</dt>
                <dd>{formatCad(number(order.shipping_total_cents))}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">Tax</dt>
                <dd>{formatCad(number(order.tax_total_cents))}</dd>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-bold">
                <dt>Total</dt>
                <dd>{formatCad(number(order.total_cents))}</dd>
              </div>
              {number(order.refunded_total_cents) > 0 ? (
                <div className="flex justify-between text-fuchsia-800">
                  <dt>Refunded</dt>
                  <dd>-{formatCad(number(order.refunded_total_cents))}</dd>
                </div>
              ) : null}
            </dl>
          </section>

          <div className="grid gap-6 md:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <Mail aria-hidden="true" className="h-5 w-5 text-teal-800" />
              <h2 className="mt-3 font-semibold text-slate-950">Customer</h2>
              <p className="mt-3 text-sm font-medium text-slate-900">
                {text(order.customer_first_name)} {text(order.customer_last_name)}
              </p>
              <a
                href={`mailto:${text(order.email)}`}
                className="mt-1 block text-sm text-teal-800"
              >
                {text(order.email)}
              </a>
              <p className="mt-1 text-sm text-slate-600">
                {text(order.phone) || "No phone provided"}
              </p>
              {text(order.customer_note) ? (
                <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">
                  {text(order.customer_note)}
                </p>
              ) : null}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <MapPin aria-hidden="true" className="h-5 w-5 text-teal-800" />
              <h2 className="mt-3 font-semibold text-slate-950">Fulfillment</h2>
              <p className="mt-3 text-sm capitalize text-slate-700">
                {text(order.fulfillment_method).replaceAll("_", " ")}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Service: {text(order.shipping_service_code) || "Pickup"}
              </p>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                {shippingAddress.length > 0
                  ? shippingAddress.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))
                  : "12071 First Ave #101, Richmond, BC V7E 3M1"}
              </p>
            </section>
          </div>

          <OrderDetailsEditor
            orderId={orderId}
            canEdit={canEditOrderDetails}
            lockedReason={orderDetailsLockedReason}
            fulfillmentMethod={text(order.fulfillment_method)}
            customer={{
              firstName: text(order.customer_first_name),
              lastName: text(order.customer_last_name),
              email: text(order.email),
              phone: text(order.phone),
              note: text(order.customer_note),
            }}
            shippingAddress={{
              addressLine1: text(shippingAddressRecord.addressLine1),
              addressLine2: text(shippingAddressRecord.addressLine2),
              city: text(shippingAddressRecord.city),
              province: text(shippingAddressRecord.province) || "BC",
              postalCode: text(shippingAddressRecord.postalCode),
            }}
          />

          <section className="rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-4">
              <CreditCard aria-hidden="true" className="h-5 w-5 text-teal-800" />
              <h2 className="font-semibold text-slate-950">Payment & refunds</h2>
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              {details.payments.map((payment) => (
                <div key={number(payment.id)} className="rounded-xl bg-slate-50 p-4 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">Stripe payment</p>
                    <StatusBadge value={text(payment.status)} />
                  </div>
                  <p className="mt-3 text-slate-600">
                    Captured {formatCad(number(payment.amount_cents))}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {dateTime(payment.captured_at)}
                  </p>
                </div>
              ))}
              {details.refunds.map((refund) => (
                <div key={number(refund.id)} className="rounded-xl bg-fuchsia-50 p-4 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">Refund</p>
                    <StatusBadge value={text(refund.status)} />
                  </div>
                  <p className="mt-3 text-fuchsia-900">
                    {formatCad(number(refund.amount_cents))}
                  </p>
                  <p className="mt-1 text-xs text-fuchsia-700">
                    {text(refund.reason)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-4">
              <Package aria-hidden="true" className="h-5 w-5 text-teal-800" />
              <h2 className="font-semibold text-slate-950">Shipments</h2>
            </div>
            <div className="p-5">
              {details.shipments.length > 0 ? (
                <ul className="space-y-3">
                  {details.shipments.map((shipment) => (
                    <li key={number(shipment.id)} className="rounded-xl bg-slate-50 p-4 text-sm">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="font-semibold capitalize">
                          {text(shipment.provider).replaceAll("_", " ")} ·{" "}
                          {text(shipment.service_name) || text(shipment.service_code)}
                        </p>
                        <StatusBadge value={text(shipment.status)} />
                      </div>
                      {text(shipment.tracking_pin) ? (
                        <p className="mt-2 text-slate-600">
                          Tracking: {text(shipment.tracking_pin)}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">No shipment record yet.</p>
              )}
            </div>
          </section>
        </div>

        <aside>
          <div className="space-y-5">
            <OrderActions
              role={staff.role}
              items={items}
              order={{
                id: orderId,
                paymentStatus: text(order.payment_status),
                fulfillmentStatus: text(order.fulfillment_status),
                fulfillmentMethod: text(order.fulfillment_method),
                totalCents: number(order.total_cents),
                refundedTotalCents: number(order.refunded_total_cents),
                internalNote: text(order.internal_note),
              }}
            />
            {text(order.fulfillment_method) === "canada_post" ? (
              <CanadaPostLabelAction
                key={canadaPostShipments
                  .map(
                    (shipment) =>
                      `${number(shipment.id)}:${text(shipment.status)}`,
                  )
                  .join("|")}
                orderId={orderId}
                paymentStatus={text(order.payment_status)}
                serviceCode={text(order.shipping_service_code)}
                serviceName={
                  text(shippingQuote.service_name) ||
                  text(order.shipping_service_code)
                }
                packageDetails={{
                  weightKg: number(packageValue.weightKg) || 0.1,
                  lengthCm: number(packageValue.lengthCm) || 1,
                  widthCm: number(packageValue.widthCm) || 1,
                  heightCm: number(packageValue.heightCm) || 1,
                }}
                existingShipments={canadaPostShipments.map((shipment) => {
                  const details = record(shipment.package_details);
                  return {
                    id: number(shipment.id),
                    status: text(shipment.status),
                    idempotencyKey: text(shipment.idempotency_key),
                    labelStoragePath: text(shipment.label_storage_path),
                    trackingPin: text(shipment.tracking_pin),
                    refundTicket: text(shipment.provider_refund_ticket),
                    packageDetails: {
                      packageNumber: number(details.packageNumber) || 1,
                      packageCount: number(details.packageCount) || 1,
                      weightKg: number(details.weightKg) || 0.1,
                      lengthCm: number(details.lengthCm) || 1,
                      widthCm: number(details.widthCm) || 1,
                      heightCm: number(details.heightCm) || 1,
                    },
                  };
                })}
              />
            ) : null}
            <ReturnActions orderId={orderId} items={items} returns={returns} />
            <OrderNotificationAction orderId={orderId} />
          </div>
        </aside>
      </div>
    </div>
  );
}
