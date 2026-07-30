import {
  Bike,
  CalendarClock,
  MessagesSquare,
  PauseCircle,
  Plus,
} from "lucide-react";
import Link from "next/link";
import {
  ListingStatusBadge,
  RequestStatusBadge,
} from "@/components/marketplace/status-badge";
import { RentalAgreementDashboardCard } from "@/components/rental-agreement/rental-agreement-dashboard-card";
import { formatDateTime } from "@/lib/marketplace/format";
import { getOperationsOverview } from "@/lib/marketplace/server-data";
import { WANDER_DASHBOARD_LABEL } from "@/lib/marketplace/workspace-labels";
import { getCurrentStaff } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export default async function OperationsDashboardPage() {
  const staff = await getCurrentStaff();
  if (!staff) return null;
  const dashboard = await getOperationsOverview();
  const signals = [
    {
      label: "Live Wander Bikes",
      value: dashboard.counts.activeListings,
      href: "/operations/bikes?status=active",
      icon: Bike,
    },
    {
      label: "New requests",
      value: dashboard.counts.pendingRequests,
      href: "/operations/requests?status=pending",
      icon: MessagesSquare,
    },
    {
      label: "Pickups in 48h",
      value: dashboard.counts.upcomingPickups,
      href: "/operations/pickups",
      icon: CalendarClock,
    },
    {
      label: "Paused bikes",
      value: dashboard.counts.pausedListings,
      href: "/operations/bikes?status=paused",
      icon: PauseCircle,
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm font-bold text-teal-800">
            {WANDER_DASHBOARD_LABEL}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Rentals, sales, and pickups
          </h1>
          <p className="mt-2 text-slate-600">
            This workspace contains Wander-owned inventory only.
          </p>
        </div>
        <Link href="/operations/bikes/new" className="btn-primary">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Wander Bike
        </Link>
      </div>

      <RentalAgreementDashboardCard mode="wander" />

      <section className="mt-8 grid divide-y divide-slate-200 rounded-[0.9rem] border border-slate-200 bg-white sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">
        {signals.map((signal) => (
          <Link
            key={signal.label}
            href={signal.href}
            className="flex items-center justify-between gap-4 p-5 hover:bg-slate-50"
          >
            <div>
              <p className="text-sm text-slate-500">{signal.label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-950">
                {signal.value}
              </p>
            </div>
            <signal.icon className="h-5 w-5 text-teal-700" aria-hidden="true" />
          </Link>
        ))}
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="rounded-[0.9rem] border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 className="font-bold text-slate-950">Recently updated bikes</h2>
            <Link
              href="/operations/bikes"
              className="text-sm font-bold text-teal-800"
            >
              View all
            </Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {dashboard.recentListings.map((listing) => (
              <li
                key={listing.id}
                className="flex items-center justify-between gap-4 px-5 py-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-950">
                    {listing.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {listing.pickupArea}
                  </p>
                </div>
                <ListingStatusBadge status={listing.status} />
              </li>
            ))}
            {dashboard.recentListings.length === 0 ? (
              <li className="px-5 py-9 text-center text-sm text-slate-500">
                No Wander Bikes yet.
              </li>
            ) : null}
          </ul>
        </section>

        <section className="rounded-[0.9rem] border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 className="font-bold text-slate-950">Recent requests</h2>
            <Link
              href="/operations/requests"
              className="text-sm font-bold text-teal-800"
            >
              View all
            </Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {dashboard.recentRequests.map((request) => (
              <li
                key={request.id}
                className="flex items-center justify-between gap-4 px-5 py-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-950">
                    {request.listing.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {request.renterName} · {formatDateTime(request.createdAt)}
                  </p>
                </div>
                <RequestStatusBadge status={request.status} />
              </li>
            ))}
            {dashboard.recentRequests.length === 0 ? (
              <li className="px-5 py-9 text-center text-sm text-slate-500">
                No Wander Bike requests yet.
              </li>
            ) : null}
          </ul>
        </section>
      </div>
    </div>
  );
}
