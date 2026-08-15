import { describe, expect, it } from "vitest";
import {
  buildAvailableSlots,
  intervalsOverlap,
  zonedLocalToUtc,
} from "./slots";

describe("zonedLocalToUtc", () => {
  it("maps London summer time to UTC", () => {
    const date = zonedLocalToUtc(2026, 8, 17, 9, 0, "Europe/London");
    expect(date.toISOString()).toBe("2026-08-17T08:00:00.000Z");
  });
});

describe("buildAvailableSlots", () => {
  it("opens weekday slots inside working hours", () => {
    const now = new Date("2026-08-17T07:00:00.000Z");
    const slots = buildAvailableSlots(
      {
        timeZone: "Europe/London",
        durationMinutes: 20,
        bufferMinutes: 0,
        minNoticeHours: 0,
        daysAhead: 0,
        workingHoursStart: "09:00",
        workingHoursEnd: "10:00",
        workingDays: [1],
        now,
      },
      [],
    );
    expect(slots.map((s) => s.start)).toEqual([
      "2026-08-17T08:00:00.000Z",
      "2026-08-17T08:20:00.000Z",
      "2026-08-17T08:40:00.000Z",
    ]);
  });

  it("hides busy times including buffer", () => {
    const now = new Date("2026-08-17T07:00:00.000Z");
    const busyStart = new Date("2026-08-17T08:00:00.000Z");
    const busyEnd = new Date("2026-08-17T08:20:00.000Z");
    const slots = buildAvailableSlots(
      {
        timeZone: "Europe/London",
        durationMinutes: 20,
        bufferMinutes: 10,
        minNoticeHours: 0,
        daysAhead: 0,
        workingHoursStart: "09:00",
        workingHoursEnd: "10:00",
        workingDays: [1],
        now,
      },
      [{ start: busyStart, end: busyEnd }],
    );
    expect(
      slots.some((s) => s.start === "2026-08-17T08:00:00.000Z"),
    ).toBe(false);
    expect(
      slots.some((s) => s.start === "2026-08-17T08:20:00.000Z"),
    ).toBe(false);
  });
});

describe("intervalsOverlap", () => {
  it("detects overlap", () => {
    expect(
      intervalsOverlap(
        new Date("2026-08-17T08:00:00.000Z"),
        new Date("2026-08-17T08:20:00.000Z"),
        [
          {
            start: new Date("2026-08-17T08:10:00.000Z"),
            end: new Date("2026-08-17T08:30:00.000Z"),
          },
        ],
        0,
      ),
    ).toBe(true);
  });
});
