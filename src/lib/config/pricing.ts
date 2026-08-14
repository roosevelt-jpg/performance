/**
 * Section 8 item 1 — monthly price points for Q9 investment confirmation only.
 * Never surface on public Pro/Elite cards or checkout.
 */
export const PRICING = {
  pro: Number(process.env.NEXT_PUBLIC_PRICE_PRO ?? "297"),
  elite: Number(process.env.NEXT_PUBLIC_PRICE_ELITE ?? "497"),
} as const;

export type BookableTier = keyof typeof PRICING;

export function priceForTier(tier: BookableTier): number {
  return PRICING[tier];
}

export function formatMonthlyPrice(amount: number): string {
  return `£${amount}`;
}
