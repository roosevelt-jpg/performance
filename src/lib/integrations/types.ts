export type CalendarPlatform = "ghl" | "calendly";

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
    ghlEmbedPro: string;
    ghlEmbedElite: string;
    calendlyEmbedPro: string;
    calendlyEmbedElite: string;
  };
  ghl: {
    apiKey: string;
    locationId: string;
    apiBaseUrl: string;
  };
  youtube: {
    apiKey: string;
    channelId: string;
  };
  email: {
    provider: "none" | "ghl" | "mailchimp" | "klaviyo";
    apiKey: string;
    listId: string;
    serverPrefix: string;
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
  group: "crm" | "calendar" | "pricing" | "product" | "security" | "media" | "email" | "reviews";
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
    ghlEmbedPro: "",
    ghlEmbedElite: "",
    calendlyEmbedPro: "",
    calendlyEmbedElite: "",
  },
  ghl: {
    apiKey: "",
    locationId: "",
    apiBaseUrl: "https://services.leadconnectorhq.com",
  },
  youtube: {
    apiKey: "",
    channelId: "",
  },
  email: {
    provider: "ghl",
    apiKey: "",
    listId: "",
    serverPrefix: "",
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
  };
  checks: IntegrationCheck[];
  readyForLive: boolean;
  storage: {
    fileExists: boolean;
    path: string;
    writable: boolean;
  };
};
