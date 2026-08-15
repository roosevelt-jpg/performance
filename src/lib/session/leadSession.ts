import type {
  EvaluateLeadResult,
  QuestionnaireAnswers,
} from "@/types/lead";

const STORAGE_KEY = "formula_lead_flow_v1";

export type LeadFlowState = {
  tier: "pro" | "elite";
  answers?: QuestionnaireAnswers;
  evaluation?: EvaluateLeadResult;
  submissionId?: string;
  bookedAt?: string;
  booking?: {
    start: string;
    end: string;
    timeZone: string;
    eventId: string;
    htmlLink?: string;
    platform: string;
  };
};

export function saveLeadFlow(state: LeadFlowState): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function loadLeadFlow(): LeadFlowState | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LeadFlowState;
  } catch {
    return null;
  }
}

export function clearLeadFlow(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}

export function mergeLeadFlow(partial: Partial<LeadFlowState>): LeadFlowState {
  const current = loadLeadFlow();
  const next = { ...current, ...partial } as LeadFlowState;
  saveLeadFlow(next);
  return next;
}
