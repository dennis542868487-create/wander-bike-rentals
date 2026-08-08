import { describe, expect, it } from "vitest";
import {
  listingLiveErrors,
  listingPhotoError,
  rentalAgreementLiveErrors,
  requestLiveErrors,
} from "@/lib/forms/live-validation";

describe("live form rules", () => {
  it("reports the combined listing price rule on the field being filled", () => {
    expect(
      listingLiveErrors(
        { offer_mode: "rent", rental_hourly: "", rental_daily: "" },
        "rental_hourly",
      ),
    ).toEqual({
      rental_hourly: "Add an hourly or daily rental price.",
    });
  });

  it("reports listing date order and included-item limits before submit", () => {
    const values = {
      offer_mode: "sale",
      available_from: "2026-08-20",
      available_until: "2026-08-10",
      included_items: Array.from({ length: 21 }, (_, index) => `Item ${index}`).join(","),
    };

    expect(listingLiveErrors(values)).toMatchObject({
      available_until:
        "Available-until date must be on or after the available-from date.",
      included_items: "Add no more than 20 included items.",
    });
  });

  it("checks request availability, time order, and minimum duration", () => {
    const rules = {
      minimumRentalHours: 4,
      availableFrom: "2026-08-10",
      availableUntil: "2026-08-30",
    };

    expect(
      requestLiveErrors(
        {
          intent: "rent",
          starts_at: "2026-08-11T12:00",
          ends_at: "2026-08-11T14:00",
        },
        rules,
        "ends_at",
        new Date("2026-08-08T12:00:00"),
      ),
    ).toEqual({
      ends_at: "This bike has a 4-hour minimum rental.",
    });

    expect(
      requestLiveErrors(
        {
          intent: "rent",
          starts_at: "2026-08-09T12:00",
          ends_at: "2026-08-31T12:00",
        },
        rules,
        undefined,
        new Date("2026-08-08T12:00:00"),
      ),
    ).toMatchObject({
      starts_at: "This bike is available from 2026-08-10.",
      ends_at: "This bike is available until 2026-08-30.",
    });
  });

  it("requires chronological agreement dates and at least one item", () => {
    expect(
      rentalAgreementLiveErrors({
        rental_start: "2026-08-12T14:00",
        expected_return: "2026-08-12T13:00",
        adult_bike_quantity: "0",
        kid_bike_quantity: "0",
        trailer_quantity: "0",
      }),
    ).toMatchObject({
      expected_return: "Expected return must be after the rental start.",
      adult_bike_quantity: "Add at least one bike or trailer to this agreement.",
    });
  });

  it("checks photo count, format, and size at selection time", () => {
    expect(
      listingPhotoError(
        [{ name: "bike.gif", type: "image/gif", size: 100 }],
        0,
      ),
    ).toContain("not supported");
    expect(
      listingPhotoError(
        [{ name: "bike.jpg", type: "image/jpeg", size: 4 * 1024 * 1024 + 1 }],
        0,
      ),
    ).toContain("larger than 4 MB");
    expect(
      listingPhotoError(
        [{ name: "bike.jpg", type: "image/jpeg", size: 100 }],
        8,
      ),
    ).toContain("no more than 0 additional photos");
  });
});
