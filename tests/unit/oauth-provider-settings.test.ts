import { describe, expect, it } from "vitest";
import {
  readSocialAuthAvailability,
  socialAuthProviders,
} from "@/lib/supabase/oauth-providers";

describe("supported authentication providers", () => {
  it("exposes Google as the only social provider", () => {
    expect(socialAuthProviders).toEqual(["google"]);
  });

  it("reads Google availability and ignores other hosted providers", () => {
    expect(
      readSocialAuthAvailability({
        external: { google: true, apple: true, facebook: true },
      }),
    ).toEqual({ google: true });
  });
});
