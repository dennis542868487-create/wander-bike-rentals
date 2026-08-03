import "server-only";

import { createClient } from "@supabase/supabase-js";
import { demoListings } from "@/lib/marketplace/demo-data";
import { primaryListingPrice } from "@/lib/marketplace/format";
import type {
  BikeListing,
  BikeType,
  ListingFilters,
  ListingImage,
  ListingSource,
} from "@/lib/marketplace/types";
import { getOptionalSupabasePublicConfig } from "@/lib/supabase/config";

type UnknownRecord = Record<string, unknown>;

export const publicListingSelect = `
  id,
  owner_id,
  source,
  slug,
  title,
  short_description,
  description,
  bike_type,
  brand,
  model,
  frame_size,
  tire_size,
  condition,
  offer_mode,
  rental_hourly_cents,
  rental_daily_cents,
  sale_price_cents,
  currency,
  minimum_rental_hours,
  pickup_area,
  city,
  province,
  approximate_latitude,
  approximate_longitude,
  available_from,
  available_until,
  availability_summary,
  rental_rules,
  included_items,
  status,
  featured,
  management_note,
  published_at,
  created_at,
  updated_at,
  bike_listing_images (
    id,
    storage_path,
    alt_text,
    width,
    height,
    sort_order
  )
`;

function optionalString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function requiredString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function optionalNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function publicListingImageUrl(storagePath: string) {
  const config = getOptionalSupabasePublicConfig();
  if (!config) return "/assets/bikes-row.jpg";
  const encodedPath = storagePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${config.url}/storage/v1/object/public/bike-listing-images/${encodedPath}`;
}

function mapImage(value: unknown): ListingImage | null {
  if (!value || typeof value !== "object") return null;
  const row = value as UnknownRecord;
  const storagePath = requiredString(row.storage_path);
  if (!storagePath) return null;
  return {
    id: requiredString(row.id),
    src: publicListingImageUrl(storagePath),
    storagePath,
    alt: requiredString(row.alt_text) || "Bike listing photo",
    width: optionalNumber(row.width),
    height: optionalNumber(row.height),
    sortOrder: optionalNumber(row.sort_order) ?? 0,
  };
}

export function mapListing(value: unknown): BikeListing | null {
  if (!value || typeof value !== "object") return null;
  const row = value as UnknownRecord;
  const id = requiredString(row.id);
  const slug = requiredString(row.slug);
  if (!id || !slug) return null;
  const imageRows = Array.isArray(row.bike_listing_images)
    ? row.bike_listing_images
    : [];

  return {
    id,
    ownerId: requiredString(row.owner_id),
    source: row.source === "wander" ? "wander" : "community",
    slug,
    title: requiredString(row.title),
    shortDescription: optionalString(row.short_description),
    description: requiredString(row.description),
    bikeType: requiredString(row.bike_type) as BikeListing["bikeType"],
    brand: optionalString(row.brand),
    model: optionalString(row.model),
    frameSize: optionalString(row.frame_size),
    tireSize: optionalString(row.tire_size),
    condition: requiredString(row.condition) as BikeListing["condition"],
    offerMode: requiredString(row.offer_mode) as BikeListing["offerMode"],
    rentalHourlyCents: optionalNumber(row.rental_hourly_cents),
    rentalDailyCents: optionalNumber(row.rental_daily_cents),
    salePriceCents: optionalNumber(row.sale_price_cents),
    currency: "CAD",
    minimumRentalHours: optionalNumber(row.minimum_rental_hours) ?? 1,
    pickupArea: requiredString(row.pickup_area),
    city: requiredString(row.city),
    province: requiredString(row.province),
    approximateLatitude: optionalNumber(row.approximate_latitude),
    approximateLongitude: optionalNumber(row.approximate_longitude),
    availableFrom: optionalString(row.available_from),
    availableUntil: optionalString(row.available_until),
    availabilitySummary: optionalString(row.availability_summary),
    rentalRules: optionalString(row.rental_rules),
    includedItems: Array.isArray(row.included_items)
      ? row.included_items.filter(
          (item): item is string => typeof item === "string",
        )
      : [],
    status: requiredString(row.status) as BikeListing["status"],
    featured: row.featured === true,
    managementNote: optionalString(row.management_note),
    publishedAt: optionalString(row.published_at),
    createdAt: requiredString(row.created_at),
    updatedAt: requiredString(row.updated_at),
    images: imageRows
      .map(mapImage)
      .filter((image): image is ListingImage => image !== null)
      .sort((left, right) => left.sortOrder - right.sortOrder),
  };
}

function filterListings(
  listings: BikeListing[],
  filters: ListingFilters = {},
) {
  const query = filters.query?.trim().toLowerCase();
  const filtered = listings.filter((listing) => {
    if (filters.type && filters.type !== "all" && listing.bikeType !== filters.type) {
      return false;
    }
    if (
      filters.intent === "rent" &&
      !["rent", "rent_sale"].includes(listing.offerMode)
    ) {
      return false;
    }
    if (
      filters.intent === "sale" &&
      !["sale", "rent_sale"].includes(listing.offerMode)
    ) {
      return false;
    }
    if (
      query &&
      ![
        listing.title,
        listing.brand,
        listing.model,
        listing.frameSize,
        listing.tireSize,
        listing.pickupArea,
        listing.bikeType,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    ) {
      return false;
    }
    return true;
  });

  return filtered.sort((left, right) => {
    if (filters.sort === "price_low") {
      return primaryListingPrice(left) - primaryListingPrice(right);
    }
    if (filters.sort === "price_high") {
      return primaryListingPrice(right) - primaryListingPrice(left);
    }
    return (
      new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
    );
  });
}

function shouldUsePreviewDemoListings(errorCode: string | undefined) {
  return (
    process.env.VERCEL_ENV === "preview" &&
    (errorCode === "PGRST205" || errorCode === "42P01")
  );
}

async function loadRemoteListings(source: ListingSource) {
  const config = getOptionalSupabasePublicConfig();
  if (!config) return null;

  const supabase = createClient(config.url, config.publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase
    .from("bike_listings")
    .select(publicListingSelect)
    .eq("source", source)
    .eq("status", "active")
    .limit(100);

  if (error) {
    console.error("Marketplace listings could not be loaded", error.message);
    if (shouldUsePreviewDemoListings(error.code)) {
      return demoListings.filter((listing) => listing.source === source);
    }
    return [];
  }
  return (data ?? [])
    .map(mapListing)
    .filter((listing): listing is BikeListing => listing !== null);
}

export async function getPublicListings(
  source: ListingSource,
  filters: ListingFilters = {},
) {
  if (process.env.MARKETPLACE_DEMO_MODE === "true") {
    return filterListings(
      demoListings.filter((listing) => listing.source === source),
      filters,
    );
  }
  const remote = await loadRemoteListings(source);
  const listings =
    remote ??
    demoListings.filter((listing) => listing.source === source);
  return filterListings(listings, filters);
}

export async function getFeaturedListings(source: ListingSource, limit = 3) {
  const listings = await getPublicListings(source);
  const featured = listings.filter((listing) => listing.featured);
  return (featured.length > 0 ? featured : listings).slice(0, limit);
}

export async function getPublicListingBySlug(slug: string) {
  if (process.env.MARKETPLACE_DEMO_MODE === "true") {
    return demoListings.find((listing) => listing.slug === slug) ?? null;
  }
  const config = getOptionalSupabasePublicConfig();
  if (!config) {
    return demoListings.find((listing) => listing.slug === slug) ?? null;
  }

  const supabase = createClient(config.url, config.publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase
    .from("bike_listings")
    .select(publicListingSelect)
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    console.error("Marketplace listing could not be loaded", error.message);
    if (shouldUsePreviewDemoListings(error.code)) {
      return demoListings.find((listing) => listing.slug === slug) ?? null;
    }
    return null;
  }
  return mapListing(data);
}

export function isBikeType(value: string | undefined): value is BikeType {
  return [
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
  ].includes(value ?? "");
}
