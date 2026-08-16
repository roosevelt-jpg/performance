import { DNA_QUESTIONS } from "./questions";
import type { DnaAnswers, DnaCategoryId, DnaQuestion, DnaResult } from "./types";
import { loadIntegrations } from "@/lib/integrations/store";

type LlmCopy = {
  summary?: string;
  nextStep?: string;
  insights?: Partial<Record<DnaCategoryId, string>>;
};

const CATEGORIES: DnaCategoryId[] = [
  "journey",
  "training",
  "nutrition",
  "routine",
  "health",
  "mindset",
];

function chosenLabels(answers: DnaAnswers, questions: DnaQuestion[]): string[] {
  return questions.map((q) => {
    const opt = q.options.find((o) => o.id === answers[q.id]);
    return `${q.category} / ${q.title} → ${opt?.label ?? answers[q.id]}`;
  });
}

function clip(text: string, max: number): string {
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trim()}…`;
}

/**
 * Rewrites report copy only. Scores, path and assigned coach stay native.
 * No key → native copy. Timeout or junk JSON → native copy.
 */
export async function narrateDnaReport(params: {
  result: DnaResult;
  answers: DnaAnswers;
  name: string;
  questions?: DnaQuestion[];
}): Promise<DnaResult> {
  const config = await loadIntegrations();
  const key = config.ai?.openaiApiKey?.trim();
  if (!key) return params.result;

  const model = config.ai.model?.trim() || "gpt-4o-mini";
  const scores = params.result.categories
    .map((c) => `${c.label}: ${c.score}/100`)
    .join("; ");
  const body = {
    model,
    temperature: 0.4,
    max_tokens: 700,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You write Kane Mousah's Performance DNA reports for The Formula. Voice: direct, British, no hype, no medical claims, never invent prices. You never change scores or the next product. Return JSON only.",
      },
      {
        role: "user",
        content: [
          `First name: ${params.name || "there"}`,
          `Locked overall: ${params.result.overall}/100`,
          `Locked scores: ${scores}`,
          `Locked path: ${params.result.path}`,
          `Assigned coach: ${params.result.coach.name} (${params.result.coach.role})`,
          `Primary leak: ${params.result.primaryLeak.label} (${params.result.primaryLeak.score})`,
          `Flags: ${params.result.flags.join(", ") || "none"}`,
          "Answers:",
          ...chosenLabels(params.answers, params.questions ?? DNA_QUESTIONS),
          "Return JSON: { \"summary\": string, \"nextStep\": string, \"insights\": { \"journey\": string, \"training\": string, \"nutrition\": string, \"routine\": string, \"health\": string, \"mindset\": string } }",
          "Each insight one or two sentences. Do not mention a different score than the locked numbers. Do not recommend Pro or Elite prices. Do not invent a different path.",
        ].join("\n"),
      },
    ],
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4500);
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) return params.result;
    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = json.choices?.[0]?.message?.content || "";
    const parsed = JSON.parse(raw) as LlmCopy;
    return overlayCopy(params.result, parsed);
  } catch {
    return params.result;
  } finally {
    clearTimeout(timer);
  }
}

function overlayCopy(result: DnaResult, copy: LlmCopy): DnaResult {
  const insights = copy.insights ?? {};
  const categories = result.categories.map((cat) => {
    const next = insights[cat.id];
    if (!next || next.trim().length < 24) return cat;
    return { ...cat, insight: clip(next, 280) };
  });
  return {
    ...result,
    overall: result.overall,
    path: result.path,
    coach: result.coach,
    primaryLeak: result.primaryLeak,
    flags: result.flags,
    categories,
    summary:
      copy.summary && copy.summary.trim().length > 40
        ? clip(copy.summary, 360)
        : result.summary,
    nextStep:
      copy.nextStep && copy.nextStep.trim().length > 24
        ? clip(copy.nextStep, 220)
        : result.nextStep,
    copySource: "llm",
  };
}
