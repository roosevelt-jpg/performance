import { EVENT_TYPES } from "@/lib/config/calendar";
import type { BookableTier } from "@/lib/config/pricing";
import type { IntegrationsConfig } from "@/lib/integrations/types";
import type { TimeSlot } from "../slots";

function eventTypeUri(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http")) return trimmed;
  return `https://api.calendly.com/event_types/${trimmed}`;
}

function eventTypeForTier(
  config: IntegrationsConfig,
  tier: BookableTier,
): string {
  return eventTypeUri(
    tier === "pro"
      ? config.calendar.calendlyEventTypePro
      : config.calendar.calendlyEventTypeElite,
  );
}

export async function calendlyRequest<T>(
  token: string,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`https://api.calendly.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const data = (await res.json().catch(() => ({}))) as T & {
    message?: string;
    title?: string;
  };
  if (!res.ok) {
    throw new Error(
      data.message || data.title || `Calendly ${res.status} ${path}`,
    );
  }
  return data;
}

export async function calendlyListSlots(
  config: IntegrationsConfig,
  tier: BookableTier,
): Promise<{ slots: TimeSlot[]; timeZone: string }> {
  const token = config.calendar.calendlyApiToken.trim();
  const eventType = eventTypeForTier(config, tier);
  if (!token || !eventType) {
    throw new Error("Calendly API token and event type URI are required.");
  }

  const now = new Date();
  const minNotice = new Date(
    now.getTime() + config.calendar.minNoticeHours * 3_600_000,
  );
  const spanDays = Math.min(config.calendar.daysAhead, 31);
  const until = new Date(now.getTime() + spanDays * 86_400_000);
  const durationMs = EVENT_TYPES[tier].durationMinutes * 60_000;

  const data = await calendlyRequest<{
    collection?: { status?: string; start_time?: string; invitees_remaining?: number }[];
  }>(
    token,
    `/event_type_available_times?${new URLSearchParams({
      event_type: eventType,
      start_time: now.toISOString(),
      end_time: until.toISOString(),
    }).toString()}`,
  );

  const slots = (data.collection ?? [])
    .filter(
      (item) =>
        item.status === "available" &&
        item.start_time &&
        (item.invitees_remaining == null || item.invitees_remaining > 0),
    )
    .map((item) => {
      const start = new Date(item.start_time!);
      return {
        start: start.toISOString(),
        end: new Date(start.getTime() + durationMs).toISOString(),
      };
    })
    .filter((slot) => new Date(slot.start) >= minNotice);

  return { slots, timeZone: config.calendar.timezone };
}

export async function calendlyCreateInvitee(options: {
  config: IntegrationsConfig;
  tier: BookableTier;
  start: string;
  name: string;
  email: string;
  timezone: string;
}): Promise<{ eventId: string; htmlLink?: string }> {
  const { config, tier, start, name, email, timezone } = options;
  const token = config.calendar.calendlyApiToken.trim();
  const eventType = eventTypeForTier(config, tier);
  const parts = name.trim().split(/\s+/);
  const locationKind = config.calendar.calendlyLocationKind.trim();
  const payload: Record<string, unknown> = {
    event_type: eventType,
    start_time: new Date(start).toISOString(),
    invitee: {
      name,
      first_name: parts[0] ?? name,
      last_name: parts.slice(1).join(" ") || parts[0] || name,
      email,
      timezone,
    },
  };
  if (locationKind) {
    payload.location = { kind: locationKind };
  }

  const data = await calendlyRequest<{
    resource?: {
      uri?: string;
      event?: string;
      scheduled_event?: { uri?: string };
    };
  }>(token, "/invitees", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const uri =
    data.resource?.uri ||
    data.resource?.event ||
    data.resource?.scheduled_event?.uri ||
    start;
  return { eventId: uri };
}

export async function calendlyPing(config: IntegrationsConfig): Promise<string> {
  const token = config.calendar.calendlyApiToken.trim();
  if (!token) throw new Error("Calendly API token is missing.");
  const me = await calendlyRequest<{ resource?: { name?: string; slug?: string } }>(
    token,
    "/users/me",
  );
  return me.resource?.name || me.resource?.slug || "Calendly";
}
