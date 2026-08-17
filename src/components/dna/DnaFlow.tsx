"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BrandLogo } from "@/components/layout/SiteChrome";
import { DnaReportView } from "@/components/dna/DnaReportView";
import { useCms } from "@/components/cms/CmsProvider";
import { DEFAULT_DNA, DNA_QUESTIONS } from "@/lib/dna/questions";
import { liveDnaBoard, scoreDna } from "@/lib/dna/score";
import type { DnaResult } from "@/lib/dna/types";

type Stage = "intro" | "quiz" | "report" | "contact" | "sent";

export function DnaFlow() {
  const copy = useCms().dna ?? DEFAULT_DNA;
  const questions = copy.questions?.length ? copy.questions : DNA_QUESTIONS;
  const [stage, setStage] = useState<Stage>("intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [preview, setPreview] = useState<DnaResult | null>(null);
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
  const shown = result ?? preview;

  function openReport(nextAnswers: Record<string, string>) {
    setPreview(scoreDna(nextAnswers, copy));
    setStage("report");
  }

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
        setError(json.error || "Could not send this report.");
        return;
      }
      setResult(json.result);
      setPdfUrl(json.pdfUrl || "");
      setNextHref(json.nextHref || "/apply");
      const notes = json.delivery?.detail ?? [];
      if (json.delivery?.emailSent) notes.unshift("Report emailed.");
      if (json.delivery?.whatsappSent) notes.unshift("Report sent on WhatsApp.");
      setDelivery(notes);
      setStage("sent");
    } finally {
      setSaving(false);
    }
  }

  const ctaLabel =
    shown?.path === "call"
      ? "See if you qualify"
      : shown?.path === "challenge"
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
              <li>Your analysis on screen first. Then the PDF on WhatsApp and email.</li>
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
                    const next = { ...answers, [question.id]: opt.id };
                    setAnswers(next);
                    if (index < questions.length - 1) {
                      setIndex((i) => i + 1);
                    } else {
                      openReport(next);
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

        {stage === "report" && shown ? (
          <div className="mt-8">
            <DnaReportView copy={copy} result={shown} />
            <button
              type="button"
              className="mt-8 inline-flex w-full items-center justify-center rounded-md bg-[var(--accent)] px-5 py-3.5 text-sm font-semibold text-[var(--accent-fg)]"
              onClick={() => setStage("contact")}
            >
              Send this PDF to email and WhatsApp
            </button>
            <p className="mt-3 text-xs text-[var(--muted)]">
              Read it here first. Then we send the file to you.
            </p>
          </div>
        ) : null}

        {stage === "contact" ? (
          <form onSubmit={(e) => void finish(e)} className="mt-10 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
              Send the report
            </p>
            <h1 className="font-heading text-[clamp(1.6rem,4vw,2.2rem)]">
              Where should we send the PDF?
            </h1>
            <p className="text-sm leading-[1.7] text-[var(--muted)]">
              Live score {overall}/100. Email is required. WhatsApp is optional if
              you add a number with country code.
            </p>
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
              {saving ? "Sending…" : "Email and WhatsApp my report"}
            </button>
            <button
              type="button"
              className="inline-flex w-full items-center justify-center rounded-md border border-[var(--border-soft)] px-5 py-3.5 text-sm font-semibold"
              onClick={() => setStage("report")}
            >
              Back to analysis
            </button>
          </form>
        ) : null}

        {stage === "sent" && shown ? (
          <div className="mt-8">
            <DnaReportView copy={copy} result={shown} />
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
