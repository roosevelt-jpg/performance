/**
 * Section 8 open items — assumed until confirmed.
 * Swap values in env / content configs; do not scatter literals elsewhere.
 */
export const SECTION_8_ASSUMPTIONS = {
  pricing: {
    status: "assumed" as const,
    note: "Pro £297 / Elite £497 — Q9 only, never on public cards. Set NEXT_PUBLIC_PRICE_PRO / NEXT_PUBLIC_PRICE_ELITE.",
  },
  entryTier: {
    status: "assumed" as const,
    note: "No fourth entry tier. Tier row is array-driven; set NEXT_PUBLIC_SHOW_ENTRY_TIER=true + entry config to add one.",
  },
  calendarPlatform: {
    status: "assumed" as const,
    note: 'Default "ghl". Set NEXT_PUBLIC_CALENDAR_PLATFORM to "calendly" to swap via adapter.',
  },
  cardCopy: {
    status: "assumed" as const,
    note: "Section 2 copy treated as build-ready in src/lib/content/tier-cards.ts.",
  },
  q10WhatsAppConflict: {
    status: "resolved_per_section_7" as const,
    note: "Q10 table lists WhatsApp on the form; Section 7 + acceptance checklist put WhatsApp on confirmation only. Implemented: privacy on Q10, WhatsApp on confirmation.",
  },
} as const;
