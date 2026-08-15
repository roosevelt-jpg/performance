import { loadIntegrations } from "./store";
import {
  embedUrlForTier,
  shouldUseNativeBooking,
} from "@/lib/calendar/nativeReady";
import type {
  CalendarBookingMode,
  CalendarPlatform,
  IntegrationsConfig,
} from "./types";

/** Non-secret values safe to expose to the browser. */
export type PublicRuntimeConfig = {
  pricing: IntegrationsConfig["pricing"];
  product: IntegrationsConfig["product"];
  calendar: {
    platform: CalendarPlatform;
    bookingMode: CalendarBookingMode;
    nativeBooking: boolean;
    nativeBookingPro: boolean;
    nativeBookingElite: boolean;
    timezone: string;
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
  const nativePro = shouldUseNativeBooking(config, "pro");
  const nativeElite = shouldUseNativeBooking(config, "elite");
  const nativeBooking = nativePro || nativeElite;

  const emailEnabled =
    config.email.provider === "ghl"
      ? Boolean(config.ghl.apiKey)
      : config.email.provider !== "none" && Boolean(config.email.apiKey);

  return {
    pricing: config.pricing,
    product: config.product,
    calendar: {
      platform: config.calendar.platform,
      bookingMode: config.calendar.bookingMode,
      nativeBooking,
      nativeBookingPro: nativePro,
      nativeBookingElite: nativeElite,
      timezone: config.calendar.timezone,
      embedPro: embedUrlForTier(config, "pro"),
      embedElite: embedUrlForTier(config, "elite"),
    },
    emailSignup: {
      enabled: emailEnabled,
      provider: config.email.provider,
    },
  };
}
