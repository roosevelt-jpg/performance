import type { CmsTier } from "./types";

export const EMPTY_TIER_COMMERCE = {
  priceAmount: 0,
  priceCurrency: "gbp",
  recurringAmount: 0,
  recurringInterval: "none" as const,
  recurringMonths: 0,
  recurringStartsAfterWeeks: 0,
  billingLabel: "",
  stripePaymentLink: "",
  stripePaymentLinkId: "",
  stripePriceId: "",
  stripeRecurringPriceId: "",
  stripeProductId: "",
  stripeSyncNote: "",
};

/** Wired to calendar, DNA, and Challenge checkout. Public names can still change. */
export const SYSTEM_TIER_IDS = ["challenge", "pro", "elite"] as const;

export function isSystemTierId(id: string): boolean {
  return (SYSTEM_TIER_IDS as readonly string[]).includes(id);
}

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

export function slugifyTierId(raw: string): string {
  const slug = raw
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return slug || "programme";
}

export function uniqueTierId(desired: string, taken: string[]): string {
  const base = slugifyTierId(desired);
  const used = new Set(taken);
  if (!used.has(base)) return base;
  let n = 2;
  while (used.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

export function newCustomTierId(name: string, existingIds: string[]): string {
  return uniqueTierId(name || "programme", [...existingIds, ...SYSTEM_TIER_IDS]);
}

export function duplicateTierCard(tier: CmsTier, existingIds: string[]): CmsTier {
  const id = newCustomTierId(`${tier.name || tier.id} copy`, existingIds);
  return {
    ...tier,
    ...EMPTY_TIER_COMMERCE,
    id,
    name: tier.name ? `${tier.name} copy` : "New programme",
    enabled: true,
    highlight: false,
    stripeSyncNote: "",
  };
}

export function publicTierHref(tier: CmsTier): string {
  if (tier.cta.kind === "book") {
    return `/book?tier=${tier.cta.bookTier}`;
  }
  if (tier.cta.kind === "checkout" && tier.id !== "challenge") {
    return tier.stripePaymentLink || tier.cta.href || "#";
  }
  return tier.cta.href;
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

export function parseNonNegInt(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.round(value));
  }
  if (typeof value === "string") {
    const n = Number.parseInt(value, 10);
    if (Number.isFinite(n)) return Math.max(0, n);
  }
  return 0;
}

export function formatPublicBilling(tier: Pick<
  CmsTier,
  | "priceAmount"
  | "recurringAmount"
  | "recurringInterval"
  | "recurringMonths"
  | "recurringStartsAfterWeeks"
  | "billingLabel"
>): string {
  const custom = String(tier.billingLabel || "").trim();
  if (custom) return custom;

  const setup = parsePriceAmount(tier.priceAmount);
  const recurring = parsePriceAmount(tier.recurringAmount);
  const months = parseNonNegInt(tier.recurringMonths);
  const afterWeeks = parseNonNegInt(tier.recurringStartsAfterWeeks);

  if (setup > 0 && recurring <= 0) return `£${setup} · one-off`;
  if (setup <= 0 && recurring > 0) {
    if (months > 0) return `£${recurring} / month · ${months} months`;
    return `£${recurring} / month · rolling`;
  }
  if (setup > 0 && recurring > 0) {
    const then =
      afterWeeks > 0
        ? `then £${recurring} / month after ${afterWeeks} weeks`
        : months > 0
          ? `then £${recurring} / month for ${months} months`
          : `then £${recurring} / month`;
    return `£${setup} · ${then}`;
  }
  return "";
}

export function normalizeTierCommerce(tier: CmsTier): CmsTier {
  const rawId = String(tier.id || "").trim();
  const id = /^[a-z0-9-]+$/.test(rawId)
    ? rawId
    : slugifyTierId(rawId || tier.name || "programme");
  const recurringAmount = parsePriceAmount(tier.recurringAmount);
  const recurringInterval =
    recurringAmount > 0
      ? tier.recurringInterval === "month"
        ? "month"
        : "month"
      : "none";
  return {
    ...tier,
    id: id || tier.id,
    priceAmount: parsePriceAmount(tier.priceAmount),
    priceCurrency: (tier.priceCurrency || "gbp").trim().toLowerCase() || "gbp",
    recurringAmount,
    recurringInterval,
    recurringMonths: parseNonNegInt(tier.recurringMonths),
    recurringStartsAfterWeeks: parseNonNegInt(tier.recurringStartsAfterWeeks),
    billingLabel: String(tier.billingLabel || "").trim(),
    stripePaymentLink: String(tier.stripePaymentLink || "").trim(),
    stripePaymentLinkId: String(tier.stripePaymentLinkId || "").trim(),
    stripePriceId: String(tier.stripePriceId || "").trim(),
    stripeRecurringPriceId: String(tier.stripeRecurringPriceId || "").trim(),
    stripeProductId: String(tier.stripeProductId || "").trim(),
    stripeSyncNote: String(tier.stripeSyncNote || "").trim(),
  };
}

export function ensureUniqueTierIds(tiers: CmsTier[]): CmsTier[] {
  const seen = new Set<string>();
  return tiers.map((tier) => {
    const next = normalizeTierCommerce(tier);
    if (!seen.has(next.id)) {
      seen.add(next.id);
      return next;
    }
    const unique = uniqueTierId(next.id, [...seen]);
    seen.add(unique);
    return { ...next, id: unique };
  });
}

export function stripPrivateCommerce(cmsTiers: CmsTier[]): CmsTier[] {
  return cmsTiers.map((tier) => {
    const normalized = normalizeTierCommerce(tier);
    if (!isApplicationOnlyTier(normalized)) return normalized;
    return { ...normalized, ...EMPTY_TIER_COMMERCE };
  });
}
