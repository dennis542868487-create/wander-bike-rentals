import type { ZodError, ZodIssue } from "zod";

/**
 * Human labels for every schema field, keyed by the path Zod reports.
 *
 * Without this, a failed parse surfaces Zod's own wording ("Too small:
 * expected string to have >=5 characters") with no indication of which field
 * it came from, because `issues[0].message` drops `issues[0].path`.
 */
const FIELD_LABELS: Record<string, string> = {
  // listingInputSchema
  source: "Listing collection",
  title: "Listing title",
  shortDescription: "Short summary",
  description: "Full description",
  bikeType: "Bike type",
  brand: "Brand",
  model: "Model",
  frameSize: "Frame size / rider fit",
  condition: "Condition",
  offerMode: "Rent or sell",
  rentalHourlyCents: "Hourly price",
  rentalDailyCents: "Daily price",
  salePriceCents: "Sale price",
  minimumRentalHours: "Minimum rental (hours)",
  pickupArea: "Public pickup area",
  pickupAddress: "Exact pickup address",
  postalCode: "Postal code",
  pickupInstructions: "Private pickup instructions",
  city: "City",
  province: "Province",
  approximateLatitude: "Approximate latitude",
  approximateLongitude: "Approximate longitude",
  availableFrom: "Available from",
  availableUntil: "Available until",
  availabilitySummary: "Public availability summary",
  rentalRules: "Rules and owner notes",
  includedItems: "Included items",

  // requestInputSchema
  listingId: "Listing",
  intent: "Request type",
  startsAt: "Pickup time",
  endsAt: "Return time",
  message: "Message",
  renterName: "Your name",
  renterPhone: "Phone",

  // requestStatusInputSchema
  status: "Status",
  responseNote: "Response note",

  // listingManagementSchema
  managementNote: "Management note",
  featured: "Featured",

  // profileInputSchema
  fullName: "Full name",
  phone: "Phone",
  bio: "Bio",

  // roleInputSchema / marketplaceAccessInputSchema
  role: "Role",
  reason: "Reason",

  // sensitiveTermInputSchema / safetyFlagActionSchema
  term: "Term",
  category: "Category",
  active: "Active",
  action: "Action",
  note: "Note",

  // imageSafetySignalSchema
  imageId: "Image",
  provider: "Provider",
  details: "Details",
  evidence: "Evidence",
  dedupeKey: "Dedupe key",
};

/** `["includedItems", 2]` → `includedItems` so array members reuse the label. */
function pathKey(path: ReadonlyArray<PropertyKey>): string {
  const [head] = path;
  return typeof head === "string" ? head : "";
}

function labelFor(path: ReadonlyArray<PropertyKey>): string {
  return FIELD_LABELS[pathKey(path)] ?? "";
}

function unit(origin: unknown, amount: number) {
  const plural = amount === 1 ? "" : "s";
  if (origin === "string") return `${amount} character${plural}`;
  if (origin === "array") return `${amount} item${plural}`;
  return String(amount);
}

/**
 * Rewrites one Zod issue as a sentence a listing owner can act on. Built from
 * the issue's own fields rather than by parsing its default message, so this
 * stays correct if Zod rewords its defaults.
 */
export function describeIssue(issue: ZodIssue): string {
  const detail = issue as ZodIssue & {
    origin?: unknown;
    minimum?: number | bigint;
    maximum?: number | bigint;
    expected?: string;
    values?: unknown[];
    format?: string;
  };

  switch (issue.code) {
    case "too_small": {
      const minimum = Number(detail.minimum ?? 0);
      if (detail.origin === "number") return `must be ${minimum} or more.`;
      if (minimum === 1 && detail.origin === "string") return "is required.";
      return `needs at least ${unit(detail.origin, minimum)}.`;
    }
    case "too_big": {
      const maximum = Number(detail.maximum ?? 0);
      if (detail.origin === "number") return `must be ${maximum} or less.`;
      return `can be at most ${unit(detail.origin, maximum)}.`;
    }
    case "invalid_type":
      return detail.expected === "string" || detail.expected === "number"
        ? "is required."
        : "is not in the expected format.";
    case "invalid_value":
      return "is not one of the allowed options.";
    case "invalid_format":
      if (detail.format === "date") return "must be a date (YYYY-MM-DD).";
      if (detail.format === "datetime") return "must be a date and time.";
      if (detail.format === "uuid") return "is not a valid reference.";
      return "is not in the expected format.";
    default:
      // `custom` issues (every superRefine rule in schemas.ts) already carry a
      // written-for-humans message.
      return issue.message;
  }
}

/** One issue as a full sentence, e.g. `Exact pickup address needs at least 5 characters.` */
export function messageForIssue(issue: ZodIssue): string {
  const label = labelFor(issue.path);
  const detail = describeIssue(issue);
  if (!label) return detail.charAt(0).toUpperCase() + detail.slice(1);
  // custom messages are standalone sentences; the rest are predicates.
  if (issue.code === "custom") return `${label}: ${detail}`;
  return `${label} ${detail}`;
}

export type FieldErrorPayload = {
  error: string;
  fieldErrors: Record<string, string>;
};

/**
 * Turns a failed parse into a response body that names the field. `error` is
 * the banner sentence; `fieldErrors` is keyed by schema field so the form can
 * attach each message to the input it belongs to.
 */
export function fieldErrorPayload(
  error: ZodError,
  fallback = "Check the highlighted fields and try again.",
): FieldErrorPayload {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = pathKey(issue.path);
    if (!key || fieldErrors[key]) continue;
    fieldErrors[key] = messageForIssue(issue);
  }

  const first = error.issues[0];
  const banner = first ? messageForIssue(first) : fallback;
  const extra = Object.keys(fieldErrors).length - 1;

  return {
    error: extra > 0 ? `${banner} (${extra} more field${extra === 1 ? "" : "s"} to fix.)` : banner,
    fieldErrors,
  };
}
