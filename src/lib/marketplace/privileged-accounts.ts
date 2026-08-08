export const WANDER_OPERATOR_EMAILS = [
  "zys1389@gmail.com",
  "dennis18922182165@gmail.com",
  "nancyzhuo2586@gmail.com",
] as const;

export const SITE_ADMIN_EMAILS = ["zyz18922182165@gmail.com"] as const;

function normalizedEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase() ?? "";
}

export function isWanderOperatorEmail(email: string | null | undefined) {
  return WANDER_OPERATOR_EMAILS.some(
    (operatorEmail) => operatorEmail === normalizedEmail(email),
  );
}

export function isSiteAdminEmail(email: string | null | undefined) {
  return SITE_ADMIN_EMAILS.some(
    (adminEmail) => adminEmail === normalizedEmail(email),
  );
}
