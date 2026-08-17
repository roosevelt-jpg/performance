import type { CmsTier } from "./types";

export const EMPTY_TIER_COMMERCE = {
  priceAmount: 0,
  priceCurrency: "gbp",
  stripePaymentLink: "",
  stripePaymentLinkId: "",
  stripePriceId: "",
  stripeProductId: "",
  stripeSyncNote: "",
};

export function isApplicationOnlyTier(tier: Pick<CmsTier, "id" | "cta">): boolean {
  return (
    tier.cta.kind === "book" || tier.id === "pro" || tier.id === "elite"
  );
}

export function isSelfServeCheckoutTier(
  tier: Pick<CmsTier, "id" | "cta">,
): boolean {
  return tier.cta.kind === "checkout" && !isApplicationOnlyTier(tier);
}

export function parsePriceAmount(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.round(value * 100) / 100);
  }
  if (typeof value === "string") {
    const n = Number.parseFloat(value.replace(/[£,\s]/g, ""));
    if (Number.isFinite(n)) return Math.max(0, Math.round(n * 100) / 100);
  }
  return 0;
}

export function unitAmountFromMajor(amount: number): number {
  return Math.round(parsePriceAmount(amount) * 100);
}

export function normalizeTierCommerce(tier: CmsTier): CmsTier {
  return {
    ...tier,
    priceAmount: parsePriceAmount(tier.priceAmount),
    priceCurrency: (tier.priceCurrency || "gbp").trim().toLowerCase() || "gbp",
    stripePaymentLink: String(tier.stripePaymentLink || "").trim(),
    stripePaymentLinkId: String(tier.stripePaymentLinkId || "").trim(),
    stripePriceId: String(tier.stripePriceId || "").trim(),
    stripeProductId: String(tier.stripeProductId || "").trim(),
    stripeSyncNote: String(tier.stripeSyncNote || "").trim(),
  };
}

export function stripPrivateCommerce(cmsTiers: CmsTier[]): CmsTier[] {
  return cmsTiers.map((tier) => {
    const normalized = normalizeTierCommerce(tier);
    if (!isApplicationOnlyTier(normalized)) return normalized;
    return { ...normalized, ...EMPTY_TIER_COMMERCE };
  });
}
