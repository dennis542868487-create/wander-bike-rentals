import { FlaskConical } from "lucide-react";

export function SandboxBanner() {
  return (
    <div className="border-b border-amber-300 bg-amber-50 text-amber-950">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-2 text-center text-xs font-semibold sm:text-sm">
        <FlaskConical aria-hidden="true" className="h-4 w-4 shrink-0" />
        Test mode: no real payment will be captured and no real shipment will be purchased.
      </div>
    </div>
  );
}
