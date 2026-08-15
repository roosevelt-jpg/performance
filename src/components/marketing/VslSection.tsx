"use client";

import { useCms } from "@/components/cms/CmsProvider";
import { GatedLink, useWatchGate } from "@/components/marketing/WatchGate";
import { YoutubeEmbed } from "@/components/marketing/YoutubeEmbed";
import { extractYoutubeId } from "@/lib/media/youtube";

export function VslSection() {
  const { vsl } = useCms().home;
  const { markWatched } = useWatchGate();
  if (!vsl.enabled) return null;

  const hasVideo = Boolean(extractYoutubeId(vsl.youtubeUrl));

  return (
    <section
      id="vsl"
      className="scroll-mt-24 border-b border-[var(--border)] bg-[var(--surface)]"
    >
      <div className="mx-auto max-w-3xl px-4 section-y sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
          {vsl.stepLabel}
        </p>
        <h2 className="mt-3 font-heading text-[clamp(1.7rem,4.2vw,2.5rem)] text-[var(--fg)]">
          {vsl.heading}
        </h2>

        <div className="mt-8">
          {hasVideo ? (
            <YoutubeEmbed
              youtubeUrl={vsl.youtubeUrl}
              title={vsl.heading}
              thumbnailUrl={vsl.thumbnailUrl}
              muteHint={vsl.muteHint}
              onPlay={markWatched}
            />
          ) : (
            <div className="aspect-video border border-[var(--border)] bg-black" />
          )}
        </div>

        {vsl.helper ? (
          <p className="mt-5 text-base leading-[1.7] text-[var(--muted)]">
            {vsl.helper}
          </p>
        ) : null}

        <div className="mt-10 border-t border-[var(--border)] pt-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            {vsl.applyStepLabel}
          </p>
          <GatedLink
            href={vsl.applyCta.href}
            className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-[var(--accent)] px-6 py-3.5 text-sm font-semibold text-[var(--accent-fg)] transition hover:bg-[var(--accent-bright)] sm:w-auto"
          >
            {vsl.applyCta.label}
          </GatedLink>
          {vsl.applyNote ? (
            <p className="mt-3 text-sm text-[var(--muted)]">{vsl.applyNote}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
