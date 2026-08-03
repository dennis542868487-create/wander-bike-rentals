import { defineConfig, devices } from "@playwright/test";

const localChromiumExecutable =
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
const localLaunchOptions = localChromiumExecutable
  ? { executablePath: localChromiumExecutable }
  : undefined;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], launchOptions: localLaunchOptions },
    },
    {
      name: "mobile-chromium",
      use: { ...devices["Pixel 7"], launchOptions: localLaunchOptions },
    },
    {
      name: "tablet-chromium",
      use: {
        ...devices["iPad (gen 11)"],
        browserName: "chromium",
        launchOptions: localLaunchOptions,
      },
    },
  ],
  webServer: {
    command: "npm run start -- --hostname 127.0.0.1 --port 3100",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      NEXT_PUBLIC_SITE_URL: "http://127.0.0.1:3100",
      NEXT_PUBLIC_SUPABASE_URL: "",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "",
      SUPABASE_SECRET_KEY: "",
      RESEND_API_KEY: "",
      EMAIL_FROM: "",
      MARKETPLACE_NOTIFICATION_EMAIL: "",
      MARKETPLACE_DEMO_MODE: "true",
    },
  },
});
