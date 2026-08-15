"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { QuestionnaireAnswers } from "@/types/lead";

type Slot = { start: string; end: string };

type Availability = {
  platform: string;
  timeZone: string;
  durationMinutes: number;
  eventLabel: string;
  slots: Slot[];
  syncedAt: string;
};

type Props = {
  tier: "pro" | "elite";
  answers: QuestionnaireAnswers;
  contactId?: string;
  onBooked: (booking: {
    start: string;
    end: string;
    timeZone: string;
    eventId: string;
    htmlLink?: string;
    platform: string;
  }) => void;
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function ymdKey(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

function monthLabel(year: number, month: number): string {
  return new Date(Date.UTC(year, month, 1)).toLocaleString("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatTime(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

function formatLong(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function startOfMonth(year: number, month: number): Date {
  return new Date(Date.UTC(year, month, 1));
}

export function BookingCalendar({
  tier,
  answers,
  contactId,
  onBooked,
}: Props) {
  const now = new Date();
  const [cursor, setCursor] = useState({
    year: now.getFullYear(),
    month: now.getMonth(),
  });
  const [data, setData] = useState<Availability | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const visitorZone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    [],
  );

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch(
        `/api/calendar/availability?tier=${tier}`,
        { cache: "no-store" },
      );
      const json = (await res.json()) as Availability & { error?: string };
      if (!res.ok) {
        setError(json.error ?? "Could not load availability.");
        return;
      }
      setData(json);
      setError(null);
    } catch {
      setError("Could not load availability.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [tier]);

  useEffect(() => {
    void load(false);
    const id = window.setInterval(() => void load(true), 15_000);
    const onFocus = () => void load(true);
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [load]);

  useEffect(() => {
    if (!selectedSlot || !data) return;
    const still = data.slots.some(
      (slot) => slot.start === selectedSlot.start,
    );
    if (!still) {
      setSelectedSlot(null);
      setError("That slot was taken. Pick another time.");
    }
  }, [data, selectedSlot]);

  const zone = data?.timeZone ?? "Europe/London";
  const slotsByDay = useMemo(() => {
    const map = new Map<string, Slot[]>();
    for (const slot of data?.slots ?? []) {
      const key = ymdKey(slot.start, zone);
      const list = map.get(key) ?? [];
      list.push(slot);
      map.set(key, list);
    }
    return map;
  }, [data, zone]);

  const days = useMemo(() => {
    const first = startOfMonth(cursor.year, cursor.month);
    const startWeekday = (first.getUTCDay() + 6) % 7;
    const daysInMonth = new Date(
      Date.UTC(cursor.year, cursor.month + 1, 0),
    ).getUTCDate();
    const cells: Array<{
      key: string;
      day: number | null;
      hasSlots: boolean;
    }> = [];
    for (let i = 0; i < startWeekday; i += 1) {
      cells.push({ key: `pad-${i}`, day: null, hasSlots: false });
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      const key = `${cursor.year}-${String(cursor.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      cells.push({
        key,
        day,
        hasSlots: (slotsByDay.get(key)?.length ?? 0) > 0,
      });
    }
    return cells;
  }, [cursor, slotsByDay]);

  const daySlots = selectedDay ? (slotsByDay.get(selectedDay) ?? []) : [];
  const platformLabel =
    data?.platform === "google"
      ? "Google Calendar"
      : data?.platform === "calendly"
        ? "Calendly"
        : "GoHighLevel";

  async function confirm() {
    if (!selectedSlot || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/calendar/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier,
          start: selectedSlot.start,
          end: selectedSlot.end,
          name: answers.name,
          email: answers.email,
          phone: answers.mobile,
          timezone: visitorZone,
          contactId,
          notes: [
            `Goal: ${answers.mainGoal}`,
            `Training now: ${answers.trainingNow}`,
            `Days: ${answers.daysCommit}`,
          ].join(" · "),
        }),
      });
      const json = (await res.json()) as {
        error?: string;
        eventId?: string;
        htmlLink?: string;
        platform?: string;
        start?: string;
        end?: string;
        timeZone?: string;
      };
      if (!res.ok || !json.eventId) {
        setError(json.error ?? "Could not book that slot.");
        void load(true);
        return;
      }
      onBooked({
        start: json.start ?? selectedSlot.start,
        end: json.end ?? selectedSlot.end,
        timeZone: json.timeZone ?? zone,
        eventId: json.eventId,
        htmlLink: json.htmlLink,
        platform: json.platform ?? data?.platform ?? "google",
      });
    } catch {
      setError("Could not book that slot.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
            Live availability
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {platformLabel}
            {data?.syncedAt
              ? ` · updated ${formatTime(data.syncedAt, visitorZone)}`
              : " · syncing…"}
            {loading ? " · checking" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-md border border-[var(--border)] px-2.5 py-1.5 text-sm text-[var(--fg)]"
            onClick={() =>
              setCursor((c) =>
                c.month === 0
                  ? { year: c.year - 1, month: 11 }
                  : { year: c.year, month: c.month - 1 },
              )
            }
            aria-label="Previous month"
          >
            ‹
          </button>
          <p className="min-w-[9rem] text-center text-sm font-medium text-[var(--fg)]">
            {monthLabel(cursor.year, cursor.month)}
          </p>
          <button
            type="button"
            className="rounded-md border border-[var(--border)] px-2.5 py-1.5 text-sm text-[var(--fg)]"
            onClick={() =>
              setCursor((c) =>
                c.month === 11
                  ? { year: c.year + 1, month: 0 }
                  : { year: c.year, month: c.month + 1 },
              )
            }
            aria-label="Next month"
          >
            ›
          </button>
        </div>
      </div>

      {error ? (
        <p className="mb-4 text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] uppercase tracking-wide text-[var(--muted)]">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((cell) => {
          if (cell.day == null) {
            return <div key={cell.key} className="h-10" />;
          }
          const selected = selectedDay === cell.key;
          return (
            <button
              key={cell.key}
              type="button"
              disabled={!cell.hasSlots}
              onClick={() => {
                setSelectedDay(cell.key);
                setSelectedSlot(null);
              }}
              className={[
                "h-10 rounded-md text-sm transition",
                selected
                  ? "bg-[var(--accent)] text-[var(--accent-fg)]"
                  : cell.hasSlots
                    ? "bg-[var(--surface-elevated)] text-[var(--fg)] hover:border-[var(--accent)] border border-[var(--border)]"
                    : "text-[var(--muted)] opacity-40",
              ].join(" ")}
            >
              {cell.day}
            </button>
          );
        })}
      </div>

      <div className="mt-5">
        <p className="text-sm font-medium text-[var(--fg)]">
          {selectedDay ? "Available times" : "Choose a day"}
          <span className="ml-2 text-xs font-normal text-[var(--muted)]">
            {zone.replace("_", " ")} time
          </span>
        </p>
        {selectedDay && daySlots.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--muted)]">
            No times left this day. Pick another.
          </p>
        ) : null}
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {daySlots.map((slot) => {
            const active = selectedSlot?.start === slot.start;
            return (
              <button
                key={slot.start}
                type="button"
                onClick={() => setSelectedSlot(slot)}
                className={[
                  "rounded-md border px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--fg)]"
                    : "border-[var(--border)] text-[var(--fg)] hover:border-[var(--accent)]",
                ].join(" ")}
              >
                {formatTime(slot.start, zone)}
                {visitorZone !== zone ? (
                  <span className="mt-0.5 block text-[11px] font-normal text-[var(--muted)]">
                    {formatTime(slot.start, visitorZone)} your time
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {selectedSlot ? (
        <div className="mt-6 border-t border-[var(--border)] pt-5">
          <p className="text-sm text-[var(--fg-soft)]">
            Confirm {data?.durationMinutes ?? 20}-minute call for{" "}
            <span className="text-[var(--fg)]">
              {formatLong(selectedSlot.start, zone)}
            </span>
          </p>
          <button
            type="button"
            onClick={() => void confirm()}
            disabled={submitting}
            className="mt-4 inline-flex w-full items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--accent-fg)] transition hover:bg-[var(--accent-bright)] disabled:opacity-60 sm:w-auto"
          >
            {submitting ? "Booking…" : "Confirm this time"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
