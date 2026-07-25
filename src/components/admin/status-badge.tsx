const tones: Record<string, string> = {
  paid: "border-emerald-200 bg-emerald-50 text-emerald-800",
  succeeded: "border-emerald-200 bg-emerald-50 text-emerald-800",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-800",
  delivered: "border-emerald-200 bg-emerald-50 text-emerald-800",
  picked_up: "border-emerald-200 bg-emerald-50 text-emerald-800",
  ready_for_pickup: "border-sky-200 bg-sky-50 text-sky-800",
  ready_to_ship: "border-sky-200 bg-sky-50 text-sky-800",
  shipped: "border-violet-200 bg-violet-50 text-violet-800",
  in_transit: "border-violet-200 bg-violet-50 text-violet-800",
  pending: "border-amber-200 bg-amber-50 text-amber-800",
  pending_payment: "border-amber-200 bg-amber-50 text-amber-800",
  reserved: "border-amber-200 bg-amber-50 text-amber-800",
  preparing: "border-cyan-200 bg-cyan-50 text-cyan-800",
  processing: "border-cyan-200 bg-cyan-50 text-cyan-800",
  failed: "border-rose-200 bg-rose-50 text-rose-800",
  cancelled: "border-slate-300 bg-slate-100 text-slate-600",
  refunded: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-800",
  partially_refunded: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-800",
};

export function StatusBadge({ value }: { value: string }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${
        tones[value] ?? "border-slate-200 bg-slate-50 text-slate-700"
      }`}
    >
      {value.replaceAll("_", " ")}
    </span>
  );
}
