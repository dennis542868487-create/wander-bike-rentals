import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RentalAgreementForm } from "@/components/rental-agreement/rental-agreement-form";
import { getCurrentStaff, getCurrentUser } from "@/lib/supabase/auth";

export const metadata: Metadata = {
  title: "Rental Agreement Form",
};

export default async function WanderRentalAgreementPage() {
  const [user, staff] = await Promise.all([getCurrentUser(), getCurrentStaff()]);
  if (!user) redirect("/auth?next=/operations/rental-agreement");
  if (!staff) redirect("/account");

  return (
    <RentalAgreementForm
      mode="wander"
      defaultProviderName="Wander Bike Rentals"
      defaultProviderContact="(778) 952-1389"
      defaultPreparedBy={user.email ?? ""}
    />
  );
}
