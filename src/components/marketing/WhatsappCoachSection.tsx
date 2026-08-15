"use client";

import { useCms } from "@/components/cms/CmsProvider";

export function WhatsappCoachSection() {
  const { whatsappCoach: coach } = useCms().home;
  if (!coach?.enabled) return null;

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

          <div
            className="card-depth mx-auto w-full max-w-sm overflow-hidden rounded-[var(--radius)] border border-[var(--border-soft)] bg-[#0e0d0c]"
            aria-label="Coach chat preview"
          >
            <div className="flex items-center gap-3 border-b border-[var(--border)] bg-[#121110] px-4 py-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-semibold text-white">
                {coach.chatName.slice(0, 1)}
              </span>
              <div>
                <p className="text-sm font-semibold text-[var(--fg)]">
                  {coach.chatName}
                </p>
                <p className="text-xs text-[var(--muted)]">{coach.chatTime}</p>
              </div>
            </div>
            <div className="space-y-3 px-4 py-5">
              <p className="text-xs text-[var(--muted)]">Performance Coach</p>
              <div className="max-w-[90%] rounded-[6px] rounded-tl-none bg-[#1c1916] px-3.5 py-3 text-sm leading-[1.6] text-[var(--fg)]">
                {coach.chatMessage}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
