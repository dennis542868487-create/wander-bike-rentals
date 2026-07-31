"use client";

import { Dialog } from "@base-ui-components/react/dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";

/*
 * The mobile navigation sheet for all three dashboards.
 *
 * This used to be a hand-rolled `{open ? <div className="fixed inset-0"> : null}`
 * in each shell. That version mounted and unmounted instantly — no entrance, no
 * exit — and its focus handling stopped at "focus the close button": Tab could
 * walk out into the page behind it, and closing dropped focus on the body.
 *
 * Base UI supplies the focus trap, focus restore, Escape handling, and scroll
 * lock, and stamps data-starting-style / data-ending-style so the sheet can
 * enter and leave along the edge it is anchored to (see .drawer-popup).
 */
export function DashboardDrawer({
  open,
  onOpenChange,
  label,
  tone,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  label: string;
  /** "dark" for the admin and operations shells, "light" for account. */
  tone: "dark" | "light";
  children: ReactNode;
}) {
  const dark = tone === "dark";

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="dialog-backdrop lg:hidden" />
        <Dialog.Popup
          aria-label={label}
          className={`drawer-popup p-4 lg:hidden ${
            dark ? "bg-slate-950 text-white" : "bg-white"
          }`}
        >
          <div className="flex items-center justify-between gap-4 px-2 py-2">
            <div>
              <Dialog.Title
                className={`font-bold ${dark ? "" : "text-slate-950"}`}
              >
                Wander Bike
              </Dialog.Title>
              <p
                className={`text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}
              >
                {label}
              </p>
            </div>
            <Dialog.Close
              aria-label="Close navigation"
              className={`dash-pressable flex h-11 w-11 items-center justify-center rounded-lg border ${
                dark
                  ? "border-slate-700 bg-slate-900 text-white"
                  : "border-slate-200 bg-white"
              }`}
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
