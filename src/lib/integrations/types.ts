export type CalendarPlatform = "ghl" | "calendly" | "google";

export type CalendarBookingMode = "auto" | "native" | "embed";

/**
 * All go-live integrations in one schema.
 * Secrets are never returned unmasked to the client after save (except on first entry).
 */
export type IntegrationsConfig = {
  admin: {
    /** Optional note shown on the integrations page */
    notes: string;
  };
  pricing: {
    pro: number;
    elite: number;
  };
  product: {
    showEntryTier: boolean;
    /** Live self-serve Challenge checkout (Shopify product, payment link, etc.) */
    challengeCheckoutUrl: string;
    /** Optional iframe embed (GHL order form / payment widget). Empty = button only. */
    challengeCheckoutEmbedUrl: string;
    /** Open checkout URL in a new tab (recommended for Shopify). */
    challengeCheckoutOpenInNewTab: boolean;
  };
  calendar: {
    platform: CalendarPlatform;
    /** auto = native calendar when an API is connected, otherwise iframe embed. */
    bookingMode: CalendarBookingMode;
    timezone: string;
    workingHoursStart: string;
    workingHoursEnd: string;
    /** ISO weekday 1–7 (Mon–Sun). */
    workingDays: number[];
    bufferMinutes: number;
    minNoticeHours: number;
    daysAhead: number;
    ghlEmbedPro: string;
    ghlEmbedElite: string;
    ghlCalendarIdPro: string;
    ghlCalendarIdElite: string;
    calendlyEmbedPro: string;
    calendlyEmbedElite: string;
    calendlyApiToken: string;
    calendlyEventTypePro: string;
    calendlyEventTypeElite: string;
    calendlyLocationKind: string;
    googleCalendarId: string;
    googleClientId: string;
    googleClientSecret: string;
    googleRefreshToken: string;
    googleServiceAccountJson: string;
  };
  ghl: {
    apiKey: string;
    locationId: string;
    apiBaseUrl: string;
    /** Optional GHL workflow IDs — triggered after apply via the Contacts API. */
    workflowQualifiedId: string;
    workflowDisqualifiedId: string;
  };
  youtube: {
    apiKey: string;
    channelId: string;
  };
  seo: {
    ga4Id: string;
    gtmId: string;
    googleAdsId: string;
    searchConsoleVerification: string;
  };
  email: {
    provider: "none" | "ghl" | "mailchimp" | "klaviyo";
    apiKey: string;
    listId: string;
    serverPrefix: string;
    /** Gmail / Google Workspace address used as SMTP login and From. */
    fromEmail: string;
    fromName: string;
    /** Google App Password (not the Gmail login). Spaces are stripped. */
    gmailAppPassword: string;
  };
  stripe: {
    publishableKey: string;
    secretKey: string;
    webhookSecret: string;
    challengePriceId: string;
  };
  whatsapp: {
    phoneNumberId: string;
    accessToken: string;
    graphVersion: string;
    templateName: string;
    templateLanguage: string;
  };
  ai: {
    openaiApiKey: string;
    model: string;
  };
  shopify: {
    storeDomain: string;
    storefrontToken: string;
  };
  reviews: {
    provider: "internal" | "judgeme";
    judgemeApiToken: string;
    judgemeShopDomain: string;
  };
};

export type IntegrationFieldStatus = "ready" | "missing" | "optional";

export type IntegrationCheck = {
  id: string;
  group:
    | "crm"
    | "calendar"
    | "pricing"
    | "product"
    | "security"
    | "media"
    | "email"
    | "reviews"
    | "seo"
    | "payments"
    | "messaging"
    | "ai";
  label: string;
  status: IntegrationFieldStatus;
  detail?: string;
};

export const DEFAULT_INTEGRATIONS: IntegrationsConfig = {
  admin: { notes: "" },
  pricing: {
    pro: 297,
    elite: 497,
  },
  product: {
    showEntryTier: false,
    challengeCheckoutUrl:
      "https://theformulaperformance.com/products/the-formula-8-week-training-plan",
    challengeCheckoutEmbedUrl: "",
    challengeCheckoutOpenInNewTab: true,
  },
  calendar: {
    platform: "ghl",
    bookingMode: "auto",
    timezone: "Europe/London",
    workingHoursStart: "09:00",
    workingHoursEnd: "17:00",
    workingDays: [1, 2, 3, 4, 5],
    bufferMinutes: 10,
    minNoticeHours: 4,
    daysAhead: 21,
    ghlEmbedPro: "",
    ghlEmbedElite: "",
    ghlCalendarIdPro: "",
    ghlCalendarIdElite: "",
    calendlyEmbedPro: "",
    calendlyEmbedElite: "",
    calendlyApiToken: "",
    calendlyEventTypePro: "",
    calendlyEventTypeElite: "",
    calendlyLocationKind: "",
    googleCalendarId: "primary",
    googleClientId: "",
    googleClientSecret: "",
    googleRefreshToken: "",
    googleServiceAccountJson: "",
  },
  ghl: {
    apiKey: "",
    locationId: "",
    apiBaseUrl: "https://services.leadconnectorhq.com",
    workflowQualifiedId: "",
    workflowDisqualifiedId: "",
  },
  youtube: {
    apiKey: "",
    channelId: "",
  },
  seo: {
    ga4Id: "",
    gtmId: "",
    googleAdsId: "",
    searchConsoleVerification: "",
  },
  email: {
    provider: "ghl",
    apiKey: "",
    listId: "",
    serverPrefix: "",
    fromEmail: "",
    fromName: "The Formula Performance",
    gmailAppPassword: "",
  },
  stripe: {
    publishableKey: "",
    secretKey: "",
    webhookSecret: "",
    challengePriceId: "",
  },
  whatsapp: {
    phoneNumberId: "",
    accessToken: "",
    graphVersion: "v21.0",
    templateName: "",
    templateLanguage: "en",
  },
  ai: {
    openaiApiKey: "",
    model: "gpt-4o-mini",
  },
  shopify: {
    storeDomain: "theformulaperformance.com",
    storefrontToken: "",
  },
  reviews: {
    provider: "internal",
    judgemeApiToken: "",
    judgemeShopDomain: "",
  },
};

export type PublicIntegrationsView = {
  config: IntegrationsConfig;
  /** Which secret fields are set (true) without revealing values */
  secretsSet: {
    ghlApiKey: boolean;
    adminCredentials: boolean;
    youtubeApiKey: boolean;
    emailApiKey: boolean;
    shopifyToken: boolean;
    judgemeToken: boolean;
    calendlyApiToken: boolean;
    googleClientSecret: boolean;
    googleRefreshToken: boolean;
    googleServiceAccount: boolean;
    stripeSecretKey: boolean;
    stripeWebhookSecret: boolean;
    whatsappAccessToken: boolean;
    gmailAppPassword: boolean;
    openaiApiKey: boolean;
  };
  checks: IntegrationCheck[];
  readyForLive: boolean;
  storage: {
    fileExists: boolean;
    path: string;
    writable: boolean;
  };
};
