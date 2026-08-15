"use client";

import { useCallback, useEffect, useState } from "react";
import { AssetUpload } from "@/components/cms/AssetUpload";
import { DEFAULT_CMS } from "@/lib/cms/defaults";
import type {
  CmsContent,
  CmsFunnel,
  CmsFunnelField,
  CmsFunnelLayout,
  CmsFunnelOpenOn,
  CmsFunnelStep,
  CmsProofItem,
} from "@/lib/cms/types";
import { DEFAULT_FUNNEL, DEFAULT_FUNNEL_STEPS } from "@/lib/funnel/defaults";
import { toPlainText } from "@/lib/text/plain";

const inputClass =
  "mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-base text-[var(--fg)] outline-none focus:border-[var(--accent)] sm:text-sm";

const FIELD_OPTIONS: { id: CmsFunnelField; label: string }[] = [
  { id: "message", label: "Continue button (no data)" },
  { id: "tier", label: "Pro / Elite" },
  { id: "name", label: "Name" },
  { id: "email", label: "Email" },
  { id: "mobile", label: "Mobile" },
  { id: "instagram", label: "Instagram" },
  { id: "mainGoal", label: "Main goal" },
  { id: "trainingNow", label: "Training now" },
  { id: "daysCommit", label: "Days they can train" },
  { id: "medical", label: "Medical" },
  { id: "stoppedResults", label: "What stopped them" },
  { id: "whyNow", label: "Why now" },
  { id: "structuredProgramme", label: "Programme experience" },
  { id: "investment", label: "Investment (Q9)" },
  { id: "privacy", label: "Privacy consent" },
];

const LAYOUT_OPTIONS: { id: keyof CmsFunnelLayout; label: string }[] = [
  { id: "phoneMockup", label: "Hero phone / chat preview" },
  { id: "vsl", label: "Video" },
  { id: "proof", label: "Live stats" },
  { id: "testimonials", label: "Transformations" },
  { id: "credentials", label: "Kane credentials" },
  { id: "problem", label: "Problem section" },
  { id: "whatsappCoach", label: "WhatsApp marketing section" },
  { id: "benchmarks", label: "Benchmarks" },
  { id: "howItWorks", label: "How it works" },
  { id: "tiers", label: "Programme cards (Choose your level)" },
  { id: "faq", label: "FAQ" },
  { id: "finalCta", label: "Final CTA" },
];

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium text-[var(--fg)]">{label}</span>
      {hint ? (
        <span className="block text-xs text-[var(--muted)]">{hint}</span>
      ) : null}
      {children}
    </label>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
      <div>
        <h2 className="text-lg font-semibold text-[var(--fg)]">{title}</h2>
        {hint ? (
          <p className="mt-1 text-sm text-[var(--muted)]">{hint}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function FunnelAdmin() {
  const [form, setForm] = useState<CmsContent>(DEFAULT_CMS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [writable, setWritable] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/cms", { credentials: "include" });
      const json = (await res.json()) as {
        content?: CmsContent;
        storage?: { writable: boolean };
        error?: string;
      };
      if (!res.ok) {
        setError(json.error ?? "Failed to load");
        return;
      }
      if (json.content) setForm(json.content);
      setWritable(json.storage?.writable ?? true);
    } catch {
      setError("Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function patchProof(patch: Partial<CmsContent["home"]["proof"]>) {
    setForm((f) => ({
      ...f,
      home: {
        ...f.home,
        proof: { ...f.home.proof, ...patch },
      },
    }));
  }

  function patchProofItem(index: number, patch: Partial<CmsProofItem>) {
    setForm((f) => ({
      ...f,
      home: {
        ...f.home,
        proof: {
          ...f.home.proof,
          items: f.home.proof.items.map((item, i) =>
            i === index ? { ...item, ...patch } : item,
          ),
        },
      },
    }));
  }

  function patchFunnel(patch: Partial<CmsFunnel>) {
    setForm((f) => ({
      ...f,
      funnel: { ...(f.funnel ?? DEFAULT_FUNNEL), ...patch },
    }));
  }

  function patchLayout(key: keyof CmsFunnelLayout, value: boolean) {
    setForm((f) => {
      const funnel = f.funnel ?? DEFAULT_FUNNEL;
      return {
        ...f,
        funnel: {
          ...funnel,
          layout: { ...funnel.layout, [key]: value },
        },
      };
    });
  }

  function patchStep(index: number, patch: Partial<CmsFunnelStep>) {
    setForm((f) => {
      const funnel = f.funnel ?? DEFAULT_FUNNEL;
      return {
        ...f,
        funnel: {
          ...funnel,
          steps: funnel.steps.map((step, i) =>
            i === index ? { ...step, ...patch } : step,
          ),
        },
      };
    });
  }

  function moveStep(index: number, dir: -1 | 1) {
    setForm((f) => {
      const funnel = f.funnel ?? DEFAULT_FUNNEL;
      const next = [...funnel.steps];
      const swap = index + dir;
      if (swap < 0 || swap >= next.length) return f;
      const hold = next[index];
      next[index] = next[swap];
      next[swap] = hold;
      return { ...f, funnel: { ...funnel, steps: next } };
    });
  }

  function addStep() {
    setForm((f) => {
      const funnel = f.funnel ?? DEFAULT_FUNNEL;
      return {
        ...f,
        funnel: {
          ...funnel,
          steps: [
            ...funnel.steps,
            {
              id: `step-${Date.now().toString(36)}`,
              enabled: true,
              field: "message",
              coachText: "",
              placeholder: "",
            },
          ],
        },
      };
    });
  }

  function removeStep(index: number) {
    setForm((f) => {
      const funnel = f.funnel ?? DEFAULT_FUNNEL;
      return {
        ...f,
        funnel: {
          ...funnel,
          steps: funnel.steps.filter((_, i) => i !== index),
        },
      };
    });
  }

  async function save() {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/cms", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: form }),
      });
      const json = (await res.json()) as {
        content?: CmsContent;
        error?: string;
      };
      if (!res.ok) {
        setError(json.error ?? "Save failed");
        return;
      }
      if (json.content) setForm(json.content);
      setMessage("Funnel saved. Refresh the public site to see it.");
    } catch {
      setError("Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-[var(--muted)]">Loading funnel…</p>;
  }

  const funnel = form.funnel ?? DEFAULT_FUNNEL;

  return (
    <div className="space-y-6">
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      {message ? (
        <p className="text-sm text-[var(--accent)]">{message}</p>
      ) : null}
      {!writable ? (
        <p className="text-sm text-[var(--muted)]">
          This environment is read-only. Connect writable storage before saving funnel changes.
        </p>
      ) : null}

      <Section
        title="Chat engine"
        hint="Apply CTAs open this chat instead of the long form. Qualifying rules stay the same: under 3 training days or investment = No goes to the Challenge."
      >
        <label className="flex items-center gap-2 text-sm text-[var(--fg)]">
          <input
            type="checkbox"
            className="accent-[var(--accent)]"
            checked={funnel.enabled}
            onChange={(e) => patchFunnel({ enabled: e.target.checked })}
          />
          Engine on — apply in chat, short landing
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Coach name">
            <input
              className={inputClass}
              value={funnel.coachName}
              onChange={(e) =>
                patchFunnel({ coachName: toPlainText(e.target.value) })
              }
            />
          </Field>
          <Field label="Launcher button">
            <input
              className={inputClass}
              value={funnel.launcherLabel}
              onChange={(e) =>
                patchFunnel({ launcherLabel: toPlainText(e.target.value) })
              }
            />
          </Field>
        </div>
        <AssetUpload
          label="Coach avatar"
          folder="images"
          value={funnel.avatarUrl}
          onChange={(url) => patchFunnel({ avatarUrl: url })}
        />
        <Field
          label="Greeting"
          hint="First coach line. Keep it short."
        >
          <textarea
            className={`${inputClass} min-h-20`}
            value={funnel.greeting}
            onChange={(e) =>
              patchFunnel({ greeting: toPlainText(e.target.value) })
            }
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Open chat">
            <select
              className={inputClass}
              value={funnel.openOn}
              onChange={(e) =>
                patchFunnel({ openOn: e.target.value as CmsFunnelOpenOn })
              }
            >
              <option value="cta">Only when they click Apply</option>
              <option value="after-vsl">After they start the video</option>
              <option value="delay">After a delay</option>
            </select>
          </Field>
          <Field label="Delay (ms)" hint="Used when Open chat is delay.">
            <input
              className={inputClass}
              type="number"
              min={1500}
              value={funnel.delayMs}
              onChange={(e) =>
                patchFunnel({ delayMs: Number(e.target.value) || 0 })
              }
            />
          </Field>
          <Field label="Default tier">
            <select
              className={inputClass}
              value={funnel.defaultTier}
              onChange={(e) =>
                patchFunnel({
                  defaultTier: e.target.value === "elite" ? "elite" : "pro",
                })
              }
            >
              <option value="pro">Pro</option>
              <option value="elite">Elite</option>
            </select>
          </Field>
        </div>
      </Section>

      <Section
        title="Landing page"
        hint="Copy stays in Content CMS. Untick a block to hide it and shorten the public page — How it works and Programme cards are off by default for a short landing."
      >
        <div className="grid gap-2 sm:grid-cols-2">
          {LAYOUT_OPTIONS.map((item) => (
            <label
              key={item.id}
              className="flex items-center gap-2 text-sm text-[var(--fg-soft)]"
            >
              <input
                type="checkbox"
                className="accent-[var(--accent)]"
                checked={Boolean(funnel.layout[item.id])}
                onChange={(e) => patchLayout(item.id, e.target.checked)}
              />
              {item.label}
            </label>
          ))}
        </div>
      </Section>

      <Section
        title="Live stats"
        hint="Kane types the figures. Empty values stay off the page — nothing is pulled from GHL. Example: 2,400+ · Clients coached."
      >
        <label className="flex items-center gap-2 text-sm text-[var(--fg)]">
          <input
            type="checkbox"
            className="accent-[var(--accent)]"
            checked={Boolean(funnel.layout.proof)}
            onChange={(e) => {
              patchLayout("proof", e.target.checked);
              patchProof({ enabled: e.target.checked });
            }}
          />
          Show stats between the video and transformations
        </label>
        {form.home.proof.items.map((item, index) => (
          <div
            key={item.id}
            className="grid grid-cols-1 gap-3 rounded-md border border-[var(--border)] p-3 sm:grid-cols-[1fr_1fr_auto]"
          >
            <Field label="Figure">
              <input
                className={inputClass}
                value={item.value}
                placeholder="e.g. 2,400+"
                onChange={(e) =>
                  patchProofItem(index, {
                    value: toPlainText(e.target.value),
                  })
                }
              />
            </Field>
            <Field label="Label">
              <input
                className={inputClass}
                value={item.label}
                placeholder="Clients coached"
                onChange={(e) =>
                  patchProofItem(index, {
                    label: toPlainText(e.target.value),
                  })
                }
              />
            </Field>
            <button
              type="button"
              className="self-end pb-2 text-sm text-red-400"
              onClick={() =>
                patchProof({
                  items: form.home.proof.items.filter((_, i) => i !== index),
                })
              }
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          className="rounded-md border border-[var(--border)] px-3 py-2 text-sm font-semibold"
          onClick={() =>
            patchProof({
              items: [
                ...form.home.proof.items,
                {
                  id: `p-${Date.now().toString(36)}`,
                  value: "",
                  label: "",
                },
              ],
            })
          }
        >
          Add stat
        </button>
      </Section>

      <Section
        title="Chat steps"
        hint="Order is the conversation. Days trained and investment must stay on if you want the qualify rules to fire. Tokens: {name} {tier} {price} {email}."
      >
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-md border border-[var(--border)] px-3 py-2 text-sm font-semibold"
            onClick={addStep}
          >
            Add step
          </button>
          <button
            type="button"
            className="rounded-md border border-[var(--border)] px-3 py-2 text-sm"
            onClick={() => patchFunnel({ steps: DEFAULT_FUNNEL_STEPS })}
          >
            Reset to default conversation
          </button>
        </div>
        <ol className="space-y-4">
          {funnel.steps.map((step, index) => (
            <li
              key={step.id}
              className="space-y-3 rounded-md border border-[var(--border)] p-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="accent-[var(--accent)]"
                    checked={step.enabled}
                    onChange={(e) =>
                      patchStep(index, { enabled: e.target.checked })
                    }
                  />
                  On
                </label>
                <select
                  className={inputClass}
                  value={step.field}
                  onChange={(e) =>
                    patchStep(index, {
                      field: e.target.value as CmsFunnelField,
                    })
                  }
                >
                  {FIELD_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="text-sm text-[var(--muted)]"
                  onClick={() => moveStep(index, -1)}
                >
                  Up
                </button>
                <button
                  type="button"
                  className="text-sm text-[var(--muted)]"
                  onClick={() => moveStep(index, 1)}
                >
                  Down
                </button>
                <button
                  type="button"
                  className="ml-auto text-sm text-red-400"
                  onClick={() => removeStep(index)}
                >
                  Remove
                </button>
              </div>
              <Field label="Coach says">
                <textarea
                  className={`${inputClass} min-h-16`}
                  value={step.coachText}
                  onChange={(e) =>
                    patchStep(index, {
                      coachText: toPlainText(e.target.value),
                    })
                  }
                />
              </Field>
              <Field
                label="Placeholder / button"
                hint="Text inputs use this as placeholder. Continue and Send use it as the button."
              >
                <input
                  className={inputClass}
                  value={step.placeholder}
                  onChange={(e) =>
                    patchStep(index, {
                      placeholder: toPlainText(e.target.value),
                    })
                  }
                />
              </Field>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="After they submit">
        <Field label="Qualified message">
          <textarea
            className={`${inputClass} min-h-16`}
            value={funnel.qualifiedMessage}
            onChange={(e) =>
              patchFunnel({ qualifiedMessage: toPlainText(e.target.value) })
            }
          />
        </Field>
        <Field label="Qualified button">
          <input
            className={inputClass}
            value={funnel.qualifiedCta}
            onChange={(e) =>
              patchFunnel({ qualifiedCta: toPlainText(e.target.value) })
            }
          />
        </Field>
        <Field label="Not a fit — message">
          <textarea
            className={`${inputClass} min-h-16`}
            value={funnel.disqualifiedMessage}
            onChange={(e) =>
              patchFunnel({
                disqualifiedMessage: toPlainText(e.target.value),
              })
            }
          />
        </Field>
        <Field label="Not a fit — button">
          <input
            className={inputClass}
            value={funnel.disqualifiedCta}
            onChange={(e) =>
              patchFunnel({ disqualifiedCta: toPlainText(e.target.value) })
            }
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Sending…">
            <input
              className={inputClass}
              value={funnel.submittingText}
              onChange={(e) =>
                patchFunnel({ submittingText: toPlainText(e.target.value) })
              }
            />
          </Field>
          <Field label="Error">
            <input
              className={inputClass}
              value={funnel.errorText}
              onChange={(e) =>
                patchFunnel({ errorText: toPlainText(e.target.value) })
              }
            />
          </Field>
        </div>
      </Section>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={saving || !writable}
          className="rounded-md bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          onClick={() => void save()}
        >
          {saving ? "Saving…" : "Save funnel"}
        </button>
        <button
          type="button"
          className="rounded-md border border-[var(--border)] px-5 py-2.5 text-sm"
          onClick={() => void load()}
        >
          Reload
        </button>
      </div>
    </div>
  );
}
