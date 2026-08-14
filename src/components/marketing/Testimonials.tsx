"use client";

import { useCms } from "@/components/cms/CmsProvider";
import { GatedLink } from "@/components/marketing/WatchGate";

export function Testimonials() {
  const cms = useCms();
  const { testimonials, vsl } = cms.home;
  if (!testimonials.enabled) return null;

  const items = testimonials.items.filter((item) => item.enabled);
  if (!items.length) return null;

  return (
    <section className="border-b border-[var(--border)]">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <h2 className="font-heading text-[clamp(1.75rem,4vw,2.8rem)] uppercase text-[var(--fg)]">
          {testimonials.heading}
        </h2>
        {testimonials.subhead ? (
          <p className="mt-3 max-w-2xl text-base leading-[1.7] text-[var(--muted)]">
            {testimonials.subhead}
          </p>
        ) : null}

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.id}
              className="flex min-w-0 flex-col overflow-hidden rounded-[var(--radius)] border border-[var(--border-soft)] bg-[var(--surface)]"
            >
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imageUrl}
                  alt={item.imageAlt || item.name}
                  className="aspect-[4/5] w-full object-cover"
                />
              ) : (
                <div className="flex aspect-[4/5] items-end bg-[linear-gradient(180deg,#231f20_0%,#000_100%)] p-4">
                  <p className="font-heading text-3xl uppercase text-[var(--accent)]">
                    {item.result}
                  </p>
                </div>
              )}
              <div className="flex flex-1 flex-col p-5">
                <p className="text-sm leading-[1.7] text-[var(--fg-soft)]">
                  “{item.quote}”
                </p>
                <div className="mt-4 flex items-end justify-between gap-3">
                  <p className="text-sm font-semibold text-[var(--fg)]">
                    {item.name}
                  </p>
                  {item.result ? (
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
                      {item.result}
                    </p>
                  ) : null}
                </div>
              </div>
            </article>
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
