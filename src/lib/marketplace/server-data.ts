import "server-only";

import { cache } from "react";
import {
  mapListing,
  publicListingImageUrl,
  publicListingSelect,
} from "@/lib/marketplace/data";
import type {
  BikeListing,
  MarketplaceAccessStatus,
  MarketplaceRequest,
  RequestStatus,
  SafetyCategory,
  SafetyFlagStatus,
  SafetySignalSource,
} from "@/lib/marketplace/types";
import { WANDER_SHOP_LISTING_DEFAULTS } from "@/lib/marketplace/wander-shop";
import {
  PLATFORM_DASHBOARD_LABEL,
  WANDER_DASHBOARD_LABEL,
} from "@/lib/marketplace/workspace-labels";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  getCurrentAdmin,
  getCurrentStaff,
  getCurrentUser,
} from "@/lib/supabase/auth";

type UnknownRecord = Record<string, unknown>;

export type MarketplaceProfile = {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  bio: string | null;
  avatarUrl: string | null;
  role: "customer" | "staff" | "admin";
  marketplaceAccessStatus: MarketplaceAccessStatus;
  marketplaceAccessReason: string | null;
  marketplaceAccessChangedAt: string | null;
  createdAt: string;
};

export type EditableListing = {
  listing: BikeListing;
  privateDetails: {
    pickupAddress: string;
    postalCode: string | null;
    pickupInstructions: string | null;
  } | null;
};

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

function firstRecord(value: unknown): UnknownRecord | null {
  if (Array.isArray(value)) {
    const first = value[0];
    return first && typeof first === "object" ? (first as UnknownRecord) : null;
  }
  return value && typeof value === "object" ? (value as UnknownRecord) : null;
}

async function assertCurrentUser(userId: string) {
  const user = await getCurrentUser();
  if (!user || user.id !== userId) {
    throw new Error("Account data access is not authorized.");
  }
  return user;
}

async function assertOperationsAccess() {
  const staff = await getCurrentStaff();
  if (!staff) {
    throw new Error(`${WANDER_DASHBOARD_LABEL} data access is not authorized.`);
  }
  return staff;
}

async function assertAdminAccess() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    throw new Error(
      `${PLATFORM_DASHBOARD_LABEL} data access is not authorized.`,
    );
  }
  return admin;
}

function mapProfile(value: unknown): MarketplaceProfile | null {
  if (!value || typeof value !== "object") return null;
  const row = value as UnknownRecord;
  const id = requiredString(row.id);
  if (!id) return null;
  const role =
    row.role === "admin" || row.role === "staff" ? row.role : "customer";
  return {
    id,
    email: requiredString(row.email),
    fullName: optionalString(row.full_name),
    phone: optionalString(row.phone),
    bio: optionalString(row.bio),
    avatarUrl: optionalString(row.avatar_url),
    role,
    marketplaceAccessStatus:
      row.marketplace_access_status === "suspended" ? "suspended" : "active",
    marketplaceAccessReason: optionalString(row.marketplace_access_reason),
    marketplaceAccessChangedAt: optionalString(
      row.marketplace_access_changed_at,
    ),
    createdAt: requiredString(row.created_at),
  };
}

export const getProfile = cache(async (userId: string) => {
  await assertCurrentUser(userId);
  const { data, error } = await getSupabaseAdmin()
    .from("profiles")
    .select(
      "id,email,full_name,phone,bio,avatar_url,role,marketplace_access_status,marketplace_access_reason,marketplace_access_changed_at,created_at",
    )
    .eq("id", userId)
    .maybeSingle();
  if (error) throw new Error("Profile could not be loaded.");
  return mapProfile(data);
});

export async function getOwnedListings(ownerId: string) {
  await assertCurrentUser(ownerId);
  const { data, error } = await getSupabaseAdmin()
    .from("bike_listings")
    .select(publicListingSelect)
    .eq("owner_id", ownerId)
    .order("updated_at", { ascending: false });
  if (error) throw new Error("Your bike listings could not be loaded.");
  return (data ?? [])
    .map(mapListing)
    .filter((listing): listing is BikeListing => listing !== null);
}

export async function getEditableListing(
  listingId: string,
  userId: string,
): Promise<EditableListing | null> {
  await assertCurrentUser(userId);
  const staff = await getCurrentStaff();
  const role = staff?.role ?? "customer";
  const query = getSupabaseAdmin()
    .from("bike_listings")
    .select(`${publicListingSelect}, bike_listing_private_details (*)`)
    .eq("id", listingId);
  const { data, error } = await query.maybeSingle();
  if (error) throw new Error("Bike listing could not be loaded.");
  const listing = mapListing(data);
  if (!listing || !data || typeof data !== "object") return null;
  if (
    listing.ownerId !== userId &&
    role !== "admin" &&
    !(role === "staff" && listing.source === "wander")
  ) {
    return null;
  }
  const privateRow = firstRecord(
    (data as UnknownRecord).bike_listing_private_details,
  );
  return {
    listing,
    privateDetails:
      listing.source === "wander"
        ? {
            pickupAddress: WANDER_SHOP_LISTING_DEFAULTS.pickupAddress,
            postalCode: WANDER_SHOP_LISTING_DEFAULTS.postalCode,
            pickupInstructions:
              WANDER_SHOP_LISTING_DEFAULTS.pickupInstructions,
          }
        : privateRow
      ? {
          pickupAddress: requiredString(privateRow.pickup_address),
          postalCode: optionalString(privateRow.postal_code),
          pickupInstructions: optionalString(privateRow.pickup_instructions),
        }
      : null,
  };
}

function mapRequest(value: unknown): MarketplaceRequest | null {
  if (!value || typeof value !== "object") return null;
  const row = value as UnknownRecord;
  const listingRow = firstRecord(row.bike_listings);
  const listing = mapListing(listingRow);
  if (!listing) return null;
  const privateRow = firstRecord(
    listingRow?.bike_listing_private_details,
  );
  const status = requiredString(row.status) as RequestStatus;
  const canSeePickup =
    status === "accepted" ||
    status === "completed" ||
    row.viewer_is_owner === true;

  return {
    id: requiredString(row.id),
    listingId: requiredString(row.listing_id),
    renterId: requiredString(row.renter_id),
    ownerId: requiredString(row.owner_id),
    intent: row.intent === "buy" ? "buy" : "rent",
    startsAt: optionalString(row.starts_at),
    endsAt: optionalString(row.ends_at),
    message: optionalString(row.message),
    renterName: requiredString(row.renter_name),
    renterEmail: requiredString(row.renter_email),
    renterPhone: optionalString(row.renter_phone),
    quotedHourlyCents: optionalNumber(row.quoted_hourly_cents),
    quotedDailyCents: optionalNumber(row.quoted_daily_cents),
    quotedSalePriceCents: optionalNumber(row.quoted_sale_price_cents),
    currency: "CAD",
    status,
    responseNote: optionalString(row.response_note),
    createdAt: requiredString(row.created_at),
    updatedAt: requiredString(row.updated_at),
    listing: {
      id: listing.id,
      slug: listing.slug,
      title: listing.title,
      source: listing.source,
      pickupArea: listing.pickupArea,
      images: listing.images,
    },
    pickupDetails:
      canSeePickup && listing.source === "wander"
        ? {
            pickupAddress: WANDER_SHOP_LISTING_DEFAULTS.pickupAddress,
            postalCode: WANDER_SHOP_LISTING_DEFAULTS.postalCode,
            pickupInstructions:
              WANDER_SHOP_LISTING_DEFAULTS.pickupInstructions,
          }
        : canSeePickup && privateRow
        ? {
            pickupAddress: requiredString(privateRow.pickup_address),
            postalCode: optionalString(privateRow.postal_code),
            pickupInstructions: optionalString(privateRow.pickup_instructions),
          }
        : null,
  };
}

const requestSelect = `
  id,
  listing_id,
  renter_id,
  owner_id,
  intent,
  starts_at,
  ends_at,
  message,
  renter_name,
  renter_email,
  renter_phone,
  quoted_hourly_cents,
  quoted_daily_cents,
  quoted_sale_price_cents,
  currency,
  status,
  response_note,
  created_at,
  updated_at,
  bike_listings (
    ${publicListingSelect},
    bike_listing_private_details (*)
  )
`;

const operationsRequestSelect = requestSelect.replace(
  "bike_listings (",
  "bike_listings!inner (",
);

export async function getRequestsForRenter(userId: string) {
  await assertCurrentUser(userId);
  const { data, error } = await getSupabaseAdmin()
    .from("marketplace_requests")
    .select(requestSelect)
    .eq("renter_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error("Your requests could not be loaded.");
  return (data ?? [])
    .map(mapRequest)
    .filter((request): request is MarketplaceRequest => request !== null);
}

export async function getRequestsForOwner(userId: string) {
  await assertCurrentUser(userId);
  const { data, error } = await getSupabaseAdmin()
    .from("marketplace_requests")
    .select(requestSelect)
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error("Incoming requests could not be loaded.");
  return ((data ?? []) as unknown[])
    .map((row) => ({ ...(row as UnknownRecord), viewer_is_owner: true }))
    .map(mapRequest)
    .filter((request): request is MarketplaceRequest => request !== null);
}

export async function getOperationsOverview() {
  await assertOperationsAccess();
  const supabase = getSupabaseAdmin();
  const now = new Date();
  const nextTwoDays = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  const [activeListings, pausedListings, pendingRequests, upcomingPickups] =
    await Promise.all([
      supabase
        .from("bike_listings")
        .select("id", { count: "exact", head: true })
        .eq("source", "wander")
        .eq("status", "active"),
      supabase
        .from("bike_listings")
        .select("id", { count: "exact", head: true })
        .eq("source", "wander")
        .eq("status", "paused"),
      supabase
        .from("marketplace_requests")
        .select("id,bike_listings!inner(source)", { count: "exact", head: true })
        .eq("bike_listings.source", "wander")
        .eq("status", "pending"),
      supabase
        .from("marketplace_requests")
        .select("id,bike_listings!inner(source)", { count: "exact", head: true })
        .eq("bike_listings.source", "wander")
        .eq("intent", "rent")
        .eq("status", "accepted")
        .gte("starts_at", now.toISOString())
        .lte("starts_at", nextTwoDays.toISOString()),
    ]);
  const error = [
    activeListings.error,
    pausedListings.error,
    pendingRequests.error,
    upcomingPickups.error,
  ].find(Boolean);
  if (error) {
    throw new Error(`${WANDER_DASHBOARD_LABEL} overview could not be loaded.`);
  }

  const [recentListings, recentRequests] = await Promise.all([
    getAdminListings({ source: "wander" }),
    getOperationsRequests({}),
  ]);
  return {
    counts: {
      activeListings: activeListings.count ?? 0,
      pausedListings: pausedListings.count ?? 0,
      pendingRequests: pendingRequests.count ?? 0,
      upcomingPickups: upcomingPickups.count ?? 0,
    },
    recentListings: recentListings.slice(0, 5),
    recentRequests: recentRequests.slice(0, 5),
  };
}

export async function getOperationsRequests(filters: {
  status?: string;
  intent?: string;
}) {
  await assertOperationsAccess();
  let query = getSupabaseAdmin()
    .from("marketplace_requests")
    .select(operationsRequestSelect)
    .eq("bike_listings.source", "wander")
    .order("created_at", { ascending: false })
    .limit(200);
  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }
  if (filters.intent === "rent" || filters.intent === "buy") {
    query = query.eq("intent", filters.intent);
  }
  const { data, error } = await query;
  if (error) throw new Error("Wander requests could not be loaded.");
  return ((data ?? []) as unknown[])
    .map((row) => ({ ...(row as UnknownRecord), viewer_is_owner: true }))
    .map(mapRequest)
    .filter((request): request is MarketplaceRequest => request !== null);
}

export async function getAdminOverview() {
  await assertAdminAccess();
  const supabase = getSupabaseAdmin();
  const now = new Date();
  const nextTwoDays = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  const [
    openSafetyFlags,
    pendingRequests,
    upcomingPickups,
    failedEmails,
    recentListings,
    recentRequests,
  ] = await Promise.all([
    supabase
      .from("marketplace_safety_flags")
      .select("id", { count: "exact", head: true })
      .eq("status", "open"),
    supabase
      .from("marketplace_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("marketplace_requests")
      .select("id", { count: "exact", head: true })
      .eq("intent", "rent")
      .eq("status", "accepted")
      .gte("starts_at", now.toISOString())
      .lte("starts_at", nextTwoDays.toISOString()),
    supabase
      .from("marketplace_notification_outbox")
      .select("id", { count: "exact", head: true })
      .eq("status", "failed"),
    supabase
      .from("bike_listings")
      .select(publicListingSelect)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("marketplace_requests")
      .select(requestSelect)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const error = [
    openSafetyFlags.error,
    pendingRequests.error,
    upcomingPickups.error,
    failedEmails.error,
    recentListings.error,
    recentRequests.error,
  ].find(Boolean);
  if (error) throw new Error("Admin overview could not be loaded.");

  return {
    counts: {
      openSafetyFlags: openSafetyFlags.count ?? 0,
      pendingRequests: pendingRequests.count ?? 0,
      upcomingPickups: upcomingPickups.count ?? 0,
      failedEmails: failedEmails.count ?? 0,
    },
    recentListings: (recentListings.data ?? [])
      .map(mapListing)
      .filter((listing): listing is BikeListing => listing !== null),
    recentRequests: (recentRequests.data ?? [])
      .map((row) => ({ ...row, viewer_is_owner: true }))
      .map(mapRequest)
      .filter((request): request is MarketplaceRequest => request !== null),
  };
}

export async function getAdminListings(filters: {
  query?: string;
  source?: string;
  status?: string;
}) {
  const staff = await assertOperationsAccess();
  if (staff.role !== "admin" && filters.source !== "wander") {
    throw new Error(
      `Community listing data requires ${PLATFORM_DASHBOARD_LABEL} access.`,
    );
  }
  let query = getSupabaseAdmin()
    .from("bike_listings")
    .select(publicListingSelect)
    .order("updated_at", { ascending: false })
    .limit(200);
  if (filters.source === "wander" || filters.source === "community") {
    query = query.eq("source", filters.source);
  }
  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }
  const { data, error } = await query;
  if (error) throw new Error("Listings could not be loaded.");
  const search = filters.query?.trim().toLowerCase();
  return (data ?? [])
    .map(mapListing)
    .filter((listing): listing is BikeListing => listing !== null)
    .filter((listing) =>
      search
        ? [listing.title, listing.brand, listing.model, listing.pickupArea]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(search))
        : true,
    );
}

export async function getAdminRequests(filters: {
  status?: string;
  intent?: string;
}) {
  await assertAdminAccess();
  let query = getSupabaseAdmin()
    .from("marketplace_requests")
    .select(requestSelect)
    .order("created_at", { ascending: false })
    .limit(200);
  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }
  if (filters.intent === "rent" || filters.intent === "buy") {
    query = query.eq("intent", filters.intent);
  }
  const { data, error } = await query;
  if (error) throw new Error("Requests could not be loaded.");
  return (data ?? [])
    .map((row) => ({ ...row, viewer_is_owner: true }))
    .map(mapRequest)
    .filter((request): request is MarketplaceRequest => request !== null);
}

export async function getAdminUsers(queryText?: string) {
  await assertAdminAccess();
  const { data, error } = await getSupabaseAdmin()
    .from("profiles")
    .select(
      "id,email,full_name,phone,bio,avatar_url,role,marketplace_access_status,marketplace_access_reason,marketplace_access_changed_at,created_at",
    )
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error("Users could not be loaded.");
  const search = queryText?.trim().toLowerCase();
  return (data ?? [])
    .map(mapProfile)
    .filter((profile): profile is MarketplaceProfile => profile !== null)
    .filter((profile) =>
      search
        ? [profile.email, profile.fullName]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(search))
        : true,
    );
}

export type SafetyFlagRow = {
  id: string;
  listingId: string;
  ownerId: string;
  ownerEmail: string;
  imageId: string | null;
  imageSrc: string | null;
  signalSource: SafetySignalSource;
  provider: string;
  category: SafetyCategory;
  details: string;
  matchedTerms: string[];
  fieldNames: string[];
  evidence: Record<string, unknown>;
  status: SafetyFlagStatus;
  resolutionNote: string | null;
  createdAt: string;
  resolvedAt: string | null;
  listing: Pick<
    BikeListing,
    "id" | "title" | "slug" | "source" | "status"
  >;
};

export async function getSafetyFlags(status = "open") {
  await assertAdminAccess();
  let query = getSupabaseAdmin()
    .from("marketplace_safety_flags")
    .select(
      `
        id,
        listing_id,
        owner_id,
        image_id,
        signal_source,
        provider,
        category,
        details,
        matched_terms,
        field_names,
        evidence,
        status,
        resolution_note,
        created_at,
        resolved_at,
        bike_listing_images!marketplace_safety_flags_image_id_fkey (
          storage_path
        ),
        bike_listings (
          id,
          title,
          slug,
          source,
          status
        )
      `,
    )
    .order("created_at", { ascending: false })
    .limit(200);
  if (status !== "all") query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw new Error("Safety signals could not be loaded.");

  const ownerIds = [
    ...new Set(
      (data ?? [])
        .map((row) => row.owner_id)
        .filter((id): id is string => typeof id === "string"),
    ),
  ];
  const ownerEmails = new Map<string, string>();
  if (ownerIds.length > 0) {
    const owners = await getSupabaseAdmin()
      .from("profiles")
      .select("id,email")
      .in("id", ownerIds);
    if (owners.error) throw new Error("Safety signal owners could not be loaded.");
    for (const owner of owners.data ?? []) {
      ownerEmails.set(owner.id, owner.email);
    }
  }

  return (data ?? [])
    .map((row): SafetyFlagRow | null => {
      const listing = firstRecord(row.bike_listings);
      const image = firstRecord(row.bike_listing_images);
      if (!listing) return null;
      return {
        id: row.id,
        listingId: row.listing_id,
        ownerId: row.owner_id,
        ownerEmail: ownerEmails.get(row.owner_id) ?? "",
        imageId: optionalString(row.image_id),
        imageSrc: image
          ? publicListingImageUrl(requiredString(image.storage_path))
          : null,
        signalSource: row.signal_source as SafetySignalSource,
        provider: row.provider,
        category: row.category as SafetyCategory,
        details: row.details,
        matchedTerms: Array.isArray(row.matched_terms)
          ? row.matched_terms
          : [],
        fieldNames: Array.isArray(row.field_names) ? row.field_names : [],
        evidence:
          row.evidence && typeof row.evidence === "object"
            ? (row.evidence as Record<string, unknown>)
            : {},
        status: row.status as SafetyFlagStatus,
        resolutionNote: optionalString(row.resolution_note),
        createdAt: row.created_at,
        resolvedAt: optionalString(row.resolved_at),
        listing: {
          id: requiredString(listing.id),
          title: requiredString(listing.title),
          slug: requiredString(listing.slug),
          source: listing.source === "wander" ? "wander" : "community",
          status: requiredString(listing.status) as BikeListing["status"],
        },
      };
    })
    .filter((row): row is SafetyFlagRow => row !== null);
}

export type SensitiveTermRow = {
  id: number;
  term: string;
  category: Extract<
    SafetyCategory,
    "sensitive_term" | "contact_details" | "external_payment"
  >;
  active: boolean;
  updatedAt: string;
};

export async function getSensitiveTerms() {
  await assertAdminAccess();
  const { data, error } = await getSupabaseAdmin()
    .from("marketplace_sensitive_terms")
    .select("id,term,category,active,updated_at")
    .order("category")
    .order("term");
  if (error) throw new Error("Sensitive terms could not be loaded.");
  return (data ?? []).map((row) => ({
    id: Number(row.id),
    term: row.term,
    category: row.category,
    active: row.active,
    updatedAt: row.updated_at,
  })) as SensitiveTermRow[];
}

export type NotificationRow = {
  id: number;
  templateKey: string;
  recipient: string;
  status: "pending" | "sending" | "sent" | "failed" | "cancelled";
  attemptCount: number;
  availableAt: string;
  sentAt: string | null;
  lastError: string | null;
  createdAt: string;
};

export async function getNotificationOutbox(status?: string) {
  await assertAdminAccess();
  let query = getSupabaseAdmin()
    .from("marketplace_notification_outbox")
    .select(
      "id,template_key,recipient,status,attempt_count,available_at,sent_at,last_error,created_at",
    )
    .order("created_at", { ascending: false })
    .limit(200);
  if (status && status !== "all") query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw new Error("Email activity could not be loaded.");
  return (data ?? []).map((row) => ({
    id: Number(row.id),
    templateKey: row.template_key,
    recipient: row.recipient,
    status: row.status,
    attemptCount: row.attempt_count,
    availableAt: row.available_at,
    sentAt: row.sent_at,
    lastError: row.last_error,
    createdAt: row.created_at,
  })) as NotificationRow[];
}
