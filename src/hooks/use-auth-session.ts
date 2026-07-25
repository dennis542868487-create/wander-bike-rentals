"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getOptionalSupabaseBrowser } from "@/lib/supabase/browser";
import { getOptionalSupabasePublicConfig } from "@/lib/supabase/config";

export function useAuthSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(
    () => getOptionalSupabasePublicConfig() === null,
  );

  useEffect(() => {
    const client = getOptionalSupabaseBrowser();
    if (!client) return;

    const { data: listener } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setReady(true);
    });

    void client.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session);
      })
      .finally(() => {
        setReady(true);
      });

    return () => listener.subscription.unsubscribe();
  }, []);

  return { session, ready };
}
