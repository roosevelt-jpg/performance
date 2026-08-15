import type { BookableTier } from "@/lib/config/pricing";
import type { IntegrationsConfig } from "@/lib/integrations/types";

export function nativeCalendarReadyForTier(
  config: IntegrationsConfig,
  tier: BookableTier,
): boolean {
  const cal = config.calendar;
  if (cal.platform === "google") {
    return Boolean(
      cal.googleRefreshToken.trim() || cal.googleServiceAccountJson.trim(),
    );
  }
  if (cal.platform === "calendly") {
    const event =
      tier === "pro" ? cal.calendlyEventTypePro : cal.calendlyEventTypeElite;
    return Boolean(cal.calendlyApiToken.trim() && event.trim());
  }
  const calendarId =
    tier === "pro" ? cal.ghlCalendarIdPro : cal.ghlCalendarIdElite;
  return Boolean(
    config.ghl.apiKey.trim() &&
      config.ghl.locationId.trim() &&
      calendarId.trim(),
  );
}

export function nativeCalendarReady(config: IntegrationsConfig): boolean {
  return (
    nativeCalendarReadyForTier(config, "pro") ||
    nativeCalendarReadyForTier(config, "elite")
  );
}

export function embedUrlForTier(
  config: IntegrationsConfig,
  tier: BookableTier,
): string {
  const cal = config.calendar;
  if (cal.platform === "calendly") {
    return tier === "pro" ? cal.calendlyEmbedPro : cal.calendlyEmbedElite;
  }
  if (cal.platform === "google") {
    return "";
  }
  return tier === "pro" ? cal.ghlEmbedPro : cal.ghlEmbedElite;
}

export function shouldUseNativeBooking(
  config: IntegrationsConfig,
  tier: BookableTier,
): boolean {
  const mode = config.calendar.bookingMode;
  const native = nativeCalendarReadyForTier(config, tier);
  if (mode === "native") return native;
  if (mode === "embed") return false;
  return native;
}
