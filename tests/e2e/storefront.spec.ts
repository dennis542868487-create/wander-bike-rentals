import { expect, test } from "@playwright/test";

test("core public pages render without client exceptions", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  const homeResponse = await page.goto("/");
  expect(homeResponse).not.toBeNull();
  expect(homeResponse?.headers()).toMatchObject({
    "content-security-policy":
      "base-uri 'self'; frame-ancestors 'none'; object-src 'none'",
    "permissions-policy":
      "camera=(), microphone=(), geolocation=(), browsing-topics=()",
    "referrer-policy": "strict-origin-when-cross-origin",
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
  });
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

  await page.goto("/policies/returns");
  await expect(
    page.getByRole("heading", { level: 1, name: "Return policy" }),
  ).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
  expect(pageErrors).toEqual([]);
});

test("account auth exposes safe Google, Apple, and email setup states", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/auth");
  await expect(
    page.getByRole("button", {
      name: "Google sign-in — setup needed",
    }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", {
      name: "Apple sign-in — setup needed",
    }),
  ).toBeDisabled();

  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(page.getByLabel("Full name")).toBeVisible();
  await expect(page.getByLabel("Password")).toHaveAttribute(
    "autocomplete",
    "new-password",
  );
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

test("commerce and rental mutations reject cross-origin requests before authentication", async ({
  request,
}) => {
  const requestOptions = {
    headers: {
      Origin: "https://attacker.example",
      "Content-Type": "application/json",
    },
    data: {},
  };
  const responses = await Promise.all([
    request.post("/api/admin/settings", requestOptions),
    request.post("/api/bookings", requestOptions),
    request.patch("/api/bookings/not-a-booking", requestOptions),
    request.patch("/api/booking-admin/bookings/not-a-booking", requestOptions),
  ]);

  expect(responses.map((response) => response.status())).toEqual([
    403, 403, 403, 403,
  ]);
});

test("sitemap includes commerce but excludes sandbox products", async ({
  request,
}) => {
  const response = await request.get("/sitemap.xml");
  expect(response.ok()).toBe(true);
  const xml = await response.text();
  expect(xml).toContain("<loc>https://www.wanderbike.ca/shop</loc>");
  expect(xml).toContain(
    "<loc>https://www.wanderbike.ca/quick-bike-repair-richmond</loc>",
  );
  expect(xml).not.toContain("test-family-ride-helmet");
});
