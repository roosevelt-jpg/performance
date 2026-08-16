"use client";

import {
  DEFAULT_APPLY_FUNNEL,
  DEFAULT_APPLY_QUESTIONS,
  DEFAULT_APPLY_ROUTING,
} from "@/lib/apply/defaults";
import type {
  ApplyOutcomeCopy,
  ApplyQuestion,
  ApplyRouting,
  CmsApplyFunnel,
} from "@/lib/apply/types";
import { DEFAULT_DNA, DNA_CATEGORY_LABELS } from "@/lib/dna/questions";
import { DNA_WEIGHTS } from "@/lib/dna/weights";
import type {
  CmsDna,
  DnaCategoryId,
  DnaGates,
  DnaOptionFlag,
  DnaQuestion,
} from "@/lib/dna/types";
import { toPlainText } from "@/lib/text/plain";

const inputClass =
  "mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-base text-[var(--fg)] outline-none focus:border-[var(--accent)] sm:text-sm";

const DNA_FLAGS: { id: DnaOptionFlag; label: string }[] = [
  { id: "looking", label: "Just looking → group" },
  { id: "uncommitted", label: "Uncommitted → blocks Kane" },
  { id: "no_accountability", label: "No accountability → group" },
  { id: "low_frequency", label: "Low frequency → Challenge or group" },
  { id: "nutrition_leak", label: "Nutrition leak (report only)" },
  { id: "no_slot", label: "No training slot (report only)" },
];

const ROUTING_RULES: {
  key: keyof ApplyRouting;
  label: string;
  hint: string;
  source: "investment" | "timeline" | "days";
}[] = [
  {
    key: "nurtureInvestmentIds",
    label: "Free group — investment",
    hint: "Spec: under £150",
    source: "investment",
  },
  {
    key: "nurtureTimelineIds",
    label: "Free group — timeline",
    hint: "Spec: just looking",
    source: "timeline",
  },
  {
    key: "lowInvestmentIds",
    label: "Challenge — investment",
    hint: "Spec: £150 to £500",
    source: "investment",
  },
  {
    key: "highBudgetInvestmentIds",
    label: "High budget (paired with days)",
    hint: "Spec: £500+, used with too-few training days",
    source: "investment",
  },
  {
    key: "lowDaysIds",
    label: "Too few training days",
    hint: "Spec: fewer than two → Challenge even with high budget",
    source: "days",
  },
  {
    key: "highProInvestmentIds",
    label: "Book Pro calendar",
    hint: "Spec: £500 to £1,000 with enough training days",
    source: "investment",
  },
  {
    key: "highEliteInvestmentIds",
    label: "Book Elite calendar",
    hint: "Spec: £1,000+ with enough training days",
    source: "investment",
  },
];

const GATE_FIELDS: { key: keyof DnaGates; label: string; hint: string }[] = [
  {
    key: "callMinOverall",
    label: "Kane call — min overall",
    hint: "Spec: 72",
  },
  {
    key: "callMinTraining",
    label: "Kane call — min training",
    hint: "Spec: 60",
  },
  {
    key: "callMinMindset",
    label: "Kane call — min mindset",
    hint: "Spec: 55",
  },
  {
    key: "challengeMinOverall",
    label: "Challenge — min overall",
    hint: "Spec: 40",
  },
  {
    key: "challengeMinTraining",
    label: "Challenge — min training",
    hint: "Spec: 40",
  },
  {
    key: "challengeMinNutrition",
    label: "Challenge — min nutrition",
    hint: "Spec: 50 (used when frequency is low)",
  },
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

function optionsFor(questions: ApplyQuestion[], id: string) {
  return (
    questions.find((q) => q.id === id)?.options ??
    DEFAULT_APPLY_QUESTIONS.find((q) => q.id === id)?.options ??
    []
  );
}

function OutcomeFields({
  title,
  value,
  onChange,
}: {
  title: string;
  value: ApplyOutcomeCopy;
  onChange: (next: ApplyOutcomeCopy) => void;
}) {
  const patch = (partial: Partial<ApplyOutcomeCopy>) =>
    onChange({ ...value, ...partial });
  return (
    <details className="space-y-3 rounded-md border border-[var(--border)] p-3" open>
      <summary className="cursor-pointer text-sm font-semibold">{title}</summary>
      <Field label="Heading" hint="Use {name} for their first name.">
        <input
          className={inputClass}
          value={value.heading}
          onChange={(e) => patch({ heading: toPlainText(e.target.value) })}
        />
      </Field>
      <Field label="Body">
        <textarea
          className={`${inputClass} min-h-24`}
          value={value.body}
          onChange={(e) => patch({ body: toPlainText(e.target.value) })}
        />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Primary button">
          <input
            className={inputClass}
            value={value.primaryLabel}
            onChange={(e) =>
              patch({ primaryLabel: toPlainText(e.target.value) })
            }
          />
        </Field>
        <Field label="Primary URL" hint="High calendar is still /book/calendar?tier=…">
          <input
            className={inputClass}
            value={value.primaryHref}
            onChange={(e) => patch({ primaryHref: e.target.value })}
          />
        </Field>
        <Field label="Secondary button">
          <input
            className={inputClass}
            value={value.secondaryLabel}
            onChange={(e) =>
              patch({ secondaryLabel: toPlainText(e.target.value) })
            }
          />
        </Field>
        <Field label="Secondary URL">
          <input
            className={inputClass}
            value={value.secondaryHref}
            onChange={(e) => patch({ secondaryHref: e.target.value })}
          />
        </Field>
      </div>
    </details>
  );
}

export function ApplyFunnelEditor({
  value,
  onChange,
}: {
  value: CmsApplyFunnel;
  onChange: (next: CmsApplyFunnel) => void;
}) {
  const apply = { ...DEFAULT_APPLY_FUNNEL, ...value };
  const questions = apply.questions?.length
    ? apply.questions
    : DEFAULT_APPLY_QUESTIONS;
  const routing = { ...DEFAULT_APPLY_ROUTING, ...apply.routing };

  const patch = (partial: Partial<CmsApplyFunnel>) =>
    onChange({ ...apply, ...partial });

  function patchQuestion(index: number, next: ApplyQuestion) {
    patch({
      questions: questions.map((q, i) => (i === index ? next : q)),
    });
  }

  function toggleRoute(key: keyof ApplyRouting, id: string) {
    const current = routing[key] ?? [];
    patch({
      routing: {
        ...routing,
        [key]: current.includes(id)
          ? current.filter((item) => item !== id)
          : [...current, id],
      },
    });
  }

  return (
    <>
      <Section
        title="Gated VSL apply"
        hint="/apply is a separate funnel from the homepage chat. Spec defaults stay in the file until you save here."
      >
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="accent-[var(--accent)]"
            checked={apply.enabled}
            onChange={(e) => patch({ enabled: e.target.checked })}
          />
          Enable /apply funnel
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="accent-[var(--accent)]"
            checked={apply.gateEnabled}
            onChange={(e) => patch({ gateEnabled: e.target.checked })}
          />
          Require name + email before the video
        </label>
        <Field label="Watch % before apply CTA" hint="Spec: 60">
          <input
            type="number"
            min={10}
            max={100}
            className={inputClass}
            value={apply.watchPct}
            onChange={(e) => patch({ watchPct: Number(e.target.value) })}
          />
        </Field>
        <Field
          label="Free-group URL"
          hint="WhatsApp invite or community link used by nurture and the video escape hatch."
        >
          <input
            className={inputClass}
            value={apply.nurtureUrl}
            onChange={(e) => patch({ nurtureUrl: e.target.value })}
            placeholder="https://chat.whatsapp.com/…"
          />
        </Field>
        <Field label="Gate headline">
          <input
            className={inputClass}
            value={apply.gateHeadline}
            onChange={(e) =>
              patch({ gateHeadline: toPlainText(e.target.value) })
            }
          />
        </Field>
        <Field label="Gate body">
          <textarea
            className={`${inputClass} min-h-16`}
            value={apply.gateBody}
            onChange={(e) => patch({ gateBody: toPlainText(e.target.value) })}
          />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Gate button">
            <input
              className={inputClass}
              value={apply.gateCta}
              onChange={(e) => patch({ gateCta: toPlainText(e.target.value) })}
            />
          </Field>
          <Field label="After-video button">
            <input
              className={inputClass}
              value={apply.vslCta}
              onChange={(e) => patch({ vslCta: toPlainText(e.target.value) })}
            />
          </Field>
          <Field label="Escape hatch">
            <input
              className={inputClass}
              value={apply.escapeHatchLabel}
              onChange={(e) =>
                patch({ escapeHatchLabel: toPlainText(e.target.value) })
              }
            />
          </Field>
          <Field label="Watching label">
            <input
              className={inputClass}
              value={apply.progressLabel}
              onChange={(e) =>
                patch({ progressLabel: toPlainText(e.target.value) })
              }
            />
          </Field>
        </div>
        <Field label="Phone screen heading">
          <input
            className={inputClass}
            value={apply.mobileTitle}
            onChange={(e) =>
              patch({ mobileTitle: toPlainText(e.target.value) })
            }
          />
        </Field>
        <Field label="Phone screen body">
          <textarea
            className={`${inputClass} min-h-16`}
            value={apply.mobileBody}
            onChange={(e) => patch({ mobileBody: toPlainText(e.target.value) })}
          />
        </Field>
        <Field label="Phone screen button">
          <input
            className={inputClass}
            value={apply.mobileCta}
            onChange={(e) => patch({ mobileCta: toPlainText(e.target.value) })}
          />
        </Field>
      </Section>

      <Section
        title="Apply questions"
        hint="Seven qualifiers plus the phone screen. Keep the ids days, timeline and investment — routing uses those answers."
      >
        <button
          type="button"
          className="rounded-md border border-[var(--border)] px-3 py-2 text-sm"
          onClick={() =>
            patch({ questions: structuredClone(DEFAULT_APPLY_QUESTIONS) })
          }
        >
          Reset questions to spec
        </button>
        {questions.map((question, index) => (
          <details
            key={`${question.id}-${index}`}
            className="space-y-3 rounded-md border border-[var(--border)] p-3"
          >
            <summary className="cursor-pointer text-sm font-semibold">
              Q{index + 1}. {question.title || question.id}
            </summary>
            <div className="grid gap-3 sm:grid-cols-[1fr_8rem_auto]">
              <Field label="Question">
                <input
                  className={inputClass}
                  value={question.title}
                  onChange={(e) =>
                    patchQuestion(index, {
                      ...question,
                      title: toPlainText(e.target.value),
                    })
                  }
                />
              </Field>
              <Field label="Answer id">
                <input
                  className={inputClass}
                  value={question.id}
                  onChange={(e) =>
                    patchQuestion(index, {
                      ...question,
                      id: e.target.value.trim(),
                    })
                  }
                />
              </Field>
              <label className="flex items-end gap-2 pb-2 text-sm">
                <input
                  type="checkbox"
                  className="accent-[var(--accent)]"
                  checked={Boolean(question.multi)}
                  onChange={(e) =>
                    patchQuestion(index, {
                      ...question,
                      multi: e.target.checked,
                    })
                  }
                />
                Multi-select
              </label>
            </div>
            <div className="space-y-2">
              {question.options.map((opt, optIndex) => (
                <div
                  key={`${opt.id}-${optIndex}`}
                  className="grid grid-cols-1 gap-2 sm:grid-cols-[8rem_1fr_auto]"
                >
                  <input
                    className={inputClass}
                    value={opt.id}
                    placeholder="id"
                    onChange={(e) =>
                      patchQuestion(index, {
                        ...question,
                        options: question.options.map((row, i) =>
                          i === optIndex
                            ? { ...row, id: e.target.value.trim() }
                            : row,
                        ),
                      })
                    }
                  />
                  <input
                    className={inputClass}
                    value={opt.label}
                    placeholder="Shown to the applicant"
                    onChange={(e) =>
                      patchQuestion(index, {
                        ...question,
                        options: question.options.map((row, i) =>
                          i === optIndex
                            ? { ...row, label: toPlainText(e.target.value) }
                            : row,
                        ),
                      })
                    }
                  />
                  <button
                    type="button"
                    className="text-sm text-red-400"
                    onClick={() =>
                      patchQuestion(index, {
                        ...question,
                        options: question.options.filter(
                          (_, i) => i !== optIndex,
                        ),
                      })
                    }
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="text-sm font-semibold"
                onClick={() =>
                  patchQuestion(index, {
                    ...question,
                    options: [
                      ...question.options,
                      {
                        id: `opt-${Date.now().toString(36)}`,
                        label: "",
                      },
                    ],
                  })
                }
              >
                Add option
              </button>
            </div>
          </details>
        ))}
      </Section>

      <Section
        title="Apply routing"
        hint="First match wins: free group, then Challenge, then Pro/Elite calendars. Tick the option ids from the questions above."
      >
        <button
          type="button"
          className="rounded-md border border-[var(--border)] px-3 py-2 text-sm"
          onClick={() =>
            patch({ routing: structuredClone(DEFAULT_APPLY_ROUTING) })
          }
        >
          Reset routing to spec
        </button>
        {ROUTING_RULES.map((rule) => {
          const opts = optionsFor(questions, rule.source);
          return (
            <div key={rule.key}>
              <p className="text-sm font-medium">{rule.label}</p>
              <p className="text-xs text-[var(--muted)]">{rule.hint}</p>
              <div className="mt-2 flex flex-wrap gap-3">
                {opts.map((opt) => (
                  <label key={opt.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="accent-[var(--accent)]"
                      checked={routing[rule.key].includes(opt.id)}
                      onChange={() => toggleRoute(rule.key, opt.id)}
                    />
                    {opt.label || opt.id}
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </Section>

      <Section
        title="Apply outcome screens"
        hint="The spec wording is the default. High goes to Kane's calendar, low to the Challenge, nurture to the free-group URL."
      >
        <button
          type="button"
          className="rounded-md border border-[var(--border)] px-3 py-2 text-sm"
          onClick={() =>
            patch({
              high: structuredClone(DEFAULT_APPLY_FUNNEL.high),
              low: structuredClone(DEFAULT_APPLY_FUNNEL.low),
              nurture: structuredClone(DEFAULT_APPLY_FUNNEL.nurture),
            })
          }
        >
          Reset outcome copy to spec
        </button>
        <OutcomeFields
          title="High — qualifies for a call"
          value={apply.high}
          onChange={(high) => patch({ high })}
        />
        <OutcomeFields
          title="Low — 8-Week Challenge"
          value={apply.low}
          onChange={(low) => patch({ low })}
        />
        <OutcomeFields
          title="Nurture — free group"
          value={apply.nurture}
          onChange={(nurture) => patch({ nurture })}
        />
      </Section>
    </>
  );
}

export function DnaFunnelEditor({
  value,
  onChange,
}: {
  value: CmsDna;
  onChange: (next: CmsDna) => void;
}) {
  const dna = {
    ...DEFAULT_DNA,
    ...value,
    weights: { ...DNA_WEIGHTS, ...value.weights },
    gates: { ...DEFAULT_DNA.gates, ...value.gates },
    questions: value.questions?.length ? value.questions : DEFAULT_DNA.questions,
    coaches: value.coaches?.length ? value.coaches : DEFAULT_DNA.coaches,
  };

  const patch = (partial: Partial<CmsDna>) => onChange({ ...dna, ...partial });

  function patchQuestion(index: number, next: DnaQuestion) {
    patch({
      questions: dna.questions.map((q, i) => (i === index ? next : q)),
    });
  }

  return (
    <>
      <Section
        title="Performance DNA"
        hint="/dna scores native Kane numbers first. Optional OpenAI in Integrations only rewrites PDF copy."
      >
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="accent-[var(--accent)]"
            checked={dna.enabled}
            onChange={(e) => patch({ enabled: e.target.checked })}
          />
          Show DNA on the site
        </label>
        <Field label="Eyebrow">
          <input
            className={inputClass}
            value={dna.eyebrow}
            onChange={(e) => patch({ eyebrow: toPlainText(e.target.value) })}
          />
        </Field>
        <Field label="Heading">
          <input
            className={inputClass}
            value={dna.heading}
            onChange={(e) => patch({ heading: toPlainText(e.target.value) })}
          />
        </Field>
        <Field label="Section body">
          <textarea
            className={`${inputClass} min-h-16`}
            value={dna.body}
            onChange={(e) => patch({ body: toPlainText(e.target.value) })}
          />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Button">
            <input
              className={inputClass}
              value={dna.ctaLabel}
              onChange={(e) =>
                patch({ ctaLabel: toPlainText(e.target.value) })
              }
            />
          </Field>
          <Field label="Result heading">
            <input
              className={inputClass}
              value={dna.resultHeading}
              onChange={(e) =>
                patch({ resultHeading: toPlainText(e.target.value) })
              }
            />
          </Field>
        </div>
        <Field label="Sending note">
          <textarea
            className={`${inputClass} min-h-16`}
            value={dna.sendingNote}
            onChange={(e) =>
              patch({ sendingNote: toPlainText(e.target.value) })
            }
          />
        </Field>
      </Section>

      <Section
        title="DNA coaches"
        hint="Assigned after the score. Kane is the 1:1 path, team is Challenge, community is the free group."
      >
        {dna.coaches.map((coach, index) => (
          <div
            key={coach.id}
            className="grid gap-3 rounded-md border border-[var(--border)] p-3 sm:grid-cols-3"
          >
            <Field label="Name">
              <input
                className={inputClass}
                value={coach.name}
                onChange={(e) =>
                  patch({
                    coaches: dna.coaches.map((row, i) =>
                      i === index
                        ? { ...row, name: toPlainText(e.target.value) }
                        : row,
                    ),
                  })
                }
              />
            </Field>
            <Field label="Role">
              <input
                className={inputClass}
                value={coach.role}
                onChange={(e) =>
                  patch({
                    coaches: dna.coaches.map((row, i) =>
                      i === index
                        ? { ...row, role: toPlainText(e.target.value) }
                        : row,
                    ),
                  })
                }
              />
            </Field>
            <Field label="Path">
              <select
                className={inputClass}
                value={coach.forPath}
                onChange={(e) =>
                  patch({
                    coaches: dna.coaches.map((row, i) =>
                      i === index
                        ? {
                            ...row,
                            forPath: e.target.value as typeof coach.forPath,
                          }
                        : row,
                    ),
                  })
                }
              >
                <option value="call">Kane / 1:1</option>
                <option value="challenge">Challenge</option>
                <option value="group">Free group</option>
              </select>
            </Field>
          </div>
        ))}
      </Section>

      <Section
        title="DNA weights"
        hint="Training, nutrition, routine and mindset move the overall. Journey and health inform the brief."
      >
        <button
          type="button"
          className="rounded-md border border-[var(--border)] px-3 py-2 text-sm"
          onClick={() => patch({ weights: { ...DNA_WEIGHTS } })}
        >
          Reset weights to spec
        </button>
        <div className="grid gap-3 sm:grid-cols-3">
          {(Object.keys(DNA_CATEGORY_LABELS) as DnaCategoryId[]).map((id) => (
            <Field key={id} label={DNA_CATEGORY_LABELS[id]}>
              <input
                type="number"
                step="0.1"
                min={0}
                className={inputClass}
                value={dna.weights[id]}
                onChange={(e) =>
                  patch({
                    weights: {
                      ...dna.weights,
                      [id]: Number(e.target.value) || 0,
                    },
                  })
                }
              />
            </Field>
          ))}
        </div>
      </Section>

      <Section
        title="DNA gates"
        hint="First: just looking or no accountability → group. Low frequency → Challenge or group. Then Kane if all three call mins clear. Else Challenge, else group."
      >
        <button
          type="button"
          className="rounded-md border border-[var(--border)] px-3 py-2 text-sm"
          onClick={() => patch({ gates: { ...DEFAULT_DNA.gates } })}
        >
          Reset gates to spec
        </button>
        <div className="grid gap-3 sm:grid-cols-2">
          {GATE_FIELDS.map((field) => (
            <Field key={field.key} label={field.label} hint={field.hint}>
              <input
                type="number"
                min={0}
                max={100}
                className={inputClass}
                value={dna.gates[field.key]}
                onChange={(e) =>
                  patch({
                    gates: {
                      ...dna.gates,
                      [field.key]: Number(e.target.value) || 0,
                    },
                  })
                }
              />
            </Field>
          ))}
        </div>
      </Section>

      <Section
        title="DNA questions"
        hint="Twelve questions. Score 0–3. Flags drive Kane vs Challenge vs group, independent of the numbers."
      >
        <button
          type="button"
          className="rounded-md border border-[var(--border)] px-3 py-2 text-sm"
          onClick={() =>
            patch({ questions: structuredClone(DEFAULT_DNA.questions) })
          }
        >
          Reset questions to spec
        </button>
        {dna.questions.map((question, index) => (
          <details
            key={`${question.id}-${index}`}
            className="space-y-3 rounded-md border border-[var(--border)] p-3"
          >
            <summary className="cursor-pointer text-sm font-semibold">
              {index + 1}. {question.title || question.id}
            </summary>
            <Field label="Question">
              <input
                className={inputClass}
                value={question.title}
                onChange={(e) =>
                  patchQuestion(index, {
                    ...question,
                    title: toPlainText(e.target.value),
                  })
                }
              />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Id">
                <input
                  className={inputClass}
                  value={question.id}
                  onChange={(e) =>
                    patchQuestion(index, {
                      ...question,
                      id: e.target.value.trim(),
                    })
                  }
                />
              </Field>
              <Field label="Category">
                <select
                  className={inputClass}
                  value={question.category}
                  onChange={(e) =>
                    patchQuestion(index, {
                      ...question,
                      category: e.target.value as DnaCategoryId,
                    })
                  }
                >
                  {(Object.keys(DNA_CATEGORY_LABELS) as DnaCategoryId[]).map(
                    (id) => (
                      <option key={id} value={id}>
                        {DNA_CATEGORY_LABELS[id]}
                      </option>
                    ),
                  )}
                </select>
              </Field>
            </div>
            {question.options.map((opt, optIndex) => (
              <div
                key={`${opt.id}-${optIndex}`}
                className="space-y-2 rounded-md border border-[var(--border)] p-3"
              >
                <div className="grid gap-2 sm:grid-cols-[5rem_1fr_5rem_auto]">
                  <input
                    className={inputClass}
                    value={opt.id}
                    placeholder="id"
                    onChange={(e) =>
                      patchQuestion(index, {
                        ...question,
                        options: question.options.map((row, i) =>
                          i === optIndex
                            ? { ...row, id: e.target.value.trim() }
                            : row,
                        ),
                      })
                    }
                  />
                  <input
                    className={inputClass}
                    value={opt.label}
                    onChange={(e) =>
                      patchQuestion(index, {
                        ...question,
                        options: question.options.map((row, i) =>
                          i === optIndex
                            ? { ...row, label: toPlainText(e.target.value) }
                            : row,
                        ),
                      })
                    }
                  />
                  <input
                    type="number"
                    min={0}
                    max={3}
                    className={inputClass}
                    value={opt.score}
                    onChange={(e) =>
                      patchQuestion(index, {
                        ...question,
                        options: question.options.map((row, i) =>
                          i === optIndex
                            ? {
                                ...row,
                                score: Math.min(
                                  3,
                                  Math.max(0, Number(e.target.value) || 0),
                                ),
                              }
                            : row,
                        ),
                      })
                    }
                  />
                  <button
                    type="button"
                    className="text-sm text-red-400"
                    onClick={() =>
                      patchQuestion(index, {
                        ...question,
                        options: question.options.filter(
                          (_, i) => i !== optIndex,
                        ),
                      })
                    }
                  >
                    Remove
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {DNA_FLAGS.map((flag) => {
                    const selected = opt.flags?.includes(flag.id) ?? false;
                    return (
                      <label
                        key={flag.id}
                        className="flex items-center gap-2 text-xs text-[var(--fg-soft)]"
                      >
                        <input
                          type="checkbox"
                          className="accent-[var(--accent)]"
                          checked={selected}
                          onChange={() => {
                            const flags = new Set(opt.flags ?? []);
                            if (selected) flags.delete(flag.id);
                            else flags.add(flag.id);
                            patchQuestion(index, {
                              ...question,
                              options: question.options.map((row, i) =>
                                i === optIndex
                                  ? { ...row, flags: [...flags] }
                                  : row,
                              ),
                            });
                          }}
                        />
                        {flag.label}
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
            <button
              type="button"
              className="text-sm font-semibold"
              onClick={() =>
                patchQuestion(index, {
                  ...question,
                  options: [
                    ...question.options,
                    { id: "e", label: "", score: 0 },
                  ],
                })
              }
            >
              Add option
            </button>
          </details>
        ))}
      </Section>
    </>
  );
}
