import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CheckCircle2,
  Clock3,
  MapPin,
  PackageCheck,
  ReceiptText,
} from "lucide-react";
import { OrderStatusClient } from "@/components/commerce/order-status-client";
import { formatCad } from "@/lib/commerce/money";
import { getOrderForViewer } from "@/lib/commerce/orders";

export const metadata: Metadata = {
  title: "Order Status",
  description: "Review your Wander Bike order status.",
  robots: { index: false, follow: false },
};

function statusCopy(paymentStatus: string) {
  if (["paid", "partially_refunded", "refunded"].includes(paymentStatus)) {
    return {
      title: "Test payment confirmed.",
      detail:
        "The Stripe webhook was verified and the sandbox inventory transaction is complete.",
      tone: "border-emerald-300 bg-emerald-50 text-emerald-950",
      icon: CheckCircle2,
    };
  }
  if (paymentStatus === "failed") {
    return {
      title: "Payment was not completed.",
      detail:
        "No real charge was made. Any sandbox inventory reservation has been released.",
      tone: "border-rose-300 bg-rose-50 text-rose-950",
      icon: Clock3,
    };
  }
  return {
    title: "Confirming the Stripe test payment.",
    detail:
      "This page refreshes briefly while the signed webhook updates the order.",
    tone: "border-amber-300 bg-amber-50 text-amber-950",
    icon: Clock3,
  };
}

function addressLines(address: Record<string, unknown> | null) {
  if (!address) return [];
  return [
    address.addressLine1,
    address.addressLine2,
    [address.city, address.province].filter(Boolean).join(", "),
    address.postalCode,
    address.country === "CA" ? "Canada" : address.country,
  ].filter((value): value is string => typeof value === "string" && value.length > 0);
}

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ publicId: string }>;
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { publicId } = await params;
  const query = await searchParams;
  const order = await getOrderForViewer(publicId);
  if (!order) notFound();

  const returnedFromStripe =
    Boolean(query.session_id) &&
    query.session_id === order.stripeCheckoutSessionId;
  const status = statusCopy(order.paymentStatus);
  const StatusIcon = status.icon;
  const shippingAddress = addressLines(order.shippingAddress);

  return (
    <main className="min-h-[75vh] bg-[#fbfaf6] px-6 py-12 sm:px-8 lg:py-16">
      <OrderStatusClient
        paymentStatus={order.paymentStatus}
        returnedFromStripe={returnedFromStripe}
      />
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
            Sandbox order {order.orderNumber}
          </p>
          <h1 className="mt-3 font-[Georgia] text-4xl text-slate-950 sm:text-5xl">
            Thanks, {order.customerName}.
          </h1>
          <p className="mt-4 text-slate-600">
            A test order record was created for {order.email}.
          </p>
        </div>

        <section className={`mx-auto mt-8 max-w-3xl border p-5 ${status.tone}`}>
          <div className="flex gap-3">
            <StatusIcon aria-hidden="true" className="mt-0.5 h-6 w-6 shrink-0" />
            <div>
              <h2 className="font-semibold">{status.title}</h2>
              <p className="mt-1 text-sm leading-6">{status.detail}</p>
            </div>
          </div>
        </section>

        <div className="mt-10 grid gap-7 lg:grid-cols-[1fr_20rem]">
          <section className="border border-slate-200 bg-white">
            <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4 sm:px-6">
              <ReceiptText aria-hidden="true" className="h-5 w-5 text-teal-800" />
              <h2 className="font-[Georgia] text-2xl text-slate-950">
                Order details
              </h2>
            </div>
            <ul className="divide-y divide-slate-200">
              {order.items.map((item) => (
                <li
                  key={item.id}
                  className="flex justify-between gap-5 px-5 py-5 text-sm sm:px-6"
                >
                  <div>
                    <p className="font-semibold text-slate-950">{item.productName}</p>
                    <p className="mt-1 text-slate-500">
                      {item.variantTitle} · {item.sku} · Qty {item.quantity}
                    </p>
                  </div>
                  <p className="shrink-0 font-semibold text-slate-950">
                    {formatCad(item.lineTotalCents)}
                  </p>
                </li>
              ))}
            </ul>
            <dl className="space-y-3 border-t border-slate-200 bg-slate-50 px-5 py-5 text-sm sm:px-6">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-600">Subtotal</dt>
                <dd className="font-medium">{formatCad(order.subtotalCents)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-600">Shipping</dt>
                <dd className="font-medium">{formatCad(order.shippingTotalCents)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-600">Tax</dt>
                <dd className="font-medium">{formatCad(order.taxTotalCents)}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-slate-200 pt-3 text-base">
                <dt className="font-semibold">Total</dt>
                <dd className="font-bold">{formatCad(order.totalCents)}</dd>
              </div>
            </dl>
          </section>

          <aside className="space-y-5">
            <section className="border border-slate-200 bg-white p-5">
              <PackageCheck aria-hidden="true" className="h-5 w-5 text-teal-800" />
              <h2 className="mt-3 font-semibold text-slate-950">Fulfillment</h2>
              <p className="mt-2 text-sm capitalize text-slate-600">
                {order.fulfillmentMethod.replaceAll("_", " ")}
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.08em] text-slate-400">
                {order.fulfillmentStatus.replaceAll("_", " ")}
              </p>
              {order.shippingServiceCode ? (
                <p className="mt-3 text-xs text-slate-500">
                  Service: {order.shippingServiceCode}
                </p>
              ) : null}
              {order.shipment?.trackingPin ? (
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Tracking
                  </p>
                  <p className="mt-1 break-all text-sm font-semibold text-slate-800">
                    {order.shipment.trackingPin}
                  </p>
                  {order.shipment.trackingUrl ? (
                    <a
                      href={order.shipment.trackingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex text-sm font-semibold text-teal-800"
                    >
                      Track with Canada Post →
                    </a>
                  ) : null}
                </div>
              ) : null}
            </section>

            <section className="border border-slate-200 bg-white p-5">
              <MapPin aria-hidden="true" className="h-5 w-5 text-teal-800" />
              <h2 className="mt-3 font-semibold text-slate-950">
                {shippingAddress.length > 0 ? "Ship to" : "Pickup at"}
              </h2>
              {shippingAddress.length > 0 ? (
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {shippingAddress.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </p>
              ) : (
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  12071 First Ave #101
                  <br />
                  Richmond, BC V7E 3M1
                </p>
              )}
            </section>

            {order.returns.length > 0 ? (
              <section className="border border-slate-200 bg-white p-5">
                <h2 className="font-semibold text-slate-950">Returns</h2>
                <ul className="mt-3 space-y-3">
                  {order.returns.map((entry) => (
                    <li
                      key={entry.returnNumber}
                      className="rounded-xl bg-slate-50 p-3 text-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold">{entry.returnNumber}</p>
                        <span className="capitalize text-teal-800">
                          {entry.status.replaceAll("_", " ")}
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-slate-600">
                        {entry.resolution || entry.reason}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </aside>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href="/shop" className="btn-primary px-6 py-3">
            Return to shop
          </Link>
          <Link href="/account" className="btn-secondary px-6 py-3">
            Customer account
          </Link>
        </div>
      </div>
    </main>
  );
}
