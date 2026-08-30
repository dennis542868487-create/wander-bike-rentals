import { CirclePause } from "lucide-react";
import { RENTAL_REQUEST_STATUS } from "@/lib/marketplace/rental-request-status";

export function RentalPauseNotice({
  className = "",
  detail,
  prominent = false,
}: {
  className?: string;
  detail?: string;
  prominent?: boolean;
}) {
  if (RENTAL_REQUEST_STATUS.enabled) return null;

  if (prominent) {
    return (
      <div
        id="rental-service-status"
        role="status"
        className={`overflow-hidden rounded-[1.5rem] border-2 border-amber-300 bg-[linear-gradient(135deg,#fff8df_0%,#fffdf5_55%,#ffffff_100%)] p-5 text-amber-950 shadow-[0_16px_36px_rgba(146,64,14,0.12)] sm:p-6 ${className}`}
      >
        <div className="flex items-start gap-4 sm:gap-5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-600 text-white shadow-sm sm:h-12 sm:w-12">
            <CirclePause className="h-6 w-6" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-amber-700">
              Rental service update
            </p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
              Bike rentals are temporarily paused.
            </h2>
            {detail ? (
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700 sm:text-base sm:leading-7">
                {detail}
              </p>
            ) : null}
            <p className="mt-4 inline-flex rounded-full border border-amber-300 bg-white px-3 py-1.5 text-sm font-bold text-amber-900">
              Reason:&nbsp;
              <span lang="zh-Hant">{RENTAL_REQUEST_STATUS.reason}</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

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
          Bike rentals are temporarily paused.
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
