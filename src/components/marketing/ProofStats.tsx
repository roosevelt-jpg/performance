"use client";

import { useCms } from "@/components/cms/CmsProvider";

export function ProofStats() {
  const { proof } = useCms().home;
  const items = proof.items.filter((item) => item.value.trim() && item.label.trim());
  if (!proof.enabled || !items.length) return null;

  const cols =
    items.length === 1
      ? "sm:grid-cols-1"
      : items.length === 2
        ? "sm:grid-cols-2"
        : items.length === 3
          ? "sm:grid-cols-3"
          : "sm:grid-cols-4";

  return (
    <section
      aria-label="Results"
      className="border-b border-[var(--border)] bg-[var(--bg)]"
    >
      <div
        className={`mx-auto grid max-w-5xl grid-cols-1 divide-y divide-[var(--border)] sm:divide-x sm:divide-y-0 ${cols}`}
      >
        {items.map((item, i) => (
          <div
            key={item.id}
            className="px-4 py-8 text-center sm:px-8 sm:py-10"
            style={{ animationDelay: `${80 + i * 70}ms` }}
          >
            <p className="animate-rise font-heading text-[clamp(1.85rem,4.5vw,2.75rem)] leading-none text-[var(--accent)]">
              {item.value}
            </p>
            <p className="animate-rise mt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--fg)] sm:text-xs">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
