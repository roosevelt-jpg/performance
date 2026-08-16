import { DNA_CATEGORY_LABELS, DNA_QUESTIONS, DEFAULT_DNA } from "./questions";
import { insightFor } from "./insights";
import { weightedAverage } from "./weights";
import type {
  CmsDna,
  DnaAnswers,
  DnaCategoryId,
  DnaCategoryScore,
  DnaLiveBoard,
  DnaResult,
} from "./types";

export { DNA_WEIGHTS, weightedAverage } from "./weights";

function optionScore(questionId: string, optionId: string | undefined): number {
  const q = DNA_QUESTIONS.find((item) => item.id === questionId);
  const chosen = q?.options.find((opt) => opt.id === optionId);
  return chosen ? (chosen.score / 3) * 100 : 0;
}

function optionId(questionId: string, answers: DnaAnswers): string {
  return answers[questionId] || "";
}

export function categoryScoresFromAnswers(
  answers: DnaAnswers,
): DnaCategoryScore[] {
  const groups = new Map<DnaCategoryId, { scores: number[]; ids: string[] }>();
  for (const q of DNA_QUESTIONS) {
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
          insight: insightFor(id, row.ids[0] || "", row.ids[1] || row.ids[0] || "", score),
        },
      ];
    },
  );
}

export function liveDnaBoard(answers: DnaAnswers): DnaLiveBoard {
  const categories = (Object.keys(DNA_CATEGORY_LABELS) as DnaCategoryId[]).map(
    (id) => {
      const row = categoryScoresFromAnswers(answers).find((c) => c.id === id);
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
    overall: weightedAverage(scored),
  };
}

function routePath(
  answers: DnaAnswers,
  categories: DnaCategoryScore[],
  overall: number,
): DnaResult["path"] {
  const looking = optionId("m2", answers) === "d";
  const refusesAccountability = optionId("m1", answers) === "d";
  const uncommitted =
    optionId("m2", answers) === "c" || optionId("m2", answers) === "d";
  const lowFrequency =
    optionId("t1", answers) === "c" || optionId("t1", answers) === "d";
  const training = categories.find((c) => c.id === "training")?.score ?? 0;
  const mindset = categories.find((c) => c.id === "mindset")?.score ?? 0;
  const nutrition = categories.find((c) => c.id === "nutrition")?.score ?? 0;

  // Wanting the product matters more than a high average.
  if (looking || refusesAccountability) return "group";

  // Sub-3 real sessions cannot deliver 1:1. Same logic as apply Rule 4.
  if (lowFrequency) {
    return overall >= 40 || training >= 40 || nutrition >= 50
      ? "challenge"
      : "group";
  }

  if (
    overall >= 72 &&
    training >= 60 &&
    mindset >= 55 &&
    !uncommitted
  ) {
    return "call";
  }

  if (overall >= 40 || training >= 40) return "challenge";
  return "group";
}

function flagsFor(answers: DnaAnswers): string[] {
  const flags: string[] = [];
  if (optionId("m2", answers) === "d") flags.push("just_looking");
  if (optionId("m2", answers) === "c") flags.push("uncommitted");
  if (optionId("m1", answers) === "d") flags.push("no_accountability");
  if (optionId("t1", answers) === "c" || optionId("t1", answers) === "d") {
    flags.push("low_frequency");
  }
  if (optionId("n1", answers) === "c" || optionId("n1", answers) === "d") {
    flags.push("nutrition_leak");
  }
  if (optionId("r1", answers) === "c" || optionId("r1", answers) === "d") {
    flags.push("no_slot");
  }
  return flags;
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
  coaches = DEFAULT_DNA.coaches,
): DnaResult {
  const filled: DnaAnswers = { ...answers };
  for (const q of DNA_QUESTIONS) {
    if (!filled[q.id]) filled[q.id] = "d";
  }

  const categories = (Object.keys(DNA_CATEGORY_LABELS) as DnaCategoryId[]).map(
    (id) => {
      const qs = DNA_QUESTIONS.filter((q) => q.category === id);
      const vals = qs.map((q) => optionScore(q.id, filled[q.id]));
      const ids = qs.map((q) => filled[q.id] || "d");
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

  const overall = weightedAverage(categories);
  const leak = primaryLeak(categories);
  const path = routePath(filled, categories, overall);
  const coach =
    coaches.find((c) => c.forPath === path) ??
    coaches[coaches.length - 1] ??
    DEFAULT_DNA.coaches[0];

  return {
    overall,
    categories,
    path,
    coach,
    summary: summaryFor(overall, path, leak),
    nextStep: nextStepFor(path, leak),
    primaryLeak: { id: leak.id, label: leak.label, score: leak.score },
    flags: flagsFor(filled),
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
