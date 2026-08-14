"use client";

import Link from "next/link";
import type { CmsTier } from "@/lib/cms/types";

type Props = {
  tier: CmsTier;
};

export function TierCard({ tier }: Props) {
  const isSell = tier.cta.kind === "book";
  const href =
    tier.cta.kind === "book"
      ? `/book?tier=${tier.cta.bookTier}`
      : tier.cta.href;

  return (
    <article
      className={[
        "flex h-full min-w-0 flex-col rounded-[var(--radius)] border p-4 sm:p-5 md:p-6",
        tier.highlight
          ? "border-[var(--accent)] bg-[var(--surface-elevated)] shadow-[0_0_0_1px_var(--accent)]"
          : "border-[var(--border-soft)] bg-[var(--surface)]",
      ].join(" ")}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          {tier.badge ? (
            <span className="mb-2 inline-block rounded-md bg-[var(--accent-soft)] px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
              {tier.badge}
            </span>
          ) : null}
          <h3 className="font-heading text-xl uppercase text-[var(--fg)] sm:text-2xl">
            {tier.name}
          </h3>
          <p className="mt-1 text-sm text-[var(--muted)]">{tier.subhead}</p>
        </div>
        {isSell && tier.applyBadge ? (
          <span className="shrink-0 rounded-md border border-[var(--accent)] px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--accent)]">
            {tier.applyBadge}
          </span>
        ) : null}
      </div>

      <ul className="mb-5 space-y-1.5 text-sm leading-relaxed text-[var(--fg-soft)]">
        {tier.body.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

      <ul className="mb-6 flex-1 space-y-2 border-t border-[var(--border)] pt-4 text-sm text-[var(--muted)]">
        {tier.includes.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
            <span className="min-w-0">{item}</span>
          </li>
        ))}
      </ul>

      <Link
        href={href}
        className={[
          "inline-flex w-full items-center justify-center rounded-md px-4 py-3 text-center text-sm font-semibold transition sm:py-2.5",
          isSell
            ? "bg-[var(--accent)] text-[var(--accent-fg)] hover:bg-[var(--accent-bright)]"
            : "border border-[var(--border)] text-[var(--fg)] hover:border-[var(--fg-soft)]",
        ].join(" ")}
      >
        {tier.cta.label}
      </Link>
    </article>
  );
}
