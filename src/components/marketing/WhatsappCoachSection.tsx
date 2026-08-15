"use client";

import { useCms } from "@/components/cms/CmsProvider";
import { ChatPreview } from "@/components/marketing/PhoneMockup";
import { COACH_CHAT } from "@/content/hero-chat";

export function WhatsappCoachSection() {
  const { whatsappCoach: coach } = useCms().home;
  if (!coach?.enabled) return null;

  const lines =
    coach.chatMessage?.trim() &&
    COACH_CHAT[COACH_CHAT.length - 1]?.text !== coach.chatMessage
      ? [...COACH_CHAT.slice(0, -1), { from: "coach" as const, text: coach.chatMessage }]
      : COACH_CHAT;

  return (
    <section className="section-vignette border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="relative mx-auto max-w-6xl px-4 section-y sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
          {coach.eyebrow}
        </p>
        <h2 className="mt-3 max-w-3xl font-heading text-[clamp(1.7rem,4.2vw,2.5rem)] text-[var(--fg)]">
          {coach.heading}
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-[1.7] text-[var(--muted)] sm:text-lg">
          {coach.body}
        </p>

        <div className="mt-12 grid items-start gap-10 lg:grid-cols-2">
          <ol className="grid gap-8 sm:grid-cols-2">
            {coach.steps.map((step, i) => (
              <li key={step.id}>
                <p className="font-heading text-3xl text-[var(--accent)]">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 font-heading text-[1.2rem] text-[var(--fg)]">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-[1.7] text-[var(--muted)]">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>

          <ChatPreview
            lines={lines}
            name={coach.chatName}
            avatarUrl={coach.avatarUrl}
            className="mx-auto w-full max-w-sm"
          />
        </div>
      </div>
    </section>
  );
}
