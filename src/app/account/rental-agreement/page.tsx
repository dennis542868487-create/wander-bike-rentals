import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RentalAgreementForm } from "@/components/rental-agreement/rental-agreement-form";
import { getProfile } from "@/lib/marketplace/server-data";
import { getCurrentUser } from "@/lib/supabase/auth";

export const metadata: Metadata = {
  title: "Rental Agreement Form",
};

export default async function CommunityRentalAgreementPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/account/rental-agreement");
  const profile = await getProfile(user.id);
  const providerName =
    profile?.fullName?.trim() || user.email?.split("@")[0] || "";

  return (
    <RentalAgreementForm
      mode="community"
      defaultProviderName={providerName}
      defaultProviderContact={user.email ?? ""}
      defaultPreparedBy={providerName}
    />
  );
}
