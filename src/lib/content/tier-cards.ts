/**
 * Section 8 item 4 — all landing-card copy in one place.
 * Array-driven so a 4th entry tier is a config edit, not a rewrite.
 */

export type TierCta =
  | { kind: "checkout"; href: string; label: string }
  | { kind: "book"; tier: "pro" | "elite"; label: string }
  | { kind: "link"; href: string; label: string };

export type TierCardContent = {
  id: string;
  name: string;
  badge?: string;
  subhead: string;
  body: string[];
  includes: string[];
  highlight?: boolean;
  cta: TierCta;
  /** When false, card is omitted from the row. */
  enabled: boolean;
};

export type TierRowOptions = {
  challengeCheckoutUrl?: string;
  showEntryTier?: boolean;
};

export function buildTierCards(options: TierRowOptions = {}): TierCardContent[] {
  const challengeCheckout =
    options.challengeCheckoutUrl ??
    process.env.NEXT_PUBLIC_CHALLENGE_CHECKOUT_URL ??
    "/challenge";
  const showEntryTier =
    options.showEntryTier ??
    process.env.NEXT_PUBLIC_SHOW_ENTRY_TIER === "true";

  return [
    {
      id: "entry",
      name: "Starter",
      subhead: "Self-serve",
      body: [
        "A lighter way in.",
        "Build the habit first.",
        "Step up when you are ready.",
      ],
      includes: ["Guided plan", "Community access"],
      cta: { kind: "link", href: challengeCheckout, label: "Learn more" },
      enabled: showEntryTier,
    },
    {
      id: "challenge",
      name: "The 8-Week Performance Challenge",
      badge: "Live",
      subhead: "Self-serve · Already built",
      body: [
        "You'll know exactly what changed.",
        "Week 1 baseline. Week 8 re-test.",
        "A coach tracking you the whole way.",
      ],
      includes: [
        "One-to-one coach",
        "Coach tracking and check-ins",
        "Food tracking and nutrition advice",
        "Community group access",
        "Leaderboard incentive challenge",
      ],
      cta: {
        kind: "checkout",
        href: challengeCheckout,
        label: "Join the Challenge",
      },
      enabled: true,
    },
    {
      id: "pro",
      name: "Pro",
      subhead: "Booking only",
      body: [
        "Your programme, written for you.",
        "Daily accountability that doesn't wait for you to check in.",
        "Real-time adjustments when the week changes.",
        "Places are limited. By application.",
      ],
      includes: [
        "Personalised training",
        "Nutrition guidance",
        "Daily accountability",
        "Direct coaching",
        "Real-time programme adjustments",
        "Performance testing",
        "Week 1 → Week 8 progress tracking",
      ],
      highlight: true,
      cta: { kind: "book", tier: "pro", label: "See If You're a Fit" },
      enabled: true,
    },
    {
      id: "elite",
      name: "Elite",
      subhead: "Booking only",
      body: [
        "Kane and the performance team, in your corner.",
        "Fully bespoke. Built for you.",
        "Single-figure intake.",
        "By application.",
      ],
      includes: [
        "Everything in Pro",
        "Built with Kane personally",
        "Closer contact when the week gets messy",
        "Video form review",
        "Priority access, first response",
      ],
      highlight: true,
      cta: { kind: "book", tier: "elite", label: "See If You're a Fit" },
      enabled: true,
    },
  ];
}

/** @deprecated Prefer buildTierCards + getVisibleTier with options from integrations. */
export const TIER_CARDS = buildTierCards();

export function getVisibleTier(
  options?: TierRowOptions,
): TierCardContent[] {
  return buildTierCards(options).filter((t) => t.enabled);
}
