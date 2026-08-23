"use client";

import { useEffect, useState } from "react";
import { WhatsAppLanguageSelect } from "@/components/forms/I18nSelects";

type Template = {
  id: string;
  name: string;
  language: string;
  category: string;
  status: string;
  bodyText: string;
  rejectedReason?: string;
};

const inputClass =
  "mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-base text-[var(--fg)] outline-none focus:border-[var(--accent)] sm:text-sm";

const CATEGORIES = ["UTILITY", "MARKETING", "AUTHENTICATION"] as const;

function statusColor(status: string): string {
  if (status === "APPROVED") return "text-[var(--accent)]";
  if (status === "REJECTED") return "text-red-400";
  return "text-[var(--muted)]";
}

/** Create and review WhatsApp message templates directly from Meta's Business
 * Management API. Meta reviews every template asynchronously (minutes to a
 * day) — there's nothing to "sync" beyond re-fetching the live status below. */
export function WhatsAppTemplatesManager() {
  const [templates, setTemplates] = useState<Template[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("UTILITY");
  const [language, setLanguage] = useState("en");
  const [bodyText, setBodyText] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createdNote, setCreatedNote] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/admin/whatsapp-templates");
      const body = await res.json();
      if (!res.ok) {
        setLoadError(body.error ?? "Could not load templates.");
        setTemplates(null);
        return;
      }
      setTemplates(body.templates);
    } catch {
      setLoadError("Could not load templates.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function createTemplate() {
    setCreating(true);
    setCreateError(null);
    setCreatedNote(null);
    try {
      const res = await fetch("/api/admin/whatsapp-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, category, language, bodyText }),
      });
      const body = await res.json();
      if (!res.ok) {
        setCreateError(body.error ?? "Could not create the template.");
        return;
      }
      setCreatedNote(
        `Submitted for review (status: ${body.status}). Meta usually takes minutes to a day to approve — refresh below to check.`,
      );
      setName("");
      setBodyText("");
      void refresh();
    } catch {
      setCreateError("Could not create the template.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-5 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
      <div>
        <p className="text-sm font-medium text-[var(--fg)]">WhatsApp message templates</p>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Create a new template here and submit it straight to Meta for review — no
          need to leave this page. Once a template shows APPROVED below, pick it as
          the booking confirmation template above.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <span className="text-sm font-medium text-[var(--fg)]">Template name</span>
          <input
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="booking_confirmation"
          />
          <span className="mt-1 block text-xs text-[var(--muted)]">
            Lowercase letters, numbers, and underscores only.
          </span>
        </div>
        <div>
          <span className="text-sm font-medium text-[var(--fg)]">Category</span>
          <select
            className={inputClass}
            value={category}
            onChange={(e) => setCategory(e.target.value as (typeof CATEGORIES)[number])}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <span className="mt-1 block text-xs text-[var(--muted)]">
            Booking confirmations should use UTILITY.
          </span>
        </div>
        <div>
          <span className="text-sm font-medium text-[var(--fg)]">Language</span>
          <WhatsAppLanguageSelect className={inputClass} value={language} onChange={setLanguage} />
        </div>
      </div>

      <div>
        <span className="text-sm font-medium text-[var(--fg)]">Body text</span>
        <textarea
          className={`${inputClass} min-h-24`}
          value={bodyText}
          onChange={(e) => setBodyText(e.target.value)}
          placeholder="Hey {{1}}, this confirms your call with Kane is booked for {{2}}. Reply here if you need to reschedule."
        />
        <span className="mt-1 block text-xs text-[var(--muted)]">
          Use {"{{1}}"}, {"{{2}}"}, etc. for variables Meta will require an example
          value for during review.
        </span>
      </div>

      {createError ? <p className="text-sm text-red-400">{createError}</p> : null}
      {createdNote ? <p className="text-sm text-[var(--accent)]">{createdNote}</p> : null}

      <button
        type="button"
        onClick={() => void createTemplate()}
        disabled={creating || !name.trim() || !bodyText.trim()}
        className="rounded-md bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-fg)] transition hover:bg-[var(--accent-bright)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {creating ? "Submitting…" : "Create and submit for review"}
      </button>

      <div className="border-t border-[var(--border)] pt-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-[var(--fg)]">Existing templates</p>
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={loading}
            className="text-xs font-medium text-[var(--accent)] hover:underline disabled:opacity-60"
          >
            {loading ? "Refreshing…" : "Refresh status"}
          </button>
        </div>
        {loadError ? <p className="mt-2 text-sm text-red-400">{loadError}</p> : null}
        {templates && templates.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--muted)]">No templates yet.</p>
        ) : null}
        {templates?.length ? (
          <ul className="mt-3 space-y-2">
            {templates.map((t) => (
              <li
                key={t.id}
                className="rounded-md border border-[var(--border)] bg-[var(--bg)] p-3 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-[var(--fg)]">
                    {t.name} <span className="text-xs text-[var(--muted)]">({t.language})</span>
                  </span>
                  <span className={`text-xs font-semibold ${statusColor(t.status)}`}>
                    {t.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[var(--muted)]">{t.category}</p>
                {t.bodyText ? (
                  <p className="mt-2 text-[var(--fg-soft)]">{t.bodyText}</p>
                ) : null}
                {t.rejectedReason ? (
                  <p className="mt-2 text-xs text-red-400">Rejected: {t.rejectedReason}</p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
