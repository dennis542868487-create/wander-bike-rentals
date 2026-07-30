import type { ListingStatus, RequestStatus } from "@/lib/marketplace/types";
import { requestStatusLabel } from "@/lib/marketplace/format";

const listingLabels: Record<ListingStatus, string> = {
  draft: "Draft",
  active: "Live",
  paused: "Paused",
  reserved: "Reserved",
  sold: "Sold",
  archived: "Archived",
};

function statusClasses(status: ListingStatus | RequestStatus) {
  if (status === "active" || status === "accepted" || status === "completed") {
    return "bg-emerald-50 text-emerald-800";
  }
  if (status === "pending" || status === "reserved") {
    return "bg-amber-50 text-amber-800";
  }
  if (status === "declined" || status === "no_show") {
    return "bg-rose-50 text-rose-800";
  }
  return "bg-slate-100 text-slate-700";
}

export function ListingStatusBadge({ status }: { status: ListingStatus }) {
  return (
    <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-bold ${statusClasses(status)}`}>
      {listingLabels[status]}
    </span>
  );
}

export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  return (
    <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-bold ${statusClasses(status)}`}>
      {requestStatusLabel(status)}
    </span>
  );
}
