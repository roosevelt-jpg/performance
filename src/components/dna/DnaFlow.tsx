"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BrandLogo } from "@/components/layout/SiteChrome";
import { useCms } from "@/components/cms/CmsProvider";
import { DEFAULT_DNA, DNA_QUESTIONS } from "@/lib/dna/questions";
import { liveDnaBoard } from "@/lib/dna/score";
import type { DnaResult } from "@/lib/dna/types";

type Stage = "intro" | "quiz" | "contact" | "result";

export function DnaFlow() {
  const copy = useCms().dna ?? DEFAULT_DNA;
  const questions = copy.questions?.length ? copy.questions : DNA_QUESTIONS;
  const [stage, setStage] = useState<Stage>("intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [result, setResult] = useState<DnaResult | null>(null);
  const [pdfUrl, setPdfUrl] = useState("");
  const [delivery, setDelivery] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [nextHref, setNextHref] = useState("/apply");

  const question = questions[index];
  const { categories: liveScores, overall } = useMemo(
    () => liveDnaBoard(answers, copy),
    [answers, copy],
  );

  async function finish(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/dna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, mobile, answers }),
      });
      const json = (await res.json()) as {
        error?: string;
        result?: DnaResult;
        pdfUrl?: string;
        nextHref?: string;
        delivery?: {
          emailSent?: boolean;
          whatsappSent?: boolean;
          detail?: string[];
        };
      };
      if (!res.ok || !json.result) {
        setError(json.error || "Could not score this run.");
        return;
      }
      setResult(json.result);
      setPdfUrl(json.pdfUrl || "");
      setNextHref(json.nextHref || "/apply");
      const notes = json.delivery?.detail ?? [];
      if (json.delivery?.emailSent) notes.unshift("Report emailed.");
      if (json.delivery?.whatsappSent) notes.unshift("Report sent on WhatsApp.");
      setDelivery(notes);
      setStage("result");
    } finally {
      setSaving(false);
    }
  }

  const ctaLabel =
    result?.path === "call"
      ? "See if you qualify"
      : result?.path === "challenge"
        ? "Start the 8-Week Challenge"
        : "Join the next step";

  return (
    <main className="flex min-h-dvh flex-col">
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8 sm:px-6">
        <Link href="/" className="self-center">
          <BrandLogo />
        </Link>

        {stage === "intro" ? (
          <div className="mt-10">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
              {copy.eyebrow}
            </p>
            <h1 className="mt-3 font-heading text-[clamp(1.8rem,5vw,2.6rem)]">
              {copy.heading}
            </h1>
            <p className="mt-4 text-base leading-[1.7] text-[var(--muted)]">
              {copy.body}
            </p>
            <ul className="mt-6 space-y-2 text-sm text-[var(--fg-soft)]">
              <li>Twelve questions — training, nutrition, routine, health, mindset.</li>
              <li>A live scoreboard as you go. Honesty scores higher than vanity.</li>
              <li>Coach assigned from Kane&apos;s team. PDF on WhatsApp and email.</li>
            </ul>
            <button
              type="button"
              className="mt-8 inline-flex w-full items-center justify-center rounded-md bg-[var(--accent)] px-5 py-3.5 text-sm font-semibold text-[var(--accent-fg)]"
              onClick={() => setStage("quiz")}
            >
              {copy.ctaLabel}
            </button>
          </div>
        ) : null}

        {stage === "quiz" && question ? (
          <>
            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
              {copy.eyebrow} · {index + 1}/{questions.length}
            </p>
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-[var(--border)]">
              <div
                className="h-full bg-[var(--accent)]"
                style={{
                  width: `${Math.round(((index + 1) / questions.length) * 100)}%`,
                }}
              />
            </div>
            <h1 className="mt-4 font-heading text-[clamp(1.6rem,4vw,2.2rem)]">
              {question.title}
            </h1>
            <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {liveScores.map((row) => (
                <div
                  key={row.id}
                  className={[
                    "rounded-md border px-3 py-2",
                    row.score === null
                      ? "border-[var(--border)] bg-[var(--surface)]"
                      : "border-[var(--accent)]/40 bg-[var(--accent-soft)]",
                  ].join(" ")}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                    {row.label}
                  </p>
                  <p className="mt-1 font-heading text-lg text-[var(--fg)]">
                    {row.score === null ? "—" : row.score}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm text-[var(--muted)]">
              Live score {overall || "—"}
            </p>
            <div className="mt-6 space-y-2">
              {question.options.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setAnswers((current) => ({ ...current, [question.id]: opt.id }));
                    if (index < questions.length - 1) {
                      setIndex((i) => i + 1);
                    } else {
                      setStage("contact");
                    }
                  }}
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-3.5 text-left text-sm hover:border-[var(--fg-soft)]"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </>
        ) : null}

        {stage === "contact" ? (
          <form onSubmit={(e) => void finish(e)} className="mt-10 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
              Scoreboard complete
            </p>
            <h1 className="font-heading text-[clamp(1.6rem,4vw,2.2rem)]">
              Your DNA is scored. Where should we send it?
            </h1>
            <p className="text-sm leading-[1.7] text-[var(--muted)]">
              Live score {overall}/100. We assign a coach from Kane&apos;s team and
              send the PDF to email and WhatsApp.
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {liveScores.map((row) => (
                <div
                  key={row.id}
                  className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                    {row.label}
                  </p>
                  <p className="mt-1 font-heading text-lg">{row.score ?? "—"}</p>
                </div>
              ))}
            </div>
            <input
              required
              placeholder="First name"
              autoComplete="given-name"
              className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-3"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              required
              type="email"
              placeholder="Email"
              autoComplete="email"
              className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-3"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="tel"
              placeholder="WhatsApp / mobile (with country code)"
              autoComplete="tel"
              className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-3"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />
            {error ? <p className="text-sm text-red-400">{error}</p> : null}
            <button
              type="submit"
              disabled={saving}
              className="inline-flex w-full items-center justify-center rounded-md bg-[var(--accent)] px-5 py-3.5 text-sm font-semibold text-[var(--accent-fg)]"
            >
              {saving ? "Scoring…" : "See my DNA and next step"}
            </button>
          </form>
        ) : null}

        {stage === "result" && result ? (
          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
              {copy.resultHeading}
            </p>
            <h1 className="mt-3 font-heading text-[clamp(2rem,6vw,3rem)]">
              {result.overall}
              <span className="text-lg text-[var(--muted)]"> / 100</span>
            </h1>
            <p className="mt-3 text-base leading-[1.7] text-[var(--muted)]">
              {result.summary}
            </p>
            <p className="mt-4 rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm">
              Assigned: <strong>{result.coach.name}</strong>
              <span className="block text-[var(--muted)]">{result.coach.role}</span>
            </p>
            {result.primaryLeak ? (
              <p className="mt-3 text-sm text-[var(--muted)]">
                Primary leak:{" "}
                <strong className="text-[var(--fg)]">
                  {result.primaryLeak.label} {result.primaryLeak.score}
                </strong>
              </p>
            ) : null}
            <div className="mt-6 space-y-4">
              {result.categories.map((cat) => (
                <div key={cat.id}>
                  <div className="mb-1 flex justify-between text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
                    <span>{cat.label}</span>
                    <span>{cat.score}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--border)]">
                    <div
                      className="h-full bg-[var(--accent)]"
                      style={{ width: `${cat.score}%` }}
                    />
                  </div>
                  {cat.insight ? (
                    <p className="mt-1.5 text-sm leading-[1.6] text-[var(--fg-soft)]">
                      {cat.insight}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm font-medium text-[var(--fg)]">
              {result.nextStep}
            </p>
            <Link
              href={nextHref}
              className="mt-8 inline-flex w-full items-center justify-center rounded-md bg-[var(--accent)] px-5 py-3.5 text-sm font-semibold text-[var(--accent-fg)]"
            >
              {ctaLabel}
            </Link>
            {pdfUrl ? (
              <a
                href={pdfUrl}
                className="mt-3 inline-flex w-full items-center justify-center rounded-md border border-[var(--border-soft)] px-5 py-3.5 text-sm font-semibold"
              >
                Download PDF report
              </a>
            ) : null}
            <p className="mt-4 text-xs text-[var(--muted)]">
              {delivery.join(" ") || copy.sendingNote}
            </p>
          </div>
        ) : null}
      </div>
    </main>
  );
}
