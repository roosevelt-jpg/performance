"use client";

import Link from "next/link";
import { GatedLink } from "@/components/marketing/WatchGate";
import type { CmsTier } from "@/lib/cms/types";
import { useCms } from "@/components/cms/CmsProvider";
import { ChallengeOffer } from "@/components/marketing/ChallengeOffer";
import {
  formatPublicBilling,
  isApplicationOnlyTier,
  publicTierHref,
} from "@/lib/cms/tierCommerce";

type Props = {
  tier: CmsTier;
};

export function TierCard({ tier }: Props) {
  const { tiersSection } = useCms().home;
  const isSell = tier.cta.kind === "book";
  const isChallenge = tier.id === "challenge" && tier.cta.kind === "checkout";
  const href = publicTierHref(tier);
  const billing = formatPublicBilling(tier);
  const showPrice =
    !isApplicationOnlyTier(tier) &&
    !isChallenge &&
    (tier.priceAmount > 0 || tier.recurringAmount > 0 || Boolean(billing));
  const guarantee = tiersSection.guarantee;

  return (
    <article
      className={[
        "card-depth flex h-full min-w-0 flex-col rounded-[var(--radius)] border p-4 sm:p-5 md:p-6",
        tier.highlight
          ? "border-[var(--accent)] bg-[var(--surface-elevated)]"
          : "border-[var(--border)] bg-[var(--surface)]",
      ].join(" ")}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          {tier.badge ? (
            <span className="mb-2 inline-block rounded-md bg-[var(--accent-soft)] px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
              {tier.badge}
            </span>
          ) : null}
          <h3 className="font-heading text-xl text-[var(--fg)] sm:text-2xl">
            {tier.name}
          </h3>
          <p className="mt-1 text-sm text-[var(--muted)]">{tier.subhead}</p>
          {showPrice ? (
            <p className="mt-2 font-heading text-lg leading-snug text-[var(--fg)] sm:text-xl">
              {billing || `£${tier.priceAmount}`}
            </p>
          ) : null}
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

      {isChallenge && tiersSection.offer ? (
        <ChallengeOffer offer={tiersSection.offer} />
      ) : null}

      {isSell ? (
        <GatedLink
          href={href}
          className="inline-flex w-full items-center justify-center rounded-md bg-[var(--accent)] px-4 py-3 text-center text-sm font-semibold text-[var(--accent-fg)] transition hover:bg-[var(--accent-bright)] sm:py-2.5"
        >
          {tier.cta.label}
        </GatedLink>
      ) : (
        <Link
          href={href}
          className="inline-flex w-full items-center justify-center rounded-md border border-[var(--border-soft)] px-4 py-3 text-center text-sm font-semibold text-[var(--fg)] transition hover:border-[var(--fg-soft)] sm:py-2.5"
        >
          {tier.cta.label}
        </Link>
      )}
      {isChallenge && guarantee?.enabled ? (
        <div className="mt-3 space-y-1 text-center text-xs text-[var(--muted)]">
          {guarantee.trustLine ? <p>{guarantee.trustLine}</p> : null}
          {guarantee.guarantee ? <p>{guarantee.guarantee}</p> : null}
        </div>
      ) : null}
    </article>
  );
}
