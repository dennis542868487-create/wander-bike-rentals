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

const optionalText = (maximum: number) =>
  z.preprocess(
    emptyToUndefined,
    z.string().trim().max(maximum).optional(),
  );

const optionalUnlimitedText = z.preprocess(
  emptyToUndefined,
  z.string().trim().optional(),
);

const optionalPositiveCents = z.preprocess(
  emptyToUndefined,
  z.coerce.number().int().positive().max(100_000_000).optional(),
);

const optionalDate = z.preprocess(
  emptyToUndefined,
  z.iso.date().optional(),
);

export const listingInputSchema = z
  .object({
    source: z.enum(["community", "wander"]).default("community"),
    title: z.string().trim().min(3).max(120),
    shortDescription: optionalUnlimitedText,
    description: z.string().trim().min(1, "Add a full description."),
    bikeType: z.enum(bikeTypes),
    brand: optionalText(80),
    model: optionalText(100),
    frameSize: optionalText(60),
    tireSize: optionalText(80),
    condition: z.enum(["new", "like_new", "good", "fair"]).default("good"),
    offerMode: z.enum(offerModes),
    rentalHourlyCents: optionalPositiveCents,
    rentalDailyCents: optionalPositiveCents,
    salePriceCents: optionalPositiveCents,
    minimumRentalHours: z.coerce.number().int().min(1).max(168).default(1),
    availableQuantity: z.preprocess(
      (value) => (value === null ? undefined : emptyToUndefined(value)),
      z.coerce.number().int().min(0).max(1000).default(1),
    ),
    pickupArea: z.string().trim().min(2).max(120),
    pickupAddress: z.string().trim().min(5).max(240),
    postalCode: optionalText(20),
    pickupInstructions: optionalText(1000),
    city: z.string().trim().min(2).max(100).default("Richmond"),
    province: z.string().trim().min(2).max(80).default("BC"),
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
    availabilitySummary: optionalText(240),
    rentalRules: optionalText(2000),
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
    message: optionalText(1000),
    renterName: z.string().trim().min(2).max(120),
    renterPhone: optionalText(40),
    website: optionalText(200),
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
  responseNote: optionalText(1000),
});

export const listingManagementSchema = z
  .object({
    status: z.enum(["active", "paused"]).optional(),
    managementNote: optionalText(1000),
    featured: z.boolean().optional(),
  })
  .refine(
    (value) => value.status !== undefined || value.featured !== undefined,
    "Choose a listing update.",
  );

export const profileInputSchema = z.object({
  fullName: z.string().trim().min(1).max(120),
  phone: optionalText(40),
  bio: optionalText(500),
});

export const roleInputSchema = z.object({
  role: z.enum(["customer", "staff", "admin"]),
});

export const marketplaceAccessInputSchema = z
  .object({
    status: z.enum(marketplaceAccessStatuses),
    reason: optionalText(1000),
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
  term: z.string().trim().min(2).max(80),
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
  note: optionalText(1000),
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
