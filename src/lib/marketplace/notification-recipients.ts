import {
  SITE_ADMIN_EMAILS,
  WANDER_OPERATOR_EMAILS,
} from "@/lib/marketplace/privileged-accounts";

export type StaffNotificationProfile = {
  email: string | null;
  role: "staff" | "admin";
};

export type RequestReceivedRecipient = {
  email: string;
  requestPath: "/account/requests" | "/operations/requests" | "/admin/requests";
};

type RecipientKind = "owner" | "staff" | "admin";

const recipientPriority: Record<RecipientKind, number> = {
  owner: 0,
  staff: 1,
  admin: 2,
};

function normalizeEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase() ?? "";
}

function requestPath(kind: RecipientKind): RequestReceivedRecipient["requestPath"] {
  if (kind === "admin") return "/admin/requests";
  if (kind === "staff") return "/operations/requests";
  return "/account/requests";
}

/**
 * A new request must reach its listing owner and every operational account.
 * Static privileged addresses cover staff before their first login; database
 * profiles include anyone granted Staff/Admin access later. Email comparison is
 * case-insensitive and a privileged dashboard wins when an address is both the
 * owner and a staff member.
 */
export function requestReceivedRecipients(
  ownerEmail: string | null | undefined,
  databaseStaff: StaffNotificationProfile[] = [],
): RequestReceivedRecipient[] {
  const recipients = new Map<string, RecipientKind>();

  function add(email: string | null | undefined, kind: RecipientKind) {
    const normalized = normalizeEmail(email);
    if (!normalized) return;
    const current = recipients.get(normalized);
    if (!current || recipientPriority[kind] > recipientPriority[current]) {
      recipients.set(normalized, kind);
    }
  }

  add(ownerEmail, "owner");
  WANDER_OPERATOR_EMAILS.forEach((email) => add(email, "staff"));
  SITE_ADMIN_EMAILS.forEach((email) => add(email, "admin"));
  databaseStaff.forEach((profile) => add(profile.email, profile.role));

  return [...recipients.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([email, kind]) => ({ email, requestPath: requestPath(kind) }));
}
