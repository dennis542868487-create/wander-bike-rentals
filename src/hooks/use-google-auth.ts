"use client";

import { useEffect, useState } from "react";

export function useGoogleAuth() {
  const [enabled, setEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) {
      void Promise.resolve().then(() => setEnabled(false));
      return;
    }
    void fetch(`${url}/auth/v1/settings`, { headers: { apikey: key } })
      .then((response) => response.json())
      .then((settings) => setEnabled(Boolean(settings.external?.google)))
      .catch(() => setEnabled(false));
  }, []);

  return enabled;
}
