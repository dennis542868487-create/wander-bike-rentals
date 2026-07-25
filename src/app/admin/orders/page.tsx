import Link from "next/link";
import { Search } from "lucide-react";
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

  return (
    <div>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
          Sales operations
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Orders
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Search customers, review payment, and complete fulfillment from one place.
        </p>
      </div>

      <form className="mt-7 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr_13rem_13rem_auto]">
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
            className="h-11 w-full rounded-xl border border-slate-300 pl-10 pr-3 text-sm outline-none focus:border-teal-700"
          />
        </label>
        <select
          name="status"
          defaultValue={filters.status ?? "all"}
          className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-teal-700"
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
        <select
          name="fulfillment"
          defaultValue={filters.fulfillment ?? "all"}
          className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-teal-700"
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
        <button className="h-11 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white">
          Apply
        </button>
      </form>

      <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Payment</th>
                <th className="px-5 py-3">Fulfillment</th>
                <th className="px-5 py-3">Method</th>
                <th className="px-5 py-3 text-right">Net total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => (
                <tr key={order.id} className="transition hover:bg-slate-50/70">
                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-semibold text-teal-800"
                    >
                      {order.orderNumber}
                    </Link>
                    <p className="mt-1 text-xs text-slate-400">
                      {dateTime(order.createdAt)}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900">{order.customerName}</p>
                    <p className="text-xs text-slate-500">{order.email}</p>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge value={order.paymentStatus} />
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge value={order.fulfillmentStatus} />
                  </td>
                  <td className="px-5 py-4 capitalize text-slate-600">
                    {order.fulfillmentMethod.replaceAll("_", " ")}
                  </td>
                  <td className="px-5 py-4 text-right font-semibold">
                    {formatCad(order.totalCents - order.refundedTotalCents)}
                  </td>
                </tr>
              ))}
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-slate-500">
                    No orders match these filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
