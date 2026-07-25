import Link from "next/link";
import {
  AlertTriangle,
  Bike,
  Boxes,
  CircleDollarSign,
  PackageCheck,
  ShoppingBag,
  Store,
} from "lucide-react";
import { StatusBadge } from "@/components/admin/status-badge";
import { formatCad } from "@/lib/commerce/money";
import { getAdminDashboard } from "@/lib/admin/data";

export const dynamic = "force-dynamic";

function dateTime(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Vancouver",
  }).format(new Date(value));
}

export default async function AdminDashboardPage() {
  const dashboard = await getAdminDashboard();
  const cards = [
    {
      label: "New orders · 24h",
      value: dashboard.counts.newOrders,
      icon: ShoppingBag,
      href: "/admin/orders",
    },
    {
      label: "Awaiting shipment",
      value: dashboard.counts.awaitingShipment,
      icon: PackageCheck,
      href: "/admin/orders?fulfillment=ready_to_ship",
    },
    {
      label: "Ready for pickup",
      value: dashboard.counts.awaitingPickup,
      icon: Store,
      href: "/admin/orders?fulfillment=ready_for_pickup",
    },
    {
      label: "Payment attention",
      value: dashboard.counts.paymentAnomalies,
      icon: AlertTriangle,
      href: "/admin/orders?status=failed",
    },
    {
      label: "Low / out of stock",
      value: dashboard.counts.lowStock,
      icon: Boxes,
      href: "/admin/inventory",
    },
    {
      label: "Rentals · next 48h",
      value: dashboard.counts.upcomingRentals,
      icon: Bike,
      href: "/booking-admin",
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
            Operations overview
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            What needs attention today
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Sales and rental signals, kept intentionally practical.
          </p>
        </div>
        <Link
          href="/admin/orders"
          className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
        >
          Open sales orders
        </Link>
      </div>

      <section className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div>
              <p className="text-sm font-medium text-slate-500">{card.label}</p>
              <p className="mt-2 text-3xl font-bold text-slate-950">{card.value}</p>
            </div>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-800 transition group-hover:bg-teal-100">
              <card.icon aria-hidden="true" className="h-5 w-5" />
            </span>
          </Link>
        ))}
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-950 p-6 text-white">
          <CircleDollarSign aria-hidden="true" className="h-6 w-6 text-teal-300" />
          <p className="mt-5 text-sm text-slate-400">Net test sales · last 24h</p>
          <p className="mt-1 text-3xl font-bold">
            {formatCad(dashboard.revenue24hCents)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <CircleDollarSign aria-hidden="true" className="h-6 w-6 text-teal-700" />
          <p className="mt-5 text-sm text-slate-500">Net test sales · 30 days</p>
          <p className="mt-1 text-3xl font-bold text-slate-950">
            {formatCad(dashboard.revenue30dCents)}
          </p>
        </div>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_.85fr]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold text-slate-950">Recent sales orders</h2>
            <Link href="/admin/orders" className="text-sm font-semibold text-teal-800">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Order</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Payment</th>
                  <th className="px-5 py-3">Fulfillment</th>
                  <th className="px-5 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dashboard.recentOrders.map((order) => (
                  <tr key={order.id}>
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
                    <td className="px-5 py-4 text-right font-semibold">
                      {formatCad(order.totalCents)}
                    </td>
                  </tr>
                ))}
                {dashboard.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                      No sandbox sales orders yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="font-semibold text-slate-950">Low stock</h2>
            </div>
            <ul className="divide-y divide-slate-100">
              {dashboard.lowStock.map((item) => (
                <li key={item.variantId} className="flex justify-between gap-4 px-5 py-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {item.productName}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{item.sku}</p>
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      item.available === 0 ? "text-rose-700" : "text-amber-700"
                    }`}
                  >
                    {item.available} left
                  </span>
                </li>
              ))}
              {dashboard.lowStock.length === 0 ? (
                <li className="px-5 py-8 text-center text-sm text-slate-500">
                  No low-stock variants.
                </li>
              ) : null}
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="font-semibold text-slate-950">Upcoming rentals</h2>
            </div>
            <ul className="divide-y divide-slate-100">
              {dashboard.upcomingBookings.map((booking) => (
                <li key={booking.id} className="px-5 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold text-slate-900">
                      {booking.customerName}
                    </p>
                    <StatusBadge value={booking.status} />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    {dateTime(booking.startsAt)} · {booking.adultBikes} adult ·{" "}
                    {booking.kidsBikes} kids · {booking.trailers} trailer
                  </p>
                </li>
              ))}
              {dashboard.upcomingBookings.length === 0 ? (
                <li className="px-5 py-8 text-center text-sm text-slate-500">
                  No rentals in the next 48 hours.
                </li>
              ) : null}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
