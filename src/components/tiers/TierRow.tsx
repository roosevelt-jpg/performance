"use client";

import { useCms } from "@/components/cms/CmsProvider";
import { TierCard } from "./TierCard";

export function TierRow() {
  const cms = useCms();
  const tiers = cms.tiers.filter((t) => t.enabled);
  const section = cms.home.tiersSection;

  const gridClass =
    tiers.length > 3
      ? "grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4"
      : "grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3";

  return (
    <section
      id="tiers"
      aria-labelledby="tiers-heading"
      className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-10 sm:px-6 sm:py-14 md:py-16"
    >
      <div className="mb-6 max-w-2xl sm:mb-8">
        <h2
          id="tiers-heading"
          className="font-heading text-[clamp(1.75rem,3.5vw,2.8rem)] uppercase text-[var(--fg)]"
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
