import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let adminClient: SupabaseClient | null = null;
let browserClient: SupabaseClient | null = null;

export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new Error("Supabase server environment variables are not configured.");
  }

  if (!adminClient) {
    adminClient = createClient(url, secretKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return adminClient;
}

export function getSupabaseBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error("Supabase browser environment variables are not configured.");
  }

  if (!browserClient) {
    browserClient = createClient(url, publishableKey, {
      // The dedicated callback component exchanges the PKCE code. Disabling the
      // automatic exchange prevents the header and callback from consuming the
      // same one-time code concurrently.
      auth: { flowType: "pkce", detectSessionInUrl: false, persistSession: true },
    });
  }
  return browserClient;
}

export async function requireUser(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return { ok: false as const, status: 401, error: "Please sign in to continue." };

  const { data, error } = await getSupabaseAdmin().auth.getUser(token);
  if (error || !data.user) {
    return { ok: false as const, status: 401, error: "Your session has expired. Please sign in again." };
  }

  return { ok: true as const, user: data.user };
}

export async function requireBookingAdmin(request: Request) {
  const auth = await requireUser(request);
  if (!auth.ok) return auth;

  const { data, error } = await getSupabaseAdmin()
    .from("profiles")
    .select("role")
    .eq("id", auth.user.id)
    .single();

  if (error || !data || !["staff", "admin"].includes(data.role)) {
    return { ok: false as const, status: 403, error: "This account does not have staff access." };
  }

  return { ok: true as const, user: auth.user, role: data.role as "staff" | "admin" };
}
