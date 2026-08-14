"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ChallengeCheckout } from "@/components/challenge/ChallengeCheckout";
import { useCms } from "@/components/cms/CmsProvider";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteChrome";
import { usePublicConfig } from "@/hooks/usePublicConfig";

function ChallengeContent() {
  const cms = useCms();
  const ch = cms.challenge;
  const params = useSearchParams();
  const { config } = usePublicConfig();
  const fromDisqualified = params.get("from") === "disqualified";
  const reasons = (params.get("reasons") ?? "").split(",").filter(Boolean);
  const checkoutDone = params.get("checkout") === "success";

  let reasonCopy: string | null = null;
  if (fromDisqualified) {
    const hasCommitment = reasons.includes("commitment");
    const hasInvestment = reasons.includes("investment");
    if (hasCommitment && hasInvestment) {
      reasonCopy = ch.disqualifyReasons.both;
    } else if (hasCommitment) {
      reasonCopy = ch.disqualifyReasons.commitment;
    } else if (hasInvestment) {
      reasonCopy = ch.disqualifyReasons.investment;
    } else {
      reasonCopy = ch.disqualifyReasons.commitment;
    }
  }

  const liveCheckout = config.product.challengeCheckoutUrl.trim();
  const primaryHref =
    liveCheckout && !liveCheckout.startsWith("/challenge")
      ? "#checkout"
      : ch.cta.href;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:py-12 md:py-16 lg:px-6">
      {reasonCopy ? (
        <div className="mb-8 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
            {ch.disqualifyEyebrow}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--fg-soft)]">
            {reasonCopy}
          </p>
        </div>
      ) : null}

      {checkoutDone ? (
        <div className="mb-8 rounded-lg border border-[var(--accent)] bg-[var(--accent-soft)] p-4 sm:p-5">
          <p className="text-sm font-semibold text-[var(--fg)]">
            You&apos;re in — thanks for joining the Challenge.
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Check your email for next steps from The Formula team.
          </p>
        </div>
      ) : null}

      <h1 className="font-heading text-[clamp(1.75rem,4vw,2.8rem)] text-[var(--fg)]">
        {ch.title}
      </h1>
      <p className="mt-3 text-base leading-[1.7] text-[var(--muted)]">
        {ch.body}
      </p>

      <Link
        href={primaryHref}
        className="mt-8 inline-flex w-full items-center justify-center rounded-md bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--accent-fg)] transition hover:bg-[var(--accent-bright)] sm:w-auto sm:py-2.5"
      >
        {ch.cta.label}
      </Link>

      <ChallengeCheckout />
    </div>
  );
}

export default function ChallengePage() {
  return (
    <main className="flex min-h-dvh flex-1 flex-col">
      <SiteHeader />
      <div className="flex-1">
        <Suspense
          fallback={
            <div className="px-4 py-16 text-center text-sm text-[var(--muted)]">
              Loading…
            </div>
          }
        >
          <ChallengeContent />
        </Suspense>
      </div>
      <SiteFooter />
    </main>
  );
}
