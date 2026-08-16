import {
  DNA_CATEGORY_LABELS,
  DNA_QUESTIONS,
  DEFAULT_DNA,
  DEFAULT_DNA_GATES,
} from "./questions";
import { insightFor } from "./insights";
import { DNA_WEIGHTS, weightedAverage } from "./weights";
import type {
  CmsDna,
  DnaAnswers,
  DnaCategoryId,
  DnaCategoryScore,
  DnaGates,
  DnaLiveBoard,
  DnaOptionFlag,
  DnaQuestion,
  DnaResult,
} from "./types";

export { DNA_WEIGHTS, weightedAverage } from "./weights";

function dnaConfig(overlay?: CmsDna): CmsDna {
  if (!overlay) return DEFAULT_DNA;
  return {
    ...DEFAULT_DNA,
    ...overlay,
    coaches: overlay.coaches?.length ? overlay.coaches : DEFAULT_DNA.coaches,
    questions: overlay.questions?.length
      ? overlay.questions
      : DEFAULT_DNA.questions,
    weights: { ...DEFAULT_DNA.weights, ...overlay.weights },
    gates: { ...DEFAULT_DNA.gates, ...overlay.gates },
  };
}

function questionsOf(cms: CmsDna): DnaQuestion[] {
  return cms.questions?.length ? cms.questions : DNA_QUESTIONS;
}

function weightsOf(cms: CmsDna) {
  return { ...DNA_WEIGHTS, ...cms.weights };
}

function gatesOf(cms: CmsDna): DnaGates {
  return { ...DEFAULT_DNA_GATES, ...cms.gates };
}

function selectedFlags(questions: DnaQuestion[], answers: DnaAnswers): Set<DnaOptionFlag> {
  const flags = new Set<DnaOptionFlag>();
  for (const q of questions) {
    const chosen = q.options.find((opt) => opt.id === answers[q.id]);
    for (const flag of chosen?.flags ?? []) flags.add(flag);
  }
  return flags;
}

export function categoryScoresFromAnswers(
  answers: DnaAnswers,
  cms?: CmsDna,
): DnaCategoryScore[] {
  const questions = questionsOf(dnaConfig(cms));
  const groups = new Map<DnaCategoryId, { scores: number[]; ids: string[] }>();
  for (const q of questions) {
    const chosen = q.options.find((opt) => opt.id === answers[q.id]);
    if (!chosen) continue;
    const row = groups.get(q.category) ?? { scores: [], ids: [] };
    row.scores.push((chosen.score / 3) * 100);
    row.ids.push(chosen.id);
    groups.set(q.category, row);
  }

  return (Object.keys(DNA_CATEGORY_LABELS) as DnaCategoryId[]).flatMap(
    (id) => {
      const row = groups.get(id);
      if (!row?.scores.length) return [];
      const score = Math.round(
        row.scores.reduce((sum, n) => sum + n, 0) / row.scores.length,
      );
      return [
        {
          id,
          label: DNA_CATEGORY_LABELS[id],
          score,
          insight: insightFor(
            id,
            row.ids[0] || "",
            row.ids[1] || row.ids[0] || "",
            score,
          ),
        },
      ];
    },
  );
}

export function liveDnaBoard(
  answers: DnaAnswers,
  cms?: CmsDna,
): DnaLiveBoard {
  const conf = dnaConfig(cms);
  const categories = (Object.keys(DNA_CATEGORY_LABELS) as DnaCategoryId[]).map(
    (id) => {
      const row = categoryScoresFromAnswers(answers, conf).find((c) => c.id === id);
      return {
        id,
        label: DNA_CATEGORY_LABELS[id],
        score: row?.score ?? null,
      };
    },
  );
  const scored = categories
    .filter((c) => c.score !== null)
    .map((c) => ({ id: c.id, score: c.score as number }));
  return {
    categories,
    overall: weightedAverage(scored, weightsOf(conf)),
  };
}

function routePath(
  flags: Set<DnaOptionFlag>,
  categories: DnaCategoryScore[],
  overall: number,
  gates: DnaGates,
): DnaResult["path"] {
  const training = categories.find((c) => c.id === "training")?.score ?? 0;
  const mindset = categories.find((c) => c.id === "mindset")?.score ?? 0;
  const nutrition = categories.find((c) => c.id === "nutrition")?.score ?? 0;

  if (flags.has("looking") || flags.has("no_accountability")) return "group";

  if (flags.has("low_frequency")) {
    return overall >= gates.challengeMinOverall ||
      training >= gates.challengeMinTraining ||
      nutrition >= gates.challengeMinNutrition
      ? "challenge"
      : "group";
  }

  if (
    overall >= gates.callMinOverall &&
    training >= gates.callMinTraining &&
    mindset >= gates.callMinMindset &&
    !flags.has("uncommitted")
  ) {
    return "call";
  }

  if (overall >= gates.challengeMinOverall || training >= gates.challengeMinTraining) {
    return "challenge";
  }
  return "group";
}

function flagsList(flags: Set<DnaOptionFlag>): string[] {
  const out: string[] = [];
  if (flags.has("looking")) out.push("just_looking");
  if (flags.has("uncommitted")) out.push("uncommitted");
  if (flags.has("no_accountability")) out.push("no_accountability");
  if (flags.has("low_frequency")) out.push("low_frequency");
  if (flags.has("nutrition_leak")) out.push("nutrition_leak");
  if (flags.has("no_slot")) out.push("no_slot");
  return out;
}

function primaryLeak(categories: DnaCategoryScore[]): DnaCategoryScore {
  const ranked = [...categories].sort((a, b) => {
    if (a.score !== b.score) return a.score - b.score;
    const order: DnaCategoryId[] = [
      "training",
      "nutrition",
      "routine",
      "mindset",
      "health",
      "journey",
    ];
    return order.indexOf(a.id) - order.indexOf(b.id);
  });
  return ranked[0] ?? categories[0];
}

function summaryFor(
  overall: number,
  path: DnaResult["path"],
  leak: DnaCategoryScore,
): string {
  if (path === "call") {
    return `Score ${overall}. You can train and you want the standard. Weakest area is ${leak.label.toLowerCase()} (${leak.score}) — Kane should see the application himself.`;
  }
  if (path === "challenge") {
    return `Score ${overall}. You know what to do. ${leak.label} is the leak (${leak.score}). Eight coached weeks close that before 1:1.`;
  }
  return `Score ${overall}. Paying for 1:1 now would be the wrong move. ${leak.label} is too early (${leak.score}). Build the habit in the free group, then come back when the week is yours.`;
}

function nextStepFor(
  path: DnaResult["path"],
  leak: DnaCategoryScore,
): string {
  if (path === "call") {
    return `Book a call with Kane. He is briefed on this DNA — including ${leak.label.toLowerCase()} as the first thing to press.`;
  }
  if (path === "challenge") {
    return `Start the 8-Week Challenge. Same system, daily accountability, and a coach on ${leak.label.toLowerCase()} until the week holds.`;
  }
  return `Join the free group. Training, questions, and the standard — no card. ${leak.label} is where we start when you come back.`;
}

export function scoreDna(
  answers: DnaAnswers,
  overlay?: CmsDna,
): DnaResult {
  const cms = dnaConfig(overlay);
  const questions = questionsOf(cms);
  const filled: DnaAnswers = { ...answers };
  for (const q of questions) {
    if (!filled[q.id]) {
      filled[q.id] = q.options[q.options.length - 1]?.id ?? "d";
    }
  }

  const categories = (Object.keys(DNA_CATEGORY_LABELS) as DnaCategoryId[]).map(
    (id) => {
      const qs = questions.filter((q) => q.category === id);
      const vals = qs.map((q) => {
        const chosen = q.options.find((opt) => opt.id === filled[q.id]);
        return chosen ? (chosen.score / 3) * 100 : 0;
      });
      const ids = qs.map((q) => filled[q.id] || "");
      const score = Math.round(
        vals.reduce((sum, n) => sum + n, 0) / Math.max(vals.length, 1),
      );
      return {
        id,
        label: DNA_CATEGORY_LABELS[id],
        score,
        insight: insightFor(id, ids[0], ids[1] || ids[0], score),
      };
    },
  );

  const overall = weightedAverage(categories, weightsOf(cms));
  const leak = primaryLeak(categories);
  const flags = selectedFlags(questions, filled);
  const path = routePath(flags, categories, overall, gatesOf(cms));
  const coach =
    cms.coaches.find((c) => c.forPath === path) ??
    cms.coaches[cms.coaches.length - 1] ??
    DEFAULT_DNA.coaches[0];

  return {
    overall,
    categories,
    path,
    coach,
    summary: summaryFor(overall, path, leak),
    nextStep: nextStepFor(path, leak),
    primaryLeak: { id: leak.id, label: leak.label, score: leak.score },
    flags: flagsList(flags),
    copySource: "native",
  };
}

export function interpolateName(template: string, name: string): string {
  return template.replaceAll("{name}", name.trim() || "there");
}

export function coachByPath(cms: CmsDna, path: DnaResult["path"]) {
  return (
    cms.coaches.find((c) => c.forPath === path) ??
    DEFAULT_DNA.coaches.find((c) => c.forPath === path)
  );
}
