import {
  DEFAULT_INTEGRATIONS,
  type IntegrationCheck,
  type IntegrationsConfig,
} from "./types";
import { getFirebaseFirestore, isFirebaseConfigured } from "@/lib/firebase/admin";

const INTEGRATIONS_DOCUMENT = "configuration/integrations";

function num(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function fromEnv(): IntegrationsConfig {
  return {
    admin: { notes: "" },
    pricing: {
      pro: num(process.env.NEXT_PUBLIC_PRICE_PRO, DEFAULT_INTEGRATIONS.pricing.pro),
      elite: num(
        process.env.NEXT_PUBLIC_PRICE_ELITE,
        DEFAULT_INTEGRATIONS.pricing.elite,
      ),
    },
    product: {
      showEntryTier: process.env.NEXT_PUBLIC_SHOW_ENTRY_TIER === "true",
      challengeCheckoutUrl:
        process.env.NEXT_PUBLIC_CHALLENGE_CHECKOUT_URL ??
        DEFAULT_INTEGRATIONS.product.challengeCheckoutUrl,
      challengeCheckoutEmbedUrl:
        process.env.NEXT_PUBLIC_CHALLENGE_CHECKOUT_EMBED_URL ??
        DEFAULT_INTEGRATIONS.product.challengeCheckoutEmbedUrl,
      challengeCheckoutOpenInNewTab:
        process.env.NEXT_PUBLIC_CHALLENGE_CHECKOUT_NEW_TAB !== "false",
    },
    calendar: {
      platform:
        process.env.NEXT_PUBLIC_CALENDAR_PLATFORM === "calendly"
          ? "calendly"
          : "ghl",
      ghlEmbedPro: process.env.NEXT_PUBLIC_GHL_CALENDAR_EMBED_PRO ?? "",
      ghlEmbedElite: process.env.NEXT_PUBLIC_GHL_CALENDAR_EMBED_ELITE ?? "",
      calendlyEmbedPro: process.env.NEXT_PUBLIC_CALENDLY_EMBED_PRO ?? "",
      calendlyEmbedElite: process.env.NEXT_PUBLIC_CALENDLY_EMBED_ELITE ?? "",
    },
    ghl: {
      apiKey: process.env.GHL_API_KEY ?? "",
      locationId: process.env.GHL_LOCATION_ID ?? "",
      apiBaseUrl:
        process.env.GHL_API_BASE_URL ?? DEFAULT_INTEGRATIONS.ghl.apiBaseUrl,
    },
    youtube: {
      apiKey: process.env.YOUTUBE_API_KEY ?? "",
      channelId: process.env.YOUTUBE_CHANNEL_ID ?? "",
    },
    email: {
      provider:
        process.env.EMAIL_PROVIDER === "mailchimp" ||
        process.env.EMAIL_PROVIDER === "klaviyo" ||
        process.env.EMAIL_PROVIDER === "none"
          ? process.env.EMAIL_PROVIDER
          : "ghl",
      apiKey: process.env.EMAIL_API_KEY ?? "",
      listId: process.env.EMAIL_LIST_ID ?? "",
      serverPrefix: process.env.MAILCHIMP_SERVER_PREFIX ?? "",
    },
    shopify: {
      storeDomain:
        process.env.SHOPIFY_STORE_DOMAIN ??
        DEFAULT_INTEGRATIONS.shopify.storeDomain,
      storefrontToken: process.env.SHOPIFY_STOREFRONT_TOKEN ?? "",
    },
    reviews: {
      provider: process.env.REVIEWS_PROVIDER === "judgeme" ? "judgeme" : "internal",
      judgemeApiToken: process.env.JUDGEME_API_TOKEN ?? "",
      judgemeShopDomain: process.env.JUDGEME_SHOP_DOMAIN ?? "",
    },
  };
}

function mergeConfig(
  base: IntegrationsConfig,
  overlay: Partial<IntegrationsConfig> | null,
): IntegrationsConfig {
  if (!overlay) return base;
  return {
    admin: { ...base.admin, ...overlay.admin },
    pricing: { ...base.pricing, ...overlay.pricing },
    product: { ...base.product, ...overlay.product },
    calendar: { ...base.calendar, ...overlay.calendar },
    ghl: { ...base.ghl, ...overlay.ghl },
    youtube: { ...base.youtube, ...overlay.youtube },
    email: { ...base.email, ...overlay.email },
    shopify: { ...base.shopify, ...overlay.shopify },
    reviews: { ...base.reviews, ...overlay.reviews },
  };
}

/** Environment defaults, then Firestore overrides. */
export async function loadIntegrations(): Promise<IntegrationsConfig> {
  const snapshot = isFirebaseConfigured()
    ? await getFirebaseFirestore().doc(INTEGRATIONS_DOCUMENT).get()
    : null;
  const persisted = snapshot?.exists
    ? (snapshot.data() as Partial<IntegrationsConfig>)
    : null;
  const merged = mergeConfig(fromEnv(), persisted);

  // Migrate stub placeholder to the live Shopify Challenge product.
  if (
    !merged.product.challengeCheckoutUrl ||
    merged.product.challengeCheckoutUrl === "/challenge" ||
    merged.product.challengeCheckoutUrl === "/challenge#checkout"
  ) {
    merged.product.challengeCheckoutUrl =
      DEFAULT_INTEGRATIONS.product.challengeCheckoutUrl;
  }
  if (merged.product.challengeCheckoutEmbedUrl === undefined) {
    merged.product.challengeCheckoutEmbedUrl =
      DEFAULT_INTEGRATIONS.product.challengeCheckoutEmbedUrl;
  }
  if (merged.product.challengeCheckoutOpenInNewTab === undefined) {
    merged.product.challengeCheckoutOpenInNewTab =
      DEFAULT_INTEGRATIONS.product.challengeCheckoutOpenInNewTab;
  }
  merged.youtube = { ...DEFAULT_INTEGRATIONS.youtube, ...merged.youtube };
  merged.email = { ...DEFAULT_INTEGRATIONS.email, ...merged.email };
  merged.shopify = { ...DEFAULT_INTEGRATIONS.shopify, ...merged.shopify };
  merged.reviews = { ...DEFAULT_INTEGRATIONS.reviews, ...merged.reviews };

  return merged;
}

export async function saveIntegrations(
  next: IntegrationsConfig,
): Promise<void> {
  await getFirebaseFirestore().doc(INTEGRATIONS_DOCUMENT).set(next);
}

export async function getStorageMeta(): Promise<{
  fileExists: boolean;
  path: string;
  writable: boolean;
}> {
  return {
    fileExists: isFirebaseConfigured(),
    path: "Firestore: configuration/integrations",
    writable: isFirebaseConfigured(),
  };
}

export function buildChecks(config: IntegrationsConfig): IntegrationCheck[] {
  const platform = config.calendar.platform;
  const proEmbed =
    platform === "ghl"
      ? config.calendar.ghlEmbedPro
      : config.calendar.calendlyEmbedPro;
  const eliteEmbed =
    platform === "ghl"
      ? config.calendar.ghlEmbedElite
      : config.calendar.calendlyEmbedElite;

  const checks: IntegrationCheck[] = [
    {
      id: "admin_credentials",
      group: "security",
      label: "Admin login credentials",
      status:
        process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD
          ? "ready"
          : "missing",
      detail: "Set ADMIN_USERNAME and ADMIN_PASSWORD (login at /admin/login).",
    },
    {
      id: "admin_session_secret",
      group: "security",
      label: "Admin session secret",
      status: process.env.ADMIN_SESSION_SECRET ? "ready" : "optional",
      detail: "Recommended in production: ADMIN_SESSION_SECRET.",
    },
    {
      id: "ghl_api_key",
      group: "crm",
      label: "GoHighLevel API key",
      status: config.ghl.apiKey ? "ready" : "missing",
    },
    {
      id: "ghl_location",
      group: "crm",
      label: "GoHighLevel location ID",
      status: config.ghl.locationId ? "ready" : "missing",
    },
    {
      id: "calendar_platform",
      group: "calendar",
      label: `Calendar platform (${platform})`,
      status: "ready",
    },
    {
      id: "calendar_pro",
      group: "calendar",
      label: "Pro call embed URL (20 min)",
      status: proEmbed ? "ready" : "missing",
    },
    {
      id: "calendar_elite",
      group: "calendar",
      label: "Elite call embed URL (30 min)",
      status: eliteEmbed ? "ready" : "missing",
    },
    {
      id: "price_pro",
      group: "pricing",
      label: "Pro monthly price (Q9 only)",
      status: config.pricing.pro > 0 ? "ready" : "missing",
      detail: `£${config.pricing.pro}`,
    },
    {
      id: "price_elite",
      group: "pricing",
      label: "Elite monthly price (Q9 only)",
      status: config.pricing.elite > 0 ? "ready" : "missing",
      detail: `£${config.pricing.elite}`,
    },
    {
      id: "challenge_checkout",
      group: "product",
      label: "Challenge checkout URL",
      status:
        config.product.challengeCheckoutUrl &&
        !config.product.challengeCheckoutUrl.startsWith("/challenge")
          ? "ready"
          : "missing",
      detail: config.product.challengeCheckoutUrl,
    },
    {
      id: "challenge_checkout_embed",
      group: "product",
      label: "Challenge checkout embed (optional)",
      status: config.product.challengeCheckoutEmbedUrl ? "ready" : "optional",
      detail: config.product.challengeCheckoutEmbedUrl || "Button-only checkout",
    },
    {
      id: "youtube_api",
      group: "media",
      label: "YouTube Data API key",
      status: config.youtube.apiKey ? "ready" : "optional",
      detail: config.youtube.channelId
        ? `Channel ${config.youtube.channelId}`
        : "Optional — used to validate video IDs",
    },
    {
      id: "email_provider",
      group: "email",
      label: `Email signup (${config.email.provider})`,
      status:
        config.email.provider === "none"
          ? "optional"
          : config.email.provider === "ghl"
            ? config.ghl.apiKey
              ? "ready"
              : "missing"
            : config.email.apiKey
              ? "ready"
              : "missing",
    },
    {
      id: "shopify_store",
      group: "product",
      label: "Shopify store domain",
      status: config.shopify.storeDomain ? "ready" : "optional",
      detail: config.shopify.storeDomain,
    },
    {
      id: "reviews_provider",
      group: "reviews",
      label: `Reviews (${config.reviews.provider})`,
      status: "ready",
      detail:
        config.reviews.provider === "internal"
          ? "CMS testimonials popup"
          : config.reviews.judgemeShopDomain || "Judge.me shop domain",
    },
  ];

  return checks;
}

export function isReadyForLive(checks: IntegrationCheck[]): boolean {
  return checks.every((c) => c.status !== "missing");
}

function maskSecret(value: string): string {
  if (!value) return "";
  if (value.includes("••••")) return value;
  return `••••••••${value.slice(-4)}`;
}

/** Mask secrets for API responses. Keep empty string if unset. */
export function maskConfig(config: IntegrationsConfig): IntegrationsConfig {
  return {
    ...config,
    ghl: {
      ...config.ghl,
      apiKey: maskSecret(config.ghl.apiKey),
    },
    youtube: {
      ...config.youtube,
      apiKey: maskSecret(config.youtube.apiKey),
    },
    email: {
      ...config.email,
      apiKey: maskSecret(config.email.apiKey),
    },
    shopify: {
      ...config.shopify,
      storefrontToken: maskSecret(config.shopify.storefrontToken),
    },
    reviews: {
      ...config.reviews,
      judgemeApiToken: maskSecret(config.reviews.judgemeApiToken),
    },
  };
}

export function toEnvSnippet(config: IntegrationsConfig): string {
  return [
    `NEXT_PUBLIC_PRICE_PRO=${config.pricing.pro}`,
    `NEXT_PUBLIC_PRICE_ELITE=${config.pricing.elite}`,
    `NEXT_PUBLIC_SHOW_ENTRY_TIER=${config.product.showEntryTier}`,
    `NEXT_PUBLIC_CHALLENGE_CHECKOUT_URL=${config.product.challengeCheckoutUrl}`,
    `NEXT_PUBLIC_CHALLENGE_CHECKOUT_EMBED_URL=${config.product.challengeCheckoutEmbedUrl}`,
    `NEXT_PUBLIC_CHALLENGE_CHECKOUT_NEW_TAB=${config.product.challengeCheckoutOpenInNewTab}`,
    `NEXT_PUBLIC_CALENDAR_PLATFORM=${config.calendar.platform}`,
    `NEXT_PUBLIC_GHL_CALENDAR_EMBED_PRO=${config.calendar.ghlEmbedPro}`,
    `NEXT_PUBLIC_GHL_CALENDAR_EMBED_ELITE=${config.calendar.ghlEmbedElite}`,
    `NEXT_PUBLIC_CALENDLY_EMBED_PRO=${config.calendar.calendlyEmbedPro}`,
    `NEXT_PUBLIC_CALENDLY_EMBED_ELITE=${config.calendar.calendlyEmbedElite}`,
    `GHL_API_KEY=${config.ghl.apiKey}`,
    `GHL_LOCATION_ID=${config.ghl.locationId}`,
    `GHL_API_BASE_URL=${config.ghl.apiBaseUrl}`,
    `YOUTUBE_API_KEY=${config.youtube.apiKey}`,
    `YOUTUBE_CHANNEL_ID=${config.youtube.channelId}`,
    `EMAIL_PROVIDER=${config.email.provider}`,
    `EMAIL_API_KEY=${config.email.apiKey}`,
    `EMAIL_LIST_ID=${config.email.listId}`,
    `MAILCHIMP_SERVER_PREFIX=${config.email.serverPrefix}`,
    `SHOPIFY_STORE_DOMAIN=${config.shopify.storeDomain}`,
    `SHOPIFY_STOREFRONT_TOKEN=${config.shopify.storefrontToken}`,
    `REVIEWS_PROVIDER=${config.reviews.provider}`,
    `JUDGEME_API_TOKEN=${config.reviews.judgemeApiToken}`,
    `JUDGEME_SHOP_DOMAIN=${config.reviews.judgemeShopDomain}`,
    `ADMIN_USERNAME=`,
    `ADMIN_PASSWORD=`,
    `ADMIN_SESSION_SECRET=`,
  ].join("\n");
}
