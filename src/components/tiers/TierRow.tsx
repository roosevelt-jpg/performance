"use client";

import { useCms } from "@/components/cms/CmsProvider";
import { usePublicConfig } from "@/hooks/usePublicConfig";
import { TierCard } from "./TierCard";

export function TierRow() {
  const cms = useCms();
  const { config } = usePublicConfig();
  const tiers = cms.tiers.filter((t) => {
    if (t.id === "entry") return t.enabled || config.product.showEntryTier;
    return t.enabled;
  });
  const section = cms.home.tiersSection;

  const gridClass =
    tiers.length > 3
      ? "grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4"
      : "grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3";

  return (
    <section
      id="tiers"
      aria-labelledby="tiers-heading"
      className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 section-y sm:px-6"
    >
      <div className="mb-8 max-w-2xl">
        <h2
          id="tiers-heading"
          className="font-heading text-[clamp(1.7rem,4.2vw,2.5rem)] text-[var(--fg)]"
        >
          {section.heading}
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)] sm:text-base">
          {section.subhead}
        </p>
      </div>

      <div className={gridClass}>
        {tiers.map((tier) => (
          <TierCard key={tier.id} tier={tier} />
        ))}
      </div>
    </section>
  );
}
