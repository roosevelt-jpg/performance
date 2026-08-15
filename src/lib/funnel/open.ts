import type { CoachingTier } from "@/types/lead";

export const FUNNEL_OPEN_EVENT = "formula:funnel-open";

export type FunnelOpenDetail = {
  tier?: CoachingTier;
};

export function isFunnelApplyHref(href: string): boolean {
  const value = href.trim().toLowerCase();
  if (!value) return false;
  if (value.startsWith("funnel:")) return true;
  if (value === "#start" || value === "#apply") return true;
  if (value.startsWith("/book")) {
    if (value.startsWith("/book/calendar")) return false;
    if (value.startsWith("/book/confirmation")) return false;
    return true;
  }
  return false;
}

export function tierFromHref(href: string): CoachingTier | undefined {
  const value = href.toLowerCase();
  if (value.includes("elite")) return "elite";
  if (value.includes("pro")) return "pro";
  return undefined;
}

export function openFunnel(detail?: FunnelOpenDetail): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<FunnelOpenDetail>(FUNNEL_OPEN_EVENT, { detail }),
  );
}
