"use client";

import { useCms } from "@/components/cms/CmsProvider";
import { GatedLink } from "@/components/marketing/WatchGate";

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
        <h2 className="font-heading text-[clamp(1.7rem,4.2vw,2.5rem)] text-[var(--fg)]">
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
              className="card-depth flex min-w-0 flex-col overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)]"
            >
              {item.beforeImageUrl || item.imageUrl ? (
                <div
                  className={
                    item.beforeImageUrl && item.imageUrl
                      ? "grid grid-cols-2"
                      : ""
                  }
                >
                  {item.beforeImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.beforeImageUrl}
                      alt={`${item.name} before`}
                      className="aspect-[4/5] w-full object-cover"
                    />
                  ) : null}
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt={item.imageAlt || item.name}
                      className="aspect-[4/5] w-full object-cover"
                    />
                  ) : null}
                </div>
              ) : null}
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
