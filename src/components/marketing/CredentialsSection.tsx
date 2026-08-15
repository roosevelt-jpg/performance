"use client";

import { useCms } from "@/components/cms/CmsProvider";

export function CredentialsSection() {
  const { credentials } = useCms().home;
  if (!credentials?.enabled) return null;

  return (
    <section className="section-vignette border-b border-[var(--border)]">
      <div className="relative mx-auto max-w-6xl px-4 section-y sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
          {credentials.eyebrow}
        </p>
        <h2 className="mt-3 max-w-3xl font-heading text-[clamp(1.7rem,4.2vw,2.5rem)] text-[var(--fg)]">
          {credentials.heading}
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-[1.7] text-[var(--muted)] sm:text-lg">
          {credentials.body}
        </p>
        <div className="mt-10 grid grid-cols-2 gap-px bg-[var(--border)] sm:grid-cols-4">
          {credentials.items.map((item) => (
            <div key={item.id} className="bg-[var(--bg)] px-4 py-6 sm:px-6">
              <p className="font-heading text-2xl text-[var(--accent)] sm:text-3xl">
                {item.value}
              </p>
              <p className="mt-1 text-sm text-[var(--muted)]">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
