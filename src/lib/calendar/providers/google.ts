import { createPrivateKey, createSign } from "crypto";
import { EVENT_TYPES } from "@/lib/config/calendar";
import type { BookableTier } from "@/lib/config/pricing";
import type { IntegrationsConfig } from "@/lib/integrations/types";
import {
  buildAvailableSlots,
  type BusyInterval,
  type TimeSlot,
} from "../slots";

type ServiceAccount = {
  client_email?: string;
  private_key?: string;
  token_uri?: string;
};

function b64url(value: object): string {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function signJwt(payload: object, privateKeyPem: string): string {
  const data = `${b64url({ alg: "RS256", typ: "JWT" })}.${b64url(payload)}`;
  const sign = createSign("RSA-SHA256");
  sign.update(data);
  sign.end();
  return `${data}.${sign.sign(createPrivateKey(privateKeyPem)).toString("base64url")}`;
}

function parseServiceAccount(raw: string): ServiceAccount {
  const parsed = JSON.parse(raw) as ServiceAccount;
  if (parsed.private_key?.includes("\\n")) {
    parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
  }
  return parsed;
}

async function tokenFromServiceAccount(raw: string): Promise<string> {
  const sa = parseServiceAccount(raw);
  if (!sa.client_email || !sa.private_key) {
    throw new Error("Google service account JSON is missing client_email or private_key.");
  }
  const now = Math.floor(Date.now() / 1000);
  const jwt = signJwt(
    {
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/calendar",
      aud: sa.token_uri || "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    },
    sa.private_key,
  );
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  const data = (await res.json()) as { access_token?: string; error?: string };
  if (!res.ok || !data.access_token) {
    throw new Error(data.error || `Google service account token failed (${res.status})`);
  }
  return data.access_token;
}

async function tokenFromRefresh(cal: IntegrationsConfig["calendar"]): Promise<string> {
  if (!cal.googleClientId || !cal.googleClientSecret || !cal.googleRefreshToken) {
    throw new Error(
      "Google OAuth needs Client ID, Client Secret, and Refresh Token.",
    );
  }
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: cal.googleClientId,
      client_secret: cal.googleClientSecret,
      refresh_token: cal.googleRefreshToken,
    }),
  });
  const data = (await res.json()) as { access_token?: string; error?: string };
  if (!res.ok || !data.access_token) {
    throw new Error(data.error || `Google refresh token failed (${res.status})`);
  }
  return data.access_token;
}

export async function googleAccessToken(
  cal: IntegrationsConfig["calendar"],
): Promise<string> {
  if (cal.googleServiceAccountJson.trim()) {
    return tokenFromServiceAccount(cal.googleServiceAccountJson);
  }
  return tokenFromRefresh(cal);
}

function calendarId(cal: IntegrationsConfig["calendar"]): string {
  return cal.googleCalendarId.trim() || "primary";
}

async function googleFreeBusy(
  token: string,
  calId: string,
  timeMin: Date,
  timeMax: Date,
  timeZone: string,
): Promise<BusyInterval[]> {
  const res = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      timeZone,
      items: [{ id: calId }],
    }),
  });
  const data = (await res.json()) as {
    error?: { message?: string };
    calendars?: Record<
      string,
      { busy?: { start?: string; end?: string }[]; errors?: { reason?: string }[] }
    >;
  };
  if (!res.ok) {
    throw new Error(data.error?.message || `Google FreeBusy failed (${res.status})`);
  }
  const cal = data.calendars?.[calId] ?? data.calendars?.[Object.keys(data.calendars ?? {})[0] ?? ""];
  if (cal?.errors?.length) {
    throw new Error(cal.errors[0]?.reason || "Google Calendar is not reachable.");
  }
  return (cal?.busy ?? [])
    .filter((b) => b.start && b.end)
    .map((b) => ({
      start: new Date(b.start!),
      end: new Date(b.end!),
    }));
}

function slotRules(config: IntegrationsConfig, tier: BookableTier) {
  const cal = config.calendar;
  return {
    timeZone: cal.timezone,
    durationMinutes: EVENT_TYPES[tier].durationMinutes,
    bufferMinutes: cal.bufferMinutes,
    minNoticeHours: cal.minNoticeHours,
    daysAhead: cal.daysAhead,
    workingHoursStart: cal.workingHoursStart,
    workingHoursEnd: cal.workingHoursEnd,
    workingDays: cal.workingDays,
  };
}

export async function googleListSlots(
  config: IntegrationsConfig,
  tier: BookableTier,
): Promise<{ slots: TimeSlot[]; busy: BusyInterval[]; timeZone: string }> {
  const token = await googleAccessToken(config.calendar);
  const calId = calendarId(config.calendar);
  const now = new Date();
  const until = new Date(
    now.getTime() + config.calendar.daysAhead * 86_400_000,
  );
  const busy = await googleFreeBusy(
    token,
    calId,
    now,
    until,
    config.calendar.timezone,
  );
  return {
    slots: buildAvailableSlots(slotRules(config, tier), busy),
    busy,
    timeZone: config.calendar.timezone,
  };
}

export async function googleCreateEvent(options: {
  config: IntegrationsConfig;
  tier: BookableTier;
  start: string;
  end: string;
  name: string;
  email: string;
  phone?: string;
  notes?: string;
}): Promise<{ eventId: string; htmlLink?: string }> {
  const { config, tier, start, end, name, email, phone, notes } = options;
  const token = await googleAccessToken(config.calendar);
  const calId = encodeURIComponent(calendarId(config.calendar));
  const event = EVENT_TYPES[tier];
  const body = {
    summary: `${event.label} — ${name}`,
    description: [
      `Booked from The Formula Performance funnel.`,
      `Name: ${name}`,
      `Email: ${email}`,
      phone ? `Phone: ${phone}` : "",
      notes ?? "",
    ]
      .filter(Boolean)
      .join("\n"),
    start: { dateTime: start },
    end: { dateTime: end },
    attendees: email ? [{ email, displayName: name }] : undefined,
    reminders: { useDefault: true },
  };
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${calId}/events?sendUpdates=all`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );
  let data = (await res.json()) as {
    id?: string;
    htmlLink?: string;
    error?: { message?: string; code?: number };
  };
  if (
    (!res.ok || !data.id) &&
    body.attendees &&
    (res.status === 403 || data.error?.message?.toLowerCase().includes("attendee"))
  ) {
    const retry = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calId}/events`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...body, attendees: undefined }),
      },
    );
    data = (await retry.json()) as typeof data;
    if (!retry.ok || !data.id) {
      throw new Error(
        data.error?.message || `Google create event failed (${retry.status})`,
      );
    }
    return { eventId: data.id, htmlLink: data.htmlLink };
  }
  if (!res.ok || !data.id) {
    throw new Error(data.error?.message || `Google create event failed (${res.status})`);
  }
  return { eventId: data.id, htmlLink: data.htmlLink };
}

export async function googlePing(config: IntegrationsConfig): Promise<string> {
  const token = await googleAccessToken(config.calendar);
  const calId = encodeURIComponent(calendarId(config.calendar));
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${calId}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  const data = (await res.json()) as {
    summary?: string;
    id?: string;
    error?: { message?: string };
  };
  if (!res.ok) {
    throw new Error(data.error?.message || `Google calendar ping failed (${res.status})`);
  }
  return data.summary || data.id || "Google Calendar";
}
