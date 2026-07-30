import "server-only";

import { cache } from "react";
import type { User } from "@supabase/supabase-js";
import {
  COMMUNITY_DASHBOARD_LABEL,
  PLATFORM_DASHBOARD_LABEL,
} from "@/lib/marketplace/workspace-labels";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AuthFailure = {
  ok: false;
  status: 401 | 403;
  error: string;
};

type UserAuthSuccess = {
  ok: true;
  user: User;
};

export type StaffRole = "staff" | "admin";

export type StaffAuthSuccess = UserAuthSuccess & {
  role: StaffRole;
};

function bearerToken(request?: Request) {
  return request?.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
}

export async function requireUser(
  request?: Request,
): Promise<AuthFailure | UserAuthSuccess> {
  const token = bearerToken(request);

  if (token) {
    const { data, error } = await getSupabaseAdmin().auth.getUser(token);
    if (!error && data.user) return { ok: true, user: data.user };
  } else {
    try {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase.auth.getUser();
      if (!error && data.user) return { ok: true, user: data.user };
    } catch {
      // Missing environment configuration is reported as an auth failure at
      // public route boundaries; privileged clients never receive the detail.
    }
  }

  return {
    ok: false,
    status: 401,
    error: "Your session has expired. Please sign in again.",
  };
}

export async function requireStaff(
  request?: Request,
): Promise<AuthFailure | StaffAuthSuccess> {
  const auth = await requireUser(request);
  if (!auth.ok) return auth;

  const { data, error } = await getSupabaseAdmin()
    .from("profiles")
    .select("role")
    .eq("id", auth.user.id)
    .single();

  if (error || !data || !["staff", "admin"].includes(data.role)) {
    return {
      ok: false,
      status: 403,
      error: "This account does not have staff access.",
    };
  }

  return {
    ok: true,
    user: auth.user,
    role: data.role as StaffRole,
  };
}

export async function requireAdmin(
  request?: Request,
): Promise<AuthFailure | StaffAuthSuccess> {
  const auth = await requireStaff(request);
  if (!auth.ok) return auth;
  if (auth.role !== "admin") {
    return {
      ok: false,
      status: 403,
      error: `This account does not have ${PLATFORM_DASHBOARD_LABEL} access.`,
    };
  }
  return auth;
}

export async function requireMarketplaceActor(
  request?: Request,
): Promise<AuthFailure | UserAuthSuccess> {
  const auth = await requireUser(request);
  if (!auth.ok) return auth;

  const { data, error } = await getSupabaseAdmin()
    .from("profiles")
    .select("marketplace_access_status")
    .eq("id", auth.user.id)
    .single();
  if (error || !data) {
    return {
      ok: false,
      status: 403,
      error: "Marketplace access could not be verified.",
    };
  }
  if (data.marketplace_access_status === "suspended") {
    return {
      ok: false,
      status: 403,
      error: `This account’s marketplace access is suspended. You can still view ${COMMUNITY_DASHBOARD_LABEL}.`,
    };
  }
  return auth;
}

export const getCurrentUser = cache(async () => {
  const auth = await requireUser();
  return auth.ok ? auth.user : null;
});

export const getCurrentStaff = cache(async () => {
  const auth = await requireStaff();
  return auth.ok ? auth : null;
});

export const getCurrentAdmin = cache(async () => {
  const auth = await requireAdmin();
  return auth.ok ? auth : null;
});

export const requireBookingAdmin = requireStaff;
