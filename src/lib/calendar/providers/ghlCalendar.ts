import { EVENT_TYPES } from "@/lib/config/calendar";
import type { BookableTier } from "@/lib/config/pricing";
import type { IntegrationsConfig } from "@/lib/integrations/types";
import type { TimeSlot } from "../slots";

function calendarIdForTier(
  config: IntegrationsConfig,
  tier: BookableTier,
): string {
  return (
    (tier === "pro"
      ? config.calendar.ghlCalendarIdPro
      : config.calendar.ghlCalendarIdElite) || ""
  ).trim();
}

function ghlHeaders(config: IntegrationsConfig): HeadersInit {
  return {
    Authorization: `Bearer ${config.ghl.apiKey}`,
    Version: "2021-07-28",
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

export async function ghlListSlots(
  config: IntegrationsConfig,
  tier: BookableTier,
): Promise<{ slots: TimeSlot[]; timeZone: string }> {
  const calendarId = calendarIdForTier(config, tier);
  if (!calendarId || !config.ghl.apiKey) {
    throw new Error("GHL calendar ID and API key are required for native booking.");
  }
  const now = Date.now();
  const until = now + config.calendar.daysAhead * 86_400_000;
  const params = new URLSearchParams({
    startDate: String(now),
    endDate: String(until),
    timezone: config.calendar.timezone,
  });
  const res = await fetch(
    `${config.ghl.apiBaseUrl}/calendars/${encodeURIComponent(calendarId)}/free-slots?${params.toString()}`,
    { headers: ghlHeaders(config) },
  );
  const data = (await res.json()) as
    | Record<string, { slots?: string[] } | unknown>
    | { message?: string; error?: string };

  if (!res.ok) {
    const err = data as { message?: string; error?: string };
    throw new Error(err.message || err.error || `GHL free-slots failed (${res.status})`);
  }

  const durationMs = EVENT_TYPES[tier].durationMinutes * 60_000;
  const minStart = new Date(
    Date.now() + config.calendar.minNoticeHours * 3_600_000,
  );
  const slots: TimeSlot[] = [];

  for (const [key, value] of Object.entries(data)) {
    if (key === "traceId") continue;
    const times: string[] = [];
    if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === "string") times.push(item);
        else if (item && typeof item === "object" && "slot" in item) {
          times.push(String((item as { slot: string }).slot));
        }
      }
    } else if (value && typeof value === "object" && "slots" in value) {
      const listed = (value as { slots?: string[] }).slots ?? [];
      times.push(...listed);
    }
    for (const time of times) {
      const start = new Date(time);
      if (Number.isNaN(start.getTime()) || start < minStart) continue;
      slots.push({
        start: start.toISOString(),
        end: new Date(start.getTime() + durationMs).toISOString(),
      });
    }
  }

  slots.sort((a, b) => a.start.localeCompare(b.start));
  return { slots, timeZone: config.calendar.timezone };
}

export async function ghlCreateAppointment(options: {
  config: IntegrationsConfig;
  tier: BookableTier;
  start: string;
  end: string;
  name: string;
  email: string;
  phone?: string;
  contactId?: string;
}): Promise<{ eventId: string }> {
  const { config, tier, start, end, contactId, name, email, phone } = options;
  const calendarId = calendarIdForTier(config, tier);
  if (!calendarId) throw new Error("GHL calendar ID is missing.");

  const res = await fetch(`${config.ghl.apiBaseUrl}/calendars/events`, {
    method: "POST",
    headers: ghlHeaders(config),
    body: JSON.stringify({
      calendarId,
      locationId: config.ghl.locationId,
      contactId: contactId || undefined,
      startTime: start,
      endTime: end,
      title: `${EVENT_TYPES[tier].label} — ${name}`,
      appointmentStatus: "confirmed",
      meetingLocationType: "custom",
      meetingLocation: "To be confirmed",
      ignoreFreeSlotValidation: false,
      to: email,
      email,
      phone,
    }),
  });
  const data = (await res.json()) as {
    id?: string;
    event?: { id?: string };
    message?: string;
  };
  if (!res.ok) {
    throw new Error(data.message || `GHL create appointment failed (${res.status})`);
  }
  const eventId = data.id || data.event?.id;
  if (!eventId) throw new Error("GHL did not return an appointment id.");
  return { eventId };
}
