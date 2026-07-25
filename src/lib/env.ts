import "server-only";

import { z } from "zod";

const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const optionalString = z.preprocess(emptyToUndefined, z.string().trim().min(1).optional());
const optionalUrl = z.preprocess(emptyToUndefined, z.url().optional());
const optionalBoolean = z.preprocess(
  (value) => {
    if (typeof value !== "string") return value;
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
    return value;
  },
  z.boolean().optional(),
);
const optionalCanadaPostAccountType = z.preprocess(
  emptyToUndefined,
  z.enum(["contract", "non_contract"]).optional(),
);

const serverEnvironmentSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_SITE_URL: optionalUrl,
  NEXT_PUBLIC_SUPABASE_URL: optionalUrl,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: optionalString,
  SUPABASE_SECRET_KEY: optionalString,
  COMMERCE_SANDBOX_MODE: optionalBoolean.default(true),
  COMMERCE_DEMO_CATALOG: optionalBoolean.default(true),
  COMMERCE_CHECKOUT_ENABLED: optionalBoolean.default(false),
  STRIPE_SECRET_KEY: optionalString,
  STRIPE_WEBHOOK_SECRET: optionalString,
  CANADA_POST_USERNAME: optionalString,
  CANADA_POST_PASSWORD: optionalString,
  CANADA_POST_ACCOUNT_TYPE: optionalCanadaPostAccountType,
  CANADA_POST_CUSTOMER_NUMBER: optionalString,
  CANADA_POST_MOBO_CUSTOMER_NUMBER: optionalString,
  CANADA_POST_CONTRACT_ID: optionalString,
  CANADA_POST_GROUP_ID: optionalString,
  CANADA_POST_API_BASE: optionalUrl.default("https://ct.soa-gw.canadapost.ca"),
  RESEND_API_KEY: optionalString,
  EMAIL_FROM: optionalString,
  ORDER_NOTIFICATION_EMAIL: optionalString,
  CRON_SECRET: optionalString,
});

export type ServerEnvironment = z.infer<typeof serverEnvironmentSchema>;

let cachedEnvironment: ServerEnvironment | undefined;

export function getServerEnvironment(): ServerEnvironment {
  if (cachedEnvironment) return cachedEnvironment;

  const parsed = serverEnvironmentSchema.safeParse(process.env);
  if (!parsed.success) {
    const names = parsed.error.issues
      .map((issue) => issue.path.join("."))
      .filter(Boolean)
      .join(", ");
    throw new Error(`Invalid server environment configuration: ${names}`);
  }

  cachedEnvironment = parsed.data;
  return cachedEnvironment;
}

export function requireServerEnvironment<
  Key extends keyof ServerEnvironment,
>(...keys: Key[]): ServerEnvironment & Required<Pick<ServerEnvironment, Key>> {
  const environment = getServerEnvironment();
  const missing = keys.filter((key) => !environment[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required server configuration: ${missing.join(", ")}`);
  }

  return environment as ServerEnvironment & Required<Pick<ServerEnvironment, Key>>;
}

export function isSandboxCommerce() {
  return getServerEnvironment().COMMERCE_SANDBOX_MODE;
}
