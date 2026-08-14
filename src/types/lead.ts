export type CoachingTier = "pro" | "elite";

export type MainGoal =
  | "fat loss"
  | "strength"
  | "physique"
  | "performance"
  | "general health";

export type TrainingNow = "None" | "1–2 days" | "3–4 days" | "5+ days";

export type DaysCommit = "1" | "2" | "3" | "4" | "5+";

export type InvestmentAnswer = "Yes" | "I'd like to know more" | "No";

export type QuestionnaireAnswers = {
  tier: CoachingTier;
  name: string;
  email: string;
  mobile: string;
  instagram: string;
  mainGoal: MainGoal | "";
  trainingNow: TrainingNow | "";
  daysCommit: DaysCommit | "";
  medical: string;
  stoppedResults: string;
  whyNow: string;
  structuredProgramme: string;
  investment: InvestmentAnswer | "";
  privacyConsent: boolean;
};

export type LeadOutcome = "qualified" | "disqualified";

export type LeadFlag =
  | "pricing_discussion"
  | "medical_review"
  | "low_commitment"
  | "investment_no";

export type EvaluateLeadResult = {
  outcome: LeadOutcome;
  flags: LeadFlag[];
  disqualifyReasons: Array<"commitment" | "investment">;
};

export type LeadSubmissionPayload = {
  answers: QuestionnaireAnswers;
  consent: {
    privacy: boolean;
    source: string;
    timestamp: string;
  };
  evaluation: EvaluateLeadResult;
};
