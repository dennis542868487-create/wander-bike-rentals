"use client";

import {
  LayoutDashboard,
  ListPlus,
  LoaderCircle,
  MapPinned,
  Search,
  Store,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useNearestTrail } from "@/hooks/use-nearest-trail";
import {
  isSiteAdminEmail,
  isWanderOperatorEmail,
} from "@/lib/marketplace/privileged-accounts";
import { WANDER_SHOP_DIRECTIONS_URL } from "@/lib/marketplace/wander-shop";

function actionClass(active: boolean) {
  return [
    "flex min-h-[3.7rem] min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-0.5 py-1 text-center !text-[0.61rem] font-bold !leading-[1.05] transition",
    active
      ? "bg-teal-300 !text-slate-950 shadow-[0_6px_18px_rgba(45,212,191,0.28)]"
      : "!text-white hover:bg-white/10 active:bg-white/15",
  ].join(" ");
}

export function MobileActionBar() {
  const pathname = usePathname();
  const { session } = useAuthSession();
  const { findNearestTrail, state: trailState } = useNearestTrail({
    useFallbackOnError: true,
  });

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
      <div
        className="h-[calc(4.9rem+env(safe-area-inset-bottom))] md:hidden"
        aria-hidden="true"
      />
      <nav
        aria-label="Mobile quick actions"
        className="mobile-action-bar fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 gap-1 border-t border-teal-300/70 bg-[#052e2b]/95 px-1.5 pt-1 shadow-[0_-12px_34px_rgba(15,23,42,0.3)] backdrop-blur-xl md:hidden"
      >
        <Link
          href="/bikes"
          className={actionClass(
            pathname === "/bikes" || pathname.startsWith("/bikes/"),
          )}
        >
          <Search className="h-5 w-5 shrink-0" aria-hidden="true" />
          Find a Bike
        </Link>
        <Link
          href="/list-your-bike"
          className={actionClass(pathname.startsWith("/list-your-bike"))}
        >
          <ListPlus className="h-5 w-5 shrink-0" aria-hidden="true" />
          List Your Bike
        </Link>
        <Link href={dashboardHref} className={actionClass(false)}>
          <LayoutDashboard className="h-5 w-5 shrink-0" aria-hidden="true" />
          Dashboard
        </Link>
        <a
          href={WANDER_SHOP_DIRECTIONS_URL}
          target="_blank"
          rel="noreferrer"
          className={actionClass(false)}
        >
          <Store className="h-5 w-5 shrink-0" aria-hidden="true" />
          Go to Store
        </a>
        <button
          type="button"
          onClick={findNearestTrail}
          disabled={trailState.status === "locating"}
          aria-busy={trailState.status === "locating"}
          className={`${actionClass(false)} disabled:cursor-wait disabled:opacity-70`}
        >
          {trailState.status === "locating" ? (
            <LoaderCircle
              className="h-5 w-5 shrink-0 animate-spin"
              aria-hidden="true"
            />
          ) : (
            <MapPinned className="h-5 w-5 shrink-0" aria-hidden="true" />
          )}
          {trailState.status === "locating" ? "Locating…" : "Nearest Trail"}
        </button>
      </nav>
    </>
  );
}
