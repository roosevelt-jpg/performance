"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCms } from "@/components/cms/CmsProvider";
import {
  formatMonthlyPrice,
  priceForTier,
  type BookableTier,
} from "@/lib/config/pricing";
import { evaluateLead } from "@/lib/qualify/evaluateLead";
import { saveLeadFlow } from "@/lib/session/leadSession";
import type {
  DaysCommit,
  InvestmentAnswer,
  MainGoal,
  QuestionnaireAnswers,
  TrainingNow,
} from "@/types/lead";
import { ProgressBar } from "./ProgressBar";

const TOTAL_STEPS = 10;

type Props = {
  tier: BookableTier;
};

function emptyAnswers(tier: BookableTier): QuestionnaireAnswers {
  return {
    tier,
    name: "",
    email: "",
    mobile: "",
    instagram: "",
    mainGoal: "",
    trainingNow: "",
    daysCommit: "",
    medical: "",
    stoppedResults: "",
    whyNow: "",
    structuredProgramme: "",
    investment: "",
    privacyConsent: false,
  };
}

function useIsNarrowViewport() {
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => setNarrow(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return narrow;
}

export function QuestionnaireForm({ tier }: Props) {
  const cms = useCms();
  const q = cms.questionnaire;
  const router = useRouter();
  const stepped = useIsNarrowViewport();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState(() => emptyAnswers(tier));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [livePrice, setLivePrice] = useState<number | null>(null);

  const goals = q.goals as MainGoal[];
  const trainingNow = q.trainingNow as TrainingNow[];
  const daysCommit = q.daysCommit as DaysCommit[];
  const investment = q.investment as InvestmentAnswer[];

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/public-config")
      .then((r) => r.json())
      .then((cfg: { pricing?: { pro: number; elite: number } }) => {
        if (cancelled || !cfg.pricing) return;
        setLivePrice(cfg.pricing[tier]);
      })
      .catch(() => {
        /* fall back to env pricing */
      });
    return () => {
      cancelled = true;
    };
  }, [tier]);

  const priceLabel = useMemo(
    () => formatMonthlyPrice(livePrice ?? priceForTier(tier)),
    [tier, livePrice],
  );

  const tierLabel = tier === "pro" ? "Pro" : "Elite";

  const completedCount = useMemo(() => {
    let n = 0;
    if (
      answers.name.trim() &&
      answers.email.includes("@") &&
      answers.mobile.trim() &&
      answers.instagram.trim()
    )
      n += 1;
    if (answers.mainGoal) n += 1;
    if (answers.trainingNow) n += 1;
    if (answers.daysCommit) n += 1;
    if (answers.medical.trim()) n += 1;
    if (answers.stoppedResults.trim()) n += 1;
    if (answers.whyNow.trim()) n += 1;
    if (answers.structuredProgramme.trim()) n += 1;
    if (answers.investment) n += 1;
    if (answers.privacyConsent) n += 1;
    return n;
  }, [answers]);

  const progressCurrent = stepped ? step : Math.max(completedCount, 1);
  const progressText = q.progressLabel
    .replace("{current}", String(progressCurrent))
    .replace("{total}", String(TOTAL_STEPS));

  function update<K extends keyof QuestionnaireAnswers>(
    key: K,
    value: QuestionnaireAnswers[K],
  ) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setError(null);
  }

  function validateStep(current: number): string | null {
    switch (current) {
      case 1:
        if (!answers.name.trim()) return "Name is required.";
        if (!answers.email.trim() || !answers.email.includes("@"))
          return "A valid email is required.";
        if (!answers.mobile.trim()) return "Mobile is required.";
        if (!answers.instagram.trim()) return "Instagram handle is required.";
        return null;
      case 2:
        return answers.mainGoal ? null : "Select your main goal.";
      case 3:
        return answers.trainingNow ? null : "Select how you are training now.";
      case 4:
        return answers.daysCommit
          ? null
          : "Select how many days you can commit.";
      case 5:
        return answers.medical.trim()
          ? null
          : 'Required — type "None" if nothing applies.';
      case 6:
        return answers.stoppedResults.trim()
          ? null
          : "Please share what has stopped you before.";
      case 7:
        return answers.whyNow.trim() ? null : "Please tell us why now.";
      case 8:
        return answers.structuredProgramme.trim()
          ? null
          : "Please share your programme experience.";
      case 9:
        return answers.investment ? null : "Select an investment answer.";
      case 10:
        return answers.privacyConsent
          ? null
          : "Privacy consent is required to continue.";
      default:
        return null;
    }
  }

  function validateAll(): string | null {
    for (let i = 1; i <= TOTAL_STEPS; i += 1) {
      const err = validateStep(i);
      if (err) return err;
    }
    return null;
  }

  function goNext() {
    const validationError = validateStep(step);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
      setError(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function goBack() {
    if (step > 1) {
      setStep((s) => s - 1);
      setError(null);
    }
  }

  async function onSubmit() {
    const validationError = stepped ? validateStep(10) : validateAll();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const evaluation = evaluateLead(answers);
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });

      if (!res.ok) {
        throw new Error("Submission failed");
      }

      const data = (await res.json()) as {
        outcome: "qualified" | "disqualified";
        flags: string[];
        disqualifyReasons: Array<"commitment" | "investment">;
        contactId: string;
      };

      saveLeadFlow({
        tier,
        answers,
        evaluation: {
          outcome: data.outcome,
          flags: data.flags as ReturnType<typeof evaluateLead>["flags"],
          disqualifyReasons: data.disqualifyReasons,
        },
        submissionId: data.contactId,
      });

      if (
        data.outcome === "disqualified" ||
        evaluation.outcome === "disqualified"
      ) {
        const reasons =
          data.disqualifyReasons?.join(",") ||
          evaluation.disqualifyReasons.join(",");
        router.push(`/challenge?from=disqualified&reasons=${reasons}`);
        return;
      }

      router.push("/book/calendar");
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  const show = (n: number) => !stepped || step === n;

  const fieldClass =
    "mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-base text-[var(--fg)] outline-none focus:border-[var(--accent)] sm:text-sm";
  const labelClass = "mb-1.5 block text-sm font-medium text-[var(--fg)]";
  const sectionClass =
    "space-y-4 border-b border-[var(--border)] pb-8 last:border-b-0 last:pb-0";
  const optionClass = (selected: boolean) =>
    [
      "min-h-11 rounded-md border px-3 py-2.5 text-left text-sm transition sm:min-h-0 sm:py-2",
      selected
        ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--fg)]"
        : "border-[var(--border)] bg-[var(--surface)] text-[var(--fg-soft)] hover:border-[var(--muted)]",
    ].join(" ");

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-10 lg:px-6 lg:py-14">
      <div className="mb-3 sm:mb-2">
        <Link
          href={q.back.href}
          className="text-sm text-[var(--muted)] hover:text-[var(--accent)]"
        >
          {q.back.label}
        </Link>
      </div>

      <header className="mb-6 flex flex-col gap-4 border-b border-[var(--border)] pb-5 sm:mb-8 sm:pb-6 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
            {tierLabel} application
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--fg)] sm:text-3xl">
            {q.title}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">
            {stepped ? q.introMobile : q.introDesktop}
          </p>
        </div>
        <div className="w-full md:max-w-xs">
          <ProgressBar
            current={progressCurrent}
            total={TOTAL_STEPS}
            label={progressText}
          />
        </div>
      </header>

      <form
        className="space-y-8"
        onSubmit={(e) => {
          e.preventDefault();
          if (stepped && step < TOTAL_STEPS) goNext();
          else void onSubmit();
        }}
      >
        {show(1) ? (
          <section className={sectionClass} aria-labelledby="q1">
            <h2 id="q1" className="text-base font-semibold text-[var(--fg)]">
              {q.stepTitles[0]}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="name">
                  {q.fieldLabels.name}
                </label>
                <input
                  id="name"
                  className={fieldClass}
                  autoComplete="name"
                  value={answers.name}
                  onChange={(e) => update("name", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="email">
                  {q.fieldLabels.email}
                </label>
                <input
                  id="email"
                  type="email"
                  className={fieldClass}
                  autoComplete="email"
                  value={answers.email}
                  onChange={(e) => update("email", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="mobile">
                  {q.fieldLabels.mobile}
                </label>
                <input
                  id="mobile"
                  type="tel"
                  className={fieldClass}
                  autoComplete="tel"
                  value={answers.mobile}
                  onChange={(e) => update("mobile", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="instagram">
                  {q.fieldLabels.instagram}
                </label>
                <input
                  id="instagram"
                  className={fieldClass}
                  placeholder={q.placeholders.instagram}
                  value={answers.instagram}
                  onChange={(e) => update("instagram", e.target.value)}
                />
              </div>
            </div>
          </section>
        ) : null}

        {show(2) ? (
          <section className={sectionClass} aria-labelledby="q2">
            <h2 id="q2" className="text-base font-semibold text-[var(--fg)]">
              {q.stepTitles[1]}
            </h2>
            <select
              id="mainGoal"
              className={`${fieldClass} max-w-md`}
              value={answers.mainGoal}
              onChange={(e) =>
                update("mainGoal", e.target.value as MainGoal | "")
              }
            >
              <option value="">Select…</option>
              {goals.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </section>
        ) : null}

        {show(3) ? (
          <section className={sectionClass} aria-labelledby="q3">
            <h2 id="q3" className="text-base font-semibold text-[var(--fg)]">
              {q.stepTitles[2]}
            </h2>
            <div className="flex flex-wrap gap-2">
              {trainingNow.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className={optionClass(answers.trainingNow === opt)}
                  onClick={() => update("trainingNow", opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {show(4) ? (
          <section className={sectionClass} aria-labelledby="q4">
            <h2 id="q4" className="text-base font-semibold text-[var(--fg)]">
              {q.stepTitles[3]}
            </h2>
            <div className="flex flex-wrap gap-2">
              {daysCommit.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className={optionClass(answers.daysCommit === opt)}
                  onClick={() => update("daysCommit", opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {show(5) ? (
          <section className={sectionClass} aria-labelledby="q5">
            <h2 id="q5" className="text-base font-semibold text-[var(--fg)]">
              {q.stepTitles[4]}
            </h2>
            <textarea
              id="medical"
              className={`${fieldClass} min-h-28`}
              value={answers.medical}
              onChange={(e) => update("medical", e.target.value)}
              placeholder={q.placeholders.medical}
            />
            <p className="text-xs leading-relaxed text-[var(--muted)]">
              {q.medicalPrivacy}
            </p>
          </section>
        ) : null}

        {show(6) ? (
          <section className={sectionClass} aria-labelledby="q6">
            <h2 id="q6" className="text-base font-semibold text-[var(--fg)]">
              {q.stepTitles[5]}
            </h2>
            <p className="text-xs text-[var(--accent)]">{q.step6Helper}</p>
            <textarea
              id="stopped"
              className={`${fieldClass} min-h-28`}
              value={answers.stoppedResults}
              onChange={(e) => update("stoppedResults", e.target.value)}
            />
          </section>
        ) : null}

        {show(7) ? (
          <section className={sectionClass} aria-labelledby="q7">
            <h2 id="q7" className="text-base font-semibold text-[var(--fg)]">
              {q.stepTitles[6]}
            </h2>
            <textarea
              id="whyNow"
              className={`${fieldClass} min-h-28`}
              value={answers.whyNow}
              onChange={(e) => update("whyNow", e.target.value)}
            />
          </section>
        ) : null}

        {show(8) ? (
          <section className={sectionClass} aria-labelledby="q8">
            <h2 id="q8" className="text-base font-semibold text-[var(--fg)]">
              {q.stepTitles[7]}
            </h2>
            <textarea
              id="programme"
              className={`${fieldClass} min-h-28`}
              value={answers.structuredProgramme}
              onChange={(e) => update("structuredProgramme", e.target.value)}
            />
          </section>
        ) : null}

        {show(9) ? (
          <section className={sectionClass} aria-labelledby="q9">
            <h2 id="q9" className="text-base font-semibold text-[var(--fg)]">
              {q.stepTitles[8]}
            </h2>
            <p className="text-sm text-[var(--fg-soft)]">
              {q.step9Prompt.replace("{price}", priceLabel)}
            </p>
            <div className="flex flex-wrap gap-2">
              {investment.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className={optionClass(answers.investment === opt)}
                  onClick={() => update("investment", opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {show(10) ? (
          <section className={sectionClass} aria-labelledby="q10">
            <h2 id="q10" className="text-base font-semibold text-[var(--fg)]">
              {q.stepTitles[9]}
            </h2>
            <label className="flex cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] p-4 text-sm text-[var(--fg-soft)]">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 accent-[var(--accent)]"
                checked={answers.privacyConsent}
                onChange={(e) => update("privacyConsent", e.target.checked)}
              />
              <span>{q.consentLabel.replace("{tier}", tierLabel)}</span>
            </label>
            <p className="text-xs text-[var(--muted)]">
              {q.consentWhatsappNote}
            </p>
          </section>
        ) : null}

        {error ? (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-3 border-t border-[var(--border)] pt-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          {stepped && step > 1 ? (
            <button
              type="button"
              onClick={goBack}
              className="w-full rounded-md border border-[var(--border)] px-4 py-3 text-sm font-semibold text-[var(--fg)] sm:w-auto sm:py-2.5"
            >
              {q.buttons.back}
            </button>
          ) : null}
          {stepped && step < TOTAL_STEPS ? (
            <button
              type="submit"
              className="w-full rounded-md bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--accent-fg)] transition hover:bg-[var(--accent-bright)] sm:w-auto sm:py-2.5"
            >
              {q.buttons.continue}
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-md bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--accent-fg)] transition hover:bg-[var(--accent-bright)] disabled:opacity-60 sm:w-auto sm:py-2.5"
            >
              {submitting ? q.buttons.submitting : q.buttons.submit}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
