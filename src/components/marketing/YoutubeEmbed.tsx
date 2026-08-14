"use client";

import { useState } from "react";
import {
  extractYoutubeId,
  youtubeEmbedSrc,
  youtubeThumbUrl,
} from "@/lib/media/youtube";

type Props = {
  youtubeUrl: string;
  title: string;
  thumbnailUrl?: string;
  muteHint?: string;
  onPlay?: () => void;
};

export function YoutubeEmbed({
  youtubeUrl,
  title,
  thumbnailUrl,
  muteHint,
  onPlay,
}: Props) {
  const [playing, setPlaying] = useState(false);
  const id = extractYoutubeId(youtubeUrl);

  if (!id) {
    return (
      <div className="flex aspect-video items-center justify-center border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--muted)]">
        Add a valid YouTube URL in Admin
      </div>
    );
  }

  const poster = thumbnailUrl?.trim() || youtubeThumbUrl(id);

  if (playing) {
    return (
      <div className="aspect-video overflow-hidden border border-[var(--border)] bg-black">
        <iframe
          className="h-full w-full"
          src={youtubeEmbedSrc(id, true)}
          title={title || "YouTube video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setPlaying(true);
        onPlay?.();
      }}
      className="group relative block aspect-video w-full overflow-hidden border border-[var(--border)] bg-black text-left"
      aria-label={`Play ${title || "video"}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={poster}
        alt=""
        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
      />
      <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-fg)] shadow-lg transition group-hover:scale-105">
          <svg viewBox="0 0 24 24" className="ml-0.5 h-6 w-6 fill-current" aria-hidden>
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </span>
      {muteHint ? (
        <span className="absolute left-3 top-3 rounded-md bg-black/70 px-2.5 py-1 text-xs font-semibold text-white">
          {muteHint}
        </span>
      ) : null}
      {title ? (
        <span className="absolute bottom-3 left-3 right-3 text-sm font-semibold text-white sm:text-base">
          {title}
        </span>
      ) : null}
    </button>
  );
}
