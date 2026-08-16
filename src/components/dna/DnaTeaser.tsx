"use client";

import Link from "next/link";
import { useCms } from "@/components/cms/CmsProvider";

export function DnaTeaser() {
  const dna = useCms().dna;
  if (!dna.enabled) return null;
  return (
    <section className="border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto max-w-6xl px-4 section-y sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
          {dna.eyebrow}
        </p>
        <h2 className="mt-3 max-w-3xl font-heading text-[clamp(1.7rem,4.2vw,2.5rem)] text-[var(--fg)]">
          {dna.heading}
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-[1.7] text-[var(--muted)]">
          {dna.body}
        </p>
        <Link
          href={dna.href || "/dna"}
          className="mt-7 inline-flex items-center justify-center rounded-md bg-[var(--accent)] px-6 py-3.5 text-sm font-semibold text-[var(--accent-fg)] transition hover:bg-[var(--accent-bright)]"
        >
          {dna.ctaLabel}
        </Link>
      </div>
    </section>
  );
}
