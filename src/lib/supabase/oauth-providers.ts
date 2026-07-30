export const socialAuthProviders = ["google"] as const;

export type SocialAuthProvider = (typeof socialAuthProviders)[number];

export type SocialAuthAvailability = Record<
  SocialAuthProvider,
  boolean | null
>;

export function readSocialAuthAvailability(
  settings: unknown,
): Record<SocialAuthProvider, boolean> {
  const external =
    settings &&
    typeof settings === "object" &&
    "external" in settings &&
    settings.external &&
    typeof settings.external === "object"
      ? settings.external
      : null;

  return {
    google:
      external !== null &&
      "google" in external &&
      external.google === true,
  };
}
