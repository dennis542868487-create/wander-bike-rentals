"use client";

import { LayoutDashboard, ListPlus, Navigation, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthSession } from "@/hooks/use-auth-session";
import {
  isSiteAdminEmail,
  isWanderOperatorEmail,
} from "@/lib/marketplace/privileged-accounts";
import { WANDER_SHOP_DIRECTIONS_URL } from "@/lib/marketplace/wander-shop";

function actionClass(active: boolean) {
  return [
    "flex min-h-13 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-1.5 text-center text-[0.64rem] font-bold leading-none transition",
    active
      ? "bg-[var(--brand-soft)] text-[var(--brand-strong)]"
      : "text-slate-600 active:bg-slate-100",
  ].join(" ");
}

export function MobileActionBar() {
  const pathname = usePathname();
  const { session } = useAuthSession();

  if (
    pathname.startsWith("/auth") ||
    pathname.startsWith("/account") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/operations")
  ) {
    return null;
  }

  const signedInEmail = session?.user.email?.toLowerCase();
  const dashboardHref = !session
    ? "/auth"
    : isSiteAdminEmail(signedInEmail)
      ? "/admin"
      : isWanderOperatorEmail(signedInEmail)
        ? "/operations"
        : "/account";

  return (
    <>
      <div className="h-[5.4rem] md:hidden" aria-hidden="true" />
      <nav
        aria-label="Mobile quick actions"
        className="mobile-action-bar fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 gap-1 border-t border-slate-200 bg-white/95 px-2 pt-2 shadow-[0_-10px_30px_rgba(15,23,42,0.1)] backdrop-blur-xl md:hidden"
      >
        <Link
          href="/bikes"
          className={actionClass(
            pathname === "/bikes" || pathname.startsWith("/bikes/"),
          )}
        >
          <Search className="h-5 w-5" aria-hidden="true" />
          Find a Bike
        </Link>
        <Link
          href="/list-your-bike"
          className={actionClass(pathname.startsWith("/list-your-bike"))}
        >
          <ListPlus className="h-5 w-5" aria-hidden="true" />
          List Your Bike
        </Link>
        <Link href={dashboardHref} className={actionClass(false)}>
          <LayoutDashboard className="h-5 w-5" aria-hidden="true" />
          Dashboard
        </Link>
        <a
          href={WANDER_SHOP_DIRECTIONS_URL}
          target="_blank"
          rel="noreferrer"
          className={actionClass(false)}
        >
          <Navigation className="h-5 w-5" aria-hidden="true" />
          Go to Store
        </a>
      </nav>
    </>
  );
}
