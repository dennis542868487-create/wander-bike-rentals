const INTERNAL_LISTING_METADATA_PREFIX =
  "__wander_internal_listing_metadata_v1__:";

const LEGACY_SHORT_DESCRIPTION_MAX = 240;
const LEGACY_DESCRIPTION_MIN = 20;
const LEGACY_DESCRIPTION_MAX = 5_000;

type ListingMetadata = {
  tireSize?: string;
  shortDescription?: string;
  description?: string;
};

type ListingStorageInput = {
  shortDescription?: string | null;
  description: string;
  tireSize?: string | null;
  includedItems: string[];
};

type StoredListingInput = {
  shortDescription: unknown;
  description: unknown;
  tireSize?: unknown;
  includedItems: unknown;
};

function visibleIncludedItems(value: unknown) {
  return Array.isArray(value)
    ? value.filter(
        (item): item is string =>
          typeof item === "string" &&
          !item.startsWith(INTERNAL_LISTING_METADATA_PREFIX),
      )
    : [];
}

function listingMetadata(value: unknown): ListingMetadata {
  if (!Array.isArray(value)) return {};

  for (let index = value.length - 1; index >= 0; index -= 1) {
    const item = value[index];
    if (
      typeof item !== "string" ||
      !item.startsWith(INTERNAL_LISTING_METADATA_PREFIX)
    ) {
      continue;
    }

    try {
      const parsed = JSON.parse(
        item.slice(INTERNAL_LISTING_METADATA_PREFIX.length),
      ) as Record<string, unknown>;
      return {
        tireSize:
          typeof parsed.tireSize === "string" ? parsed.tireSize : undefined,
        shortDescription:
          typeof parsed.shortDescription === "string"
            ? parsed.shortDescription
            : undefined,
        description:
          typeof parsed.description === "string"
            ? parsed.description
            : undefined,
      };
    } catch {
      return {};
    }
  }

  return {};
}

function optionalString(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : null;
}

/**
 * Keeps writes compatible with the first production marketplace schema while
 * preserving the exact user-facing values. The checked-in migration adds the
 * native column and removes the old limits; this envelope lets older connected
 * projects continue operating until that migration can be applied there too.
 */
export function prepareListingStorage(input: ListingStorageInput) {
  const shortDescription = input.shortDescription ?? null;
  const metadata: ListingMetadata = {};

  if (input.tireSize) metadata.tireSize = input.tireSize;
  if (
    shortDescription &&
    shortDescription.length > LEGACY_SHORT_DESCRIPTION_MAX
  ) {
    metadata.shortDescription = shortDescription;
  }
  if (input.description.length > LEGACY_DESCRIPTION_MAX) {
    metadata.description = input.description;
  }

  const includedItems = visibleIncludedItems(input.includedItems);
  if (Object.keys(metadata).length > 0) {
    includedItems.push(
      `${INTERNAL_LISTING_METADATA_PREFIX}${JSON.stringify(metadata)}`,
    );
  }

  return {
    shortDescription: shortDescription?.slice(
      0,
      LEGACY_SHORT_DESCRIPTION_MAX,
    ) ?? null,
    description: input.description
      .slice(0, LEGACY_DESCRIPTION_MAX)
      .padEnd(LEGACY_DESCRIPTION_MIN, " "),
    includedItems,
  };
}

export function readListingStorage(input: StoredListingInput) {
  const metadata = listingMetadata(input.includedItems);
  const storedShortDescription = optionalString(input.shortDescription);
  const storedDescription =
    typeof input.description === "string" ? input.description : "";
  const nativeTireSize = optionalString(input.tireSize);

  return {
    shortDescription:
      metadata.shortDescription ?? storedShortDescription?.trimEnd() ?? null,
    description: metadata.description ?? storedDescription.trimEnd(),
    tireSize: metadata.tireSize ?? nativeTireSize,
    includedItems: visibleIncludedItems(input.includedItems),
  };
}
