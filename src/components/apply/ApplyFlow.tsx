"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ApplyVideo } from "@/components/apply/ApplyVideo";
import { BrandLogo } from "@/components/layout/SiteChrome";
import { useCms } from "@/components/cms/CmsProvider";
import { DEFAULT_APPLY_FUNNEL, DEFAULT_APPLY_QUESTIONS } from "@/lib/apply/defaults";
import { leadFlowFromApply } from "@/lib/apply/toLeadFlow";
import {
  applyOutcomeKey,
  applyTierFromRoute,
} from "@/lib/apply/routeLead";
import { saveLeadFlow } from "@/lib/session/leadSession";
import type {
  ApplyAnswers,
  ApplyDaysId,
  ApplyInvestId,
  ApplyRoute,
  ApplyTimelineId,
} from "@/lib/apply/types";

const STORAGE = "tfp-apply-lead";
const WATCH_MARKS = [25, 50, 60, 90, 100];

const empty: ApplyAnswers = {
  name: "",
  email: "",
  mobile: "",
  goal: "",
  startingPoint: "",
  days: "",
  obstacles: [],
  timeline: "",
  coachHistory: "",
  investment: "",
};

type Stage = "gate" | "vsl" | "qualify" | "result";

function interpolate(template: string, name: string): string {
  return template.replaceAll("{name}", name.trim() || "there");
}

export function ApplyFlow() {
  const cms = useCms();
  const funnel = cms.applyFunnel ?? DEFAULT_APPLY_FUNNEL;
  const vsl = cms.home.vsl;
  const [stage, setStage] = useState<Stage>(funnel.gateEnabled ? "gate" : "vsl");
  const [answers, setAnswers] = useState<ApplyAnswers>(empty);
  const [qIndex, setQIndex] = useState(0);
  const [watchPct, setWatchPct] = useState(0);
  const [leadId, setLeadId] = useState("");
  const [route, setRoute] = useState<ApplyRoute | "">("");
  const [emailError, setEmailError] = useState("");
  const [saving, setSaving] = useState(false);
  const marksSent = useRef(new Set<number>());

  const persist = useCallback(
    async (payload: {
      step: Stage;
      finish?: boolean;
      watch?: number;
      patch?: Partial<ApplyAnswers>;
      droppedAt?: string;
    }) => {
      const nextAnswers = { ...answers, ...payload.patch };
      try {
        const res = await fetch("/api/apply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: leadId || undefined,
            step: payload.step === "result" ? "routed" : payload.step,
            droppedAt: payload.droppedAt || payload.step,
            vslWatchPct: payload.watch ?? watchPct,
            answers: nextAnswers,
            finish: payload.finish,
            referer: window.location.href,
          }),
        });
        const json = (await res.json()) as {
          id?: string;
          route?: ApplyRoute;
          calendarHref?: string;
        };
        if (json.id) {
          setLeadId(json.id);
          try {
            sessionStorage.setItem(STORAGE, json.id);
          } catch {
            /* ignore */
          }
        }
        return json;
      } catch {
        return {};
      }
    },
    [answers, leadId, watchPct],
  );

  useEffect(() => {
    if (stage !== "vsl") return;
    for (const mark of WATCH_MARKS) {
      if (watchPct < mark || marksSent.current.has(mark)) continue;
      marksSent.current.add(mark);
      void persist({
        step: "vsl",
        watch: watchPct,
        droppedAt: `vsl_${mark}`,
      });
    }
  }, [watchPct, persist, stage]);

  async function unlockVideo(e: React.FormEvent) {
    e.preventDefault();
    if (!answers.name.trim()) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answers.email)) {
      setEmailError("Enter a real email so we can keep your place.");
      return;
    }
    setEmailError("");
    setSaving(true);
    try {
      await persist({ step: "vsl", patch: answers, droppedAt: "vsl" });
      setStage("vsl");
    } finally {
      setSaving(false);
    }
  }

  const threshold = funnel.watchPct || 60;
  const ctaReady = watchPct >= threshold || !vsl.youtubeUrl;

  const questions = funnel.questions?.length
    ? funnel.questions
    : DEFAULT_APPLY_QUESTIONS;
  const question = questions[qIndex];
  const totalScreens = questions.length + 1;
  const progress = Math.round(
    ((Math.min(qIndex, questions.length) + 1) / totalScreens) * 100,
  );

  function patchChoice(value: string): Partial<ApplyAnswers> {
    if (!question) return {};
    if (question.multi || question.id === "obstacles") {
      const next = answers.obstacles.includes(value)
        ? answers.obstacles.filter((item) => item !== value)
        : [...answers.obstacles, value];
      return { obstacles: next };
    }
    if (question.id === "goal") return { goal: value };
    if (question.id === "startingPoint") return { startingPoint: value };
    if (question.id === "days") return { days: value as ApplyDaysId };
    if (question.id === "timeline") return { timeline: value as ApplyTimelineId };
    if (question.id === "coachHistory") return { coachHistory: value };
    if (question.id === "investment") return { investment: value as ApplyInvestId };
    return {};
  }

  async function choose(value: string) {
    if (!question) return;
    const patch = patchChoice(value);
    if (question.multi || question.id === "obstacles") {
      setAnswers((a) => ({ ...a, ...patch }));
      return;
    }
    setAnswers((a) => ({ ...a, ...patch }));
    await goNext({ ...answers, ...patch }, question.id);
  }

  async function goNext(nextAnswers = answers, droppedAt = question?.id) {
    if (qIndex < questions.length - 1) {
      setQIndex((i) => i + 1);
      void persist({
        step: "qualify",
        patch: nextAnswers,
        droppedAt,
      });
      return;
    }
    setQIndex(questions.length);
    void persist({
      step: "qualify",
      patch: nextAnswers,
      droppedAt: droppedAt || "mobile",
    });
  }

  async function finishMobile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const json = await persist({
        step: "result",
        finish: true,
        patch: answers,
        droppedAt: "routed",
      });
      if (json.route) {
        setRoute(json.route);
        const flow = leadFlowFromApply({
          answers,
          route: json.route,
          submissionId: json.id || leadId,
        });
        if (flow) saveLeadFlow(flow);
      }
      setStage("result");
    } finally {
      setSaving(false);
    }
  }

  const outcome = route ? applyOutcomeKey(route) : null;
  const copy = outcome ? funnel[outcome] : funnel.high;
  const tier = route ? applyTierFromRoute(route) : null;
  const nurtureHref = (funnel.nurtureUrl || "").trim();
  const primaryHref =
    outcome === "high" && tier
      ? `/book/calendar?tier=${tier}`
      : outcome === "low"
        ? copy.primaryHref || "/challenge"
        : nurtureHref || copy.primaryHref || "/dna";
  const secondaryHref =
    outcome === "low"
      ? nurtureHref || copy.secondaryHref || "/dna"
      : copy.secondaryHref || "/dna";

  const optionLabels = useMemo(() => {
    if (!question) return [];
    return question.options.map((opt) =>
      typeof opt === "string" ? { id: opt, label: opt } : opt,
    );
  }, [question]);

  return (
    <main className="flex min-h-dvh flex-col bg-[var(--bg)]">
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 py-8 sm:px-6">
        <Link href="/" className="self-center">
          <BrandLogo />
        </Link>

        {stage === "gate" ? (
          <form onSubmit={(e) => void unlockVideo(e)} className="mt-10">
            <h1 className="font-heading text-[clamp(1.8rem,5vw,2.6rem)] text-[var(--fg)]">
              {funnel.gateHeadline}
            </h1>
            <p className="mt-4 text-base leading-[1.7] text-[var(--muted)]">
              {funnel.gateBody}
            </p>
            <label className="mt-8 block text-sm font-medium">
              First name
              <input
                required
                autoComplete="given-name"
                className="mt-1.5 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-3"
                value={answers.name}
                onChange={(e) =>
                  setAnswers((a) => ({ ...a, name: e.target.value }))
                }
              />
            </label>
            <label className="mt-4 block text-sm font-medium">
              Email
              <input
                required
                type="email"
                autoComplete="email"
                className="mt-1.5 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-3"
                value={answers.email}
                onBlur={() => {
                  if (
                    answers.email &&
                    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answers.email)
                  ) {
                    setEmailError("Enter a real email.");
                  }
                }}
                onChange={(e) => {
                  setEmailError("");
                  setAnswers((a) => ({ ...a, email: e.target.value }));
                }}
              />
            </label>
            {emailError ? (
              <p className="mt-2 text-sm text-red-400">{emailError}</p>
            ) : null}
            <button
              type="submit"
              disabled={saving}
              className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-[var(--accent)] px-5 py-3.5 text-sm font-semibold text-[var(--accent-fg)]"
            >
              {saving ? "Saving…" : funnel.gateCta}
            </button>
          </form>
        ) : null}

        {stage === "vsl" ? (
          <div className="mt-10">
            <h1 className="font-heading text-[clamp(1.6rem,4vw,2.2rem)] text-[var(--fg)]">
              {vsl.heading}
            </h1>
            <p className="mt-3 text-sm text-[var(--muted)]">{vsl.helper}</p>
            <div className="mt-6">
              <ApplyVideo
                youtubeUrl={vsl.youtubeUrl}
                title={vsl.heading}
                muteHint={vsl.muteHint}
                onProgress={setWatchPct}
              />
            </div>
            <div className="mt-6">
              {ctaReady ? (
                <button
                  type="button"
                  className="inline-flex w-full items-center justify-center rounded-md bg-[var(--accent)] px-5 py-3.5 text-sm font-semibold text-[var(--accent-fg)]"
                  onClick={() => {
                    setStage("qualify");
                    void persist({ step: "qualify", droppedAt: "q1" });
                  }}
                >
                  {funnel.vslCta}
                </button>
              ) : (
                <div>
                  <div className="h-1 overflow-hidden rounded-full bg-[var(--border)]">
                    <div
                      className="h-full bg-[var(--accent)] transition-[width]"
                      style={{
                        width: `${Math.min(100, Math.round((watchPct / threshold) * 100))}%`,
                      }}
                    />
                  </div>
                  <p className="mt-3 text-sm text-[var(--muted)]">
                    {funnel.progressLabel}
                  </p>
                </div>
              )}
              <Link
                href={nurtureHref || "/dna"}
                className="mt-4 block text-center text-sm text-[var(--muted)] underline-offset-2 hover:underline"
              >
                {funnel.escapeHatchLabel}
              </Link>
            </div>
          </div>
        ) : null}

        {stage === "qualify" && question ? (
          <div className="mt-10">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
              Question {qIndex + 1} of {totalScreens}
            </p>
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-[var(--border)]">
              <div
                className="h-full bg-[var(--accent)]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <h1 className="mt-6 font-heading text-[clamp(1.5rem,4vw,2.1rem)] text-[var(--fg)]">
              {question.title}
            </h1>
            <div className="mt-6 space-y-2">
              {optionLabels.map((opt) => {
                const selected =
                  question.multi || question.id === "obstacles"
                    ? answers.obstacles.includes(opt.id)
                    : false;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => void choose(opt.id)}
                    className={[
                      "w-full rounded-md border px-4 py-3.5 text-left text-sm",
                      selected
                        ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                        : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--fg-soft)]",
                    ].join(" ")}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            {question.multi ? (
              <button
                type="button"
                disabled={!answers.obstacles.length}
                className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-[var(--accent)] px-5 py-3.5 text-sm font-semibold text-[var(--accent-fg)] disabled:opacity-50"
                onClick={() => void goNext()}
              >
                Continue
              </button>
            ) : null}
          </div>
        ) : null}

        {stage === "qualify" && !question ? (
          <form onSubmit={(e) => void finishMobile(e)} className="mt-10">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
              Question {totalScreens} of {totalScreens}
            </p>
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-[var(--border)]">
              <div className="h-full w-full bg-[var(--accent)]" />
            </div>
            <h1 className="mt-6 font-heading text-[clamp(1.5rem,4vw,2.1rem)] text-[var(--fg)]">
              {funnel.mobileTitle}
            </h1>
            <p className="mt-3 text-sm text-[var(--muted)]">
              {funnel.mobileBody}
            </p>
            <label className="mt-8 block text-sm font-medium">
              Mobile, with country code
              <input
                required
                type="tel"
                autoComplete="tel"
                className="mt-1.5 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-3"
                value={answers.mobile}
                onChange={(e) =>
                  setAnswers((a) => ({ ...a, mobile: e.target.value }))
                }
              />
            </label>
            <button
              type="submit"
              disabled={saving}
              className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-[var(--accent)] px-5 py-3.5 text-sm font-semibold text-[var(--accent-fg)]"
            >
              {saving ? "Routing…" : funnel.mobileCta}
            </button>
          </form>
        ) : null}

        {stage === "result" && outcome ? (
          <div className="mt-10">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
              {outcome === "high"
                ? "You qualify"
                : outcome === "low"
                  ? "Start here"
                  : "Stay close"}
            </p>
            <h1 className="mt-3 font-heading text-[clamp(1.6rem,4vw,2.3rem)] text-[var(--fg)]">
              {interpolate(copy.heading, answers.name)}
            </h1>
            <p className="mt-4 text-base leading-[1.7] text-[var(--muted)]">
              {copy.body}
            </p>
            <Link
              href={primaryHref}
              className="mt-8 inline-flex w-full items-center justify-center rounded-md bg-[var(--accent)] px-5 py-3.5 text-sm font-semibold text-[var(--accent-fg)]"
            >
              {copy.primaryLabel}
            </Link>
            {copy.secondaryLabel ? (
              <Link
                href={secondaryHref || "/dna"}
                className="mt-3 inline-flex w-full items-center justify-center rounded-md border border-[var(--border-soft)] px-5 py-3.5 text-sm font-semibold"
              >
                {copy.secondaryLabel}
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </main>
  );
}
