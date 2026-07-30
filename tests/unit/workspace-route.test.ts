import { describe, expect, it } from "vitest";
import {
  COMMUNITY_DASHBOARD_LABEL,
  PLATFORM_DASHBOARD_LABEL,
  WANDER_DASHBOARD_LABEL,
} from "@/lib/marketplace/workspace-labels";
import { workspaceRouteForRole } from "@/lib/marketplace/workspace-route";

describe("post-auth workspace routing", () => {
  it("sends each account type to its own default workspace", () => {
    expect(workspaceRouteForRole("admin")).toBe("/admin");
    expect(workspaceRouteForRole("staff")).toBe("/operations");
    expect(workspaceRouteForRole("customer")).toBe("/account");
    expect(workspaceRouteForRole(null)).toBe("/account");
  });

  it("keeps the three dashboard names distinct and stable", () => {
    expect(COMMUNITY_DASHBOARD_LABEL).toBe("Community Bike Dashboard");
    expect(WANDER_DASHBOARD_LABEL).toBe("Wander Bike Dashboard");
    expect(PLATFORM_DASHBOARD_LABEL).toBe(
      "Website and Marketplace Dashboard",
    );
  });
});
