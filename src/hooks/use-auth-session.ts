"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseBrowser } from "@/lib/supabase";

export function useAuthSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const client = getSupabaseBrowser();
    const { data: listener } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setReady(true);
    });

    void client.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return { session, ready };
}
