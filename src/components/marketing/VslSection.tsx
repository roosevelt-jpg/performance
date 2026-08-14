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
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
          {vsl.stepLabel}
        </p>
        <h2 className="mt-3 font-heading text-[clamp(1.75rem,4vw,2.8rem)] uppercase text-[var(--fg)]">
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
            <div className="flex aspect-video items-center justify-center border border-dashed border-[var(--border)] bg-black text-center text-sm text-[var(--muted)]">
              Paste a YouTube URL in Admin → Home / Media → VSL video
            </div>
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
