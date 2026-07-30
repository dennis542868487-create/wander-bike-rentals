import "server-only";

import { z } from "zod";

const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const optionalString = z.preprocess(
  emptyToUndefined,
  z.string().trim().min(1).optional(),
);
const optionalUrl = z.preprocess(emptyToUndefined, z.url().optional());
const serverEnvironmentSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  NEXT_PUBLIC_SITE_URL: optionalUrl,
  NEXT_PUBLIC_SUPABASE_URL: optionalUrl,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: optionalString,
  SUPABASE_SECRET_KEY: optionalString,
  RESEND_API_KEY: optionalString,
  EMAIL_FROM: optionalString,
  EMAIL_REPLY_TO: optionalString,
  MARKETPLACE_NOTIFICATION_EMAIL: optionalString,
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

export function requireServerEnvironment<Key extends keyof ServerEnvironment>(
  ...keys: Key[]
): ServerEnvironment & Required<Pick<ServerEnvironment, Key>> {
  const environment = getServerEnvironment();
  const missing = keys.filter((key) => !environment[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required server configuration: ${missing.join(", ")}`,
    );
  }

  return environment as ServerEnvironment &
    Required<Pick<ServerEnvironment, Key>>;
}
