/**
 * Programme cutover map — this app is the Stripe → GHL event source.
 * Tag names and field keys match the live GHL location (verified 28 July 2026).
 */

export const CUTOVER_TAGS = {
  trackB: "track-b",
  tierProgramme: "tier-programme",
  consentWhatsapp: "consent-whatsapp",
  noWaOptin: "no-wa-optin",
  programmeWelcome: "programme-welcome",
  overdue: "overdue",
  paymentRecovery: "payment-recovery",
  cancelled: "cancelled",
} as const;

/** Tags this app removes on checkout (replaces waitlist / Track A). */
export const CUTOVER_REMOVE_ON_CHECKOUT = ["track-a", "waitlist"] as const;

/** Tags removed when a failed payment recovers. */
export const CUTOVER_REMOVE_ON_RECOVERY = [
  "overdue",
  "paused",
  "payment-recovery",
] as const;

/** Tags removed when a subscription is cancelled. */
export const CUTOVER_REMOVE_ON_CANCEL = ["programme-active"] as const;

/** Tags removed when intake is marked complete. */
export const CUTOVER_REMOVE_ON_INTAKE_COMPLETE = ["intake-stalled"] as const;

export const CUTOVER_FIELDS = {
  stripeCustomerId: "stripe_customer_id",
  stripeSubscriptionId: "stripe_subscription_id",
  track: "track",
  tier: "tier",
  subscriptionStatus: "subscription_status",
  blockStartDate: "block_start_date",
  blockEndDate: "block_end_date",
  intakeStatus: "intake_status",
  cmsTierId: "cms_tier_id",
  product: "product",
} as const;

export const CUTOVER_VALUES = {
  trackProgramme: "B - Programme",
  subscriptionActive: "Active",
  subscriptionOverdue: "Overdue",
  subscriptionCancelled: "Cancelled",
  subscriptionPaused: "Paused",
  intakeComplete: "complete",
} as const;

export type CutoverTierKind =
  | "challenge"
  | "performance"
  | "performance-analysis"
  | "pro"
  | "elite"
  | "programme"
  | string;

/** GHL dropdown / custom field value for `tier`. */
export function ghlTierLabel(tierId: string): string {
  switch (tierId) {
    case "challenge":
    case "8-week-challenge":
      return "Programme";
    case "performance":
      return "Programme";
    case "performance-analysis":
      return "Analysis";
    case "pro":
      return "Pro";
    case "elite":
      return "Elite";
    default:
      return "Programme";
  }
}

/** Whether this product enters Track B (programme coach / WF cutover). */
export function isProgrammeTrack(tierId: string): boolean {
  const id = tierId.trim().toLowerCase();
  return (
    id === "challenge" ||
    id === "8-week-challenge" ||
    id === "performance" ||
    id === "performance-analysis" ||
    id === "programme" ||
    id === "pro" ||
    id === "elite"
  );
}

export function blockLengthDays(tierId: string): number {
  switch (tierId) {
    case "challenge":
    case "8-week-challenge":
      return 56;
    case "performance":
    case "pro":
    case "elite":
      return 183; // ~6 months
    case "performance-analysis":
      return 0;
    default:
      return 56;
  }
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function blockDatesForTier(
  tierId: string,
  from: Date = new Date(),
): { start: string; end: string } | null {
  const days = blockLengthDays(tierId);
  if (days <= 0) return null;
  const start = new Date(from);
  const end = new Date(from);
  end.setUTCDate(end.getUTCDate() + days);
  return { start: isoDate(start), end: isoDate(end) };
}

export type ProgrammePurchaseWrite = {
  email: string;
  name: string;
  phone: string;
  tierId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  source: string;
  /** Tags to add */
  tagsAdd: string[];
  /** Tags to remove after upsert */
  tagsRemove: string[];
  customFields: { key: string; field_value: string }[];
  note: string;
};

export function buildCheckoutWrite(params: {
  email: string;
  name?: string;
  phone?: string;
  tierId: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  source?: string;
}): ProgrammePurchaseWrite | null {
  const email = params.email.trim();
  if (!email) return null;
  const tierId =
    params.tierId === "8-week-challenge" ? "challenge" : params.tierId.trim();
  if (!tierId) return null;

  const blocks = blockDatesForTier(tierId);
  const tagsAdd = [
    CUTOVER_TAGS.trackB,
    CUTOVER_TAGS.tierProgramme,
    "stripe_paid",
    `paid_${tierId}`,
  ];
  if (tierId === "challenge") {
    tagsAdd.push("paid_challenge", "stripe_challenge");
  }

  const customFields: { key: string; field_value: string }[] = [
    {
      key: CUTOVER_FIELDS.track,
      field_value: CUTOVER_VALUES.trackProgramme,
    },
    { key: CUTOVER_FIELDS.tier, field_value: ghlTierLabel(tierId) },
    {
      key: CUTOVER_FIELDS.subscriptionStatus,
      field_value: CUTOVER_VALUES.subscriptionActive,
    },
    { key: CUTOVER_FIELDS.cmsTierId, field_value: tierId },
    { key: CUTOVER_FIELDS.product, field_value: tierId },
  ];
  if (params.stripeCustomerId) {
    customFields.push({
      key: CUTOVER_FIELDS.stripeCustomerId,
      field_value: params.stripeCustomerId,
    });
  }
  if (params.stripeSubscriptionId) {
    customFields.push({
      key: CUTOVER_FIELDS.stripeSubscriptionId,
      field_value: params.stripeSubscriptionId,
    });
  }
  if (blocks) {
    customFields.push(
      { key: CUTOVER_FIELDS.blockStartDate, field_value: blocks.start },
      { key: CUTOVER_FIELDS.blockEndDate, field_value: blocks.end },
    );
  }

  return {
    email,
    name: (params.name || "").trim(),
    phone: (params.phone || "").trim(),
    tierId,
    stripeCustomerId: params.stripeCustomerId || "",
    stripeSubscriptionId: params.stripeSubscriptionId || "",
    source: params.source || "stripe_checkout",
    tagsAdd: [...new Set(tagsAdd)],
    tagsRemove: [...CUTOVER_REMOVE_ON_CHECKOUT],
    customFields,
    note: [
      `Programme checkout — ${ghlTierLabel(tierId)} (${tierId})`,
      `Track: ${CUTOVER_VALUES.trackProgramme}`,
      `Subscription: ${CUTOVER_VALUES.subscriptionActive}`,
      params.stripeCustomerId
        ? `Stripe customer: ${params.stripeCustomerId}`
        : null,
      params.stripeSubscriptionId
        ? `Stripe subscription: ${params.stripeSubscriptionId}`
        : null,
      blocks ? `Block: ${blocks.start} → ${blocks.end}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
  };
}

export function buildPaymentFailedTags(): {
  tagsAdd: string[];
  customFields: { key: string; field_value: string }[];
} {
  return {
    tagsAdd: [CUTOVER_TAGS.overdue, CUTOVER_TAGS.paymentRecovery],
    customFields: [
      {
        key: CUTOVER_FIELDS.subscriptionStatus,
        field_value: CUTOVER_VALUES.subscriptionOverdue,
      },
    ],
  };
}

export function buildPaymentRecoveredTags(): {
  tagsAdd: string[];
  tagsRemove: string[];
  customFields: { key: string; field_value: string }[];
} {
  return {
    tagsAdd: [],
    tagsRemove: [...CUTOVER_REMOVE_ON_RECOVERY],
    customFields: [
      {
        key: CUTOVER_FIELDS.subscriptionStatus,
        field_value: CUTOVER_VALUES.subscriptionActive,
      },
    ],
  };
}

export function buildCancelledTags(): {
  tagsAdd: string[];
  tagsRemove: string[];
  customFields: { key: string; field_value: string }[];
} {
  return {
    tagsAdd: [CUTOVER_TAGS.cancelled],
    tagsRemove: [...CUTOVER_REMOVE_ON_CANCEL],
    customFields: [
      {
        key: CUTOVER_FIELDS.subscriptionStatus,
        field_value: CUTOVER_VALUES.subscriptionCancelled,
      },
    ],
  };
}

export function buildWhatsAppConsentTags(optedIn: boolean): {
  tagsAdd: string[];
  tagsRemove: string[];
} {
  if (optedIn) {
    return {
      tagsAdd: [CUTOVER_TAGS.consentWhatsapp, CUTOVER_TAGS.programmeWelcome],
      tagsRemove: [CUTOVER_TAGS.noWaOptin],
    };
  }
  return {
    tagsAdd: [CUTOVER_TAGS.noWaOptin],
    tagsRemove: [CUTOVER_TAGS.consentWhatsapp, CUTOVER_TAGS.programmeWelcome],
  };
}
