export const GOOGLE_CRAWLERS = [
  "Googlebot",
  "Googlebot-Image",
  "Googlebot-Video",
  "Googlebot-News",
  "Storebot-Google",
  "Google-InspectionTool",
  "GoogleOther",
  "AdsBot-Google",
  "AdsBot-Google-Mobile",
  "Mediapartners-Google",
  "FeedFetcher-Google",
  "APIs-Google",
] as const;

export function siteOrigin(siteUrl: string): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || siteUrl || "https://example.com";
  try {
    return new URL(raw).origin;
  } catch {
    return "https://example.com";
  }
}

export function absoluteUrl(siteUrl: string, path: string): string {
  if (!path) return siteOrigin(siteUrl);
  if (/^https?:\/\//i.test(path)) return path;
  const origin = siteOrigin(siteUrl);
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

export function parseKeywords(raw: string): string[] {
  return raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 16);
}

const GA4 = /^G-[A-Z0-9]+$/i;
const GTM = /^GTM-[A-Z0-9]+$/i;
const AW = /^AW-[0-9]+$/;

export function sanitizeGa4Id(value: string): string {
  const id = value.trim();
  return GA4.test(id) ? id.toUpperCase() : "";
}

export function sanitizeGtmId(value: string): string {
  const id = value.trim();
  return GTM.test(id) ? id.toUpperCase() : "";
}

export function sanitizeAdsId(value: string): string {
  const id = value.trim();
  return AW.test(id) ? id.toUpperCase() : "";
}
