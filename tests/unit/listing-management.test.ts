import { beforeEach, describe, expect, it, vi } from "vitest";

const adminMocks = vi.hoisted(() => ({
  getSupabaseAdmin: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdmin: adminMocks.getSupabaseAdmin,
}));

import { deleteManagedListing } from "@/lib/marketplace/listing-management-server";

function createAdminClient(requestCount: number) {
  const calls = {
    listingDeleted: false,
    notificationsDeleted: false,
    storagePaths: [] as string[],
  };
  let deletingListing = false;

  const listingBuilder: Record<string, ReturnType<typeof vi.fn>> = {};
  listingBuilder.select = vi.fn(() => listingBuilder);
  listingBuilder.eq = vi.fn(() => listingBuilder);
  listingBuilder.delete = vi.fn(() => {
    deletingListing = true;
    calls.listingDeleted = true;
    return listingBuilder;
  });
  listingBuilder.maybeSingle = vi.fn(async () => ({
    data: deletingListing
      ? { id: "listing-1" }
      : { id: "listing-1", title: "City Bike", source: "wander" },
    error: null,
  }));

  const requestBuilder: Record<string, ReturnType<typeof vi.fn>> = {};
  requestBuilder.select = vi.fn(() => requestBuilder);
  requestBuilder.eq = vi.fn(async () => ({
    count: requestCount,
    error: null,
  }));

  const imageBuilder: Record<string, ReturnType<typeof vi.fn>> = {};
  imageBuilder.select = vi.fn(() => imageBuilder);
  imageBuilder.eq = vi.fn(async () => ({
    data: [{ storage_path: "owner-1/photo.webp" }],
    error: null,
  }));

  const notificationBuilder: Record<string, ReturnType<typeof vi.fn>> = {};
  notificationBuilder.delete = vi.fn(() => {
    calls.notificationsDeleted = true;
    return notificationBuilder;
  });
  notificationBuilder.eq = vi.fn(async () => ({ error: null }));

  const remove = vi.fn(async (paths: string[]) => {
    calls.storagePaths = paths;
    return { error: null };
  });

  return {
    calls,
    client: {
      from: vi.fn((table: string) => {
        if (table === "bike_listings") return listingBuilder;
        if (table === "marketplace_requests") return requestBuilder;
        if (table === "bike_listing_images") return imageBuilder;
        if (table === "marketplace_notification_outbox") {
          return notificationBuilder;
        }
        throw new Error("Unexpected table: " + table);
      }),
      storage: {
        from: vi.fn(() => ({ remove })),
      },
    },
  };
}

describe("managed listing deletion", () => {
  beforeEach(() => {
    adminMocks.getSupabaseAdmin.mockReset();
  });

  it("blocks permanent deletion when the bike has request history", async () => {
    const fake = createAdminClient(2);
    adminMocks.getSupabaseAdmin.mockReturnValue(fake.client);

    const result = await deleteManagedListing({
      listingId: "listing-1",
      allowedSource: "wander",
    });

    expect(result).toMatchObject({ ok: false, status: 409 });
    expect(fake.calls.listingDeleted).toBe(false);
    expect(fake.calls.notificationsDeleted).toBe(false);
    expect(fake.calls.storagePaths).toEqual([]);
  });

  it("deletes a no-history bike and cleans up its stored images", async () => {
    const fake = createAdminClient(0);
    adminMocks.getSupabaseAdmin.mockReturnValue(fake.client);

    const result = await deleteManagedListing({
      listingId: "listing-1",
      allowedSource: "wander",
    });

    expect(result).toEqual({
      ok: true,
      deletedListing: {
        id: "listing-1",
        title: "City Bike",
      },
    });
    expect(fake.calls.notificationsDeleted).toBe(true);
    expect(fake.calls.listingDeleted).toBe(true);
    expect(fake.calls.storagePaths).toEqual(["owner-1/photo.webp"]);
  });
});
