import Link from "next/link";
import { PackageCheck } from "lucide-react";
import { StatusBadge } from "@/components/admin/status-badge";
import { formatCad } from "@/lib/commerce/money";
import { getCustomerOrderSummaries } from "@/lib/commerce/customer-orders";

export const dynamic = "force-dynamic";

function dateTime(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Vancouver",
  }).format(new Date(value));
}

export default async function AccountOrdersPage() {
  const result = await getCustomerOrderSummaries();

  return (
    <main className="min-h-[70vh] bg-[radial-gradient(circle_at_8%_5%,rgba(20,184,166,.18),transparent_34%),#f0fdf9] px-6 py-12 sm:py-16">
      <div className="mx-auto max-w-5xl">
        {!result ? (
          <div className="rounded-[2rem] border border-teal-100 bg-white p-8 text-center shadow-sm">
            <h1 className="text-3xl font-bold text-slate-950">Sign in to see orders</h1>
            <p className="mt-3 text-slate-600">
              Shop order history is private to your account.
            </p>
            <Link
              href="/auth?next=/account/orders"
              className="btn-primary mt-6 px-6 py-3"
            >
              Sign in
            </Link>
          </div>
        ) : (
          <>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[.18em] text-teal-700">
                Signed in as {result.user.email}
              </p>
              <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
                My shop orders
              </h1>
              <p className="mt-3 text-slate-600">
                Payment, fulfillment, and Canada Post tracking in one place.
              </p>
            </div>

            {result.orders.length === 0 ? (
              <div className="mt-8 rounded-[2rem] border border-dashed border-teal-200 bg-white/70 p-10 text-center">
                <PackageCheck
                  aria-hidden="true"
                  className="mx-auto h-10 w-10 text-teal-700"
                />
                <h2 className="mt-4 text-2xl font-bold text-slate-950">
                  No linked shop orders
                </h2>
                <p className="mt-2 text-slate-600">
                  Orders placed while signed in will appear here.
                </p>
                <Link href="/shop" className="btn-primary mt-6 px-6 py-3">
                  Browse shop
                </Link>
              </div>
            ) : (
              <div className="mt-8 grid gap-5">
                {result.orders.map((order) => (
                  <article
                    key={order.publicId}
                    className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                  >
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusBadge value={order.paymentStatus} />
                          <StatusBadge value={order.fulfillmentStatus} />
                        </div>
                        <h2 className="mt-4 text-xl font-bold text-slate-950">
                          {order.orderNumber}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                          {dateTime(order.createdAt)} ·{" "}
                          {order.fulfillmentMethod.replaceAll("_", " ")}
                        </p>
                        {order.shipments.some(
                          (shipment) => shipment.trackingPin,
                        ) ? (
                          <ul className="mt-2 space-y-1 text-sm text-slate-600">
                            {order.shipments
                              .filter((shipment) => shipment.trackingPin)
                              .map((shipment, index) => (
                                <li
                                  key={`${shipment.trackingPin}-${index}`}
                                  className="break-all"
                                >
                                  Package{" "}
                                  {shipment.packageNumber ?? index + 1}:{" "}
                                  {shipment.trackingPin}
                                </li>
                              ))}
                          </ul>
                        ) : null}
                      </div>
                      <div className="sm:text-right">
                        <p className="text-lg font-bold text-slate-950">
                          {formatCad(order.totalCents - order.refundedTotalCents)}
                        </p>
                        <Link
                          href={`/orders/${order.publicId}`}
                          className="mt-3 inline-flex rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                        >
                          View order
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
