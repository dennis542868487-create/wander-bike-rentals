import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parse } from "pgsql-parser";
import { describe, expect, it } from "vitest";

describe("marketplace migration", () => {
  it("parses as PostgreSQL and contains the critical privacy and overlap controls", async () => {
    const path = resolve(
      process.cwd(),
      "supabase/migrations/20260729062650_marketplace_platform.sql",
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
});
