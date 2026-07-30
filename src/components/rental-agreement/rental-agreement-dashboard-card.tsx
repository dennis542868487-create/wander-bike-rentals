import {
  ArrowRight,
  Download,
  FileSignature,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import type { RentalAgreementMode } from "@/lib/rental-agreement";

export function RentalAgreementDashboardCard({
  mode,
}: {
  mode: RentalAgreementMode;
}) {
  const href =
    mode === "wander"
      ? "/operations/rental-agreement"
      : "/account/rental-agreement";

  return (
    <section className="mt-7 overflow-hidden rounded-[1.25rem] bg-slate-950 text-white shadow-[0_18px_45px_rgba(15,23,42,0.14)]">
      <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-center lg:p-7">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-400 text-slate-950">
            <FileSignature className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-teal-300">
              Required before bike handoff
            </p>
            <h2 className="mt-1.5 text-xl font-bold tracking-tight sm:text-2xl">
              Have the renter complete and sign the rental agreement.
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
              Fill it together on a phone, download the signed PDF, and keep
              your own copy. Wander Bike does not permanently store the form
              or signature.
            </p>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-slate-300 sm:text-sm">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck
                  className="h-4 w-4 text-teal-300"
                  aria-hidden="true"
                />
                Nothing is saved to the account
              </span>
              <span className="inline-flex items-center gap-2">
                <Download
                  className="h-4 w-4 text-teal-300"
                  aria-hidden="true"
                />
                Signed PDF downloads to this device
              </span>
            </div>
          </div>
        </div>
        <Link
          href={href}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-teal-50 lg:w-auto"
          style={{ color: "#0f172a" }}
        >
          Open rental form
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
