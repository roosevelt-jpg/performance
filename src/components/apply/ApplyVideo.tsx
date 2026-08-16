"use client";

import { useEffect, useRef, useState } from "react";
import {
  extractYoutubeId,
  youtubeThumbUrl,
} from "@/lib/media/youtube";

type Props = {
  youtubeUrl: string;
  title: string;
  muteHint?: string;
  onProgress: (pct: number) => void;
};

type YtPlayer = {
  getCurrentTime: () => number;
  getDuration: () => number;
  destroy: () => void;
  mute: () => void;
  unMute: () => void;
  playVideo: () => void;
  pauseVideo: () => void;
  getPlayerState: () => number;
};

declare global {
  interface Window {
    YT?: {
      Player: new (
        el: HTMLElement,
        opts: Record<string, unknown>,
      ) => YtPlayer;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

function loadApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  return new Promise((resolve) => {
    const existing = document.getElementById("yt-iframe-api");
    if (existing) {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prev?.();
        resolve();
      };
      return;
    }
    window.onYouTubeIframeAPIReady = () => resolve();
    const script = document.createElement("script");
    script.id = "yt-iframe-api";
    script.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(script);
  });
}

export function ApplyVideo({ youtubeUrl, title, muteHint, onProgress }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YtPlayer | null>(null);
  const lastPct = useRef(0);
  const id = extractYoutubeId(youtubeUrl);
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!id || !mountRef.current) return;
    let timer: number | undefined;
    let elapsedTimer: number | undefined;
    let cancelled = false;
    const startedAt = Date.now();
    let sawDuration = false;

    function report(pct: number) {
      const next = Math.min(100, Math.max(0, Math.round(pct)));
      if (next <= lastPct.current) return;
      lastPct.current = next;
      onProgress(next);
    }

    void loadApi().then(() => {
      if (cancelled || !mountRef.current || !window.YT?.Player) return;
      const player = new window.YT.Player(mountRef.current, {
        videoId: id,
        playerVars: {
          autoplay: 1,
          mute: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
        },
        events: {
          onReady: () => {
            try {
              player.mute();
              player.playVideo();
            } catch {
              /* ignore */
            }
            timer = window.setInterval(() => {
              try {
                const duration = player.getDuration();
                const current = player.getCurrentTime();
                if (duration > 0) {
                  sawDuration = true;
                  report((current / duration) * 100);
                }
              } catch {
                /* player gone */
              }
            }, 800);
          },
        },
      });
      playerRef.current = player;
    });

    elapsedTimer = window.setInterval(() => {
      if (sawDuration) return;
      const elapsedSec = (Date.now() - startedAt) / 1000;
      report((elapsedSec / 180) * 100);
    }, 1000);

    return () => {
      cancelled = true;
      if (timer) window.clearInterval(timer);
      if (elapsedTimer) window.clearInterval(elapsedTimer);
      try {
        playerRef.current?.destroy();
      } catch {
        /* ignore */
      }
    };
  }, [id, onProgress]);

  if (!id) {
    return (
      <div className="flex aspect-video items-center justify-center border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--muted)]">
        Add a YouTube URL in Admin → Content
      </div>
    );
  }

  function tapSound() {
    const player = playerRef.current;
    if (!player) return;
    try {
      player.unMute();
      player.playVideo();
      setMuted(false);
      setPaused(false);
    } catch {
      /* ignore */
    }
  }

  function togglePause() {
    const player = playerRef.current;
    if (!player) return;
    try {
      if (paused) {
        player.playVideo();
        setPaused(false);
      } else {
        player.pauseVideo();
        setPaused(true);
      }
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="overflow-hidden rounded-[var(--radius)] border border-[var(--border-soft)] bg-black">
      <div className="relative aspect-video">
        <div ref={mountRef} className="absolute inset-0 h-full w-full" />
        {muted ? (
          <button
            type="button"
            onClick={tapSound}
            className="absolute left-3 top-3 rounded-md bg-black/75 px-2.5 py-1 text-xs font-semibold text-white"
          >
            {muteHint || "Tap for sound"}
          </button>
        ) : null}
        <button
          type="button"
          onClick={togglePause}
          className="absolute bottom-3 left-3 rounded-md bg-black/75 px-2.5 py-1 text-xs font-semibold text-white"
        >
          {paused ? "Play" : "Pause"}
        </button>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={youtubeThumbUrl(id)} alt={title} className="hidden" />
    </div>
  );
}
