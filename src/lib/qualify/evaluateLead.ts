import type {
  DaysCommit,
  EvaluateLeadResult,
  QuestionnaireAnswers,
} from "@/types/lead";

const LOW_COMMITMENT: DaysCommit[] = ["1", "2"];

function isBlankMedical(value: string): boolean {
  const normalised = value.trim().toLowerCase();
  if (!normalised) return true;
  return ["none", "no", "n/a", "na", "nil", "nothing"].includes(normalised);
}

/**
 * Pure qualifying gate for Pro/Elite leads.
 * Disqualify: Q4 under 3 days OR Q9 = "No".
 * Flag (still book): Q9 "I'd like to know more", Q5 medical ≠ none-equivalent.
 */
export function evaluateLead(
  answers: Pick<QuestionnaireAnswers, "daysCommit" | "investment" | "medical">,
): EvaluateLeadResult {
  const flags: EvaluateLeadResult["flags"] = [];
  const disqualifyReasons: EvaluateLeadResult["disqualifyReasons"] = [];

  if (
    !answers.daysCommit ||
    LOW_COMMITMENT.includes(answers.daysCommit as DaysCommit)
  ) {
    disqualifyReasons.push("commitment");
    flags.push("low_commitment");
  }

  if (answers.investment === "No") {
    disqualifyReasons.push("investment");
    flags.push("investment_no");
  }

  if (answers.investment === "I'd like to know more") {
    flags.push("pricing_discussion");
  }

  if (!isBlankMedical(answers.medical ?? "")) {
    flags.push("medical_review");
  }

  return {
    outcome: disqualifyReasons.length > 0 ? "disqualified" : "qualified",
    flags,
    disqualifyReasons,
  };
}

export function daysCommitValue(days: DaysCommit | ""): number {
  if (!days) return 0;
  if (days === "5+") return 5;
  return Number(days);
}
