import { z } from "zod";
import {
  bikeTypes,
  marketplaceAccessStatuses,
  offerModes,
  requestIntents,
  requestStatuses,
  safetyCategories,
} from "@/lib/marketplace/types";

const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const optionalText = (maximum: number, label: string) =>
  z.preprocess(
    emptyToUndefined,
    z
      .string()
      .trim()
      .max(maximum, `${label} must be ${maximum} characters or fewer.`)
      .optional(),
  );

const optionalTextWithMinimum = (
  minimum: number,
  maximum: number,
  label: string,
) =>
  z.preprocess(
    emptyToUndefined,
    z
      .string()
      .trim()
      .min(minimum, `${label} must be at least ${minimum} characters.`)
      .max(maximum, `${label} must be ${maximum} characters or fewer.`)
      .optional(),
  );

const optionalUnlimitedText = z.preprocess(
  emptyToUndefined,
  z.string().trim().optional(),
);

const optionalPositiveCents = (maximum: number, label: string) =>
  z.preprocess(
    emptyToUndefined,
    z.coerce
      .number()
      .int(`${label} must use whole cents.`)
      .positive(`${label} must be greater than $0.`)
      .max(maximum, `${label} is above the allowed maximum.`)
      .optional(),
  );

const optionalDate = z.preprocess(
  emptyToUndefined,
  z.iso.date().optional(),
);

export const listingInputSchema = z
  .object({
    source: z.enum(["community", "wander"]).default("community"),
    title: z
      .string()
      .trim()
      .min(3, "Listing title must be at least 3 characters.")
      .max(120, "Listing title must be 120 characters or fewer."),
    shortDescription: optionalUnlimitedText,
    description: z.string().trim().min(1, "Add a full description."),
    bikeType: z.enum(bikeTypes),
    brand: optionalText(80, "Brand"),
    model: optionalText(100, "Model"),
    frameSize: optionalText(60, "Frame size"),
    tireSize: optionalText(80, "Wheel or tire size"),
    condition: z.enum(["new", "like_new", "good", "fair"]).default("good"),
    offerMode: z.enum(offerModes),
    rentalHourlyCents: optionalPositiveCents(1_000_000, "Hourly price"),
    rentalDailyCents: optionalPositiveCents(10_000_000, "Daily price"),
    salePriceCents: optionalPositiveCents(100_000_000, "Sale price"),
    minimumRentalHours: z.coerce.number().int().min(1).max(168).default(1),
    availableQuantity: z.preprocess(
      (value) => (value === null ? undefined : emptyToUndefined(value)),
      z.coerce.number().int().min(0).max(1000).default(1),
    ),
    pickupArea: z
      .string()
      .trim()
      .min(2, "Public pickup area must be at least 2 characters.")
      .max(120, "Public pickup area must be 120 characters or fewer."),
    pickupAddress: z
      .string()
      .trim()
      .min(5, "Exact pickup address must be at least 5 characters.")
      .max(240, "Exact pickup address must be 240 characters or fewer."),
    postalCode: optionalTextWithMinimum(3, 20, "Postal code"),
    pickupInstructions: optionalText(1000, "Pickup instructions"),
    city: z
      .string()
      .trim()
      .min(2, "City must be at least 2 characters.")
      .max(100, "City must be 100 characters or fewer.")
      .default("Richmond"),
    province: z
      .string()
      .trim()
      .min(2, "Province must be at least 2 characters.")
      .max(80, "Province must be 80 characters or fewer.")
      .default("BC"),
    approximateLatitude: z.preprocess(
      emptyToUndefined,
      z.coerce.number().min(-90).max(90).optional(),
    ),
    approximateLongitude: z.preprocess(
      emptyToUndefined,
      z.coerce.number().min(-180).max(180).optional(),
    ),
    availableFrom: optionalDate,
    availableUntil: optionalDate,
    availabilitySummary: optionalText(240, "Availability summary"),
    rentalRules: optionalText(2000, "Rental rules"),
    includedItems: z
      .array(z.string().trim().min(1).max(80))
      .max(20)
      .default([]),
  })
  .superRefine((value, context) => {
    const rents = value.offerMode === "rent" || value.offerMode === "rent_sale";
    const sells = value.offerMode === "sale" || value.offerMode === "rent_sale";

    if (
      rents &&
      value.rentalHourlyCents === undefined &&
      value.rentalDailyCents === undefined
    ) {
      context.addIssue({
        code: "custom",
        path: ["rentalDailyCents"],
        message: "Add an hourly or daily rental price.",
      });
    }
    if (sells && value.salePriceCents === undefined) {
      context.addIssue({
        code: "custom",
        path: ["salePriceCents"],
        message: "Add a sale price.",
      });
    }
    if (
      value.availableFrom &&
      value.availableUntil &&
      value.availableUntil < value.availableFrom
    ) {
      context.addIssue({
        code: "custom",
        path: ["availableUntil"],
        message: "Available-until date must be after available-from date.",
      });
    }
  });

export type ListingInput = z.infer<typeof listingInputSchema>;

export const requestInputSchema = z
  .object({
    listingId: z.uuid(),
    intent: z.enum(requestIntents),
    startsAt: z.preprocess(emptyToUndefined, z.iso.datetime().optional()),
    endsAt: z.preprocess(emptyToUndefined, z.iso.datetime().optional()),
    message: optionalText(1000, "Message"),
    renterName: z
      .string()
      .trim()
      .min(2, "Your name must be at least 2 characters.")
      .max(120, "Your name must be 120 characters or fewer."),
    renterPhone: optionalTextWithMinimum(7, 40, "Phone number"),
    website: optionalText(200, "Website"),
  })
  .superRefine((value, context) => {
    if (value.intent === "rent") {
      if (!value.startsAt) {
        context.addIssue({
          code: "custom",
          path: ["startsAt"],
          message: "Choose a pickup time.",
        });
      }
      if (!value.endsAt) {
        context.addIssue({
          code: "custom",
          path: ["endsAt"],
          message: "Choose a return time.",
        });
      }
      if (
        value.startsAt &&
        value.endsAt &&
        new Date(value.endsAt) <= new Date(value.startsAt)
      ) {
        context.addIssue({
          code: "custom",
          path: ["endsAt"],
          message: "Return must be after pickup.",
        });
      }
      if (value.startsAt && new Date(value.startsAt).getTime() < Date.now() - 300_000) {
        context.addIssue({
          code: "custom",
          path: ["startsAt"],
          message: "Pickup cannot be in the past.",
        });
      }
    }
  });

export const requestStatusInputSchema = z.object({
  status: z.enum(requestStatuses),
  responseNote: optionalText(1000, "Response note"),
});

export const listingManagementSchema = z
  .object({
    status: z.enum(["active", "paused"]).optional(),
    managementNote: optionalText(1000, "Management note"),
    featured: z.boolean().optional(),
  })
  .refine(
    (value) => value.status !== undefined || value.featured !== undefined,
    "Choose a listing update.",
  );

export const profileInputSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Add your full name.")
    .max(120, "Full name must be 120 characters or fewer."),
  phone: optionalTextWithMinimum(7, 40, "Phone number"),
  bio: optionalText(500, "Bio"),
});

export const roleInputSchema = z.object({
  role: z.enum(["customer", "staff", "admin"]),
});

export const marketplaceAccessInputSchema = z
  .object({
    status: z.enum(marketplaceAccessStatuses),
    reason: optionalText(1000, "Suspension reason"),
  })
  .superRefine((value, context) => {
    if (value.status === "suspended" && !value.reason) {
      context.addIssue({
        code: "custom",
        path: ["reason"],
        message: "Add a reason before suspending marketplace access.",
      });
    }
  });

export const sensitiveTermInputSchema = z.object({
  term: z
    .string()
    .trim()
    .min(2, "Sensitive term must be at least 2 characters.")
    .max(80, "Sensitive term must be 80 characters or fewer."),
  category: z.enum([
    "sensitive_term",
    "contact_details",
    "external_payment",
  ]),
});

export const sensitiveTermStatusSchema = z.object({
  active: z.boolean(),
});

export const safetyFlagActionSchema = z.object({
  action: z.enum(["dismiss", "mark_handled", "pause_listing"]),
  note: optionalText(1000, "Safety note"),
});

export const imageSafetySignalSchema = z.object({
  listingId: z.uuid(),
  imageId: z.uuid(),
  category: z.enum(safetyCategories).default("image_risk"),
  provider: z.string().trim().min(2).max(80),
  details: z.string().trim().min(2).max(1000),
  evidence: z.record(z.string(), z.unknown()).default({}),
  dedupeKey: z.string().trim().min(8).max(240),
});
