"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getOptionalSupabasePublicConfig,
  getSupabasePublicConfig,
} from "@/lib/supabase/config";

let browserClient: SupabaseClient | undefined;

export function getSupabaseBrowser() {
  if (browserClient) return browserClient;

  const { url, publishableKey } = getSupabasePublicConfig();
  browserClient = createBrowserClient(url, publishableKey, {
    auth: {
      flowType: "pkce",
      detectSessionInUrl: false,
      persistSession: true,
    },
  });

  return browserClient;
}

export function getOptionalSupabaseBrowser(): SupabaseClient | null {
  if (browserClient) return browserClient;

  const config = getOptionalSupabasePublicConfig();
  if (!config) return null;

  try {
    browserClient = createBrowserClient(config.url, config.publishableKey, {
      auth: {
        flowType: "pkce",
        detectSessionInUrl: false,
        persistSession: true,
      },
    });
  } catch {
    return null;
  }

  return browserClient;
}
