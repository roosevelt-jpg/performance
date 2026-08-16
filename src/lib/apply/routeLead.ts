import { DEFAULT_APPLY_ROUTING } from "./defaults";
import type { ApplyAnswers, ApplyRoute, ApplyRouting } from "./types";

/**
 * Spec 2 routing. First match wins.
 * Rule 4 sends high-budget, sub-2-day applicants to the Challenge
 * so 1:1 stays for people who can actually train.
 */
export function routeApplyLead(
  answers: ApplyAnswers,
  routing: ApplyRouting = DEFAULT_APPLY_ROUTING,
): ApplyRoute {
  const investment = answers.investment;
  const timeline = answers.timeline;
  const days = answers.days;

  if (routing.nurtureInvestmentIds.includes(investment)) return "nurture";
  if (routing.nurtureTimelineIds.includes(timeline)) return "nurture";
  if (routing.lowInvestmentIds.includes(investment)) return "low";
  if (
    routing.highBudgetInvestmentIds.includes(investment) &&
    routing.lowDaysIds.includes(days)
  ) {
    return "low";
  }
  if (routing.highProInvestmentIds.includes(investment)) return "high_pro";
  if (routing.highEliteInvestmentIds.includes(investment)) return "high_elite";
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
