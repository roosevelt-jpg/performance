export type DnaCategoryId =
  | "journey"
  | "training"
  | "nutrition"
  | "routine"
  | "health"
  | "mindset";

export type DnaOptionFlag =
  | "looking"
  | "uncommitted"
  | "no_accountability"
  | "low_frequency"
  | "nutrition_leak"
  | "no_slot";

export type DnaOption = {
  id: string;
  label: string;
  /** 0–3. Higher is closer to Kane's standard. */
  score: number;
  flags?: DnaOptionFlag[];
};

export type DnaQuestion = {
  id: string;
  category: DnaCategoryId;
  title: string;
  options: DnaOption[];
};

export type DnaCoach = {
  id: string;
  name: string;
  role: string;
  forPath: "call" | "challenge" | "group";
};

export type DnaGates = {
  callMinOverall: number;
  callMinTraining: number;
  callMinMindset: number;
  challengeMinOverall: number;
  challengeMinTraining: number;
  challengeMinNutrition: number;
};

export type CmsDna = {
  enabled: boolean;
  eyebrow: string;
  heading: string;
  body: string;
  ctaLabel: string;
  href: string;
  resultHeading: string;
  sendingNote: string;
  coaches: DnaCoach[];
  questions: DnaQuestion[];
  weights: Record<DnaCategoryId, number>;
  gates: DnaGates;
};

export type DnaAnswers = Record<string, string>;

export type DnaCategoryScore = {
  id: DnaCategoryId;
  label: string;
  score: number;
  insight: string;
};

export type DnaResult = {
  overall: number;
  categories: DnaCategoryScore[];
  path: "call" | "challenge" | "group";
  coach: DnaCoach;
  summary: string;
  nextStep: string;
  primaryLeak: Pick<DnaCategoryScore, "id" | "label" | "score">;
  flags: string[];
  copySource: "native" | "llm";
};

export type DnaLiveBoard = {
  overall: number;
  categories: Array<{
    id: DnaCategoryId;
    label: string;
    score: number | null;
  }>;
};
