import { DEFAULT_INTEGRATIONS } from "@/lib/integrations/types";

/** Hostname only — accepts paste of https://theformulaperformance.com/ */
export function normalizeStoreDomain(input: string | undefined | null): string {
  const raw = (input ?? "").trim();
  if (!raw) return "";
  try {
    const withProto = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    return new URL(withProto).hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return raw
      .replace(/^https?:\/\//i, "")
      .replace(/\/.*$/, "")
      .replace(/^www\./i, "")
      .toLowerCase();
  }
}

/** Hosting-injected Shopify placeholder — not Kane's live storefront. */
export function isPlaceholderStoreDomain(domain: string): boolean {
  const host = normalizeStoreDomain(domain);
  if (!host) return true;
  return (
    /^vercel-store[-.].*\.myshopify\.com$/i.test(host) ||
    host.endsWith(".vercel.app")
  );
}

/**
 * Live shop hostname. Drops injected placeholder shops so the checklist
 * does not show a temporary hostname over the real domain.
 */
export function resolveStoreDomain(
  input?: string | null,
  fallback = DEFAULT_INTEGRATIONS.shopify.storeDomain,
): string {
  const host = normalizeStoreDomain(input);
  if (!host || isPlaceholderStoreDomain(host)) return fallback;
  return host;
}
