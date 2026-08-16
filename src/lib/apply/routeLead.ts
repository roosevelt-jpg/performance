import type { ApplyAnswers, ApplyInvestId, ApplyRoute } from "./types";

const HIGH_BUDGET: ApplyInvestId[] = ["500_1000", "1000_plus"];

/**
 * Spec 2 routing. First match wins.
 * Rule 4 sends high-budget, sub-2-day applicants to the Challenge
 * so 1:1 stays for people who can actually train.
 */
export function routeApplyLead(answers: ApplyAnswers): ApplyRoute {
  if (answers.investment === "under_150") return "nurture";
  if (answers.timeline === "looking") return "nurture";
  if (answers.investment === "150_500") return "low";
  if (
    HIGH_BUDGET.includes(answers.investment as ApplyInvestId) &&
    answers.days === "under_two"
  ) {
    return "low";
  }
  if (answers.investment === "500_1000") return "high_pro";
  if (answers.investment === "1000_plus") return "high_elite";
  return "nurture";
}

export function applyTierFromRoute(
  route: ApplyRoute,
): "pro" | "elite" | null {
  if (route === "high_pro") return "pro";
  if (route === "high_elite") return "elite";
  return null;
}

export function applyOutcomeKey(
  route: ApplyRoute,
): "high" | "low" | "nurture" {
  if (route === "high_pro" || route === "high_elite") return "high";
  if (route === "low") return "low";
  return "nurture";
}
