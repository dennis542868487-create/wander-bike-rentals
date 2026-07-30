import { ArrowRight, Bike, CalendarCheck, ClipboardList, Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ListingStatusBadge, RequestStatusBadge } from "@/components/marketplace/status-badge";
import { RentalAgreementDashboardCard } from "@/components/rental-agreement/rental-agreement-dashboard-card";
import {
  getOwnedListings,
  getProfile,
  getRequestsForOwner,
  getRequestsForRenter,
} from "@/lib/marketplace/server-data";
import { COMMUNITY_DASHBOARD_LABEL } from "@/lib/marketplace/workspace-labels";
import { getCurrentUser } from "@/lib/supabase/auth";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/account");
  const [profile, listings, rentals, incoming] = await Promise.all([
    getProfile(user.id),
    getOwnedListings(user.id),
    getRequestsForRenter(user.id),
    getRequestsForOwner(user.id),
  ]);
  const pendingIncoming = incoming.filter((request) => request.status === "pending");

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm font-bold text-teal-800">
            {COMMUNITY_DASHBOARD_LABEL}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Welcome{profile?.fullName ? `, ${profile.fullName.split(" ")[0]}` : ""}.
          </h1>
          <p className="mt-2 text-slate-600">
            Rent bikes and manage your own listings from the same account.
          </p>
        </div>
        <Link href="/account/bikes/new" className="btn-primary">
          <Plus className="h-4 w-4" aria-hidden="true" />
          List a bike
        </Link>
      </div>

      <RentalAgreementDashboardCard mode="community" />

      <section className="mt-8 grid divide-y divide-slate-200 rounded-[0.9rem] border border-slate-200 bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {[
          { icon: CalendarCheck, label: "My open requests", value: rentals.filter((item) => ["pending", "accepted"].includes(item.status)).length, href: "/account/rentals" },
          { icon: Bike, label: "My bike listings", value: listings.filter((item) => item.status !== "archived").length, href: "/account/bikes" },
          { icon: ClipboardList, label: "Requests to review", value: pendingIncoming.length, href: "/account/requests" },
        ].map((item) => (
          <Link key={item.label} href={item.href} className="flex items-center justify-between gap-4 p-5 hover:bg-slate-50">
            <div>
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-950">{item.value}</p>
            </div>
            <item.icon className="h-5 w-5 text-teal-700" aria-hidden="true" />
          </Link>
        ))}
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-[0.9rem] border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 className="font-bold text-slate-950">Recent rental activity</h2>
            <Link href="/account/rentals" className="text-sm font-bold text-teal-800">
              View all
            </Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {rentals.slice(0, 4).map((request) => (
              <li key={request.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-950">
                    {request.listing.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {request.intent === "rent" ? "Rental request" : "Purchase inquiry"}
                  </p>
                </div>
                <RequestStatusBadge status={request.status} />
              </li>
            ))}
            {rentals.length === 0 ? (
              <li className="px-5 py-9 text-center text-sm text-slate-500">
                You have not requested a bike yet.
              </li>
            ) : null}
          </ul>
        </section>

        <section className="rounded-[0.9rem] border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 className="font-bold text-slate-950">My latest bikes</h2>
            <Link href="/account/bikes" className="text-sm font-bold text-teal-800">
              Manage
            </Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {listings.slice(0, 4).map((listing) => (
              <li key={listing.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-950">
                    {listing.title}
                  </p>
                  <p className="mt-1 text-xs capitalize text-slate-500">
                    {listing.source} listing
                  </p>
                </div>
                <ListingStatusBadge status={listing.status} />
              </li>
            ))}
            {listings.length === 0 ? (
              <li className="px-5 py-9 text-center text-sm text-slate-500">
                No bikes listed yet.
              </li>
            ) : null}
          </ul>
        </section>
      </div>

      {pendingIncoming.length > 0 ? (
        <Link
          href="/account/requests"
          className="mt-6 flex items-center justify-between gap-4 rounded-[0.9rem] border border-amber-200 bg-amber-50 p-5"
        >
          <div>
            <p className="font-bold text-amber-950">
              {pendingIncoming.length} booking {pendingIncoming.length === 1 ? "request needs" : "requests need"} your reply
            </p>
            <p className="mt-1 text-sm text-amber-800">
              Accept or decline from Booking Requests.
            </p>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-amber-800" aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}
