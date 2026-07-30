import { describe, expect, it } from "vitest";
import {
  isSiteAdminEmail,
  isWanderOperatorEmail,
} from "@/lib/marketplace/privileged-accounts";

describe("privileged marketplace accounts", () => {
  it("recognizes both Wander Operations Google accounts", () => {
    expect(isWanderOperatorEmail("zys1389@gmail.com")).toBe(true);
    expect(isWanderOperatorEmail(" DENNIS18922182165@GMAIL.COM ")).toBe(true);
    expect(isWanderOperatorEmail("rider@example.com")).toBe(false);
  });

  it("keeps Site Admin separate from Wander Operations", () => {
    expect(isSiteAdminEmail("zyz18922182165@gmail.com")).toBe(true);
    expect(isSiteAdminEmail("dennis18922182165@gmail.com")).toBe(false);
    expect(isWanderOperatorEmail("zyz18922182165@gmail.com")).toBe(false);
  });
});
