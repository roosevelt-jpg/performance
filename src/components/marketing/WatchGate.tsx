"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { useCms } from "@/components/cms/CmsProvider";
import { extractYoutubeId } from "@/lib/media/youtube";

const STORAGE_KEY = "tfp-vsl-watched";

type WatchGateContextValue = {
  watched: boolean;
  gated: boolean;
  markWatched: () => void;
  requestApply: (href: string) => boolean;
};

const WatchGateContext = createContext<WatchGateContextValue>({
  watched: false,
  gated: false,
  markWatched: () => {},
  requestApply: () => true,
});

export function WatchGateProvider({ children }: { children: ReactNode }) {
  const vsl = useCms().home.vsl;
  const hasVideo = Boolean(extractYoutubeId(vsl.youtubeUrl));
  const gated = Boolean(vsl.enabled && vsl.requireWatch && hasVideo);
  const [watched, setWatched] = useState(false);
  const [blockedHref, setBlockedHref] = useState<string | null>(null);

  useEffect(() => {
    try {
      setWatched(sessionStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  const markWatched = useCallback(() => {
    setWatched(true);
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
  }, []);

  const requestApply = useCallback(
    (href: string) => {
      if (!gated || watched) return true;
      setBlockedHref(href);
      return false;
    },
    [gated, watched],
  );

  const value = useMemo(
    () => ({ watched, gated, markWatched, requestApply }),
    [watched, gated, markWatched, requestApply],
  );

  return (
    <WatchGateContext.Provider value={value}>
      {children}
      {blockedHref ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="watch-gate-title"
        >
          <div className="w-full max-w-lg border border-[var(--border)] bg-[var(--bg)] p-5 sm:p-7">
            <p
              id="watch-gate-title"
              className="font-heading text-2xl text-[var(--fg)]"
            >
              {vsl.gateTitle}
            </p>
            <p className="mt-3 text-base leading-[1.7] text-[var(--muted)]">
              {vsl.gateBody}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href="#vsl"
                className="inline-flex flex-1 items-center justify-center rounded-md bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--accent-fg)]"
                onClick={() => setBlockedHref(null)}
              >
                {vsl.gateCta}
              </a>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md border border-[var(--border)] px-5 py-3 text-sm font-semibold text-[var(--fg)]"
                onClick={() => setBlockedHref(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </WatchGateContext.Provider>
  );
}

export function useWatchGate() {
  return useContext(WatchGateContext);
}

export function GatedLink({
  href,
  className,
  children,
  gate = true,
}: {
  href: string;
  className?: string;
  children: ReactNode;
  gate?: boolean;
}) {
  const { requestApply } = useWatchGate();

  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!gate) return;
    const ok = requestApply(href);
    if (!ok) event.preventDefault();
  }

  return (
    <a href={href} className={className} onClick={onClick}>
      {children}
    </a>
  );
}
