"use client";

import type { CmsChallengeOffer } from "@/lib/cms/types";

export function ChallengeOffer({ offer }: { offer: CmsChallengeOffer }) {
  if (!offer?.enabled) return null;

  const hasAny =
    Boolean(offer.livePrice) ||
    Boolean(offer.anchorPrice) ||
    Boolean(offer.totalSaving) ||
    Boolean(offer.addonPrice) ||
    Boolean(offer.recurringTerms) ||
    Boolean(offer.offerEnd) ||
    Boolean(offer.placesRemaining);

  if (!hasAny) return null;

  return (
    <div className="mb-5 border-t border-[var(--border)] pt-4">
      {offer.anchorPrice || offer.livePrice ? (
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          {offer.anchorPrice ? (
            <span className="text-sm text-[var(--muted)] line-through">
              {offer.anchorPrice}
            </span>
          ) : null}
          {offer.livePrice ? (
            <span className="font-heading text-3xl text-[var(--accent)]">
              {offer.livePrice}
            </span>
          ) : null}
        </div>
      ) : null}
      {offer.totalSaving ? (
        <p className="mt-1 font-heading text-2xl text-[var(--fg)]">
          {offer.totalSaving}
        </p>
      ) : null}
      {offer.addonLabel && (offer.addonValue || offer.addonPrice) ? (
        <p className="mt-3 text-sm text-[var(--muted)]">
          {offer.addonLabel}
          {offer.addonValue ? ` · ${offer.addonValue}` : ""}
          {offer.addonPrice ? ` · ${offer.addonPrice}` : ""}
        </p>
      ) : null}
      {offer.recurringTerms ? (
        <p className="mt-2 text-sm leading-[1.6] text-[var(--muted)]">
          {offer.recurringTerms}
        </p>
      ) : null}
      {offer.offerEnd || offer.placesRemaining ? (
        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--accent)]">
          {[offer.offerEnd, offer.placesRemaining].filter(Boolean).join(" · ")}
        </p>
      ) : null}
    </div>
  );
}
