import Link from "next/link";
import { ChevronRight, Search, ShoppingBag, X } from "lucide-react";
import { StatusBadge } from "@/components/admin/status-badge";
import { getAdminOrders } from "@/lib/admin/data";
import { formatCad } from "@/lib/commerce/money";

export const dynamic = "force-dynamic";

function dateTime(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Vancouver",
  }).format(new Date(value));
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    fulfillment?: string;
    q?: string;
  }>;
}) {
  const filters = await searchParams;
  const orders = await getAdminOrders({
    status: filters.status,
    fulfillment: filters.fulfillment,
    query: filters.q,
  });
  const hasFilters = Boolean(
    filters.q ||
      (filters.status && filters.status !== "all") ||
      (filters.fulfillment && filters.fulfillment !== "all"),
  );

  return (
    <div>
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          Orders
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Search customers, review payment, and complete fulfillment.
        </p>
      </div>

      <form className="mt-5 grid gap-3 rounded-xl border border-slate-200 bg-white p-3 lg:grid-cols-[minmax(16rem,1fr)_12rem_12rem_auto_auto]">
        <label className="relative">
          <span className="sr-only">Search orders</span>
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          />
          <input
            name="q"
            defaultValue={filters.q}
            placeholder="Order, customer, or email"
            className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
          />
        </label>
        <label>
          <span className="sr-only">Payment status</span>
          <select
            name="status"
            defaultValue={filters.status ?? "all"}
            className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
          >
            <option value="all">All payment states</option>
            {["pending", "paid", "failed", "partially_refunded", "refunded"].map(
              (status) => (
                <option key={status} value={status}>
                  {status.replaceAll("_", " ")}
                </option>
              ),
            )}
          </select>
        </label>
        <label>
          <span className="sr-only">Fulfillment status</span>
          <select
            name="fulfillment"
            defaultValue={filters.fulfillment ?? "all"}
            className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
          >
            <option value="all">All fulfillment</option>
            {[
              "reserved",
              "preparing",
              "ready_for_pickup",
              "ready_to_ship",
              "shipped",
              "delivered",
              "picked_up",
              "cancelled",
            ].map((status) => (
              <option key={status} value={status}>
                {status.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>
        <button className="h-10 rounded-lg bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2">
          Apply
        </button>
        {hasFilters ? (
          <Link
            href="/admin/orders"
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
          >
            <X aria-hidden="true" className="h-4 w-4" />
            Clear
          </Link>
        ) : (
          <span aria-hidden="true" />
        )}
      </form>

      <section className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3.5">
          <h2 className="font-semibold text-slate-950">
            {hasFilters ? "Filtered orders" : "All orders"}
          </h2>
          <p className="text-sm text-slate-500">
            {orders.length} {orders.length === 1 ? "order" : "orders"}
          </p>
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="sticky top-0 bg-slate-50/95 text-xs font-semibold text-slate-500 backdrop-blur">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Fulfillment</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3 text-right">Net total</th>
                <th className="w-10 px-2 py-3">
                  <span className="sr-only">Open</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => (
                <tr key={order.id} className="group transition hover:bg-slate-50/80">
                  <td className="px-4 py-3.5">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-semibold text-slate-950 hover:text-teal-800"
                    >
                      {order.orderNumber}
                    </Link>
                    <p className="mt-1 text-xs text-slate-400">
                      {dateTime(order.createdAt)}
                    </p>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="font-medium text-slate-900">
                      {order.customerName}
                    </p>
                    <p className="mt-0.5 max-w-64 truncate text-xs text-slate-500">
                      {order.email}
                    </p>
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge value={order.paymentStatus} />
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge value={order.fulfillmentStatus} />
                  </td>
                  <td className="px-4 py-3.5 capitalize text-slate-600">
                    {order.fulfillmentMethod.replaceAll("_", " ")}
                  </td>
                  <td className="px-4 py-3.5 text-right font-semibold tabular-nums">
                    {formatCad(order.totalCents - order.refundedTotalCents)}
                  </td>
                  <td className="px-2 py-3.5">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      aria-label={`Open order ${order.orderNumber}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition group-hover:text-slate-700 hover:bg-slate-100"
                    >
                      <ChevronRight aria-hidden="true" className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-slate-100 md:hidden">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/admin/orders/${order.id}`}
              className="block px-4 py-4 transition hover:bg-slate-50"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-950">{order.orderNumber}</p>
                  <p className="mt-1 truncate text-xs text-slate-500">
                    {order.customerName} · {order.email}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {dateTime(order.createdAt)}
                  </p>
                </div>
                <p className="shrink-0 font-semibold tabular-nums">
                  {formatCad(order.totalCents - order.refundedTotalCents)}
                </p>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <StatusBadge value={order.paymentStatus} />
                <StatusBadge value={order.fulfillmentStatus} />
                <span className="text-xs capitalize text-slate-500">
                  {order.fulfillmentMethod.replaceAll("_", " ")}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {orders.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <ShoppingBag
              aria-hidden="true"
              className="mx-auto h-7 w-7 text-slate-400"
            />
            <p className="mt-3 text-sm font-semibold text-slate-700">
              No orders match these filters
            </p>
            <Link
              href="/admin/orders"
              className="mt-3 inline-flex text-sm font-semibold text-teal-800 hover:text-teal-950"
            >
              Clear filters
            </Link>
          </div>
        ) : null}
      </section>
    </div>
  );
}
