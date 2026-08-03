import type { SafetyCategory } from "@/lib/marketplace/types";

export type SensitiveTermRule = {
  term: string;
  category: Extract<
    SafetyCategory,
    "sensitive_term" | "contact_details" | "external_payment"
  >;
};

export type ListingTextForSafety = {
  title: string;
  shortDescription?: string | null;
  description: string;
  brand?: string | null;
  model?: string | null;
  frameSize?: string | null;
  tireSize?: string | null;
  pickupArea: string;
  availabilitySummary?: string | null;
  rentalRules?: string | null;
  includedItems: string[];
};

export type ListingTextSignal = {
  category: Extract<
    SafetyCategory,
    "sensitive_term" | "contact_details" | "external_payment"
  >;
  details: string;
  matchedTerms: string[];
  fieldNames: string[];
};

export type NsfwPrediction = {
  className: "Drawing" | "Hentai" | "Neutral" | "Porn" | "Sexy";
  probability: number;
};

export const defaultSensitiveTerms: SensitiveTermRule[] = [
  { term: "gift card", category: "external_payment" },
  { term: "cryptocurrency", category: "external_payment" },
  { term: "bitcoin", category: "external_payment" },
  { term: "wire transfer", category: "external_payment" },
  { term: "western union", category: "external_payment" },
  { term: "pay deposit first", category: "external_payment" },
  { term: "e-transfer first", category: "external_payment" },
  { term: "whatsapp", category: "contact_details" },
  { term: "telegram", category: "contact_details" },
  { term: "礼品卡", category: "external_payment" },
  { term: "加密货币", category: "external_payment" },
  { term: "比特币", category: "external_payment" },
  { term: "先付定金", category: "external_payment" },
  { term: "先转账", category: "external_payment" },
];

const fieldLabels: Record<keyof ListingTextForSafety, string> = {
  title: "title",
  shortDescription: "short description",
  description: "description",
  brand: "brand",
  model: "model",
  frameSize: "frame size",
  tireSize: "wheel or tire size",
  pickupArea: "public pickup area",
  availabilitySummary: "availability",
  rentalRules: "owner notes",
  includedItems: "included items",
};

const emailPattern = /\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/iu;
const urlPattern = /\b(?:https?:\/\/|www\.)\S+/iu;
const phoneWithContactContext =
  /(?:call|text|phone|contact|whatsapp|telegram|wechat|微信|电话|短信)[^\n]{0,28}\+?[\d().\s-]{7,}/iu;

function normalize(value: string) {
  return value.normalize("NFKC").toLocaleLowerCase("en-CA");
}

function publicFieldEntries(input: ListingTextForSafety) {
  return (Object.keys(fieldLabels) as Array<keyof ListingTextForSafety>)
    .map((field) => {
      const value = input[field];
      const text = Array.isArray(value) ? value.join(", ") : value;
      return [fieldLabels[field], typeof text === "string" ? text : ""] as const;
    })
    .filter((entry) => entry[1].trim().length > 0);
}

export function scanListingText(
  input: ListingTextForSafety,
  rules: SensitiveTermRule[] = defaultSensitiveTerms,
): ListingTextSignal[] {
  const grouped = new Map<
    ListingTextSignal["category"],
    { matchedTerms: Set<string>; fieldNames: Set<string> }
  >();

  const add = (
    category: ListingTextSignal["category"],
    term: string,
    fieldName: string,
  ) => {
    const existing = grouped.get(category) ?? {
      matchedTerms: new Set<string>(),
      fieldNames: new Set<string>(),
    };
    existing.matchedTerms.add(term);
    existing.fieldNames.add(fieldName);
    grouped.set(category, existing);
  };

  for (const [fieldName, rawText] of publicFieldEntries(input)) {
    const text = normalize(rawText);
    for (const rule of rules) {
      const term = normalize(rule.term.trim());
      if (term && text.includes(term)) {
        add(rule.category, rule.term.trim(), fieldName);
      }
    }
    if (emailPattern.test(rawText)) {
      add("contact_details", "email address", fieldName);
    }
    if (urlPattern.test(rawText)) {
      add("contact_details", "external link", fieldName);
    }
    if (phoneWithContactContext.test(rawText)) {
      add("contact_details", "public phone number", fieldName);
    }
  }

  return [...grouped.entries()].map(([category, value]) => {
    const matchedTerms = [...value.matchedTerms].sort();
    const fieldNames = [...value.fieldNames].sort();
    return {
      category,
      matchedTerms,
      fieldNames,
      details: `Automatic text signal: ${matchedTerms.join(", ")} found in ${fieldNames.join(", ")}. The listing remains live until an administrator decides otherwise.`,
    };
  });
}

export function imageNeedsAdminAttention(predictions: NsfwPrediction[]) {
  const scores = Object.fromEntries(
    predictions.map((prediction) => [
      prediction.className,
      Math.max(0, Math.min(1, prediction.probability)),
    ]),
  ) as Partial<Record<NsfwPrediction["className"], number>>;

  const porn = scores.Porn ?? 0;
  const hentai = scores.Hentai ?? 0;
  const sexy = scores.Sexy ?? 0;
  const attention =
    porn >= 0.6 ||
    hentai >= 0.6 ||
    sexy >= 0.85 ||
    porn + hentai >= 0.55;

  return {
    attention,
    scores: {
      Drawing: scores.Drawing ?? 0,
      Hentai: hentai,
      Neutral: scores.Neutral ?? 0,
      Porn: porn,
      Sexy: sexy,
    },
  };
}
