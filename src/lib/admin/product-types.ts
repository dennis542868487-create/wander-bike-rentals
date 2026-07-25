export type AdminTaxonomyOption = {
  id: number;
  name: string;
};

export type AdminCategory = {
  id: number;
  parentId: number | null;
  slug: string;
  name: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
};

export type AdminBrand = {
  id: number;
  slug: string;
  name: string;
  description: string;
  websiteUrl: string;
  isActive: boolean;
};

export type AdminProductImage = {
  storagePath: string;
  publicUrl: string;
  altText: string;
  width: number | null;
  height: number | null;
  sortOrder: number;
};

export type AdminProductVariant = {
  id: number | null;
  sku: string;
  barcode: string;
  title: string;
  optionValues: Record<string, string>;
  priceCents: number;
  compareAtPriceCents: number | null;
  costCents: number | null;
  weightGrams: number | null;
  lengthCm: number | null;
  widthCm: number | null;
  heightCm: number | null;
  pickupEligible: boolean;
  localDeliveryEligible: boolean;
  canadaPostEligible: boolean;
  shippingProfile: "standard" | "large" | "special";
  taxCode: string;
  isActive: boolean;
  sortOrder: number;
  initialOnHand: number;
  onHand: number;
  reserved: number;
  available: number;
  reorderPoint: number;
  allowBackorder: boolean;
};

export type AdminProductEditorValue = {
  id: number | null;
  categoryId: number | null;
  brandId: number | null;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  productType: "physical" | "service" | "gift_card";
  status: "draft" | "active" | "archived";
  tags: string[];
  trackInventory: boolean;
  requiresShipping: boolean;
  seoTitle: string;
  seoDescription: string;
  variants: AdminProductVariant[];
  images: AdminProductImage[];
};

export type AdminProductListItem = {
  id: number;
  slug: string;
  name: string;
  status: string;
  productType: string;
  categoryName: string;
  variantCount: number;
  minPriceCents: number;
  available: number;
  updatedAt: string;
};

export type AdminInventoryRow = {
  variantId: number;
  productId: number;
  productName: string;
  productStatus: string;
  variantTitle: string;
  sku: string;
  locationId: number;
  locationName: string;
  onHand: number;
  reserved: number;
  available: number;
  reorderPoint: number;
  allowBackorder: boolean;
};

export type AdminInventoryLedgerEntry = {
  id: number;
  productName: string;
  variantTitle: string;
  sku: string;
  locationName: string;
  orderNumber: string;
  actorName: string;
  eventType: string;
  deltaOnHand: number;
  deltaReserved: number;
  reason: string;
  createdAt: string;
};
