import { promises as fs } from "fs";
import path from "path";
import {
  embedUrlForTier,
  nativeCalendarReadyForTier,
} from "@/lib/calendar/nativeReady";
import {
  DEFAULT_INTEGRATIONS,
  type CalendarBookingMode,
  type CalendarPlatform,
  type IntegrationCheck,
  type IntegrationsConfig,
} from "./types";
import { isValidTimeZone } from "@/lib/i18n/timezones";
import { normalizeStoreDomain } from "@/lib/shopify/domain";

export const INTEGRATIONS_FILE = path.join(
  process.cwd(),
  "data",
  "integrations.local.json",
);

function num(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function intOr(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function parsePlatform(value: string | undefined): CalendarPlatform {
  if (value === "calendly" || value === "google" || value === "ghl") {
    return value;
  }
  return DEFAULT_INTEGRATIONS.calendar.platform;
}

function parseBookingMode(value: string | undefined): CalendarBookingMode {
  if (value === "native" || value === "embed" || value === "auto") {
    return value;
  }
  return DEFAULT_INTEGRATIONS.calendar.bookingMode;
}

function parseWorkingDays(value: string | undefined, fallback: number[]): number[] {
  if (!value) return fallback;
  const days = value
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((n) => Number.isInteger(n) && n >= 1 && n <= 7);
  return days.length ? days : fallback;
}

function calendarDefaults(
  overlay?: Partial<IntegrationsConfig["calendar"]> | null,
): IntegrationsConfig["calendar"] {
  const base = DEFAULT_INTEGRATIONS.calendar;
  const merged = { ...base, ...overlay };
  merged.workingDays =
    Array.isArray(merged.workingDays) && merged.workingDays.length
      ? merged.workingDays.filter((n) => n >= 1 && n <= 7)
      : base.workingDays;
  merged.platform = parsePlatform(merged.platform);
  merged.bookingMode = parseBookingMode(merged.bookingMode);
  merged.timezone = isValidTimeZone(merged.timezone)
    ? merged.timezone.trim()
    : base.timezone;
  merged.workingHoursStart =
    merged.workingHoursStart?.trim() || base.workingHoursStart;
  merged.workingHoursEnd =
    merged.workingHoursEnd?.trim() || base.workingHoursEnd;
  merged.bufferMinutes = Number.isFinite(merged.bufferMinutes)
    ? merged.bufferMinutes
    : base.bufferMinutes;
  merged.minNoticeHours = Number.isFinite(merged.minNoticeHours)
    ? merged.minNoticeHours
    : base.minNoticeHours;
  merged.daysAhead = Number.isFinite(merged.daysAhead)
    ? merged.daysAhead
    : base.daysAhead;
  merged.googleCalendarId =
    merged.googleCalendarId?.trim() || base.googleCalendarId;
  return merged;
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
    calendar: calendarDefaults({
      platform: parsePlatform(process.env.NEXT_PUBLIC_CALENDAR_PLATFORM),
      bookingMode: parseBookingMode(process.env.CALENDAR_BOOKING_MODE),
      timezone: process.env.CALENDAR_TIMEZONE,
      workingHoursStart: process.env.CALENDAR_HOURS_START,
      workingHoursEnd: process.env.CALENDAR_HOURS_END,
      workingDays: parseWorkingDays(
        process.env.CALENDAR_WORKING_DAYS,
        DEFAULT_INTEGRATIONS.calendar.workingDays,
      ),
      bufferMinutes: intOr(
        process.env.CALENDAR_BUFFER_MINUTES,
        DEFAULT_INTEGRATIONS.calendar.bufferMinutes,
      ),
      minNoticeHours: intOr(
        process.env.CALENDAR_MIN_NOTICE_HOURS,
        DEFAULT_INTEGRATIONS.calendar.minNoticeHours,
      ),
      daysAhead: intOr(
        process.env.CALENDAR_DAYS_AHEAD,
        DEFAULT_INTEGRATIONS.calendar.daysAhead,
      ),
      ghlEmbedPro: process.env.NEXT_PUBLIC_GHL_CALENDAR_EMBED_PRO ?? "",
      ghlEmbedElite: process.env.NEXT_PUBLIC_GHL_CALENDAR_EMBED_ELITE ?? "",
      ghlCalendarIdPro: process.env.GHL_CALENDAR_ID_PRO ?? "",
      ghlCalendarIdElite: process.env.GHL_CALENDAR_ID_ELITE ?? "",
      calendlyEmbedPro: process.env.NEXT_PUBLIC_CALENDLY_EMBED_PRO ?? "",
      calendlyEmbedElite: process.env.NEXT_PUBLIC_CALENDLY_EMBED_ELITE ?? "",
      calendlyApiToken: process.env.CALENDLY_API_TOKEN ?? "",
      calendlyEventTypePro: process.env.CALENDLY_EVENT_TYPE_PRO ?? "",
      calendlyEventTypeElite: process.env.CALENDLY_EVENT_TYPE_ELITE ?? "",
      calendlyLocationKind: process.env.CALENDLY_LOCATION_KIND ?? "",
      googleCalendarId: process.env.GOOGLE_CALENDAR_ID ?? "primary",
      googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
      googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      googleRefreshToken: process.env.GOOGLE_REFRESH_TOKEN ?? "",
      googleServiceAccountJson: process.env.GOOGLE_SERVICE_ACCOUNT_JSON ?? "",
    }),
    ghl: {
      apiKey: process.env.GHL_API_KEY ?? "",
      locationId: process.env.GHL_LOCATION_ID ?? "",
      apiBaseUrl:
        process.env.GHL_API_BASE_URL ?? DEFAULT_INTEGRATIONS.ghl.apiBaseUrl,
      workflowQualifiedId: process.env.GHL_WORKFLOW_QUALIFIED_ID ?? "",
      workflowDisqualifiedId: process.env.GHL_WORKFLOW_DISQUALIFIED_ID ?? "",
    },
    youtube: {
      apiKey: process.env.YOUTUBE_API_KEY ?? "",
      channelId: process.env.YOUTUBE_CHANNEL_ID ?? "",
    },
    seo: {
      ga4Id: process.env.GOOGLE_GA4_ID ?? "",
      gtmId: process.env.GOOGLE_GTM_ID ?? "",
      googleAdsId: process.env.GOOGLE_ADS_ID ?? "",
      searchConsoleVerification:
        process.env.GOOGLE_SITE_VERIFICATION ?? "",
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
      fromEmail: process.env.EMAIL_FROM ?? process.env.GMAIL_USER ?? "",
      fromName:
        process.env.EMAIL_FROM_NAME ??
        DEFAULT_INTEGRATIONS.email.fromName,
      gmailAppPassword: process.env.GMAIL_APP_PASSWORD ?? "",
    },
    stripe: {
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
      secretKey: process.env.STRIPE_SECRET_KEY ?? "",
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
      challengePriceId: process.env.STRIPE_CHALLENGE_PRICE_ID ?? "",
    },
    whatsapp: {
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID ?? "",
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN ?? "",
      graphVersion: process.env.WHATSAPP_GRAPH_VERSION ?? "v21.0",
      templateName: process.env.WHATSAPP_TEMPLATE_NAME ?? "",
      templateLanguage: process.env.WHATSAPP_TEMPLATE_LANGUAGE ?? "en",
    },
    ai: {
      openaiApiKey: process.env.OPENAI_API_KEY ?? "",
      model: process.env.OPENAI_DNA_MODEL ?? "gpt-4o-mini",
    },
    shopify: {
      storeDomain:
        normalizeStoreDomain(
          process.env.SHOPIFY_STORE_DOMAIN ??
            DEFAULT_INTEGRATIONS.shopify.storeDomain,
        ) || DEFAULT_INTEGRATIONS.shopify.storeDomain,
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
    calendar: calendarDefaults({ ...base.calendar, ...overlay.calendar }),
    ghl: {
      ...base.ghl,
      ...overlay.ghl,
      workflowQualifiedId:
        overlay.ghl?.workflowQualifiedId ?? base.ghl.workflowQualifiedId,
      workflowDisqualifiedId:
        overlay.ghl?.workflowDisqualifiedId ?? base.ghl.workflowDisqualifiedId,
    },
    youtube: { ...base.youtube, ...overlay.youtube },
    seo: { ...base.seo, ...overlay.seo },
    email: {
      ...base.email,
      ...overlay.email,
    },
    stripe: { ...base.stripe, ...overlay.stripe },
    whatsapp: { ...base.whatsapp, ...overlay.whatsapp },
    ai: { ...base.ai, ...overlay.ai },
    shopify: {
      ...base.shopify,
      ...overlay.shopify,
      storeDomain:
        normalizeStoreDomain(
          overlay.shopify?.storeDomain ?? base.shopify.storeDomain,
        ) || DEFAULT_INTEGRATIONS.shopify.storeDomain,
    },
    reviews: { ...base.reviews, ...overlay.reviews },
  };
}

async function readFileConfig(): Promise<Partial<IntegrationsConfig> | null> {
  try {
    const raw = await fs.readFile(INTEGRATIONS_FILE, "utf8");
    return JSON.parse(raw) as Partial<IntegrationsConfig>;
  } catch {
    return null;
  }
}

/** Env defaults, then local file overrides (UI saves here). */
export async function loadIntegrations(): Promise<IntegrationsConfig> {
  const file = await readFileConfig();
  const merged = mergeConfig(fromEnv(), file);

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
  merged.stripe = { ...DEFAULT_INTEGRATIONS.stripe, ...merged.stripe };
  merged.whatsapp = { ...DEFAULT_INTEGRATIONS.whatsapp, ...merged.whatsapp };
  merged.ai = { ...DEFAULT_INTEGRATIONS.ai, ...merged.ai };
  merged.shopify = {
    ...DEFAULT_INTEGRATIONS.shopify,
    ...merged.shopify,
    storeDomain:
      normalizeStoreDomain(merged.shopify.storeDomain) ||
      DEFAULT_INTEGRATIONS.shopify.storeDomain,
  };
  merged.reviews = { ...DEFAULT_INTEGRATIONS.reviews, ...merged.reviews };
  merged.calendar = calendarDefaults(merged.calendar);

  return merged;
}

export async function saveIntegrations(
  next: IntegrationsConfig,
): Promise<void> {
  await fs.mkdir(path.dirname(INTEGRATIONS_FILE), { recursive: true });
  await fs.writeFile(
    INTEGRATIONS_FILE,
    `${JSON.stringify(next, null, 2)}\n`,
    "utf8",
  );
}

export async function getStorageMeta(): Promise<{
  fileExists: boolean;
  path: string;
  writable: boolean;
}> {
  let fileExists = false;
  try {
    await fs.access(INTEGRATIONS_FILE);
    fileExists = true;
  } catch {
    fileExists = false;
  }

  let writable = true;
  try {
    await fs.mkdir(path.dirname(INTEGRATIONS_FILE), { recursive: true });
    const probe = path.join(path.dirname(INTEGRATIONS_FILE), ".write-probe");
    await fs.writeFile(probe, "ok");
    await fs.unlink(probe);
  } catch {
    writable = false;
  }

  return {
    fileExists,
    path: "data/integrations.local.json",
    writable,
  };
}

function calendarTierCheck(
  config: IntegrationsConfig,
  tier: "pro" | "elite",
): { status: IntegrationCheck["status"]; detail: string } {
  const native = nativeCalendarReadyForTier(config, tier);
  const embed = embedUrlForTier(config, tier).trim();
  const mode = config.calendar.bookingMode;
  if (mode === "native") {
    return native
      ? { status: "ready", detail: "Native API connected" }
      : {
          status: "missing",
          detail: "Add Google Calendar, Calendly, or GHL calendar API",
        };
  }
  if (mode === "embed") {
    return embed
      ? { status: "ready", detail: "Embed URL" }
      : { status: "missing", detail: "Add embed URL" };
  }
  if (native) return { status: "ready", detail: "Native API" };
  if (embed) return { status: "ready", detail: "Embed fallback" };
  return { status: "missing", detail: "Add API keys or an embed URL" };
}

export function listSecretsSet(config: IntegrationsConfig) {
  return {
    ghlApiKey: Boolean(config.ghl.apiKey),
    youtubeApiKey: Boolean(config.youtube.apiKey),
    emailApiKey: Boolean(config.email.apiKey),
    shopifyToken: Boolean(config.shopify.storefrontToken),
    judgemeToken: Boolean(config.reviews.judgemeApiToken),
    calendlyApiToken: Boolean(config.calendar.calendlyApiToken),
    googleClientSecret: Boolean(config.calendar.googleClientSecret),
    googleRefreshToken: Boolean(config.calendar.googleRefreshToken),
    googleServiceAccount: Boolean(config.calendar.googleServiceAccountJson),
    stripeSecretKey: Boolean(config.stripe?.secretKey),
    stripeWebhookSecret: Boolean(config.stripe?.webhookSecret),
    whatsappAccessToken: Boolean(config.whatsapp?.accessToken),
    gmailAppPassword: Boolean(config.email?.gmailAppPassword),
    openaiApiKey: Boolean(config.ai?.openaiApiKey),
  };
}

export function buildChecks(config: IntegrationsConfig): IntegrationCheck[] {
  const platform = config.calendar.platform;
  const proCal = calendarTierCheck(config, "pro");
  const eliteCal = calendarTierCheck(config, "elite");

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
      label: "Pro call (20 min)",
      status: proCal.status,
      detail: proCal.detail,
    },
    {
      id: "calendar_elite",
      group: "calendar",
      label: "Elite call (30 min)",
      status: eliteCal.status,
      detail: eliteCal.detail,
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
      label: "Challenge checkout",
      status:
        (config.stripe?.secretKey && config.stripe?.challengePriceId) ||
        (config.product.challengeCheckoutUrl &&
          !config.product.challengeCheckoutUrl.startsWith("/challenge"))
          ? "ready"
          : "missing",
      detail:
        config.stripe?.challengePriceId
          ? "Stripe Price ID"
          : config.product.challengeCheckoutUrl,
    },
    {
      id: "challenge_checkout_embed",
      group: "product",
      label: "Challenge checkout embed (optional)",
      status: config.product.challengeCheckoutEmbedUrl ? "ready" : "optional",
      detail: config.product.challengeCheckoutEmbedUrl || "Button-only checkout",
    },
    {
      id: "stripe",
      group: "payments",
      label: "Stripe Challenge checkout",
      status:
        config.stripe?.secretKey && config.stripe?.challengePriceId
          ? "ready"
          : "optional",
      detail: config.stripe?.challengePriceId
        ? "Price ID set — Challenge pays through Stripe"
        : "Add secret key + Challenge Price ID to take card payments here",
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
      id: "google_search_console",
      group: "seo",
      label: "Google Search Console verification",
      status: config.seo?.searchConsoleVerification ? "ready" : "optional",
      detail: "Paste the content= value from Google's meta tag",
    },
    {
      id: "google_analytics",
      group: "seo",
      label: "Google Analytics 4 or Tag Manager",
      status:
        config.seo?.gtmId || config.seo?.ga4Id ? "ready" : "optional",
      detail: config.seo?.gtmId || config.seo?.ga4Id || "Not set",
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
      id: "gmail_smtp",
      group: "email",
      label: "Gmail SMTP (DNA reports)",
      status:
        config.email.fromEmail && config.email.gmailAppPassword
          ? "ready"
          : "optional",
      detail: config.email.fromEmail
        ? config.email.gmailAppPassword
          ? config.email.fromEmail
          : "Address set — add a Google App Password"
        : "Needed to email the Performance DNA PDF",
    },
    {
      id: "whatsapp_cloud",
      group: "messaging",
      label: "WhatsApp Cloud API (DNA reports)",
      status:
        config.whatsapp?.phoneNumberId && config.whatsapp?.accessToken
          ? "ready"
          : "optional",
      detail: config.whatsapp?.templateName
        ? `Template ${config.whatsapp.templateName}`
        : config.whatsapp?.phoneNumberId
          ? "Connected — add a utility template for first-contact sends"
          : "Phone number ID + access token from Meta for Developers",
    },
    {
      id: "openai_dna_copy",
      group: "ai",
      label: "OpenAI (DNA report copy only)",
      status: config.ai?.openaiApiKey ? "ready" : "optional",
      detail: config.ai?.openaiApiKey
        ? `Model ${config.ai.model || "gpt-4o-mini"} — scores stay native`
        : "Leave empty to keep native Kane copy. Never used for the score.",
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
      gmailAppPassword: maskSecret(config.email.gmailAppPassword ?? ""),
    },
    stripe: {
      ...config.stripe,
      secretKey: maskSecret(config.stripe?.secretKey ?? ""),
      webhookSecret: maskSecret(config.stripe?.webhookSecret ?? ""),
    },
    whatsapp: {
      ...DEFAULT_INTEGRATIONS.whatsapp,
      ...config.whatsapp,
      accessToken: maskSecret(config.whatsapp?.accessToken ?? ""),
    },
    ai: {
      ...DEFAULT_INTEGRATIONS.ai,
      ...config.ai,
      openaiApiKey: maskSecret(config.ai?.openaiApiKey ?? ""),
    },
    shopify: {
      ...config.shopify,
      storefrontToken: maskSecret(config.shopify.storefrontToken),
    },
    reviews: {
      ...config.reviews,
      judgemeApiToken: maskSecret(config.reviews.judgemeApiToken),
    },
    calendar: {
      ...config.calendar,
      calendlyApiToken: maskSecret(config.calendar.calendlyApiToken),
      googleClientSecret: maskSecret(config.calendar.googleClientSecret),
      googleRefreshToken: maskSecret(config.calendar.googleRefreshToken),
      googleServiceAccountJson: config.calendar.googleServiceAccountJson
        ? "••••••••json"
        : "",
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
    `CALENDAR_BOOKING_MODE=${config.calendar.bookingMode}`,
    `CALENDAR_TIMEZONE=${config.calendar.timezone}`,
    `CALENDAR_HOURS_START=${config.calendar.workingHoursStart}`,
    `CALENDAR_HOURS_END=${config.calendar.workingHoursEnd}`,
    `CALENDAR_WORKING_DAYS=${config.calendar.workingDays.join(",")}`,
    `CALENDAR_BUFFER_MINUTES=${config.calendar.bufferMinutes}`,
    `CALENDAR_MIN_NOTICE_HOURS=${config.calendar.minNoticeHours}`,
    `CALENDAR_DAYS_AHEAD=${config.calendar.daysAhead}`,
    `NEXT_PUBLIC_GHL_CALENDAR_EMBED_PRO=${config.calendar.ghlEmbedPro}`,
    `NEXT_PUBLIC_GHL_CALENDAR_EMBED_ELITE=${config.calendar.ghlEmbedElite}`,
    `GHL_CALENDAR_ID_PRO=${config.calendar.ghlCalendarIdPro}`,
    `GHL_CALENDAR_ID_ELITE=${config.calendar.ghlCalendarIdElite}`,
    `NEXT_PUBLIC_CALENDLY_EMBED_PRO=${config.calendar.calendlyEmbedPro}`,
    `NEXT_PUBLIC_CALENDLY_EMBED_ELITE=${config.calendar.calendlyEmbedElite}`,
    `CALENDLY_API_TOKEN=${config.calendar.calendlyApiToken}`,
    `CALENDLY_EVENT_TYPE_PRO=${config.calendar.calendlyEventTypePro}`,
    `CALENDLY_EVENT_TYPE_ELITE=${config.calendar.calendlyEventTypeElite}`,
    `CALENDLY_LOCATION_KIND=${config.calendar.calendlyLocationKind}`,
    `GOOGLE_CALENDAR_ID=${config.calendar.googleCalendarId}`,
    `GOOGLE_CLIENT_ID=${config.calendar.googleClientId}`,
    `GOOGLE_CLIENT_SECRET=${config.calendar.googleClientSecret}`,
    `GOOGLE_REFRESH_TOKEN=${config.calendar.googleRefreshToken}`,
    `GOOGLE_SERVICE_ACCOUNT_JSON=${config.calendar.googleServiceAccountJson}`,
    `GHL_API_KEY=${config.ghl.apiKey}`,
    `GHL_LOCATION_ID=${config.ghl.locationId}`,
    `GHL_API_BASE_URL=${config.ghl.apiBaseUrl}`,
    `GHL_WORKFLOW_QUALIFIED_ID=${config.ghl.workflowQualifiedId}`,
    `GHL_WORKFLOW_DISQUALIFIED_ID=${config.ghl.workflowDisqualifiedId}`,
    `YOUTUBE_API_KEY=${config.youtube.apiKey}`,
    `YOUTUBE_CHANNEL_ID=${config.youtube.channelId}`,
    `GOOGLE_GA4_ID=${config.seo?.ga4Id ?? ""}`,
    `GOOGLE_GTM_ID=${config.seo?.gtmId ?? ""}`,
    `GOOGLE_ADS_ID=${config.seo?.googleAdsId ?? ""}`,
    `GOOGLE_SITE_VERIFICATION=${config.seo?.searchConsoleVerification ?? ""}`,
    `EMAIL_PROVIDER=${config.email.provider}`,
    `EMAIL_API_KEY=${config.email.apiKey}`,
    `EMAIL_LIST_ID=${config.email.listId}`,
    `MAILCHIMP_SERVER_PREFIX=${config.email.serverPrefix}`,
    `GMAIL_USER=${config.email.fromEmail}`,
    `GMAIL_APP_PASSWORD=${config.email.gmailAppPassword}`,
    `EMAIL_FROM=${config.email.fromEmail}`,
    `EMAIL_FROM_NAME=${config.email.fromName}`,
    `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${config.stripe.publishableKey}`,
    `STRIPE_SECRET_KEY=${config.stripe.secretKey}`,
    `STRIPE_WEBHOOK_SECRET=${config.stripe.webhookSecret}`,
    `STRIPE_CHALLENGE_PRICE_ID=${config.stripe.challengePriceId}`,
    `WHATSAPP_PHONE_NUMBER_ID=${config.whatsapp?.phoneNumberId ?? ""}`,
    `WHATSAPP_ACCESS_TOKEN=${config.whatsapp?.accessToken ?? ""}`,
    `WHATSAPP_GRAPH_VERSION=${config.whatsapp?.graphVersion ?? "v21.0"}`,
    `WHATSAPP_TEMPLATE_NAME=${config.whatsapp?.templateName ?? ""}`,
    `WHATSAPP_TEMPLATE_LANGUAGE=${config.whatsapp?.templateLanguage ?? "en"}`,
    `OPENAI_API_KEY=${config.ai?.openaiApiKey ?? ""}`,
    `OPENAI_DNA_MODEL=${config.ai?.model ?? "gpt-4o-mini"}`,
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
