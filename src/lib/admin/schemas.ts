import { z } from "zod";
import { addressSchema } from "@/lib/commerce/schemas";
import { canadaPostParcelLimitViolation } from "@/lib/commerce/canada-post-limits";
import {
  canadianProvinceCodes,
  storeDayKeys,
} from "@/lib/commerce/settings-types";

export const fulfillmentUpdateSchema = z.object({
  fulfillmentStatus: z.enum([
    "unfulfilled",
    "reserved",
    "preparing",
    "ready_for_pickup",
    "ready_to_ship",
    "shipped",
    "delivered",
    "picked_up",
    "returned",
    "cancelled",
  ]),
  internalNote: z.string().trim().max(2000).optional().or(z.literal("")),
});

export const orderDetailsUpdateSchema = z.object({
  email: z.email().trim().max(320),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  phone: z.string().trim().min(7).max(40).optional().or(z.literal("")),
  customerNote: z.string().trim().max(500).optional().or(z.literal("")),
  shippingAddress: addressSchema.nullable(),
});

export const manualTrackingSchema = z.object({
  provider: z.enum(["canada_post", "local_delivery", "other"]),
  serviceName: z.string().trim().min(2).max(120),
  trackingPin: z.string().trim().min(3).max(80),
  trackingUrl: z
    .string()
    .trim()
    .url()
    .startsWith("https://")
    .max(1000)
    .optional()
    .or(z.literal("")),
  idempotencyKey: z.uuid(),
});

export const refundRequestSchema = z.object({
  amountCents: z.number().int().positive(),
  reason: z.string().trim().min(2).max(500),
  restockItems: z.boolean().default(false),
  items: z
    .array(
      z.object({
        variantId: z.number().int().positive(),
        quantity: z.number().int().min(1).max(100),
      }),
    )
    .max(50)
    .default([]),
  idempotencyKey: z.uuid(),
});

export const inventoryAdjustmentSchema = z.object({
  locationId: z.number().int().positive(),
  deltaOnHand: z.number().int().min(-10000).max(10000).refine((value) => value !== 0),
  reason: z.string().trim().min(2).max(500),
});

const nullableMoney = z.number().int().min(0).max(100_000_000).nullable();
const nullableDimension = z.number().min(0).max(10_000).nullable();

const productVariantSchema = z
  .object({
    id: z.number().int().positive().nullable(),
    sku: z.string().trim().min(1).max(80),
    barcode: z.string().trim().max(120),
    title: z.string().trim().min(1).max(180),
    optionValues: z.record(z.string().trim().min(1).max(80), z.string().trim().max(120)),
    priceCents: z.number().int().min(0).max(100_000_000),
    compareAtPriceCents: nullableMoney,
    costCents: nullableMoney,
    weightGrams: z.number().int().min(0).max(1_000_000).nullable(),
    lengthCm: nullableDimension,
    widthCm: nullableDimension,
    heightCm: nullableDimension,
    pickupEligible: z.boolean(),
    localDeliveryEligible: z.boolean(),
    canadaPostEligible: z.boolean(),
    shippingProfile: z.enum(["standard", "large", "special"]),
    taxCode: z.string().trim().max(80),
    isActive: z.boolean(),
    sortOrder: z.number().int().min(-10_000).max(10_000),
    initialOnHand: z.number().int().min(0).max(1_000_000),
    reorderPoint: z.number().int().min(0).max(1_000_000),
    allowBackorder: z.boolean(),
  })
  .superRefine((variant, context) => {
    if (
      variant.compareAtPriceCents !== null &&
      variant.compareAtPriceCents < variant.priceCents
    ) {
      context.addIssue({
        code: "custom",
        path: ["compareAtPriceCents"],
        message: "Compare-at price must be at least the selling price.",
      });
    }

    if (
      variant.canadaPostEligible &&
      [variant.weightGrams, variant.lengthCm, variant.widthCm, variant.heightCm].some(
        (value) => value === null || value <= 0,
      )
    ) {
      context.addIssue({
        code: "custom",
        path: ["canadaPostEligible"],
        message:
          "Canada Post variants require a positive weight, length, width, and height.",
      });
    }

    if (
      variant.canadaPostEligible &&
      variant.weightGrams !== null &&
      variant.lengthCm !== null &&
      variant.widthCm !== null &&
      variant.heightCm !== null
    ) {
      const violation = canadaPostParcelLimitViolation({
        weightKg: variant.weightGrams / 1000,
        lengthCm: variant.lengthCm,
        widthCm: variant.widthCm,
        heightCm: variant.heightCm,
      });
      if (violation) {
        context.addIssue({
          code: "custom",
          path: ["canadaPostEligible"],
          message: `${violation} Disable automatic Canada Post fulfillment or change the packaged dimensions.`,
        });
      }
    }

    if (
      !variant.pickupEligible &&
      !variant.localDeliveryEligible &&
      !variant.canadaPostEligible
    ) {
      context.addIssue({
        code: "custom",
        path: ["pickupEligible"],
        message: "Choose at least one fulfillment method for this variant.",
      });
    }

    if (variant.shippingProfile === "special" && variant.canadaPostEligible) {
      context.addIssue({
        code: "custom",
        path: ["shippingProfile"],
        message:
          "Special-handling variants require staff fulfillment and cannot use automatic Canada Post checkout.",
      });
    }
  });

const productImageSchema = z.object({
  storagePath: z
    .string()
    .trim()
    .min(1)
    .max(500)
    .startsWith("products/")
    .refine((value) => !value.includes(".."), "Invalid product image path."),
  altText: z.string().trim().min(1).max(240),
  width: z.number().int().positive().max(50_000).nullable(),
  height: z.number().int().positive().max(50_000).nullable(),
  sortOrder: z.number().int().min(-10_000).max(10_000),
});

export const adminProductSchema = z
  .object({
    productId: z.number().int().positive().nullable(),
    categoryId: z.number().int().positive().nullable(),
    brandId: z.number().int().positive().nullable(),
    slug: z
      .string()
      .trim()
      .min(2)
      .max(120)
      .regex(/^[a-z0-9][a-z0-9-]*$/, "Use lowercase letters, numbers, and hyphens."),
    name: z.string().trim().min(1).max(180),
    shortDescription: z.string().trim().max(320),
    description: z.string().trim().max(20_000),
    productType: z.enum(["physical", "service", "gift_card"]),
    status: z.enum(["draft", "active", "archived"]),
    tags: z.array(z.string().trim().min(1).max(80)).max(40),
    trackInventory: z.boolean(),
    requiresShipping: z.boolean(),
    seoTitle: z.string().trim().max(180),
    seoDescription: z.string().trim().max(320),
    variants: z.array(productVariantSchema).min(1).max(50),
    images: z.array(productImageSchema).max(24),
  })
  .superRefine((product, context) => {
    const skus = product.variants.map((variant) => variant.sku.toLowerCase());
    if (new Set(skus).size !== skus.length) {
      context.addIssue({
        code: "custom",
        path: ["variants"],
        message: "Every variant must have a unique SKU.",
      });
    }

    if (
      product.productType !== "physical" &&
      (product.requiresShipping || product.trackInventory)
    ) {
      context.addIssue({
        code: "custom",
        path: ["productType"],
        message: "Services and gift cards cannot require shipping or inventory.",
      });
    }
  });

export const shippingLabelRequestSchema = z.object({
  idempotencyKey: z.uuid(),
  package: z
    .object({
      packageNumber: z.number().int().min(1).max(50),
      packageCount: z.number().int().min(1).max(50),
      weightKg: z.number().positive().max(30),
      lengthCm: z.number().positive().max(200),
      widthCm: z.number().positive().max(200),
      heightCm: z.number().positive().max(200),
    })
    .superRefine((value, context) => {
      if (value.packageNumber > value.packageCount) {
        context.addIssue({
          code: "custom",
          path: ["packageNumber"],
          message: "Package number cannot exceed the package count.",
        });
      }
      const violation = canadaPostParcelLimitViolation(value);
      if (violation) {
        context.addIssue({
          code: "custom",
          path: ["lengthCm"],
          message: violation,
        });
      }
    }),
});

export const shipmentCancellationSchema = z.object({
  email: z.email().trim().max(60),
  confirmation: z.literal("VOID"),
});

export const returnCreateSchema = z.object({
  reason: z.string().trim().min(2).max(1000),
  items: z
    .array(
      z.object({
        orderItemId: z.number().int().positive(),
        quantity: z.number().int().min(1).max(100),
      }),
    )
    .min(1)
    .max(50),
});

export const returnUpdateSchema = z.object({
  status: z.enum([
    "requested",
    "approved",
    "received",
    "rejected",
    "completed",
    "cancelled",
  ]),
  resolution: z.string().trim().max(2000).optional().or(z.literal("")),
});

export const orderNotificationSchema = z.object({
  templateKey: z.enum([
    "order_confirmation",
    "payment_failed",
    "order_preparing",
    "order_ready_for_pickup",
    "order_ready_to_ship",
    "tracking_created",
    "order_shipped",
    "order_delivered",
    "order_picked_up",
    "order_cancelled",
    "refund_partial",
    "refund_full",
    "return_status_updated",
  ]),
});

const canadianProvinceSchema = z.enum(canadianProvinceCodes);
const canadianPostalCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]\d[A-Z][ -]?\d[A-Z]\d$/, "Enter a valid Canadian postal code.");
const canadianFsaSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(
    /^[ABCEGHJ-NPRSTVXY]\d[A-Z]$/,
    "Use a valid three-character Canadian postal prefix.",
  );
const timeSchema = z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/);
const nullableOperationalMoney = z
  .number()
  .int()
  .min(0)
  .max(100_000_000)
  .nullable();

export const adminStoreSettingsSchema = z
  .object({
    checkoutEnabled: z.boolean(),
    profile: z.object({
      displayName: z.string().trim().min(1).max(160),
      phone: z.string().trim().min(7).max(40),
      customerEmail: z.email().trim().max(320).optional().or(z.literal("")),
      addressLine1: z.string().trim().min(2).max(160),
      addressLine2: z.string().trim().max(160),
      city: z.string().trim().min(2).max(100),
      province: canadianProvinceSchema,
      postalCode: canadianPostalCodeSchema,
      country: z.literal("CA"),
    }),
    hours: z.object({
      timezone: z.literal("America/Vancouver"),
      note: z.string().trim().max(500),
      days: z
        .array(
          z.object({
            day: z.enum(storeDayKeys),
            closed: z.boolean(),
            open: timeSchema,
            close: timeSchema,
          }),
        )
        .length(7),
    }),
    pickupEnabled: z.boolean(),
    pickupInstructions: z.string().trim().max(2000),
    salesProvinces: z
      .array(canadianProvinceSchema)
      .min(1)
      .max(canadianProvinceCodes.length),
    localDelivery: z.object({
      enabled: z.boolean(),
      feeCents: z.number().int().min(0).max(10_000_000),
      postalCodePrefixes: z.array(canadianFsaSchema).max(200),
    }),
    canadaPostEnabled: z.boolean(),
    shippingOrigin: z.object({
      company: z.string().trim().min(1).max(160),
      contact: z.string().trim().min(1).max(160),
      phone: z.string().trim().min(7).max(40),
      addressLine1: z.string().trim().min(2).max(160),
      addressLine2: z.string().trim().max(160),
      city: z.string().trim().min(2).max(100),
      province: canadianProvinceSchema,
      postalCode: canadianPostalCodeSchema,
      country: z.literal("CA"),
    }),
    shippingRules: z.object({
      freeShippingThresholdCents: nullableOperationalMoney,
      fixedCanadaPostFeeCents: nullableOperationalMoney,
    }),
    tax: z.object({
      provider: z.literal("manual"),
      enabled: z.boolean(),
      registrationNumber: z.string().trim().max(100),
      rates: z
        .array(
          z.object({
            province: canadianProvinceSchema,
            label: z.string().trim().min(1).max(80),
            rateBps: z.number().int().min(0).max(5000),
            appliesToShipping: z.boolean(),
          }),
        )
        .max(canadianProvinceCodes.length),
    }),
    notificationEmail: z.email().trim().max(320).optional().or(z.literal("")),
    policies: z.object({
      shipping: z.string().trim().max(20_000),
      refund: z.string().trim().max(20_000),
      returns: z.string().trim().max(20_000),
    }),
  })
  .superRefine((settings, context) => {
    if (
      settings.localDelivery.enabled &&
      settings.localDelivery.postalCodePrefixes.length === 0
    ) {
      context.addIssue({
        code: "custom",
        path: ["localDelivery", "postalCodePrefixes"],
        message: "Add at least one postal prefix before enabling local delivery.",
      });
    }
    if (
      settings.tax.enabled &&
      !settings.tax.rates.some((rate) => rate.rateBps > 0)
    ) {
      context.addIssue({
        code: "custom",
        path: ["tax", "rates"],
        message: "Add at least one positive tax rate before enabling tax.",
      });
    }
    if (settings.canadaPostEnabled) {
      const canadaPostSenderFields: Array<{
        path: keyof typeof settings.shippingOrigin;
        maximum: number;
        label: string;
      }> = [
        { path: "company", maximum: 44, label: "Company" },
        { path: "contact", maximum: 44, label: "Contact" },
        { path: "phone", maximum: 25, label: "Phone" },
        { path: "addressLine1", maximum: 44, label: "Address line 1" },
        { path: "addressLine2", maximum: 44, label: "Address line 2" },
        { path: "city", maximum: 40, label: "City" },
      ];
      for (const field of canadaPostSenderFields) {
        if (settings.shippingOrigin[field.path].length > field.maximum) {
          context.addIssue({
            code: "custom",
            path: ["shippingOrigin", field.path],
            message: `${field.label} must be ${field.maximum} characters or fewer for Canada Post.`,
          });
        }
      }
    }
    if (
      new Set(settings.hours.days.map((day) => day.day)).size !==
      storeDayKeys.length
    ) {
      context.addIssue({
        code: "custom",
        path: ["hours", "days"],
        message: "Each day of the week must appear exactly once.",
      });
    }
  });

export const catalogTaxonomySchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("category"),
    id: z.number().int().positive().nullable(),
    parentId: z.number().int().positive().nullable(),
    slug: z
      .string()
      .trim()
      .min(2)
      .max(80)
      .regex(/^[a-z0-9][a-z0-9-]*$/),
    name: z.string().trim().min(1).max(100),
    description: z.string().trim().max(2000),
    sortOrder: z.number().int().min(-10_000).max(10_000),
    isActive: z.boolean(),
  }),
  z.object({
    kind: z.literal("brand"),
    id: z.number().int().positive().nullable(),
    slug: z
      .string()
      .trim()
      .min(2)
      .max(80)
      .regex(/^[a-z0-9][a-z0-9-]*$/),
    name: z.string().trim().min(1).max(100),
    description: z.string().trim().max(2000),
    websiteUrl: z
      .url()
      .startsWith("https://")
      .max(1000)
      .optional()
      .or(z.literal("")),
    isActive: z.boolean(),
  }),
]);
