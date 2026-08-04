export const listingSources = ["wander", "community"] as const;
export type ListingSource = (typeof listingSources)[number];

export const offerModes = ["rent", "sale", "rent_sale"] as const;
export type OfferMode = (typeof offerModes)[number];

export const bikeTypes = [
  "cruiser",
  "hybrid",
  "mountain",
  "road",
  "electric",
  "kids",
  "cargo",
  "folding",
  "trailer",
  "other",
] as const;
export type BikeType = (typeof bikeTypes)[number];

export const listingStatuses = [
  "draft",
  "active",
  "paused",
  "reserved",
  "sold",
  "archived",
] as const;
export type ListingStatus = (typeof listingStatuses)[number];

export const marketplaceAccessStatuses = ["active", "suspended"] as const;
export type MarketplaceAccessStatus =
  (typeof marketplaceAccessStatuses)[number];

export type ListingImage = {
  id: string;
  src: string;
  storagePath: string | null;
  alt: string;
  width: number | null;
  height: number | null;
  sortOrder: number;
};

export type BikeListing = {
  id: string;
  ownerId: string;
  source: ListingSource;
  slug: string;
  title: string;
  shortDescription: string | null;
  description: string;
  bikeType: BikeType;
  brand: string | null;
  model: string | null;
  frameSize: string | null;
  tireSize: string | null;
  condition: "new" | "like_new" | "good" | "fair";
  offerMode: OfferMode;
  rentalHourlyCents: number | null;
  rentalDailyCents: number | null;
  salePriceCents: number | null;
  currency: "CAD";
  minimumRentalHours: number;
  availableQuantity: number;
  pickupArea: string;
  city: string;
  province: string;
  approximateLatitude: number | null;
  approximateLongitude: number | null;
  availableFrom: string | null;
  availableUntil: string | null;
  availabilitySummary: string | null;
  rentalRules: string | null;
  includedItems: string[];
  status: ListingStatus;
  featured: boolean;
  managementNote: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  images: ListingImage[];
};

export const safetySignalSources = ["text_rule", "image_provider"] as const;
export type SafetySignalSource = (typeof safetySignalSources)[number];

export const safetyFlagStatuses = ["open", "dismissed", "actioned"] as const;
export type SafetyFlagStatus = (typeof safetyFlagStatuses)[number];

export const safetyCategories = [
  "sensitive_term",
  "contact_details",
  "external_payment",
  "image_risk",
  "other",
] as const;
export type SafetyCategory = (typeof safetyCategories)[number];

export const requestIntents = ["rent", "buy"] as const;
export type RequestIntent = (typeof requestIntents)[number];

export const requestStatuses = [
  "pending",
  "accepted",
  "declined",
  "cancelled",
  "completed",
  "no_show",
] as const;
export type RequestStatus = (typeof requestStatuses)[number];

export type MarketplaceRequest = {
  id: string;
  listingId: string;
  renterId: string;
  ownerId: string;
  intent: RequestIntent;
  startsAt: string | null;
  endsAt: string | null;
  message: string | null;
  renterName: string;
  renterEmail: string;
  renterPhone: string | null;
  quotedHourlyCents: number | null;
  quotedDailyCents: number | null;
  quotedSalePriceCents: number | null;
  currency: "CAD";
  status: RequestStatus;
  responseNote: string | null;
  createdAt: string;
  updatedAt: string;
  listing: Pick<
    BikeListing,
    "id" | "slug" | "title" | "source" | "pickupArea" | "images"
  >;
  pickupDetails?: {
    pickupAddress: string;
    postalCode: string | null;
    pickupInstructions: string | null;
  } | null;
};

export type ListingFilters = {
  query?: string;
  type?: BikeType | "all";
  intent?: "all" | "rent" | "sale";
  sort?: "newest" | "price_low" | "price_high";
};
