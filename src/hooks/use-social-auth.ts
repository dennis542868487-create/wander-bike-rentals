"use client";

import { useEffect, useState } from "react";
import { getOptionalSupabasePublicConfig } from "@/lib/supabase/config";
import {
  readSocialAuthAvailability,
  type SocialAuthAvailability,
} from "@/lib/supabase/oauth-providers";

const unavailableProviders: SocialAuthAvailability = {
  google: false,
};

export function useSocialAuth() {
  const [availability, setAvailability] =
    useState<SocialAuthAvailability>({
      google: null,
    });

  useEffect(() => {
    const config = getOptionalSupabasePublicConfig();
    if (!config) {
      void Promise.resolve().then(() =>
        setAvailability(unavailableProviders),
      );
      return;
    }

    const controller = new AbortController();
    void fetch(`${config.url}/auth/v1/settings`, {
      headers: { apikey: config.publishableKey },
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Supabase Auth settings are unavailable.");
        }
        return response.json() as Promise<unknown>;
      })
      .then((settings) => {
        if (!controller.signal.aborted) {
          setAvailability(readSocialAuthAvailability(settings));
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setAvailability(unavailableProviders);
        }
      });

    return () => controller.abort();
  }, []);

  return availability;
}
