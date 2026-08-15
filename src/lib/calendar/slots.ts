export type BusyInterval = {
  start: Date;
  end: Date;
};

export type SlotRules = {
  timeZone: string;
  durationMinutes: number;
  bufferMinutes: number;
  minNoticeHours: number;
  daysAhead: number;
  workingHoursStart: string;
  workingHoursEnd: string;
  /** ISO weekday 1–7 (Mon–Sun). */
  workingDays: number[];
  slotIntervalMinutes?: number;
  now?: Date;
};

export type TimeSlot = {
  start: string;
  end: string;
};

function parseHm(value: string): { h: number; m: number } {
  const [rawH, rawM] = value.split(":");
  const h = Number(rawH);
  const m = Number(rawM);
  return {
    h: Number.isFinite(h) ? h : 0,
    m: Number.isFinite(m) ? m : 0,
  };
}

function getTzOffsetMs(date: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = Object.fromEntries(
    dtf.formatToParts(date).filter((p) => p.type !== "literal").map((p) => [p.type, p.value]),
  );
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
  return asUtc - date.getTime();
}

export function zonedLocalToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
): Date {
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, 0);
  const offset = getTzOffsetMs(new Date(utcGuess), timeZone);
  const adjusted = new Date(utcGuess - offset);
  const offset2 = getTzOffsetMs(adjusted, timeZone);
  if (offset2 !== offset) {
    return new Date(utcGuess - offset2);
  }
  return adjusted;
}

export function isoWeekdayInZone(date: Date, timeZone: string): number {
  const wd = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: "short",
  }).format(date);
  const map: Record<string, number> = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
    Sun: 7,
  };
  return map[wd] ?? 1;
}

export function ymdInZone(
  date: Date,
  timeZone: string,
): { year: number; month: number; day: number } {
  const dtf = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const [year, month, day] = dtf.format(date).split("-").map(Number);
  return { year, month, day };
}

function overlaps(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
): boolean {
  return aStart < bEnd && aEnd > bStart;
}

export function intervalsOverlap(
  slotStart: Date,
  slotEnd: Date,
  busy: BusyInterval[],
  bufferMinutes: number,
): boolean {
  const pad = bufferMinutes * 60_000;
  const aStart = slotStart.getTime() - pad;
  const aEnd = slotEnd.getTime() + pad;
  return busy.some((b) =>
    overlaps(aStart, aEnd, b.start.getTime(), b.end.getTime()),
  );
}

function addDaysYmd(
  year: number,
  month: number,
  day: number,
  add: number,
): { year: number; month: number; day: number } {
  const utc = new Date(Date.UTC(year, month - 1, day + add));
  return {
    year: utc.getUTCFullYear(),
    month: utc.getUTCMonth() + 1,
    day: utc.getUTCDate(),
  };
}

export function buildAvailableSlots(
  rules: SlotRules,
  busy: BusyInterval[],
): TimeSlot[] {
  const now = rules.now ?? new Date();
  const durationMs = rules.durationMinutes * 60_000;
  const stepMinutes =
    rules.slotIntervalMinutes && rules.slotIntervalMinutes > 0
      ? rules.slotIntervalMinutes
      : rules.durationMinutes;
  const stepMs = stepMinutes * 60_000;
  const minStart = new Date(
    now.getTime() + rules.minNoticeHours * 3_600_000,
  );
  const startHm = parseHm(rules.workingHoursStart);
  const endHm = parseHm(rules.workingHoursEnd);
  const days = new Set(rules.workingDays);
  const today = ymdInZone(now, rules.timeZone);
  const slots: TimeSlot[] = [];

  for (let i = 0; i <= rules.daysAhead; i += 1) {
    const day = addDaysYmd(today.year, today.month, today.day, i);
    const dayStart = zonedLocalToUtc(
      day.year,
      day.month,
      day.day,
      12,
      0,
      rules.timeZone,
    );
    const weekday = isoWeekdayInZone(dayStart, rules.timeZone);
    if (!days.has(weekday)) continue;

    const windowStart = zonedLocalToUtc(
      day.year,
      day.month,
      day.day,
      startHm.h,
      startHm.m,
      rules.timeZone,
    );
    const windowEnd = zonedLocalToUtc(
      day.year,
      day.month,
      day.day,
      endHm.h,
      endHm.m,
      rules.timeZone,
    );

    for (
      let cursor = windowStart.getTime();
      cursor + durationMs <= windowEnd.getTime();
      cursor += stepMs
    ) {
      const start = new Date(cursor);
      const end = new Date(cursor + durationMs);
      if (start < minStart) continue;
      if (intervalsOverlap(start, end, busy, rules.bufferMinutes)) continue;
      slots.push({
        start: start.toISOString(),
        end: end.toISOString(),
      });
    }
  }

  return slots;
}

export function slotStillOpen(
  startIso: string,
  endIso: string,
  busy: BusyInterval[],
  bufferMinutes: number,
): boolean {
  return !intervalsOverlap(
    new Date(startIso),
    new Date(endIso),
    busy,
    bufferMinutes,
  );
}
