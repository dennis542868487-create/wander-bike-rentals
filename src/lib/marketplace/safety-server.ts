import "server-only";

import {
  defaultSensitiveTerms,
  imageNeedsAdminAttention,
  scanListingText,
  type ListingTextForSafety,
  type NsfwPrediction,
  type SensitiveTermRule,
} from "@/lib/marketplace/safety-signals";
import {
  marketplaceTeamEmail,
  queueMarketplaceNotifications,
} from "@/lib/marketplace/notifications";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function getActiveSensitiveTerms(): Promise<SensitiveTermRule[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("marketplace_sensitive_terms")
    .select("term,category")
    .eq("active", true)
    .order("term");

  if (error) {
    console.error("Sensitive terms could not be loaded", error.message);
    return defaultSensitiveTerms;
  }

  return (data ?? [])
    .filter(
      (
        row,
      ): row is {
        term: string;
        category:
          | "sensitive_term"
          | "contact_details"
          | "external_payment";
      } =>
        typeof row.term === "string" &&
        ["sensitive_term", "contact_details", "external_payment"].includes(
          row.category,
        ),
    )
    .map((row) => ({ term: row.term, category: row.category }));
}

export async function refreshListingTextSignals(input: {
  listingId: string;
  ownerId: string;
  listingTitle: string;
  listingSlug: string;
  listingUpdatedAt: string;
  text: ListingTextForSafety;
}) {
  const supabase = getSupabaseAdmin();
  const rules = await getActiveSensitiveTerms();
  const signals = scanListingText(input.text, rules);
  const now = new Date().toISOString();

  const { error: clearError } = await supabase
    .from("marketplace_safety_flags")
    .update({
      status: "dismissed",
      resolution_note: "Cleared automatically after the listing was edited.",
      resolved_at: now,
    })
    .eq("listing_id", input.listingId)
    .eq("signal_source", "text_rule")
    .eq("status", "open");
  if (clearError) throw new Error("Previous text signals could not be closed.");

  if (signals.length === 0) return [];

  const rows = signals.map((signal) => ({
    listing_id: input.listingId,
    owner_id: input.ownerId,
    signal_source: "text_rule",
    provider: "wander-sensitive-terms",
    category: signal.category,
    details: signal.details,
    matched_terms: signal.matchedTerms,
    field_names: signal.fieldNames,
    evidence: {},
    dedupe_key: `text:${input.listingId}:${input.listingUpdatedAt}:${signal.category}`,
  }));
  const { data: flags, error } = await supabase
    .from("marketplace_safety_flags")
    .insert(rows)
    .select("id,category");
  if (error) throw new Error("Text safety signals could not be saved.");

  try {
    await queueMarketplaceNotifications([
      {
        listingId: input.listingId,
        templateKey: "safety_flag_created",
        dedupeKey: `safety-text-email:${input.listingId}:${input.listingUpdatedAt}`,
        recipient: marketplaceTeamEmail(),
        payload: {
          bike_title: input.listingTitle,
          listing_slug: input.listingSlug,
          signal_count: signals.length,
          signal_source: "text",
        },
      },
    ]);
  } catch (notificationError) {
    console.error("Text signal notification could not be queued", notificationError);
  }

  return flags ?? [];
}

export async function recordImageSafetySignal(input: {
  listingId: string;
  listingTitle: string;
  listingSlug: string;
  ownerId: string;
  imageId: string;
  predictions: NsfwPrediction[];
}) {
  const result = imageNeedsAdminAttention(input.predictions);
  if (!result.attention) return null;

  const topScores = Object.entries(result.scores)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3)
    .map(([label, score]) => `${label} ${Math.round(score * 100)}%`)
    .join(", ");
  const supabase = getSupabaseAdmin();
  const { data: flag, error } = await supabase
    .from("marketplace_safety_flags")
    .upsert(
      {
        listing_id: input.listingId,
        owner_id: input.ownerId,
        image_id: input.imageId,
        signal_source: "image_provider",
        provider: "nsfwjs-mobilenet-v2-client",
        category: "image_risk",
        details: `NSFWJS marked this image for administrator review (${topScores}). No automatic action was taken.`,
        matched_terms: [],
        field_names: ["listing photo"],
        evidence: { scores: result.scores },
        dedupe_key: `image:nsfwjs:${input.imageId}`,
        status: "open",
        resolution_note: null,
        resolved_by: null,
        resolved_at: null,
      },
      { onConflict: "dedupe_key" },
    )
    .select("id")
    .single();
  if (error || !flag) throw new Error("Image safety signal could not be saved.");

  try {
    await queueMarketplaceNotifications([
      {
        listingId: input.listingId,
        templateKey: "safety_flag_created",
        dedupeKey: `safety-image-email:${input.imageId}`,
        recipient: marketplaceTeamEmail(),
        payload: {
          bike_title: input.listingTitle,
          listing_slug: input.listingSlug,
          signal_count: 1,
          signal_source: "image",
        },
      },
    ]);
  } catch (notificationError) {
    console.error("Image signal notification could not be queued", notificationError);
  }

  return flag;
}
