"use client";

import { AlertDialog } from "@base-ui-components/react/alert-dialog";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

/*
 * Replaces window.confirm across the dashboards. The native dialog blocks the
 * main thread, cannot be styled, and drops the visitor out of the product's
 * design language at exactly the moment they are deciding whether to destroy
 * something. Base UI brings the focus trap, focus restore, and Escape handling
 * that a hand-rolled dialog has to reimplement and usually gets wrong.
 *
 * The API stays promise-shaped so call sites read the way window.confirm did:
 *
 *   if (!(await confirm({ title: "Archive this listing?" }))) return;
 */

export type ConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** "danger" for destructive, irreversible actions. */
  tone?: "default" | "danger";
};

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

export function useConfirm(): ConfirmFn {
  const confirm = useContext(ConfirmContext);
  if (!confirm) {
    throw new Error("useConfirm must be used inside <ConfirmProvider>");
  }
  return confirm;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  /*
   * Settle any in-flight promise before opening another one. Without this an
   * abandoned confirm would leave its caller awaiting forever.
   */
  const confirm = useCallback<ConfirmFn>((next) => {
    resolveRef.current?.(false);
    setOptions(next);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const settle = useCallback((result: boolean) => {
    resolveRef.current?.(result);
    resolveRef.current = null;
    setOptions(null);
  }, []);

  const value = useMemo(() => confirm, [confirm]);
  const danger = options?.tone === "danger";

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <AlertDialog.Root
        open={options !== null}
        onOpenChange={(open) => {
          if (!open) settle(false);
        }}
      >
        <AlertDialog.Portal>
          <AlertDialog.Backdrop className="dialog-backdrop" />
          <AlertDialog.Popup className="dialog-popup">
            <AlertDialog.Title className="text-lg font-bold text-slate-950">
              {options?.title}
            </AlertDialog.Title>
            {options?.description ? (
              <AlertDialog.Description className="mt-2 text-sm leading-6 text-slate-600">
                {options.description}
              </AlertDialog.Description>
            ) : null}
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <AlertDialog.Close className="btn-quiet min-h-10 px-4 py-2 text-sm">
                {options?.cancelLabel ?? "Cancel"}
              </AlertDialog.Close>
              <button
                type="button"
                onClick={() => settle(true)}
                className={
                  danger
                    ? "btn-danger min-h-10 px-4 py-2 text-sm"
                    : "btn-primary min-h-10 px-4 py-2 text-sm"
                }
              >
                {options?.confirmLabel ?? "Confirm"}
              </button>
            </div>
          </AlertDialog.Popup>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </ConfirmContext.Provider>
  );
}
