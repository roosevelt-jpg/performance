import type { DnaCategoryId } from "./types";

/**
 * Kane's filter, not a survey average.
 * Training / nutrition / routine / mindset move the result.
 * Journey and health inform the brief; they do not buy a 1:1 seat on their own.
 */
export const DNA_WEIGHTS: Record<DnaCategoryId, number> = {
  journey: 0.8,
  training: 1.4,
  nutrition: 1.3,
  routine: 1.2,
  health: 0.9,
  mindset: 1.4,
};

export function weightedAverage(
  scores: Array<{ id: DnaCategoryId; score: number }>,
  weights: Record<DnaCategoryId, number> = DNA_WEIGHTS,
): number {
  if (!scores.length) return 0;
  let sum = 0;
  let weight = 0;
  for (const row of scores) {
    const w = weights[row.id] ?? 1;
    sum += row.score * w;
    weight += w;
  }
  return Math.round(sum / weight);
}
