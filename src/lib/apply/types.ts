export type ApplyRoute = "high_pro" | "high_elite" | "low" | "nurture";

export type ApplyDaysId = "five_plus" | "three_four" | "two" | "under_two" | string;
export type ApplyTimelineId =
  | "immediately"
  | "two_weeks"
  | "month"
  | "looking"
  | string;
export type ApplyInvestId =
  | "1000_plus"
  | "500_1000"
  | "150_500"
  | "under_150"
  | string;

export type ApplyAnswers = {
  name: string;
  email: string;
  mobile: string;
  goal: string;
  startingPoint: string;
  days: ApplyDaysId | "";
  obstacles: string[];
  timeline: ApplyTimelineId | "";
  coachHistory: string;
  investment: ApplyInvestId | "";
};

export type ApplyLead = {
  id: string;
  createdAt: string;
  updatedAt: string;
  step: "gate" | "vsl" | "qualify" | "routed";
  droppedAt: string;
  vslWatchPct: number;
  route: ApplyRoute | "";
  utm: Record<string, string>;
  answers: ApplyAnswers;
};

export type ApplyOutcomeCopy = {
  heading: string;
  body: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
};

export type ApplyQuestionOption = {
  id: string;
  label: string;
};

export type ApplyQuestion = {
  id: string;
  title: string;
  multi?: boolean;
  options: ApplyQuestionOption[];
};

/** First match wins. IDs must match option ids on the questions. */
export type ApplyRouting = {
  nurtureInvestmentIds: string[];
  nurtureTimelineIds: string[];
  lowInvestmentIds: string[];
  highBudgetInvestmentIds: string[];
  lowDaysIds: string[];
  highProInvestmentIds: string[];
  highEliteInvestmentIds: string[];
};

export type CmsApplyFunnel = {
  enabled: boolean;
  gateEnabled: boolean;
  watchPct: number;
  nurtureUrl: string;
  gateHeadline: string;
  gateBody: string;
  gateCta: string;
  vslCta: string;
  escapeHatchLabel: string;
  progressLabel: string;
  mobileTitle: string;
  mobileBody: string;
  mobileCta: string;
  high: ApplyOutcomeCopy;
  low: ApplyOutcomeCopy;
  nurture: ApplyOutcomeCopy;
  questions: ApplyQuestion[];
  routing: ApplyRouting;
};
