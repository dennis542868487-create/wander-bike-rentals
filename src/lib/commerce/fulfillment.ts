import type { LocalDeliverySettings } from "@/lib/commerce/settings-types";
import { normalizeCanadianPostalCode } from "@/lib/commerce/schemas";

export function localDeliveryEligibility(
  postalCode: string,
  settings: LocalDeliverySettings,
) {
  const normalized = normalizeCanadianPostalCode(postalCode);
  const prefix = normalized.slice(0, 3);
  return {
    normalizedPostalCode: normalized,
    prefix,
    eligible:
      settings.enabled &&
      normalized.length === 6 &&
      settings.postalCodePrefixes.includes(prefix),
  };
}
