import Link from "next/link";
import { Search } from "lucide-react";
import { InventoryAdjustment } from "@/components/admin/inventory-adjustment";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  getAdminInventory,
  getAdminInventoryLedger,
} from "@/lib/admin/products";

export const dynamic = "force-dynamic";

function dateTime(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Vancouver",
  }).format(new Date(value));
}

function signedDelta(value: number) {
  return value > 0 ? `+${value}` : String(value);
}

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const filters = await searchParams;
  const [inventory, ledger] = await Promise.all([
    getAdminInventory(filters.q),
    getAdminInventoryLedger(filters.q),
  ]);

  return (
    <div>
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          Inventory
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          On-hand changes are atomic and recorded in the immutable inventory ledger.
        </p>
      </div>

      <form className="mt-5 flex gap-3 rounded-xl border border-slate-200 bg-white p-3">
        <label className="relative flex-1">
          <span className="sr-only">Search inventory</span>
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          />
          <input
            name="q"
            defaultValue={filters.q}
            placeholder="Product or SKU"
            className="h-11 w-full rounded-xl border border-slate-300 pl-10 pr-3 text-sm outline-none focus:border-teal-700"
          />
        </label>
        <button className="h-11 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white">
          Search
        </button>
      </form>

      <section className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Product / SKU</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Location</th>
                <th className="px-5 py-3 text-right">On hand</th>
                <th className="px-5 py-3 text-right">Reserved</th>
                <th className="px-5 py-3 text-right">Available</th>
                <th className="px-5 py-3 text-right">Reorder</th>
                <th className="px-5 py-3">Adjustment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 align-top">
              {inventory.map((row) => {
                const low = row.available <= row.reorderPoint;
                return (
                  <tr key={`${row.variantId}-${row.locationId}`}>
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/products/${row.productId}`}
                        className="font-semibold text-teal-800"
                      >
                        {row.productName}
                      </Link>
                      <p className="mt-1 text-xs text-slate-500">
                        {row.variantTitle} · {row.sku}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge value={row.productStatus} />
                      {row.allowBackorder ? (
                        <p className="mt-2 text-xs text-amber-700">Backorder allowed</p>
                      ) : null}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{row.locationName}</td>
                    <td className="px-5 py-4 text-right font-semibold">
                      {row.onHand}
                    </td>
                    <td className="px-5 py-4 text-right">{row.reserved}</td>
                    <td
                      className={`px-5 py-4 text-right font-bold ${
                        low ? "text-rose-700" : "text-emerald-700"
                      }`}
                    >
                      {row.available}
                    </td>
                    <td className="px-5 py-4 text-right">{row.reorderPoint}</td>
                    <td className="px-5 py-4">
                      <InventoryAdjustment
                        variantId={row.variantId}
                        locationId={row.locationId}
                      />
                    </td>
                  </tr>
                );
              })}
              {inventory.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center text-slate-500">
                    No inventory rows match this search.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-950">
            Recent inventory movements
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Immutable reservation, sale, release, return, and staff-adjustment
            records.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Time</th>
                <th className="px-5 py-3">Product / SKU</th>
                <th className="px-5 py-3">Event</th>
                <th className="px-5 py-3 text-right">On hand</th>
                <th className="px-5 py-3 text-right">Reserved</th>
                <th className="px-5 py-3">Order / operator</th>
                <th className="px-5 py-3">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 align-top">
              {ledger.map((entry) => (
                <tr key={entry.id}>
                  <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">
                    {dateTime(entry.createdAt)}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900">
                      {entry.productName}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {entry.variantTitle} · {entry.sku}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge value={entry.eventType} />
                  </td>
                  <td className="px-5 py-4 text-right font-semibold">
                    {signedDelta(entry.deltaOnHand)}
                  </td>
                  <td className="px-5 py-4 text-right font-semibold">
                    {signedDelta(entry.deltaReserved)}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    <p>{entry.orderNumber || "No order"}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {entry.actorName}
                    </p>
                  </td>
                  <td className="max-w-sm px-5 py-4 text-slate-600">
                    {entry.reason || "—"}
                  </td>
                </tr>
              ))}
              {ledger.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-slate-500"
                  >
                    No inventory movements match this search.
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
