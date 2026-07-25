import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";

export function hashGuestAccessToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function guestAccessMatches(token: string, expectedHash: string) {
  const actual = Buffer.from(hashGuestAccessToken(token), "hex");
  const expected = Buffer.from(expectedHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
