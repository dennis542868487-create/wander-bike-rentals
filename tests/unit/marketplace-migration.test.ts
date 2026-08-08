import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parse } from "pgsql-parser";
import { describe, expect, it } from "vitest";

describe("marketplace migration", () => {
  it("parses as PostgreSQL and contains the critical privacy and overlap controls", async () => {
    const path = resolve(
      process.cwd(),
      "supabase/migrations/20260729223000_marketplace_platform.sql",
    );
    const sql = await readFile(path, "utf8");
    await expect(parse(sql)).resolves.toBeDefined();
    expect(sql).toContain("bike_listing_private_details");
    expect(sql).toContain("marketplace_requests_no_accepted_rental_overlap");
    expect(sql).toContain("marketplace_safety_flags");
    expect(sql).toContain("marketplace_staff_allowlist");
    expect(sql).toContain("'zys1389@gmail.com', 'staff'");
    expect(sql).toContain("'dennis18922182165@gmail.com', 'staff'");
    expect(sql).toContain("'zyz18922182165@gmail.com', 'admin'");
    expect(sql.match(/listing\.source = 'wander'/g)).toHaveLength(3);
    expect(sql).toContain("and source = 'wander'");
    expect(sql).not.toContain("pending_review");
    expect(sql).toContain("force row level security");
    expect(sql).not.toContain("stripe");
    expect(sql).not.toContain("canada_post");
  });

  it("adds tire size, removes copy length checks, and fixes Wander shop details", async () => {
    const path = resolve(
      process.cwd(),
      "supabase/migrations/20260803023500_marketplace_wheel_size_and_wander_defaults.sql",
    );
    const sql = await readFile(path, "utf8");

    await expect(parse(sql)).resolves.toBeDefined();
    expect(sql).toContain("add column if not exists tire_size text");
    expect(sql).toContain(
      "drop constraint if exists bike_listings_short_description_check",
    );
    expect(sql).toContain(
      "drop constraint if exists bike_listings_description_check",
    );
    expect(sql).toContain("12071 First Ave #101, Richmond, BC V7E 3M1");
    expect(sql).toContain("Open daily 9:00 AM–10:00 PM");
  });

  it("adds a Wander-only available quantity with a default of one", async () => {
    const path = resolve(
      process.cwd(),
      "supabase/migrations/20260804034806_add_wander_available_quantity.sql",
    );
    const sql = await readFile(path, "utf8");

    await expect(parse(sql)).resolves.toBeDefined();
    expect(sql).toContain("add column if not exists available_quantity integer");
    expect(sql).toContain("alter column available_quantity set default 1");
    expect(sql).toContain("available_quantity between 0 and 1000");
    expect(sql).toContain("source = 'wander' or available_quantity = 1");
  });

  it("adds Nancy to the Google Staff allowlist", async () => {
    const path = resolve(
      process.cwd(),
      "supabase/migrations/20260808192801_add_nancy_staff_allowlist.sql",
    );
    const sql = await readFile(path, "utf8");

    await expect(parse(sql)).resolves.toBeDefined();
    expect(sql).toContain("'nancyzhuo2586@gmail.com', 'staff'");
    expect(sql).toContain("raw_app_meta_data");
  });
});
