import { redirect } from "next/navigation";
import { ListingForm } from "@/components/account/listing-form";
import { getCurrentStaff, getCurrentUser } from "@/lib/supabase/auth";

export default async function NewWanderBikePage() {
  const [user, staff] = await Promise.all([getCurrentUser(), getCurrentStaff()]);
  if (!user) redirect("/auth?next=/operations/bikes/new");
  if (!staff) redirect("/account");

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-slate-950">
        Add a Wander Bike
      </h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Add one Wander-owned bike with its own rent and/or sale prices.
      </p>
      <div className="mt-7">
        <ListingForm
          userId={user.id}
          isStaff
          requestedSource="wander"
          returnTo="/operations/bikes"
          lockSource
        />
      </div>
    </div>
  );
}
