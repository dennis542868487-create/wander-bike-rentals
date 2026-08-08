export type LiveFormValues = Record<
  string,
  string | number | null | undefined
>;

function text(values: LiveFormValues, key: string) {
  const candidate = values[key];
  return candidate === null || candidate === undefined
    ? ""
    : String(candidate).trim();
}

function preferredField(
  changedFieldName: string | undefined,
  candidates: string[],
  fallback: string,
) {
  return changedFieldName && candidates.includes(changedFieldName)
    ? changedFieldName
    : fallback;
}

function localDateTime(value: string) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function listingLiveErrors(
  values: LiveFormValues,
  changedFieldName?: string,
) {
  const errors: Record<string, string> = {};
  const offerMode = text(values, "offer_mode");
  const rents = offerMode === "rent" || offerMode === "rent_sale";

  if (
    rents &&
    !text(values, "rental_hourly") &&
    !text(values, "rental_daily")
  ) {
    const field = preferredField(
      changedFieldName,
      ["rental_hourly", "rental_daily"],
      "rental_daily",
    );
    errors[field] = "Add an hourly or daily rental price.";
  }

  const availableFrom = text(values, "available_from");
  const availableUntil = text(values, "available_until");
  if (
    availableFrom &&
    availableUntil &&
    availableUntil < availableFrom
  ) {
    errors.available_until =
      "Available-until date must be on or after the available-from date.";
  }

  const includedItems = text(values, "included_items")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  if (includedItems.length > 20) {
    errors.included_items = "Add no more than 20 included items.";
  } else if (includedItems.some((item) => item.length > 80)) {
    errors.included_items =
      "Each included item must be 80 characters or fewer.";
  }

  return errors;
}

export type RequestLiveRules = {
  minimumRentalHours: number;
  availableFrom: string | null;
  availableUntil: string | null;
};

export function requestLiveErrors(
  values: LiveFormValues,
  rules: RequestLiveRules,
  changedFieldName?: string,
  now = new Date(),
) {
  const errors: Record<string, string> = {};
  if (text(values, "intent") !== "rent") return errors;

  const startCanonical = text(values, "starts_at");
  const endCanonical = text(values, "ends_at");
  const start = localDateTime(startCanonical);
  const end = localDateTime(endCanonical);

  if (start && start.getTime() < now.getTime() - 300_000) {
    errors.starts_at = "Pickup cannot be in the past.";
  }

  if (start && rules.availableFrom && startCanonical.slice(0, 10) < rules.availableFrom) {
    errors.starts_at = `This bike is available from ${rules.availableFrom}.`;
  }

  if (start && end && end <= start) {
    errors[
      preferredField(
        changedFieldName,
        ["starts_at", "ends_at"],
        "ends_at",
      )
    ] = "Return must be after pickup.";
  } else if (
    start &&
    end &&
    end.getTime() - start.getTime() < rules.minimumRentalHours * 3_600_000
  ) {
    errors.ends_at = `This bike has a ${rules.minimumRentalHours}-hour minimum rental.`;
  }

  if (end && rules.availableUntil && endCanonical.slice(0, 10) > rules.availableUntil) {
    errors.ends_at = `This bike is available until ${rules.availableUntil}.`;
  }

  return errors;
}

export function rentalAgreementLiveErrors(
  values: LiveFormValues,
  changedFieldName?: string,
) {
  const errors: Record<string, string> = {};
  const start = localDateTime(text(values, "rental_start"));
  const end = localDateTime(text(values, "expected_return"));

  if (start && end && end <= start) {
    errors[
      preferredField(
        changedFieldName,
        ["rental_start", "expected_return"],
        "expected_return",
      )
    ] = "Expected return must be after the rental start.";
  }

  const quantityFields = [
    "adult_bike_quantity",
    "kid_bike_quantity",
    "trailer_quantity",
  ];
  const quantity = quantityFields.reduce(
    (total, key) => total + Math.max(0, Number(text(values, key)) || 0),
    0,
  );
  if (quantity < 1) {
    errors[
      preferredField(
        changedFieldName,
        quantityFields,
        "adult_bike_quantity",
      )
    ] = "Add at least one bike or trailer to this agreement.";
  }

  return errors;
}

export type PhotoSelection = Pick<File, "name" | "size" | "type">;

const acceptedPhotoTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

export function listingPhotoError(
  photos: PhotoSelection[],
  existingPhotoCount = 0,
) {
  if (photos.length + existingPhotoCount > 8) {
    const remaining = Math.max(0, 8 - existingPhotoCount);
    return `Choose no more than ${remaining} additional ${remaining === 1 ? "photo" : "photos"}; a listing can have 8 in total.`;
  }
  const unsupported = photos.find((photo) => !acceptedPhotoTypes.has(photo.type));
  if (unsupported) {
    return `${unsupported.name} is not supported. Choose JPEG, PNG, WebP, or AVIF.`;
  }
  const oversized = photos.find((photo) => photo.size > 4 * 1024 * 1024);
  if (oversized) {
    return `${oversized.name} is larger than 4 MB.`;
  }
  return "";
}
