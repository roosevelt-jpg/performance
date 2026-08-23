"use client";

import { useMemo } from "react";
import { BookingCalendar } from "@/components/calendar/BookingCalendar";
import { useCms } from "@/components/cms/CmsProvider";
import {
  resolveCalendarEmbed,
  type CalendarRuntimeConfig,
} from "@/lib/calendar/adapter";
import type { QuestionnaireAnswers } from "@/types/lead";

type Props = {
  tier: "pro" | "elite";
  answers: QuestionnaireAnswers;
  contactId?: string;
  /** Fetched server-side by the page so the browser never has to round-trip for it. */
  runtime?: CalendarRuntimeConfig;
  onBooked: (booking?: {
    start: string;
    end: string;
    timeZone: string;
    eventId: string;
    htmlLink?: string;
    platform: string;
  }) => void;
};

function buildSrc(base: string, params: Record<string, string>): string {
  if (!base) return "";
  try {
    const url = new URL(base);
    Object.entries(params).forEach(([k, v]) => {
      if (v) url.searchParams.set(k, v);
    });
    return url.toString();
  } catch {
    return base;
  }
}

export function CalendarEmbed({ tier, answers, contactId, runtime, onBooked }: Props) {
  const cms = useCms();
  const cal = cms.calendar;

  const embed = useMemo(
    () =>
      resolveCalendarEmbed(
        {
          tier,
          answers,
          prefill: {
            name: answers.name,
            email: answers.email,
            phone: answers.mobile,
          },
        },
        runtime,
      ),
    [tier, answers, runtime],
  );

  const src = buildSrc(embed.embedUrl, embed.queryParams);
  const eventLabel =
    tier === "pro" ? cal.proEventLabel : cal.eliteEventLabel;
  const tierLabel = tier === "pro" ? "Pro" : "Elite";
  const subhead = cal.subhead
    .replace("{duration}", String(embed.durationMinutes))
    .replace("{tier}", tierLabel);
  const missingBody = cal.missingBody.replace("{platform}", embed.platform);
  const useNative =
    tier === "pro"
      ? Boolean(runtime?.nativeBookingPro)
      : Boolean(runtime?.nativeBookingElite);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-10 lg:px-6">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
          {eventLabel}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--fg)] sm:text-3xl">
          {cal.title}
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">{subhead}</p>
      </div>

      {useNative ? (
        <BookingCalendar
          tier={tier}
          answers={answers}
          contactId={contactId}
          onBooked={(booking) => onBooked(booking)}
        />
      ) : src ? (
        <div className="-mx-4 overflow-hidden border-y border-[var(--border)] bg-[var(--surface)] sm:mx-0 sm:rounded-lg sm:border">
          <iframe
            title={eventLabel}
            src={src}
            className="h-[70vh] min-h-[480px] w-full max-h-[820px] sm:h-[min(720px,75vh)]"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--muted)] sm:p-6">
          <p className="font-medium text-[var(--fg)]">{cal.missingTitle}</p>
          <p className="mt-2 break-words">{missingBody}</p>
          <button
            type="button"
            onClick={() => onBooked()}
            className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--accent-fg)] transition hover:bg-[var(--accent-bright)] sm:w-auto sm:py-2.5"
          >
            {cal.devContinue}
          </button>
        </div>
      )}

      {src && !useNative ? (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => onBooked()}
            className="w-full rounded-md border border-[var(--border)] px-4 py-3 text-sm font-medium text-[var(--accent)] sm:w-auto sm:border-0 sm:px-0 sm:py-0 sm:underline-offset-2 sm:hover:underline"
          >
            {cal.bookedContinue}
          </button>
        </div>
      ) : null}
    </div>
  );
}
