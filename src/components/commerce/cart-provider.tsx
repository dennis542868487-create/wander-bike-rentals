"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartLine } from "@/lib/commerce/types";

type CartContextValue = {
  lines: CartLine[];
  ready: boolean;
  itemCount: number;
  subtotalCents: number;
  addLine: (line: CartLine) => void;
  updateQuantity: (variantId: number, quantity: number) => void;
  removeLine: (variantId: number) => void;
  clearCart: () => void;
};

const STORAGE_KEY = "wander-bike-cart-v3";
const CartContext = createContext<CartContextValue | null>(null);

function clampQuantity(line: CartLine, quantity: number) {
  const maximum = line.allowBackorder ? 99 : Math.max(line.available, 1);
  return Math.min(Math.max(Math.trunc(quantity), 1), maximum);
}

function isCartLine(value: unknown): value is CartLine {
  if (!value || typeof value !== "object") return false;
  const line = value as Partial<CartLine>;
  return (
    typeof line.variantId === "number" &&
    typeof line.productSlug === "string" &&
    typeof line.productName === "string" &&
    typeof line.variantTitle === "string" &&
    typeof line.sku === "string" &&
    typeof line.unitPriceCents === "number" &&
    typeof line.quantity === "number" &&
    typeof line.available === "number" &&
    typeof line.allowBackorder === "boolean" &&
    typeof line.requiresShipping === "boolean" &&
    typeof line.pickupEligible === "boolean" &&
    typeof line.localDeliveryEligible === "boolean" &&
    typeof line.canadaPostEligible === "boolean" &&
    (line.shippingProfile === "standard" ||
      line.shippingProfile === "large" ||
      line.shippingProfile === "special")
  );
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let restoredLines: CartLine[] = [];

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          restoredLines = parsed
            .filter(isCartLine)
            .map((line) => ({ ...line, quantity: clampQuantity(line, line.quantity) }));
        }
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }

    queueMicrotask(() => {
      if (cancelled) return;
      setLines(restoredLines);
      setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, ready]);

  const addLine = useCallback((incoming: CartLine) => {
    setLines((current) => {
      const existing = current.find((line) => line.variantId === incoming.variantId);
      if (!existing) {
        return [
          ...current,
          { ...incoming, quantity: clampQuantity(incoming, incoming.quantity) },
        ];
      }

      return current.map((line) =>
        line.variantId === incoming.variantId
          ? {
              ...incoming,
              quantity: clampQuantity(incoming, line.quantity + incoming.quantity),
            }
          : line,
      );
    });
  }, []);

  const updateQuantity = useCallback((variantId: number, quantity: number) => {
    setLines((current) =>
      current.map((line) =>
        line.variantId === variantId
          ? { ...line, quantity: clampQuantity(line, quantity) }
          : line,
      ),
    );
  }, []);

  const removeLine = useCallback((variantId: number) => {
    setLines((current) => current.filter((line) => line.variantId !== variantId));
  }, []);

  const clearCart = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      ready,
      itemCount: lines.reduce((total, line) => total + line.quantity, 0),
      subtotalCents: lines.reduce(
        (total, line) => total + line.unitPriceCents * line.quantity,
        0,
      ),
      addLine,
      updateQuantity,
      removeLine,
      clearCart,
    }),
    [addLine, clearCart, lines, ready, removeLine, updateQuantity],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside CartProvider.");
  return value;
}
