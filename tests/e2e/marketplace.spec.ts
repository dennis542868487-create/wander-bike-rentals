import { expect, test } from "@playwright/test";

test("home presents the two marketplace actions and no commerce checkout", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  const response = await page.goto("/");
  expect(response).not.toBeNull();
  expect(response?.headers()).toMatchObject({
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
      name: "Easy local bike rentals, now with a community marketplace.",
    }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Find a Bike", exact: true }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "List Your Bike", exact: true }).first()).toBeVisible();
  await expect(page.getByText("No cart. No shipping. No platform payment.")).toBeVisible();
  await expect(
    page.getByRole("heading", {
      level: 2,
      name: "What local riders say about us",
    }),
  ).toBeVisible();
  await expect(page.getByText("Shop", { exact: true })).toHaveCount(0);
  expect(pageErrors).toEqual([]);
});

test("mobile quick actions include directions to the Wander store", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const storeLink = page
    .getByRole("navigation", { name: "Mobile quick actions" })
    .getByRole("link", { name: "Go to Store" });
  await expect(storeLink).toBeVisible();
  await expect(storeLink).toHaveAttribute(
    "href",
    /google\.com\/maps\/dir.*destination=12071.*First.*Ave/,
  );
});

test("about page states the shop history, current scope, and sharing mission", async ({
  page,
}) => {
  await page.goto("/about");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "A local bike shop with a bigger sharing mission.",
    }),
  ).toBeVisible();
  await expect(page.getByText("Opened in Steveston · April 2026")).toBeVisible();
  await expect(
    page.getByRole("heading", {
      level: 2,
      name: "Find the bike there. Leave yours at home.",
    }),
  ).toBeVisible();
  await expect(page.getByText("Local service from Steveston")).toBeVisible();
  await expect(page).toHaveTitle(
    "About Wander Bike | Steveston Bike Rental Shop",
  );
});

test("Wander and Community bikes stay on separate pages", async ({ page }) => {
  await page.goto("/bikes/wander");
  await expect(
    page.getByRole("link", { name: /Wander Bikes/ }).first(),
  ).toHaveAttribute("aria-current", "page");
  await expect(
    page.getByRole("heading", { level: 2, name: "Wander Bikes" }),
  ).toBeVisible();
  await expect(page.getByText("Seaside Cruiser", { exact: true })).toBeVisible();
  await expect(page.getByText("Sage City Bike", { exact: true })).toHaveCount(0);

  await page.goto("/bikes/community");
  await expect(
    page.getByRole("link", { name: /Community Bikes/ }).first(),
  ).toHaveAttribute("aria-current", "page");
  await expect(
    page.getByRole("heading", { level: 2, name: "Community Bikes" }),
  ).toBeVisible();
  await expect(page.getByText("Sage City Bike", { exact: true })).toBeVisible();
  await expect(page.getByText("Seaside Cruiser", { exact: true })).toHaveCount(0);
});

test("community owners are told that listings publish immediately", async ({
  page,
}) => {
  await page.goto("/list-your-bike");
  await expect(
    page.getByRole("heading", { level: 2, name: "Publish immediately" }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "There is no listing approval queue. Automatic signals only alert Site Admin.",
    ),
  ).toBeVisible();
});

test("the three private workspaces keep separate sign-in destinations", async ({
  page,
}) => {
  await page.goto("/account");
  await expect(page).toHaveURL(/\/auth\?next=\/account$/);

  await page.goto("/operations");
  await expect(page).toHaveURL(/\/auth\?next=\/operations$/);

  await page.goto("/admin");
  await expect(page).toHaveURL(/\/auth\?next=\/admin$/);

  await page.goto("/account/rental-agreement");
  await expect(page).toHaveURL(/\/auth\?next=\/account$/);

  await page.goto("/operations/rental-agreement");
  await expect(page).toHaveURL(/\/auth\?next=\/operations$/);
});

test("the dark workspace switcher keeps readable button contrast", async ({
  page,
}) => {
  await page.goto("/");
  const colors = await page.evaluate(() => {
    const link = document.createElement("a");
    link.href = "/operations";
    link.className =
      "workspace-switch-link-dark bg-slate-950 px-3 py-2.5";
    link.textContent = "Wander Bike Dashboard";
    document.body.append(link);
    const style = getComputedStyle(link);
    const result = {
      background: style.backgroundColor,
      foreground: style.color,
    };
    link.remove();
    return result;
  });

  expect(colors.foreground).toBe("rgb(255, 255, 255)");
  expect(colors.background).not.toBe("rgba(0, 0, 0, 0)");
});

test("browse filters and individual bike prices work", async ({ page }) => {
  await page.goto("/bikes/wander?q=west");
  await expect(page.getByText("West Dyke Hybrid", { exact: true })).toBeVisible();
  await expect(page.getByText("Seaside Cruiser", { exact: true })).toHaveCount(0);

  await page.goto("/bikes/wander?intent=sale");
  await expect(page.getByText("Seaside Cruiser", { exact: true })).toBeVisible();
  await expect(page.getByText("Family Bike Trailer", { exact: true })).toBeVisible();
  await expect(page.getByText("West Dyke Hybrid", { exact: true })).toHaveCount(0);

  await page.goto("/bikes/wander-seaside-cruiser");
  await expect(page.getByText("$45", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("$485", { exact: true }).first()).toBeVisible();
  const offlinePaymentLabels = page.getByText("Payment is arranged offline");
  await expect(offlinePaymentLabels).toHaveCount(2);
  await expect
    .poll(() =>
      offlinePaymentLabels.evaluateAll((elements) =>
        elements.some((element) => element.getClientRects().length > 0),
      ),
    )
    .toBe(true);
});

test("auth exposes only Google and email", async ({ page }) => {
  await page.goto("/auth");
  await expect(
    page.getByRole("button", { name: "Continue with Google" }),
  ).toBeEnabled();
  await expect(page.getByText(/Apple/i)).toHaveCount(0);
  await expect(page.getByText(/Facebook/i)).toHaveCount(0);
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
});

test("legacy commerce URLs redirect into the marketplace", async ({ page }) => {
  await page.goto("/shop");
  await expect(page).toHaveURL(/\/bikes$/);
  await page.goto("/checkout");
  await expect(page).toHaveURL(/\/bikes$/);
  await page.goto("/booking");
  await expect(page).toHaveURL(/\/booking$/);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Choose a bike before you reserve.",
    }),
  ).toBeVisible();
});

test("mutation routes reject cross-origin requests before auth", async ({
  request,
}) => {
  const options = {
    headers: {
      Origin: "https://attacker.example",
      "Content-Type": "application/json",
    },
    data: {},
  };
  const responses = await Promise.all([
    request.post("/api/marketplace/listings", options),
    request.post("/api/marketplace/requests", options),
    request.patch("/api/account/profile", options),
    request.post("/api/admin/marketplace/safety/terms", options),
    request.patch(
      "/api/operations/marketplace/listings/00000000-0000-0000-0000-000000000000",
      options,
    ),
  ]);
  expect(responses.map((response) => response.status())).toEqual([
    403, 403, 403, 403, 403,
  ]);
});

test("sitemap contains marketplace pages and no shop or checkout", async ({
  request,
}) => {
  const response = await request.get("/sitemap.xml");
  expect(response.ok()).toBe(true);
  const xml = await response.text();
  expect(xml).toContain("<loc>https://www.wanderbike.ca/about</loc>");
  expect(xml).toContain("<loc>https://www.wanderbike.ca/bikes/wander</loc>");
  expect(xml).toContain("<loc>https://www.wanderbike.ca/bikes/community</loc>");
  expect(xml).toContain("<loc>https://www.wanderbike.ca/about-marketplace</loc>");
  expect(xml).toContain("<loc>https://www.wanderbike.ca/location</loc>");
  expect(xml).toContain(
    "<loc>https://www.wanderbike.ca/quick-bike-repair-richmond</loc>",
  );
  expect(xml).toContain("<loc>https://www.wanderbike.ca/booking</loc>");
  expect(xml).not.toContain("/shop");
  expect(xml).not.toContain("/checkout");
});
