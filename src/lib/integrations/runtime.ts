import { loadIntegrations } from "./store";
import type { CalendarPlatform, IntegrationsConfig } from "./types";

/** Non-secret values safe to expose to the browser. */
export type PublicRuntimeConfig = {
  pricing: IntegrationsConfig["pricing"];
  product: IntegrationsConfig["product"];
  calendar: {
    platform: CalendarPlatform;
    embedPro: string;
    embedElite: string;
  };
  emailSignup: {
    enabled: boolean;
    provider: IntegrationsConfig["email"]["provider"];
  };
};

export async function getPublicRuntimeConfig(): Promise<PublicRuntimeConfig> {
  const config = await loadIntegrations();
  const embedPro =
    config.calendar.platform === "ghl"
      ? config.calendar.ghlEmbedPro
      : config.calendar.calendlyEmbedPro;
  const embedElite =
    config.calendar.platform === "ghl"
      ? config.calendar.ghlEmbedElite
      : config.calendar.calendlyEmbedElite;

  const emailEnabled =
    config.email.provider === "ghl"
      ? Boolean(config.ghl.apiKey)
      : config.email.provider !== "none" && Boolean(config.email.apiKey);

  return {
    pricing: config.pricing,
    product: config.product,
    calendar: {
      platform: config.calendar.platform,
      embedPro,
      embedElite,
    },
    emailSignup: {
      enabled: emailEnabled,
      provider: config.email.provider,
    },
  };
}
