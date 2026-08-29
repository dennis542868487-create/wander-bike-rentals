import { describe, expect, it } from "vitest";
import {
  RENTAL_REQUEST_STATUS,
  rentalRequestUnavailableMessage,
} from "@/lib/marketplace/rental-request-status";

describe("rental request status", () => {
  it("keeps new rental requests paused with the requested reason", () => {
    expect(RENTAL_REQUEST_STATUS).toEqual({
      enabled: false,
      reason: "需要更新",
    });
    expect(rentalRequestUnavailableMessage()).toBe(
      "Rental requests are temporarily paused. Reason: 需要更新",
    );
  });
});
