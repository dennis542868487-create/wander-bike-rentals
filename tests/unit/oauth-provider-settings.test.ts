import { describe, expect, it } from "vitest";
import { readSocialAuthAvailability } from "@/lib/supabase/oauth-providers";

describe("Supabase social auth provider settings", () => {
  it("enables only providers explicitly reported by Supabase", () => {
    expect(
      readSocialAuthAvailability({
        external: {
          google: true,
          apple: false,
        },
      }),
    ).toEqual({
      google: true,
      apple: false,
    });
  });

  it("fails closed when provider settings are missing", () => {
    expect(readSocialAuthAvailability(null)).toEqual({
      google: false,
      apple: false,
    });
    expect(readSocialAuthAvailability({ external: null })).toEqual({
      google: false,
      apple: false,
    });
  });

  it("does not treat string values as enabled providers", () => {
    expect(
      readSocialAuthAvailability({
        external: {
          google: "true",
          apple: 1,
        },
      }),
    ).toEqual({
      google: false,
      apple: false,
    });
  });
});
