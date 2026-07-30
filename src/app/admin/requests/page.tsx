import { X } from "lucide-react";
import Link from "next/link";
import { RequestCard } from "@/components/account/request-card";
import { requestStatuses } from "@/lib/marketplace/types";
import { getAdminRequests } from "@/lib/marketplace/server-data";
import { getCurrentAdmin } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export default async function AdminRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; intent?: string }>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) return null;
  const filters = await searchParams;
  const requests = await getAdminRequests(filters);
  const hasFilters = Boolean(
    (filters.status && filters.status !== "all") ||
      (filters.intent && filters.intent !== "all"),
  );

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-slate-950">Requests</h1>
      <p className="mt-2 text-slate-600">
        Rental reservations and purchase inquiries across the marketplace.
      </p>
      <form className="mt-7 flex flex-wrap gap-3 rounded-[0.9rem] border border-slate-200 bg-white p-4">
        <select name="status" defaultValue={filters.status ?? "all"} className="market-select mt-0 w-full sm:w-48" aria-label="Request status">
          <option value="all">All statuses</option>
          {requestStatuses.map((status) => (
            <option key={status} value={status}>
              {status.replaceAll("_", " ")}
            </option>
          ))}
        </select>
        <select name="intent" defaultValue={filters.intent ?? "all"} className="market-select mt-0 w-full sm:w-48" aria-label="Request type">
          <option value="all">Rent and buy</option>
          <option value="rent">Rental requests</option>
          <option value="buy">Purchase inquiries</option>
        </select>
        <button className="btn-primary">Filter</button>
        {hasFilters ? (
          <Link href="/admin/requests" className="btn-quiet text-sm">
            <X className="h-4 w-4" aria-hidden="true" />
            Clear
          </Link>
        ) : null}
      </form>
      <p className="mt-5 text-sm font-semibold text-slate-600">
        {requests.length} {requests.length === 1 ? "request" : "requests"}
      </p>
      {requests.length > 0 ? (
        <div className="mt-4 space-y-5">
          {requests.map((request) => (
            <RequestCard key={request.id} request={request} viewer="admin" />
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-[0.9rem] border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-600">
          No requests match these filters.
        </div>
      )}
    </div>
  );
}
