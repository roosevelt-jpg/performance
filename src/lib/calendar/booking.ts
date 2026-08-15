import { EVENT_TYPES } from "@/lib/config/calendar";
import type { BookableTier } from "@/lib/config/pricing";
import { loadIntegrations } from "@/lib/integrations/store";
import type { IntegrationsConfig } from "@/lib/integrations/types";
import { nativeCalendarReadyForTier } from "./nativeReady";
import {
  calendlyCreateInvitee,
  calendlyListSlots,
} from "./providers/calendly";
import {
  ghlCreateAppointment,
  ghlListSlots,
} from "./providers/ghlCalendar";
import {
  googleCreateEvent,
  googleListSlots,
} from "./providers/google";
import { slotStillOpen, type TimeSlot } from "./slots";

export type AvailabilityResponse = {
  platform: IntegrationsConfig["calendar"]["platform"];
  timeZone: string;
  durationMinutes: number;
  eventLabel: string;
  slots: TimeSlot[];
  syncedAt: string;
};

export type BookRequest = {
  tier: BookableTier;
  start: string;
  end: string;
  name: string;
  email: string;
  phone?: string;
  timezone?: string;
  contactId?: string;
  notes?: string;
};

export type BookResponse = {
  ok: true;
  platform: IntegrationsConfig["calendar"]["platform"];
  eventId: string;
  htmlLink?: string;
  start: string;
  end: string;
  timeZone: string;
};

export async function listAvailability(
  tier: BookableTier,
): Promise<AvailabilityResponse> {
  const config = await loadIntegrations();
  if (!nativeCalendarReadyForTier(config, tier)) {
    throw Object.assign(
      new Error(
        "Native calendar is not connected yet. Add Google Calendar, Calendly, or GHL API keys in Admin → Integrations.",
      ),
      { status: 409 },
    );
  }

  const event = EVENT_TYPES[tier];
  const platform = config.calendar.platform;
  let slots: TimeSlot[] = [];
  let timeZone = config.calendar.timezone;

  if (platform === "google") {
    const result = await googleListSlots(config, tier);
    slots = result.slots;
    timeZone = result.timeZone;
  } else if (platform === "calendly") {
    const result = await calendlyListSlots(config, tier);
    slots = result.slots;
    timeZone = result.timeZone;
  } else {
    const result = await ghlListSlots(config, tier);
    slots = result.slots;
    timeZone = result.timeZone;
  }

  return {
    platform,
    timeZone,
    durationMinutes: event.durationMinutes,
    eventLabel: event.label,
    slots,
    syncedAt: new Date().toISOString(),
  };
}

export async function bookSlot(request: BookRequest): Promise<BookResponse> {
  const config = await loadIntegrations();
  const { tier } = request;
  if (!nativeCalendarReadyForTier(config, tier)) {
    throw Object.assign(new Error("Native calendar is not connected."), {
      status: 409,
    });
  }

  const event = EVENT_TYPES[tier];
  const expectedEnd = new Date(
    new Date(request.start).getTime() + event.durationMinutes * 60_000,
  ).toISOString();
  const end = request.end || expectedEnd;
  const platform = config.calendar.platform;

  if (platform === "google") {
    const { busy } = await googleListSlots(config, tier);
    if (!slotStillOpen(request.start, end, busy, config.calendar.bufferMinutes)) {
      throw Object.assign(
        new Error("That time was just taken. Pick another slot."),
        { status: 409 },
      );
    }
    const created = await googleCreateEvent({
      config,
      tier,
      start: request.start,
      end,
      name: request.name,
      email: request.email,
      phone: request.phone,
      notes: request.notes,
    });
    return {
      ok: true,
      platform,
      eventId: created.eventId,
      htmlLink: created.htmlLink,
      start: request.start,
      end,
      timeZone: config.calendar.timezone,
    };
  }

  if (platform === "calendly") {
    const live = await calendlyListSlots(config, tier);
    const still = live.slots.some(
      (slot) => new Date(slot.start).getTime() === new Date(request.start).getTime(),
    );
    if (!still) {
      throw Object.assign(
        new Error("That time was just taken. Pick another slot."),
        { status: 409 },
      );
    }
    const created = await calendlyCreateInvitee({
      config,
      tier,
      start: request.start,
      name: request.name,
      email: request.email,
      timezone: request.timezone || config.calendar.timezone,
    });
    return {
      ok: true,
      platform,
      eventId: created.eventId,
      htmlLink: created.htmlLink,
      start: request.start,
      end,
      timeZone: config.calendar.timezone,
    };
  }

  const live = await ghlListSlots(config, tier);
  const still = live.slots.some(
    (slot) => new Date(slot.start).getTime() === new Date(request.start).getTime(),
  );
  if (!still) {
    throw Object.assign(
      new Error("That time was just taken. Pick another slot."),
      { status: 409 },
    );
  }
  const created = await ghlCreateAppointment({
    config,
    tier,
    start: request.start,
    end,
    name: request.name,
    email: request.email,
    phone: request.phone,
    contactId: request.contactId,
  });
  return {
    ok: true,
    platform,
    eventId: created.eventId,
    start: request.start,
    end,
    timeZone: config.calendar.timezone,
  };
}
