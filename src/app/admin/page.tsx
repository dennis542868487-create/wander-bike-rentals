import { AlertTriangle, CalendarClock, MailWarning, MessagesSquare, Plus, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { ListingStatusBadge, RequestStatusBadge } from "@/components/marketplace/status-badge";
import { formatDateTime } from "@/lib/marketplace/format";
import { getAdminOverview } from "@/lib/marketplace/server-data";
import { PLATFORM_DASHBOARD_LABEL } from "@/lib/marketplace/workspace-labels";
import { getCurrentAdmin } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const admin = await getCurrentAdmin();
  if (!admin) return null;
  const dashboard = await getAdminOverview();
  const signals = [
    {
      label: "Open safety signals",
      value: dashboard.counts.openSafetyFlags,
      href: "/admin/safety?status=open",
      icon: ShieldAlert,
    },
    {
      label: "Open requests",
      value: dashboard.counts.pendingRequests,
      href: "/admin/requests?status=pending",
      icon: MessagesSquare,
    },
    {
      label: "Pickups in 48h",
      value: dashboard.counts.upcomingPickups,
      href: "/admin/requests?status=accepted",
      icon: CalendarClock,
    },
    {
      label: "Failed emails",
      value: dashboard.counts.failedEmails,
      href: "/admin/email?status=failed",
      icon: MailWarning,
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm font-bold text-teal-800">
            {PLATFORM_DASHBOARD_LABEL}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            What needs attention
          </h1>
          <p className="mt-2 text-slate-600">
            Site safety, account access, marketplace activity, and email delivery.
          </p>
        </div>
        <Link href="/operations/bikes/new" className="btn-primary">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Wander Bike
        </Link>
      </div>

      <section className="mt-8 grid divide-y divide-slate-200 rounded-[0.9rem] border border-slate-200 bg-white sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">
        {signals.map((signal) => (
          <Link
            key={signal.label}
            href={signal.href}
            className="flex items-center justify-between gap-4 p-5 hover:bg-slate-50"
          >
            <div>
              <p className="text-sm text-slate-500">{signal.label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-950">{signal.value}</p>
            </div>
            <signal.icon className="h-5 w-5 text-teal-700" aria-hidden="true" />
          </Link>
        ))}
      </section>

      {(dashboard.counts.openSafetyFlags > 0 ||
        dashboard.counts.failedEmails > 0) ? (
        <section className="mt-6 flex gap-3 rounded-[0.9rem] border border-amber-200 bg-amber-50 p-5">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-800" aria-hidden="true" />
          <div>
            <h2 className="font-bold text-amber-950">Action queue is not empty</h2>
            <p className="mt-1 text-sm text-amber-900">
              Review automatic safety signals when needed and retry failed
              notification emails from the Email page. Nothing is paused
              automatically.
            </p>
          </div>
        </section>
      ) : null}

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="rounded-[0.9rem] border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 className="font-bold text-slate-950">Recent listings</h2>
            <Link href="/admin/listings" className="text-sm font-bold text-teal-800">
              View all
            </Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {dashboard.recentListings.map((listing) => (
              <li key={listing.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-950">
                    {listing.title}
                  </p>
                  <p className="mt-1 text-xs capitalize text-slate-500">
                    {listing.source} · {listing.pickupArea}
                  </p>
                </div>
                <ListingStatusBadge status={listing.status} />
              </li>
            ))}
            {dashboard.recentListings.length === 0 ? (
              <li className="px-5 py-9 text-center text-sm text-slate-500">
                No marketplace listings yet.
              </li>
            ) : null}
          </ul>
        </section>

        <section className="rounded-[0.9rem] border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 className="font-bold text-slate-950">Recent requests</h2>
            <Link href="/admin/requests" className="text-sm font-bold text-teal-800">
              View all
            </Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {dashboard.recentRequests.map((request) => (
              <li key={request.id} className="flex items-center justify-between gap-4 px-5 py-4">
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
                No bike requests yet.
              </li>
            ) : null}
          </ul>
        </section>
      </div>
    </div>
  );
}
