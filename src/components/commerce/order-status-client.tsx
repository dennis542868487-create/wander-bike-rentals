"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/commerce/cart-provider";

export function OrderStatusClient({
  paymentStatus,
  returnedFromStripe,
}: {
  paymentStatus: string;
  returnedFromStripe: boolean;
}) {
  const router = useRouter();
  const { clearCart } = useCart();

  useEffect(() => {
    if (["paid", "partially_refunded", "refunded"].includes(paymentStatus)) {
      clearCart();
      return;
    }
    if (!returnedFromStripe || paymentStatus !== "pending") return;

    let refreshCount = 0;
    const interval = window.setInterval(() => {
      refreshCount += 1;
      router.refresh();
      if (refreshCount >= 12) window.clearInterval(interval);
    }, 2500);

    return () => window.clearInterval(interval);
  }, [clearCart, paymentStatus, returnedFromStripe, router]);

  return null;
}
