"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useCms } from "@/components/cms/CmsProvider";
import { FunnelChat } from "@/components/funnel/FunnelChat";
import { GatedLink } from "@/components/marketing/WatchGate";
import { usePublicConfig } from "@/hooks/usePublicConfig";

const EMAIL_KEY = "tfp-email-popup";
const REVIEW_KEY = "tfp-review-popup";

function dismissedRecently(key: string, days = 7): boolean {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return false;
    const at = Number(raw);
    if (!Number.isFinite(at)) return false;
    return Date.now() - at < days * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function dismiss(key: string) {
  try {
    localStorage.setItem(key, String(Date.now()));
  } catch {
    /* ignore */
  }
}

function pageScrollRatio(): number {
  const el = document.documentElement;
  const total = el.scrollHeight - window.innerHeight;
  if (total <= 0) return 0;
  return window.scrollY / total;
}

/** Never on arrival. Requires 50% page scroll, then exit intent (desktop) or the scroll itself (touch). */
function useDeferredPopup(enabled: boolean) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
  }, [open]);

  useEffect(() => {
    if (!enabled) return;
    let scrolled = false;
    let shown = false;

    function show() {
      if (shown) return;
      shown = true;
      setOpen(true);
    }

    function onScroll() {
      if (pageScrollRatio() < 0.5) return;
      scrolled = true;
      if (window.matchMedia("(pointer: coarse)").matches) show();
    }

    function onMouseOut(event: MouseEvent) {
      if (!scrolled) return;
      if (event.clientY > 0) return;
      show();
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("mouseout", onMouseOut);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mouseout", onMouseOut);
    };
  }, [enabled]);

  return [open, setOpen] as const;
}

export function SiteWidgets() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return (
    <>
      <EmailPopup />
      <ReviewsPopup />
      <StickyApplyBar />
      <FunnelChat />
    </>
  );
}

function EmailPopup() {
  const popup = useCms().home.popups?.email;
  const { config } = usePublicConfig();
  const [open, setOpen] = useDeferredPopup(Boolean(popup?.enabled));
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">(
    "idle",
  );
  const [error, setError] = useState("");

  if (!popup?.enabled || !open || dismissedRecently(EMAIL_KEY)) return null;

  async function submit() {
    setStatus("saving");
    setError("");
    try {
      const res = await fetch("/api/email-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setStatus("error");
        setError(json.error ?? "Could not save that email.");
        return;
      }
      setStatus("done");
      dismiss(EMAIL_KEY);
    } catch {
      setStatus("error");
      setError("Could not save that email.");
    }
  }

  function close() {
    dismiss(EMAIL_KEY);
    setOpen(false);
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/75 p-3 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="email-popup-title"
    >
      <div className="w-full max-w-md border border-[var(--border)] bg-[var(--bg)] p-5 sm:p-7">
        <h2
          id="email-popup-title"
          className="font-heading text-xl text-[var(--fg)] sm:text-2xl"
        >
          {popup.title}
        </h2>
        <p className="mt-3 text-sm leading-[1.7] text-[var(--muted)] sm:text-base">
          {popup.body}
        </p>
        {status === "done" ? (
          <p className="mt-5 text-sm text-[var(--accent)]">{popup.success}</p>
        ) : (
          <form
            className="mt-5 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
          >
            <input
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-base text-[var(--fg)] outline-none focus:border-[var(--accent)]"
              placeholder={popup.placeholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {!config.emailSignup?.enabled ? (
              <p className="text-xs text-[var(--muted)]">
                Connect an email provider on Integrations to collect signups live.
              </p>
            ) : null}
            {error ? (
              <p className="text-xs text-red-400" role="alert">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={status === "saving"}
              className="inline-flex w-full items-center justify-center rounded-md bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--accent-fg)] disabled:opacity-60"
            >
              {status === "saving" ? "Saving…" : popup.cta}
            </button>
          </form>
        )}
        <p className="mt-3 text-xs leading-[1.7] text-[var(--muted)]">
          {popup.privacy}
        </p>
        <button
          type="button"
          className="mt-4 text-sm text-[var(--muted)] hover:text-[var(--fg)]"
          onClick={close}
        >
          Close
        </button>
      </div>
    </div>
  );
}

function ReviewsPopup() {
  const cms = useCms();
  const popup = cms.home.popups?.reviews;
  const items = (cms.home.testimonials?.items ?? []).filter(
    (t) => t.enabled && t.quote && t.name,
  );
  const [open, setOpen] = useDeferredPopup(
    Boolean(popup?.enabled && items.length && !dismissedRecently(REVIEW_KEY)),
  );
  const [index, setIndex] = useState(0);

  if (!popup?.enabled || !open || !items.length) return null;

  const item = items[index % items.length];

  function close() {
    dismiss(REVIEW_KEY);
    setOpen(false);
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/75 p-3 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reviews-popup-title"
    >
      <div className="w-full max-w-md overflow-hidden border border-[var(--border)] bg-[var(--bg)]">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt={item.imageAlt || item.name}
            className="max-h-56 w-full object-cover"
          />
        ) : null}
        <div className="p-5 sm:p-7">
          <h2
            id="reviews-popup-title"
            className="font-heading text-xl text-[var(--fg)] sm:text-2xl"
          >
            {popup.title}
          </h2>
          <p className="mt-4 text-sm leading-[1.7] text-[var(--fg-soft)] sm:text-base">
            “{item.quote}”
          </p>
          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-[var(--fg)]">{item.name}</p>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
              {item.result}
            </p>
          </div>
          {items.length > 1 ? (
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                className="text-sm text-[var(--muted)] hover:text-[var(--fg)]"
                onClick={() =>
                  setIndex((i) => (i + items.length - 1) % items.length)
                }
              >
                Previous
              </button>
              <button
                type="button"
                className="text-sm text-[var(--muted)] hover:text-[var(--fg)]"
                onClick={() => setIndex((i) => (i + 1) % items.length)}
              >
                Next
              </button>
            </div>
          ) : null}
          <GatedLink
            href={popup.ctaHref}
            className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--accent-fg)]"
          >
            {popup.ctaLabel}
          </GatedLink>
          <button
            type="button"
            className="mt-4 w-full text-sm text-[var(--muted)] hover:text-[var(--fg)]"
            onClick={close}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function StickyApplyBar() {
  const sticky = useCms().home.stickyCta;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!sticky?.enabled) return;
    const hero = document.getElementById("hero");
    if (!hero) {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 },
    );
    io.observe(hero);
    return () => io.disconnect();
  }, [sticky?.enabled]);

  if (!sticky?.enabled || !visible) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-50 border-b border-[var(--border)] bg-[var(--bg)]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        <p className="hidden text-sm text-[var(--muted)] sm:block">
          The Formula Performance
        </p>
        <GatedLink
          href={sticky.href}
          gate={sticky.href.includes("/book")}
          className="inline-flex w-full items-center justify-center rounded-md bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-fg)] sm:w-auto"
        >
          {sticky.label}
        </GatedLink>
      </div>
    </div>
  );
}
