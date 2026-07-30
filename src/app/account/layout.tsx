import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountShell } from "@/components/account/account-shell";
import { getProfile } from "@/lib/marketplace/server-data";
import { COMMUNITY_DASHBOARD_LABEL } from "@/lib/marketplace/workspace-labels";
import { getCurrentUser } from "@/lib/supabase/auth";

export const metadata: Metadata = {
  title: COMMUNITY_DASHBOARD_LABEL,
  robots: { index: false, follow: false },
};

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/account");
  const profile = await getProfile(user.id);
  return (
    <AccountShell
      email={user.email ?? profile?.email ?? ""}
      name={profile?.fullName ?? null}
      role={profile?.role ?? "customer"}
      marketplaceAccessStatus={profile?.marketplaceAccessStatus ?? "active"}
      marketplaceAccessReason={profile?.marketplaceAccessReason ?? null}
    >
      {children}
    </AccountShell>
  );
}
