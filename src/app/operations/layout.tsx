import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminSignOut } from "@/components/admin/admin-sign-out";
import { OperationsShell } from "@/components/operations/operations-shell";
import {
  COMMUNITY_DASHBOARD_LABEL,
  WANDER_DASHBOARD_LABEL,
} from "@/lib/marketplace/workspace-labels";
import { getCurrentStaff, getCurrentUser } from "@/lib/supabase/auth";

export const metadata: Metadata = {
  title: {
    default: WANDER_DASHBOARD_LABEL,
    template: `%s | ${WANDER_DASHBOARD_LABEL}`,
  },
  robots: { index: false, follow: false },
};

export default async function OperationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, staff] = await Promise.all([getCurrentUser(), getCurrentStaff()]);
  if (!user) redirect("/auth?next=/operations");
  if (!staff) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6">
        <div className="w-full max-w-md rounded-[0.9rem] bg-white p-8 text-center shadow-2xl">
          <p className="text-xs font-bold text-rose-700">ACCESS DENIED</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
            {WANDER_DASHBOARD_LABEL} access required
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {user.email} is signed in, but this account does not have Wander
            operations access.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/account" className="btn-secondary">
              {COMMUNITY_DASHBOARD_LABEL}
            </Link>
            <AdminSignOut nextPath="/operations" />
          </div>
        </div>
      </main>
    );
  }
  return (
    <OperationsShell email={user.email ?? ""} role={staff.role}>
      {children}
    </OperationsShell>
  );
}
