"use client";

import { useCms } from "@/components/cms/CmsProvider";

export function BenchmarkSection() {
  const { benchmarks } = useCms().home;
  if (!benchmarks?.enabled) return null;

  return (
    <section className="border-b border-[var(--border)]">
      <div className="mx-auto max-w-6xl px-4 section-y sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
          {benchmarks.eyebrow}
        </p>
        <h2 className="mt-3 max-w-3xl font-heading text-[clamp(1.7rem,4.2vw,2.5rem)] text-[var(--fg)]">
          {benchmarks.heading}
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-[1.7] text-[var(--muted)] sm:text-lg">
          {benchmarks.body}
        </p>
        <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {benchmarks.items.map((item) => (
            <li
              key={item.id}
              className="card-depth rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-4 py-5"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
                {item.value}
              </p>
              <p className="mt-2 font-heading text-xl text-[var(--fg)]">
                {item.label}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
