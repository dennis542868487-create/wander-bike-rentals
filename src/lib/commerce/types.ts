export type ProductOptionValues = Record<string, string>;
export type ShippingProfile = "standard" | "large" | "special";

export type CatalogImage = {
  id: number;
  src: string;
  alt: string;
  width: number | null;
  height: number | null;
};

export type CatalogVariant = {
  id: number;
  sku: string;
  title: string;
  optionValues: ProductOptionValues;
  priceCents: number;
  compareAtPriceCents: number | null;
  weightGrams: number | null;
  lengthCm: number | null;
  widthCm: number | null;
  heightCm: number | null;
  pickupEligible: boolean;
  localDeliveryEligible: boolean;
  canadaPostEligible: boolean;
  shippingProfile: ShippingProfile;
  available: number;
  isAvailable: boolean;
  allowBackorder: boolean;
};

export type CatalogProduct = {
  id: number;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  productType: "physical" | "service" | "gift_card";
  brand: { id: number; slug: string; name: string } | null;
  category: { id: number; slug: string; name: string } | null;
  tags: string[];
  requiresShipping: boolean;
  images: CatalogImage[];
  variants: CatalogVariant[];
  isSandboxProduct: boolean;
};

export type CatalogFacets = {
  categories: Array<{ slug: string; name: string; count: number }>;
  brands: Array<{ slug: string; name: string; count: number }>;
  priceRange: { minCents: number; maxCents: number };
};

export type CartLine = {
  variantId: number;
  productSlug: string;
  productName: string;
  variantTitle: string;
  sku: string;
  imageSrc: string | null;
  unitPriceCents: number;
  quantity: number;
  available: number;
  allowBackorder: boolean;
  requiresShipping: boolean;
  pickupEligible: boolean;
  localDeliveryEligible: boolean;
  canadaPostEligible: boolean;
  shippingProfile: ShippingProfile;
};

export type FulfillmentMethod = "pickup" | "local_delivery" | "canada_post";
