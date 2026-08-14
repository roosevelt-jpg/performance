import { EVENT_TYPES } from "@/lib/config/calendar";
import type { CalendarPlatform } from "@/lib/integrations/types";
import type { CalendarAdapter, CalendarEmbedRequest, CalendarEmbedResult } from "./types";

export type CalendarRuntimeConfig = {
  platform: CalendarPlatform;
  embedPro: string;
  embedElite: string;
};

function embedForTier(
  config: CalendarRuntimeConfig,
  tier: "pro" | "elite",
): string {
  return tier === "pro" ? config.embedPro : config.embedElite;
}

function buildAdapter(config: CalendarRuntimeConfig): CalendarAdapter {
  return {
    getEmbed(request: CalendarEmbedRequest): CalendarEmbedResult {
      const event = EVENT_TYPES[request.tier];
      return {
        platform: config.platform,
        eventTypeLabel: event.label,
        durationMinutes: event.durationMinutes,
        embedUrl: embedForTier(config, request.tier),
        queryParams: {
          name: request.prefill?.name ?? request.answers.name,
          email: request.prefill?.email ?? request.answers.email,
          ...(config.platform === "ghl"
            ? {
                phone: request.prefill?.phone ?? request.answers.mobile,
              }
            : {}),
        },
      };
    },
  };
}

/** Prefer runtime config from integrations; fall back to env-based defaults. */
export function resolveCalendarEmbed(
  request: CalendarEmbedRequest,
  runtime?: CalendarRuntimeConfig,
): CalendarEmbedResult {
  const config: CalendarRuntimeConfig = runtime ?? {
    platform:
      process.env.NEXT_PUBLIC_CALENDAR_PLATFORM === "calendly"
        ? "calendly"
        : "ghl",
    embedPro:
      process.env.NEXT_PUBLIC_CALENDAR_PLATFORM === "calendly"
        ? (process.env.NEXT_PUBLIC_CALENDLY_EMBED_PRO ?? "")
        : (process.env.NEXT_PUBLIC_GHL_CALENDAR_EMBED_PRO ?? ""),
    embedElite:
      process.env.NEXT_PUBLIC_CALENDAR_PLATFORM === "calendly"
        ? (process.env.NEXT_PUBLIC_CALENDLY_EMBED_ELITE ?? "")
        : (process.env.NEXT_PUBLIC_GHL_CALENDAR_EMBED_ELITE ?? ""),
  };

  return buildAdapter(config).getEmbed(request);
}
