import type { CalendarPlatform } from "@/lib/integrations/types";

export type { CalendarPlatform };

export const CALENDAR_PLATFORM = (process.env.NEXT_PUBLIC_CALENDAR_PLATFORM ??
  "ghl") as CalendarPlatform;

export const CALENDAR_EMBEDS = {
  ghl: {
    pro: process.env.NEXT_PUBLIC_GHL_CALENDAR_EMBED_PRO ?? "",
    elite: process.env.NEXT_PUBLIC_GHL_CALENDAR_EMBED_ELITE ?? "",
  },
  calendly: {
    pro: process.env.NEXT_PUBLIC_CALENDLY_EMBED_PRO ?? "",
    elite: process.env.NEXT_PUBLIC_CALENDLY_EMBED_ELITE ?? "",
  },
} as const;

/** Event types — auto-selected from tier; user never picks. */
export const EVENT_TYPES = {
  pro: { label: "Pro Call — 20 min", durationMinutes: 20 },
  elite: { label: "Elite Call — 30 min", durationMinutes: 30 },
} as const;
