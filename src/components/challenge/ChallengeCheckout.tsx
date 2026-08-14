"use client";

import { useCms } from "@/components/cms/CmsProvider";
import { usePublicConfig } from "@/hooks/usePublicConfig";

function isEmbeddable(url: string): boolean {
  if (!url) return false;
  try {
    const u = new URL(url, window.location.origin);
    // Same-origin relative paths aren't embeds; external payment forms are.
    return u.origin !== window.location.origin;
  } catch {
    return false;
  }
}

export function ChallengeCheckout() {
  const cms = useCms();
  const ch = cms.challenge;
  const { config, loading } = usePublicConfig();
  const checkoutUrl = config.product.challengeCheckoutUrl.trim();
  const embedUrl = config.product.challengeCheckoutEmbedUrl.trim();
  const newTab = config.product.challengeCheckoutOpenInNewTab !== false;
  const showEmbed =
    Boolean(embedUrl) &&
    typeof window !== "undefined" &&
    isEmbeddable(embedUrl);
  const ready =
    Boolean(checkoutUrl) &&
    checkoutUrl !== "/challenge" &&
    checkoutUrl !== "/challenge#checkout";

  return (
    <section
      id="checkout"
      className="mt-10 scroll-mt-24 border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
        Self-serve checkout
      </p>
      <h2 className="mt-2 font-heading text-[clamp(1.5rem,3vw,2.4rem)] uppercase text-[var(--fg)]">
        {ch.checkoutHeading}
      </h2>
      <p className="mt-2 text-base leading-[1.7] text-[var(--muted)]">
        {ch.checkoutBody}
      </p>

      {loading ? (
        <p className="mt-6 text-sm text-[var(--muted)]">Loading checkout…</p>
      ) : null}

      {!loading && !ready && !showEmbed ? (
        <p className="mt-6 rounded-md border border-dashed border-[var(--border)] p-4 text-sm text-[var(--muted)]">
          Set the Challenge checkout URL in{" "}
          <a
            href="/admin/integrations"
            className="font-semibold text-[var(--accent)]"
          >
            Admin → Integrations
          </a>
          . Pro and Elite never checkout here.
        </p>
      ) : null}

      {showEmbed ? (
        <div className="mt-6 overflow-hidden border border-[var(--border)] bg-black">
          <iframe
            title="Challenge checkout"
            src={embedUrl}
            className="h-[min(720px,80vh)] w-full"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="payment *"
          />
        </div>
      ) : null}

      {ready ? (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <a
            href={checkoutUrl}
            target={newTab ? "_blank" : undefined}
            rel={newTab ? "noopener noreferrer" : undefined}
            className="inline-flex w-full items-center justify-center rounded-md bg-[var(--accent)] px-6 py-3.5 text-sm font-semibold text-[var(--accent-fg)] transition hover:bg-[var(--accent-bright)] sm:w-auto"
          >
            {ch.cta.label}
          </a>
          <p className="text-xs text-[var(--muted)] sm:max-w-xs">
            Secure checkout on The Formula store. Pro and Elite stay
            application-only — never sold here.
          </p>
        </div>
      ) : null}
    </section>
  );
}
