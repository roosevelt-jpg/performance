export type ApplyRoute = "high_pro" | "high_elite" | "low" | "nurture";

export type ApplyDaysId = "five_plus" | "three_four" | "two" | "under_two";
export type ApplyTimelineId =
  | "immediately"
  | "two_weeks"
  | "month"
  | "looking";
export type ApplyInvestId = "1000_plus" | "500_1000" | "150_500" | "under_150";

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
  high: ApplyOutcomeCopy;
  low: ApplyOutcomeCopy;
  nurture: ApplyOutcomeCopy;
};
