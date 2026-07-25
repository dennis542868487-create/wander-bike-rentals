import { expect, test } from "@playwright/test";

test("core public pages render without client exceptions", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: /Easy bike rentals/i,
    }),
  ).toBeVisible();

  await expect(
    page.getByRole("link", { name: "Shop Bikes & Accessories" }),
  ).toBeVisible();

  await page.goto("/shop");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Quality gear for every kind of ride.",
    }),
  ).toBeVisible();
  await expect(page.getByText("Sandbox catalog:")).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test("shop filters the sandbox catalog", async ({ page }) => {
  await page.goto("/shop?q=helmet");
  await expect(page.getByText("[TEST] Family Ride Helmet")).toBeVisible();
  await expect(page.getByText("[TEST] Kids Trail Helmet")).toBeVisible();
  await expect(page.getByText("[TEST] Steveston City Bike")).toHaveCount(0);

  await page.goto("/shop?type=physical&min=60&max=70");
  await expect(page.getByText("[TEST] Rear Market Basket")).toBeVisible();
  await expect(page.getByText("[TEST] Family Ride Helmet")).toHaveCount(0);
});

test("customer can add a product, change quantity, and reach the safe checkout gate", async ({
  page,
}) => {
  await page.goto("/shop/test-family-ride-helmet");
  await page.getByRole("button", { name: "Add to cart" }).click();
  await expect(page.getByRole("button", { name: "Added to cart" })).toBeVisible();

  await page.goto("/cart");
  await expect(page.getByText("[TEST] Family Ride Helmet")).toBeVisible();
  await page
    .getByRole("button", {
      name: "Increase quantity of [TEST] Family Ride Helmet",
    })
    .click();
  await expect(
    page.getByRole("link", { name: "Cart with 2 items" }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("listitem")
      .filter({ hasText: "[TEST] Family Ride Helmet" })
      .getByText("$178.00", { exact: true }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("complementary")
      .getByText("$178.00", { exact: true }),
  ).toHaveCount(2);

  await page.getByRole("link", { name: "Continue to checkout" }).click();
  await expect(page).toHaveURL(/\/checkout$/);
  await expect(page.getByText("Setup gate is on.")).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "Continue to Stripe test checkout",
    }),
  ).toBeDisabled();
});

test("admin mutation routes reject a cross-origin request before authentication", async ({
  request,
}) => {
  const response = await request.post("/api/admin/settings", {
    headers: {
      Origin: "https://attacker.example",
      "Content-Type": "application/json",
    },
    data: {},
  });
  expect(response.status()).toBe(403);
});
