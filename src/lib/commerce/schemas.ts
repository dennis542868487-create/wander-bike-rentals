import { z } from "zod";
import { canadianProvinceCodes } from "@/lib/commerce/settings-types";

const canadianPostalCodePattern = /^[A-Z]\d[A-Z][ -]?\d[A-Z]\d$/i;

export const cartItemInputSchema = z.object({
  variantId: z.number().int().positive(),
  quantity: z.number().int().min(1).max(100),
});

export const cartItemsInputSchema = z
  .array(cartItemInputSchema)
  .min(1, "Your cart is empty.")
  .max(50, "Your cart has too many line items.");

export const shippingRateRequestSchema = z.object({
  postalCode: z
    .string()
    .trim()
    .regex(canadianPostalCodePattern, "Enter a valid Canadian postal code."),
  province: z.enum(canadianProvinceCodes),
  items: cartItemsInputSchema,
});

export const addressSchema = z.object({
  addressLine1: z.string().trim().min(2).max(160),
  addressLine2: z.string().trim().max(160).optional().default(""),
  city: z.string().trim().min(2).max(100),
  province: z.string().trim().toUpperCase().length(2),
  postalCode: z
    .string()
    .trim()
    .regex(canadianPostalCodePattern, "Enter a valid Canadian postal code."),
  country: z.literal("CA").default("CA"),
});

export const checkoutRequestSchema = z
  .object({
    checkoutRequestId: z.uuid(),
    email: z.email().trim().max(320),
    firstName: z.string().trim().min(1).max(100),
    lastName: z.string().trim().min(1).max(100),
    phone: z.string().trim().min(7).max(40).optional().or(z.literal("")),
    fulfillmentMethod: z.enum(["pickup", "local_delivery", "canada_post"]),
    shippingAddress: addressSchema.optional(),
    shippingQuoteId: z.uuid().optional(),
    customerNote: z.string().trim().max(500).optional().or(z.literal("")),
    items: cartItemsInputSchema,
  })
  .superRefine((value, context) => {
    if (value.fulfillmentMethod !== "pickup" && !value.shippingAddress) {
      context.addIssue({
        code: "custom",
        path: ["shippingAddress"],
        message: "A delivery address is required.",
      });
    }

    if (value.fulfillmentMethod === "canada_post" && !value.shippingQuoteId) {
      context.addIssue({
        code: "custom",
        path: ["shippingQuoteId"],
        message: "Choose a current Canada Post rate.",
      });
    }

    if (value.fulfillmentMethod === "canada_post" && value.shippingAddress) {
      const canadaPostFields: Array<{
        path: string;
        value: string;
        maximum: number;
        label: string;
      }> = [
        {
          path: "firstName",
          value: `${value.firstName} ${value.lastName}`.trim(),
          maximum: 44,
          label: "Recipient name",
        },
        {
          path: "phone",
          value: value.phone ?? "",
          maximum: 25,
          label: "Phone",
        },
        {
          path: "shippingAddress.addressLine1",
          value: value.shippingAddress.addressLine1,
          maximum: 44,
          label: "Address line 1",
        },
        {
          path: "shippingAddress.addressLine2",
          value: value.shippingAddress.addressLine2,
          maximum: 44,
          label: "Address line 2",
        },
        {
          path: "shippingAddress.city",
          value: value.shippingAddress.city,
          maximum: 40,
          label: "City",
        },
      ];

      for (const field of canadaPostFields) {
        if (field.value.length > field.maximum) {
          context.addIssue({
            code: "custom",
            path: field.path.split("."),
            message: `${field.label} must be ${field.maximum} characters or fewer for Canada Post.`,
          });
        }
      }
    }
  });

export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;
export type StoreAddress = z.infer<typeof addressSchema>;

export function normalizeCanadianPostalCode(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function formatCanadianPostalCode(value: string) {
  const normalized = normalizeCanadianPostalCode(value);
  return normalized.length === 6
    ? `${normalized.slice(0, 3)} ${normalized.slice(3)}`
    : normalized;
}
