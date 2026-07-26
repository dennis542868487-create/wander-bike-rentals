import Link from "next/link";
import {
  AlertTriangle,
  Bike,
  Boxes,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
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
      label: "New orders",
      meta: "Last 24h",
      value: dashboard.counts.newOrders,
      icon: ShoppingBag,
      href: "/admin/orders",
      attention: false,
    },
    {
      label: "Payment attention",
      value: dashboard.counts.paymentAnomalies,
      icon: AlertTriangle,
      href: "/admin/orders?status=failed",
      attention: dashboard.counts.paymentAnomalies > 0,
    },
    {
      label: "Awaiting shipment",
      value: dashboard.counts.awaitingShipment,
      icon: PackageCheck,
      href: "/admin/orders?fulfillment=ready_to_ship",
      attention: false,
    },
    {
      label: "Ready for pickup",
      value: dashboard.counts.awaitingPickup,
      icon: Store,
      href: "/admin/orders?fulfillment=ready_for_pickup",
      attention: false,
    },
    {
      label: "Low stock",
      value: dashboard.counts.lowStock,
      icon: Boxes,
      href: "/admin/inventory",
      attention: dashboard.counts.lowStock > 0,
    },
    {
      label: "Rentals next 48h",
      value: dashboard.counts.upcomingRentals,
      icon: Bike,
      href: "/admin/rentals",
      attention: false,
    },
  ];

  const hasAttention =
    dashboard.counts.paymentAnomalies > 0 ||
    dashboard.counts.awaitingShipment > 0 ||
    dashboard.counts.lowStock > 0;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Home
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Today&apos;s orders, rentals, inventory, and store health.
          </p>
        </div>
        <Link
          href="/admin/orders"
          className="inline-flex h-10 items-center rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
        >
          View orders
        </Link>
      </div>

      <section
        aria-label="Operational summary"
        className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6"
      >
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="group rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:bg-slate-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-500">
                  {card.label}
                </p>
                {card.meta ? (
                  <p className="mt-0.5 text-xs text-slate-400">{card.meta}</p>
                ) : null}
              </div>
              <card.icon
                aria-hidden="true"
                className={`h-[18px] w-[18px] shrink-0 ${
                  card.attention ? "text-amber-600" : "text-slate-400"
                }`}
              />
            </div>
            <p className="mt-3 text-2xl font-bold tabular-nums text-slate-950">
              {card.value}
            </p>
          </Link>
        ))}
      </section>

      <section
        aria-label="Test revenue"
        className="mt-4 grid overflow-hidden rounded-xl border border-slate-200 bg-white sm:grid-cols-2"
      >
        <div className="flex items-center gap-3 px-4 py-4 sm:border-r sm:border-slate-200">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-800">
            <CircleDollarSign aria-hidden="true" className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-medium text-slate-500">
              Net test sales · Last 24h
            </p>
            <p className="mt-0.5 text-xl font-bold tabular-nums text-slate-950">
              {formatCad(dashboard.revenue24hCents)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 border-t border-slate-200 px-4 py-4 sm:border-t-0">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-800">
            <CircleDollarSign aria-hidden="true" className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-medium text-slate-500">
              Net test sales · Last 30 days
            </p>
            <p className="mt-0.5 text-xl font-bold tabular-nums text-slate-950">
              {formatCad(dashboard.revenue30dCents)}
            </p>
          </div>
        </div>
      </section>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(19rem,.72fr)]">
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3.5">
            <div>
              <h2 className="font-semibold text-slate-950">Recent orders</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {dashboard.recentOrders.length} recent{" "}
                {dashboard.recentOrders.length === 1 ? "order" : "orders"}
              </p>
            </div>
            <Link
              href="/admin/orders"
              className="text-sm font-semibold text-teal-800 hover:text-teal-950"
            >
              View all orders
            </Link>
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Fulfillment</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="w-10 px-2 py-3">
                    <span className="sr-only">Open</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dashboard.recentOrders.map((order) => (
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
                      <p className="mt-0.5 max-w-52 truncate text-xs text-slate-500">
                        {order.email}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge value={order.paymentStatus} />
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge value={order.fulfillmentStatus} />
                    </td>
                    <td className="px-4 py-3.5 text-right font-semibold tabular-nums">
                      {formatCad(order.totalCents)}
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
            {dashboard.recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="block px-4 py-4 transition hover:bg-slate-50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{order.orderNumber}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {order.customerName} · {dateTime(order.createdAt)}
                    </p>
                  </div>
                  <p className="shrink-0 font-semibold tabular-nums">
                    {formatCad(order.totalCents)}
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <StatusBadge value={order.paymentStatus} />
                  <StatusBadge value={order.fulfillmentStatus} />
                </div>
              </Link>
            ))}
          </div>

          {dashboard.recentOrders.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <ShoppingBag
                aria-hidden="true"
                className="mx-auto h-7 w-7 text-slate-400"
              />
              <p className="mt-3 text-sm font-semibold text-slate-700">
                No sandbox sales orders yet
              </p>
              <p className="mt-1 text-xs text-slate-500">
                New test orders will appear here.
              </p>
            </div>
          ) : null}
        </section>

        <div className="space-y-4">
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-4 py-3.5">
              <h2 className="font-semibold text-slate-950">Needs attention</h2>
            </div>
            {hasAttention ? (
              <div className="divide-y divide-slate-100">
                {dashboard.counts.paymentAnomalies > 0 ? (
                  <Link
                    href="/admin/orders?status=failed"
                    className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-slate-50"
                  >
                    <AlertTriangle
                      aria-hidden="true"
                      className="h-5 w-5 shrink-0 text-amber-600"
                    />
                    <span className="min-w-0 flex-1 text-sm text-slate-700">
                      <strong className="font-semibold text-slate-950">
                        {dashboard.counts.paymentAnomalies}{" "}
                        {dashboard.counts.paymentAnomalies === 1
                          ? "order needs"
                          : "orders need"}
                      </strong>{" "}
                      payment attention
                    </span>
                    <ChevronRight
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0 text-slate-400"
                    />
                  </Link>
                ) : null}
                {dashboard.counts.awaitingShipment > 0 ? (
                  <Link
                    href="/admin/orders?fulfillment=ready_to_ship"
                    className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-slate-50"
                  >
                    <PackageCheck
                      aria-hidden="true"
                      className="h-5 w-5 shrink-0 text-sky-600"
                    />
                    <span className="min-w-0 flex-1 text-sm text-slate-700">
                      <strong className="font-semibold text-slate-950">
                        {dashboard.counts.awaitingShipment}
                      </strong>{" "}
                      ready to ship
                    </span>
                    <ChevronRight
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0 text-slate-400"
                    />
                  </Link>
                ) : null}
                {dashboard.lowStock.map((item) => (
                  <Link
                    key={item.variantId}
                    href="/admin/inventory"
                    className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-slate-50"
                  >
                    <Boxes
                      aria-hidden="true"
                      className="h-5 w-5 shrink-0 text-rose-600"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-slate-950">
                        {item.productName}
                      </span>
                      <span className="block text-xs text-slate-500">
                        {item.sku} · {item.available} left
                      </span>
                    </span>
                    <ChevronRight
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0 text-slate-400"
                    />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="px-5 py-8 text-center">
                <CheckCircle2
                  aria-hidden="true"
                  className="mx-auto h-7 w-7 text-emerald-600"
                />
                <p className="mt-3 text-sm font-semibold text-slate-700">
                  No urgent actions
                </p>
              </div>
            )}
          </section>

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3.5">
              <h2 className="font-semibold text-slate-950">Upcoming rentals</h2>
              <CalendarDays aria-hidden="true" className="h-4 w-4 text-slate-400" />
            </div>
            <div className="divide-y divide-slate-100">
              {dashboard.upcomingBookings.map((booking) => (
                <Link
                  key={booking.id}
                  href="/admin/rentals"
                  className="block px-4 py-3.5 transition hover:bg-slate-50"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {booking.customerName}
                    </p>
                    <StatusBadge value={booking.status} />
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    {dateTime(booking.startsAt)} · {booking.adultBikes} adult ·{" "}
                    {booking.kidsBikes} kids · {booking.trailers} trailer
                  </p>
                </Link>
              ))}
              {dashboard.upcomingBookings.length === 0 ? (
                <div className="px-5 py-9 text-center">
                  <CalendarDays
                    aria-hidden="true"
                    className="mx-auto h-7 w-7 text-slate-400"
                  />
                  <p className="mt-3 text-sm text-slate-500">
                    No rentals in the next 48 hours.
                  </p>
                  <Link
                    href="/admin/rentals"
                    className="mt-3 inline-flex text-sm font-semibold text-teal-800 hover:text-teal-950"
                  >
                    View rental calendar
                  </Link>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
