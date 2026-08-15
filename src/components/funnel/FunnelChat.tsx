"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCms } from "@/components/cms/CmsProvider";
import { useWatchGate } from "@/components/marketing/WatchGate";
import {
  formatMonthlyPrice,
  priceForTier,
  type BookableTier,
} from "@/lib/config/pricing";
import {
  answersFromChat,
  interpolateFunnelText,
  validateChatField,
} from "@/lib/funnel/engine";
import {
  FUNNEL_OPEN_EVENT,
  type FunnelOpenDetail,
} from "@/lib/funnel/open";
import { saveLeadFlow } from "@/lib/session/leadSession";
import type { CmsFunnelStep } from "@/lib/cms/types";
import type {
  CoachingTier,
  DaysCommit,
  InvestmentAnswer,
  LeadFlag,
  MainGoal,
  QuestionnaireAnswers,
  TrainingNow,
} from "@/types/lead";

const OPENED_KEY = "tfp-funnel-auto-opened";

type Props = {
  variant?: "widget" | "page";
  initialTier?: CoachingTier;
};

type Bubble = {
  id: string;
  from: "coach" | "user";
  text: string;
};

type Phase = "chat" | "submitting" | "qualified" | "disqualified";

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function isHiddenPath(pathname: string) {
  return (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/book/calendar") ||
    pathname.startsWith("/book/confirmation") ||
    pathname.startsWith("/challenge")
  );
}

export function FunnelChat({ variant = "widget", initialTier }: Props) {
  const cms = useCms();
  const funnel = cms.funnel;
  const q = cms.questionnaire;
  const router = useRouter();
  const pathname = usePathname();
  const { watched, gated, requestApply: requestWatch } = useWatchGate();
  const isPage = variant === "page";

  const [open, setOpen] = useState(isPage);
  const [phase, setPhase] = useState<Phase>("chat");
  const [messages, setMessages] = useState<Bubble[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<QuestionnaireAnswers>>({});
  const [draft, setDraft] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [price, setPrice] = useState<string>("");
  const [typing, setTyping] = useState(false);
  const [outcomeReasons, setOutcomeReasons] = useState<string>("");

  const scroller = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  const busy = useRef(false);

  const hidden =
    !funnel?.enabled ||
    (variant === "widget" &&
      (isHiddenPath(pathname) || pathname === "/book"));

  const steps = useMemo(
    () => (funnel?.steps ?? []).filter((step) => step.enabled),
    [funnel?.steps],
  );
  const step: CmsFunnelStep | undefined = steps[stepIndex];
  const tier: CoachingTier =
    answers.tier === "elite" || answers.tier === "pro"
      ? answers.tier
      : (initialTier ?? funnel?.defaultTier ?? "pro");

  const vars = useMemo(
    () => ({
      name: answers.name,
      email: answers.email,
      tier,
      price,
    }),
    [answers.email, answers.name, price, tier],
  );

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/public-config")
      .then((r) => r.json())
      .then((cfg: { pricing?: { pro: number; elite: number } }) => {
        if (cancelled) return;
        const amount = cfg.pricing?.[tier] ?? priceForTier(tier as BookableTier);
        setPrice(formatMonthlyPrice(amount));
      })
      .catch(() => {
        setPrice(formatMonthlyPrice(priceForTier(tier as BookableTier)));
      });
    return () => {
      cancelled = true;
    };
  }, [tier]);

  useEffect(() => {
    const node = scroller.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [messages, typing, error, phase]);

  const pushCoach = useCallback(async (text: string) => {
    setTyping(true);
    await wait(380);
    setTyping(false);
    setMessages((prev) => [
      ...prev,
      { id: uid(), from: "coach", text },
    ]);
  }, []);

  const begin = useCallback(
    async (preferred?: CoachingTier) => {
      if (started.current) return;
      started.current = true;
      setPhase("chat");
      setMessages([]);
      setStepIndex(0);
      setDraft("");
      setConsent(false);
      setError(null);
      setAnswers(preferred ? { tier: preferred } : {});
      if (funnel.greeting) await pushCoach(funnel.greeting);
      const first = steps[0];
      if (first) {
        await pushCoach(interpolateFunnelText(first.coachText, {
          ...vars,
          tier: preferred ?? tier,
        }));
      }
    },
    [funnel.greeting, pushCoach, steps, tier, vars],
  );

  const requestOpen = useCallback(
    (preferred?: CoachingTier) => {
      if (gated && !watched && !isPage) {
        requestWatch(`/book?tier=${preferred ?? funnel.defaultTier}`);
        return;
      }
      setOpen(true);
      void begin(preferred ?? initialTier);
    },
    [begin, funnel.defaultTier, gated, initialTier, isPage, requestWatch, watched],
  );

  useEffect(() => {
    if (hidden || variant !== "widget") return;
    function onOpen(event: Event) {
      const detail = (event as CustomEvent<FunnelOpenDetail>).detail;
      requestOpen(detail?.tier);
    }
    window.addEventListener(FUNNEL_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(FUNNEL_OPEN_EVENT, onOpen);
  }, [hidden, requestOpen, variant]);

  useEffect(() => {
    if (hidden || !isPage) return;
    void begin(initialTier);
  }, [begin, hidden, initialTier, isPage]);

  useEffect(() => {
    if (hidden || variant !== "widget") return;
    if (funnel.openOn !== "delay") return;
    if (gated && !watched) return;
    try {
      if (sessionStorage.getItem(OPENED_KEY) === "1") return;
    } catch {
      /* ignore */
    }
    const timer = window.setTimeout(() => {
      try {
        sessionStorage.setItem(OPENED_KEY, "1");
      } catch {
        /* ignore */
      }
      requestOpen();
    }, Math.max(1500, funnel.delayMs || 12000));
    return () => window.clearTimeout(timer);
  }, [funnel.delayMs, funnel.openOn, gated, hidden, requestOpen, variant, watched]);

  useEffect(() => {
    if (hidden || variant !== "widget") return;
    if (funnel.openOn !== "after-vsl") return;
    if (!watched) return;
    try {
      if (sessionStorage.getItem(OPENED_KEY) === "1") return;
      sessionStorage.setItem(OPENED_KEY, "1");
    } catch {
      /* ignore */
    }
    requestOpen();
  }, [funnel.openOn, hidden, requestOpen, variant, watched]);

  const submitAnswers = useCallback(
    async (nextAnswers: Partial<QuestionnaireAnswers>) => {
      const payload = answersFromChat(nextAnswers, funnel.defaultTier);
      if (!steps.some((item) => item.field === "privacy")) {
        payload.privacyConsent = true;
      }
      setPhase("submitting");
      setError(null);
      try {
        const res = await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, intakeSource: "funnel_chat" }),
        });
        if (!res.ok) throw new Error("fail");
        const data = (await res.json()) as {
          outcome: "qualified" | "disqualified";
          flags: string[];
          disqualifyReasons: Array<"commitment" | "investment">;
          contactId: string;
        };
        saveLeadFlow({
          tier: payload.tier,
          answers: payload,
          evaluation: {
            outcome: data.outcome,
            flags: data.flags as LeadFlag[],
            disqualifyReasons: data.disqualifyReasons,
          },
          submissionId: data.contactId,
        });
        const outcome = data.outcome;
        setOutcomeReasons(data.disqualifyReasons?.join(",") || "");
        setPhase(outcome);
        const copy =
          outcome === "qualified"
            ? funnel.qualifiedMessage
            : funnel.disqualifiedMessage;
        await pushCoach(interpolateFunnelText(copy, vars));
        window.setTimeout(() => {
          if (outcome === "qualified") router.push("/book/calendar");
          else {
            const reasons = data.disqualifyReasons?.join(",") || "";
            router.push(
              `/challenge?from=disqualified${reasons ? `&reasons=${reasons}` : ""}`,
            );
          }
        }, 1600);
      } catch {
        setPhase("chat");
        setError(funnel.errorText);
      }
    },
    [funnel.defaultTier, funnel.disqualifiedMessage, funnel.errorText, funnel.qualifiedMessage, pushCoach, router, steps, vars],
  );

  async function advance(patch: Partial<QuestionnaireAnswers>, userText: string) {
    if (!step || busy.current || phase !== "chat") return;
    const nextAnswers = { ...answers, ...patch, tier };
    const invalid = validateChatField(step.field, nextAnswers);
    if (invalid) {
      setError(invalid);
      return;
    }
    busy.current = true;
    setError(null);
    setAnswers(nextAnswers);
    if (userText) {
      setMessages((prev) => [...prev, { id: uid(), from: "user", text: userText }]);
    }
    setDraft("");
    const nextIndex = stepIndex + 1;
    if (nextIndex >= steps.length) {
      await submitAnswers({ ...nextAnswers, privacyConsent: true });
      busy.current = false;
      return;
    }
    setStepIndex(nextIndex);
    const next = steps[nextIndex];
    await pushCoach(
      interpolateFunnelText(next.coachText, {
        name: nextAnswers.name,
        email: nextAnswers.email,
        tier: nextAnswers.tier ?? tier,
        price,
      }),
    );
    busy.current = false;
  }

  function sendDraft() {
    if (!step) return;
    if (step.field === "message") {
      void advance({}, step.placeholder || "Let's go");
      return;
    }
    const value = draft.trim();
    const field = step.field as keyof QuestionnaireAnswers;
    void advance({ [field]: value } as Partial<QuestionnaireAnswers>, value);
  }

  function destinationCta() {
    if (phase === "qualified") {
      router.push("/book/calendar");
      return;
    }
    router.push(
      `/challenge?from=disqualified${outcomeReasons ? `&reasons=${outcomeReasons}` : ""}`,
    );
  }

  if (hidden) return null;

  const chipOptions = chipChoices(step?.field, q);
  const inputKind = inputType(step?.field);
  const consentLabel = q.consentLabel.replace(
    "{tier}",
    tier === "elite" ? "Elite" : "Pro",
  );

  const panel = (
    <div
      className={[
        "flex flex-col overflow-hidden border border-white/10 bg-[#121110]",
        isPage
          ? "min-h-[32rem] rounded-[var(--radius)]"
          : "h-[min(34rem,calc(100dvh-5.5rem))] rounded-[18px] shadow-[0_24px_80px_#000000b0]",
      ].join(" ")}
    >
      <header className="flex items-center gap-2.5 border-b border-white/10 px-3 py-2.5">
        {funnel.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={funnel.avatarUrl}
            alt=""
            className="h-9 w-9 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent)] text-sm font-semibold text-white">
            {funnel.coachName.slice(0, 1)}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[var(--fg)]">
            {funnel.coachName}
          </p>
          <p className="text-[11px] text-[var(--accent)]">online</p>
        </div>
        {isPage ? null : (
          <button
            type="button"
            className="text-sm text-[var(--muted)] hover:text-[var(--fg)]"
            onClick={() => setOpen(false)}
          >
            Close
          </button>
        )}
      </header>

      <div
        ref={scroller}
        className="flex flex-1 flex-col gap-2 overflow-y-auto px-3 py-3"
      >
        {messages.map((line) => (
          <p
            key={line.id}
            className={[
              "max-w-[92%] px-3 py-2 text-sm leading-[1.5]",
              line.from === "coach"
                ? "self-start rounded-[10px] rounded-tl-sm bg-[#1c1916] text-[var(--fg)]"
                : "self-end rounded-[10px] rounded-tr-sm bg-[var(--accent)] text-white",
            ].join(" ")}
          >
            {line.text}
          </p>
        ))}
        {typing ? (
          <p className="self-start rounded-[10px] bg-[#1c1916] px-3 py-2 text-sm text-[var(--muted)]">
            …
          </p>
        ) : null}
        {phase === "submitting" ? (
          <p className="text-center text-xs text-[var(--muted)]">
            {funnel.submittingText}
          </p>
        ) : null}
      </div>

      <div className="border-t border-white/10 p-3">
        {error ? (
          <p className="mb-2 text-xs text-red-400">{error}</p>
        ) : null}

        {phase === "qualified" || phase === "disqualified" ? (
          <button
            type="button"
            className="inline-flex w-full items-center justify-center rounded-md bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white"
            onClick={destinationCta}
          >
            {phase === "qualified" ? funnel.qualifiedCta : funnel.disqualifiedCta}
          </button>
        ) : null}

        {phase === "chat" && step && !typing ? (
          <div className="space-y-2">
            {inputKind === "chips" ? (
              <div className="flex flex-wrap gap-2">
                {chipOptions.map((opt) => (
                  <button
                    type="button"
                    key={opt.value}
                    className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--fg)] hover:border-[var(--accent)]"
                    onClick={() =>
                      void advance(
                        { [step.field]: opt.value } as Partial<QuestionnaireAnswers>,
                        opt.label,
                      )
                    }
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            ) : null}

            {inputKind === "message" ? (
              <button
                type="button"
                className="inline-flex w-full items-center justify-center rounded-md bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white"
                onClick={sendDraft}
              >
                {step.placeholder || funnel.startButton}
              </button>
            ) : null}

            {inputKind === "privacy" ? (
              <div className="space-y-2">
                <label className="flex items-start gap-2 text-xs leading-[1.5] text-[var(--muted)]">
                  <input
                    type="checkbox"
                    className="mt-0.5 accent-[var(--accent)]"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                  />
                  <span>{consentLabel}</span>
                </label>
                <button
                  type="button"
                  className="inline-flex w-full items-center justify-center rounded-md bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                  disabled={!consent}
                  onClick={() =>
                    void advance(
                      { privacyConsent: true },
                      step.placeholder || "Send application",
                    )
                  }
                >
                  {step.placeholder || "Send application"}
                </button>
              </div>
            ) : null}

            {inputKind === "text" ? (
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  sendDraft();
                }}
              >
                <input
                  className="min-w-0 flex-1 rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-base text-[var(--fg)] outline-none focus:border-[var(--accent)] sm:text-sm"
                  value={draft}
                  placeholder={step.placeholder}
                  autoComplete={
                    step.field === "email"
                      ? "email"
                      : step.field === "name"
                        ? "name"
                        : step.field === "mobile"
                          ? "tel"
                          : "off"
                  }
                  inputMode={
                    step.field === "email"
                      ? "email"
                      : step.field === "mobile"
                        ? "tel"
                        : "text"
                  }
                  onChange={(e) => setDraft(e.target.value)}
                />
                <button
                  type="submit"
                  className="rounded-md bg-[var(--accent)] px-3 py-2.5 text-sm font-semibold text-white"
                >
                  Send
                </button>
              </form>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );

  if (isPage) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-6 sm:py-10">
        {panel}
      </div>
    );
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-end p-3 sm:p-4">
      <div className="pointer-events-auto w-full max-w-[24rem]">
        {open ? panel : (
          <button
            type="button"
            className="ml-auto flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_40px_#d8231c66]"
            onClick={() => requestOpen(initialTier)}
          >
            {funnel.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={funnel.avatarUrl}
                alt=""
                className="h-7 w-7 rounded-full object-cover"
              />
            ) : null}
            {funnel.launcherLabel}
          </button>
        )}
      </div>
    </div>
  );
}

function inputType(field: CmsFunnelStep["field"] | undefined) {
  if (!field) return "none";
  if (field === "message") return "message";
  if (field === "privacy") return "privacy";
  if (
    field === "tier" ||
    field === "mainGoal" ||
    field === "trainingNow" ||
    field === "daysCommit" ||
    field === "investment"
  ) {
    return "chips";
  }
  return "text";
}

function chipChoices(
  field: CmsFunnelStep["field"] | undefined,
  q: ReturnType<typeof useCms>["questionnaire"],
): { value: string; label: string }[] {
  if (field === "tier") {
    return [
      { value: "pro", label: "Pro" },
      { value: "elite", label: "Elite" },
    ];
  }
  if (field === "mainGoal") {
    return (q.goals as MainGoal[]).map((value) => ({ value, label: value }));
  }
  if (field === "trainingNow") {
    return (q.trainingNow as TrainingNow[]).map((value) => ({
      value,
      label: value,
    }));
  }
  if (field === "daysCommit") {
    return (q.daysCommit as DaysCommit[]).map((value) => ({
      value,
      label: value === "5+" ? "5+ days" : `${value} days`,
    }));
  }
  if (field === "investment") {
    return (q.investment as InvestmentAnswer[]).map((value) => ({
      value,
      label: value,
    }));
  }
  return [];
}
