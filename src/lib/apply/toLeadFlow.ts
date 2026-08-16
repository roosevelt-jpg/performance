import { applyTierFromRoute } from "./routeLead";
import type { ApplyAnswers, ApplyRoute } from "./types";
import type { LeadFlowState } from "@/lib/session/leadSession";
import type {
  DaysCommit,
  MainGoal,
  QuestionnaireAnswers,
  TrainingNow,
} from "@/types/lead";

function daysCommit(days: ApplyAnswers["days"]): DaysCommit | "" {
  if (days === "five_plus") return "5+";
  if (days === "three_four") return "3";
  if (days === "two") return "2";
  if (days === "under_two") return "1";
  return "";
}

function trainingNow(startingPoint: string): TrainingNow | "" {
  const value = startingPoint.toLowerCase();
  if (value.includes("consistently")) return "5+ days";
  if (value.includes("on and off")) return "3–4 days";
  if (value.includes("stopped")) return "1–2 days";
  if (value.includes("never")) return "None";
  return "";
}

function mainGoal(goal: string): MainGoal | "" {
  const value = goal.toLowerCase();
  if (value.includes("fat")) return "fat loss";
  if (value.includes("muscle")) return "physique";
  if (value.includes("strong") || value.includes("fit")) return "strength";
  if (value.includes("rebuild") || value.includes("injury")) return "general health";
  return "";
}

export function questionnaireFromApply(
  answers: ApplyAnswers,
  tier: "pro" | "elite",
): QuestionnaireAnswers {
  return {
    tier,
    name: answers.name,
    email: answers.email,
    mobile: answers.mobile,
    instagram: "",
    mainGoal: mainGoal(answers.goal),
    trainingNow: trainingNow(answers.startingPoint),
    daysCommit: daysCommit(answers.days),
    medical: "",
    stoppedResults: answers.obstacles.join(", "),
    whyNow: answers.timeline,
    structuredProgramme: answers.coachHistory,
    investment: "Yes",
    privacyConsent: true,
  };
}

/** High-route apply leads get a qualified calendar session. Others do not. */
export function leadFlowFromApply(params: {
  answers: ApplyAnswers;
  route: ApplyRoute | "";
  submissionId?: string;
}): LeadFlowState | null {
  const tier = applyTierFromRoute(params.route || "nurture");
  if (!tier) return null;
  return {
    tier,
    answers: questionnaireFromApply(params.answers, tier),
    evaluation: {
      outcome: "qualified",
      flags: [],
      disqualifyReasons: [],
    },
    submissionId: params.submissionId,
  };
}
