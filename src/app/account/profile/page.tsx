import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/account/profile-form";
import { getProfile } from "@/lib/marketplace/server-data";
import { getCurrentUser } from "@/lib/supabase/auth";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/account/profile");
  const profile = await getProfile(user.id);
  if (!profile) redirect("/auth?next=/account/profile");

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-slate-950">Profile</h1>
      <p className="mt-2 text-slate-600">
        Keep your contact details current for local pickup communication.
      </p>
      <div className="mt-7">
        <ProfileForm profile={profile} />
      </div>
    </div>
  );
}
