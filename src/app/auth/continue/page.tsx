import { redirect } from "next/navigation";
import { getProfile } from "@/lib/marketplace/server-data";
import { workspaceRouteForRole } from "@/lib/marketplace/workspace-route";
import { getCurrentUser } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export default async function AuthContinuePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth");
  const profile = await getProfile(user.id);
  redirect(workspaceRouteForRole(profile?.role));
}
