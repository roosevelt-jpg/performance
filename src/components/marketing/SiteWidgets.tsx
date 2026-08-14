"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useCms } from "@/components/cms/CmsProvider";
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

export function SiteWidgets() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return (
    <>
      <EmailPopup />
      <ReviewsPopup />
      <StickyApplyBar />
    </>
  );
}

function EmailPopup() {
  const popup = useCms().home.popups?.email;
  const { config } = usePublicConfig();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">(
    "idle",
  );
  const [error, setError] = useState("");

  useEffect(() => {
    if (!popup?.enabled) return;
    if (dismissedRecently(EMAIL_KEY)) return;
    const id = window.setTimeout(() => setOpen(true), popup.delayMs || 18000);
    return () => window.clearTimeout(id);
  }, [popup?.enabled, popup?.delayMs]);

  if (!popup?.enabled || !open) return null;

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
          className="font-heading text-xl uppercase text-[var(--fg)] sm:text-2xl"
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
  const items = (cms.home.testimonials?.items ?? []).filter((t) => t.enabled);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!popup?.enabled || !items.length) return;
    if (dismissedRecently(REVIEW_KEY)) return;
    const id = window.setTimeout(() => setOpen(true), popup.delayMs || 28000);
    return () => window.clearTimeout(id);
  }, [popup?.enabled, popup?.delayMs, items.length]);

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
            className="font-heading text-xl uppercase text-[var(--fg)] sm:text-2xl"
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
  if (!sticky?.enabled) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border-soft)] bg-[var(--bg)]/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
      <GatedLink
        href={sticky.href}
        gate={sticky.href.includes("/book")}
        className="inline-flex w-full items-center justify-center rounded-md bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--accent-fg)]"
      >
        {sticky.label}
      </GatedLink>
    </div>
  );
}
