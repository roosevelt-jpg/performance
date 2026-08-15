"use client";

import { useCms } from "@/components/cms/CmsProvider";

export function CredentialsSection() {
  const { credentials } = useCms().home;
  if (!credentials?.enabled) return null;

  return (
    <section className="section-vignette border-b border-[var(--border)]">
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 section-y sm:px-6 md:grid-cols-2 md:gap-16">
        {credentials.imageUrl ? (
          <div className="relative overflow-hidden rounded-[var(--radius)] border border-[var(--border)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={credentials.imageUrl}
              alt={credentials.imageAlt || credentials.heading}
              className="aspect-[4/3] w-full object-cover object-[42%_24%] grayscale-[0.15] contrast-[1.04]"
            />
            {credentials.followerCount && credentials.followerHref ? (
              <a
                href={credentials.followerHref}
                target="_blank"
                rel="noreferrer"
                className="absolute right-3 top-3 rounded-full border border-white/15 bg-black/55 px-3 py-1 text-xs font-semibold text-[var(--fg)] backdrop-blur"
              >
                {credentials.followerCount} on Instagram
              </a>
            ) : null}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-[linear-gradient(0deg,rgba(10,10,10,0.92),transparent)] p-[18px]">
              <p className="font-heading text-[1.4rem] text-[var(--fg)]">Kane Mousah</p>
              {credentials.caption ? (
                <p className="mt-1 text-[0.74rem] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                  {credentials.caption}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
            {credentials.eyebrow}
          </p>
          <h2 className="mt-3 max-w-3xl font-heading text-[clamp(1.7rem,4.2vw,2.5rem)] text-[var(--fg)]">
            {credentials.heading}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-[1.7] text-[var(--muted)] sm:text-lg">
            {credentials.body}
          </p>
          <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3">
            {credentials.items
              .filter((item) => item.value.trim() || item.label.trim())
              .map((item) => (
              <div key={item.id}>
                <p className="font-heading text-2xl text-[var(--accent)] sm:text-[1.7rem]">
                  {item.value}
                </p>
                <p className="mt-1 text-sm text-[var(--muted)]">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
