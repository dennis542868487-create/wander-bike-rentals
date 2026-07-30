import { AlertTriangle, CheckCircle2, Clock, X } from "lucide-react";
import Link from "next/link";
import { ProcessEmailButton } from "@/components/admin/email-actions";
import { emailDeliveryIsConfigured } from "@/lib/email/process-outbox";
import { formatDateTime } from "@/lib/marketplace/format";
import { getNotificationOutbox } from "@/lib/marketplace/server-data";
import { getCurrentAdmin } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export default async function AdminEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) return null;
  const filters = await searchParams;
  const [rows, configured] = await Promise.all([
    getNotificationOutbox(filters.status),
    Promise.resolve(emailDeliveryIsConfigured()),
  ]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Email
          </h1>
          <p className="mt-2 text-slate-600">
            Resend delivery queue for listings, requests, and pickup reminders.
          </p>
        </div>
        <ProcessEmailButton />
      </div>

      <div className={`mt-7 flex gap-3 rounded-[0.9rem] border p-5 ${configured ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
        {configured ? (
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" aria-hidden="true" />
        ) : (
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-800" aria-hidden="true" />
        )}
        <div>
          <h2 className={`font-bold ${configured ? "text-emerald-950" : "text-amber-950"}`}>
            {configured ? "Resend is configured for this environment" : "Resend setup is incomplete"}
          </h2>
          <p className={`mt-1 text-sm ${configured ? "text-emerald-900" : "text-amber-900"}`}>
            {configured
              ? "Queued messages can be sent now and retried safely."
              : "Set RESEND_API_KEY and EMAIL_FROM before relying on notification delivery."}
          </p>
        </div>
      </div>

      <form className="mt-6 flex flex-wrap gap-3">
        <select name="status" defaultValue={filters.status ?? "all"} className="market-select mt-0 w-full bg-white sm:w-48" aria-label="Email status">
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="sending">Sending</option>
          <option value="sent">Sent</option>
          <option value="failed">Failed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button className="btn-primary">Filter</button>
        {filters.status && filters.status !== "all" ? (
          <Link href="/admin/email" className="btn-quiet text-sm">
            <X className="h-4 w-4" aria-hidden="true" />
            Clear
          </Link>
        ) : null}
      </form>

      <div className="mt-5 hidden overflow-hidden rounded-[0.9rem] border border-slate-200 bg-white md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Template</th>
              <th className="px-5 py-3">Recipient</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Created / attempts</th>
              <th className="px-5 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.id} className="align-top">
                <td className="px-5 py-4 font-semibold text-slate-950">
                  {row.templateKey.replaceAll("_", " ")}
                  {row.lastError ? <p className="mt-2 max-w-sm text-xs font-normal leading-5 text-rose-700">{row.lastError}</p> : null}
                </td>
                <td className="px-5 py-4 text-slate-600">{row.recipient}</td>
                <td className="px-5 py-4">
                  <EmailStatus status={row.status} />
                </td>
                <td className="px-5 py-4 text-xs text-slate-500">
                  {formatDateTime(row.createdAt)}
                  <p className="mt-1">{row.attemptCount} attempts</p>
                </td>
                <td className="px-5 py-4">
                  {row.status === "failed" || row.status === "cancelled" ? (
                    <ProcessEmailButton notificationId={row.id} />
                  ) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 space-y-3 md:hidden">
        {rows.map((row) => (
          <article key={row.id} className="rounded-[0.9rem] border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <p className="font-bold capitalize text-slate-950">
                {row.templateKey.replaceAll("_", " ")}
              </p>
              <EmailStatus status={row.status} />
            </div>
            <p className="mt-2 break-all text-sm text-slate-600">{row.recipient}</p>
            <p className="mt-3 text-xs text-slate-500">
              {formatDateTime(row.createdAt)} · {row.attemptCount} attempts
            </p>
            {row.lastError ? <p className="mt-3 text-sm leading-6 text-rose-700">{row.lastError}</p> : null}
            {row.status === "failed" || row.status === "cancelled" ? (
              <div className="mt-4 border-t border-slate-100 pt-4">
                <ProcessEmailButton notificationId={row.id} />
              </div>
            ) : null}
          </article>
        ))}
      </div>
      {rows.length === 0 ? (
        <div className="mt-5 rounded-[0.9rem] border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-600">
          No email events match this filter.
        </div>
      ) : null}
    </div>
  );
}

function EmailStatus({
  status,
}: {
  status: "pending" | "sending" | "sent" | "failed" | "cancelled";
}) {
  const classes =
    status === "sent"
      ? "bg-emerald-50 text-emerald-800"
      : status === "failed"
        ? "bg-rose-50 text-rose-800"
        : "bg-amber-50 text-amber-800";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold capitalize ${classes}`}>
      {status === "sent" ? (
        <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
      ) : (
        <Clock className="h-3 w-3" aria-hidden="true" />
      )}
      {status}
    </span>
  );
}
