import { CirclePause } from "lucide-react";
import { RENTAL_REQUEST_STATUS } from "@/lib/marketplace/rental-request-status";

export function RentalPauseNotice({
  className = "",
  detail,
}: {
  className?: string;
  detail?: string;
}) {
  if (RENTAL_REQUEST_STATUS.enabled) return null;

  return (
    <div
      role="status"
      className={`flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950 ${className}`}
    >
      <CirclePause
        className="mt-0.5 h-5 w-5 shrink-0 text-amber-700"
        aria-hidden="true"
      />
      <div>
        <p className="text-sm font-bold">
          Rental requests are temporarily paused.
        </p>
        <p className="mt-1 text-sm leading-6">
          Reason: <span lang="zh-Hant">{RENTAL_REQUEST_STATUS.reason}</span>
        </p>
        {detail ? (
          <p className="mt-1 text-sm leading-6 text-amber-900">{detail}</p>
        ) : null}
      </div>
    </div>
  );
}
