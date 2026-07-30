export type MarketplaceRole = "customer" | "staff" | "admin";

export function workspaceRouteForRole(
  role: MarketplaceRole | null | undefined,
) {
  if (role === "admin") return "/admin";
  if (role === "staff") return "/operations";
  return "/account";
}
