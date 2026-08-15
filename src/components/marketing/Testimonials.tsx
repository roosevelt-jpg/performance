"use client";

import { useCms } from "@/components/cms/CmsProvider";
import { GatedLink } from "@/components/marketing/WatchGate";
import { TransformationCard } from "@/components/marketing/TransformationCard";

export function Testimonials() {
  const cms = useCms();
  const { testimonials, vsl } = cms.home;
  if (!testimonials.enabled) return null;

  const items = testimonials.items.filter(
    (item) => item.enabled && item.name && item.quote,
  );
  if (!items.length) return null;

  return (
    <section className="border-b border-[var(--border)]">
      <div className="mx-auto max-w-6xl px-4 section-y sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
          The difference
        </p>
        <h2 className="mt-3 font-heading text-[clamp(1.7rem,4.2vw,2.5rem)] text-[var(--fg)]">
          {testimonials.heading}
        </h2>
        {testimonials.subhead ? (
          <p className="mt-3 max-w-2xl text-base leading-[1.7] text-[var(--muted)]">
            {testimonials.subhead}
          </p>
        ) : null}

        <div className="-mx-4 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
          {items.map((item) => (
            <div
              key={item.id}
              className="w-[min(85vw,22rem)] shrink-0 snap-start sm:w-[min(45%,22rem)] lg:w-[calc((100%-2rem)/3)]"
            >
              <TransformationCard
                name={item.name}
                quote={item.quote}
                result={item.result}
                imageUrl={item.imageUrl}
                beforeImageUrl={item.beforeImageUrl}
                imageAlt={item.imageAlt}
              />
            </div>
          ))}
        </div>

        {vsl.enabled && vsl.applyCta.label ? (
          <div className="mt-10 text-center">
            <GatedLink
              href={vsl.applyCta.href}
              className="inline-flex w-full items-center justify-center rounded-md bg-[var(--accent)] px-6 py-3.5 text-sm font-semibold text-[var(--accent-fg)] transition hover:bg-[var(--accent-bright)] sm:w-auto"
            >
              {vsl.applyCta.label}
            </GatedLink>
          </div>
        ) : null}
      </div>
    </section>
  );
}
