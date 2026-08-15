import type { BookableTier } from "@/lib/config/pricing";
import type { LeadFlowState } from "@/lib/session/leadSession";

export type CalendarEmbedRequest = {
  tier: BookableTier;
  answers: NonNullable<LeadFlowState["answers"]>;
  prefill?: {
    name?: string;
    email?: string;
    phone?: string;
  };
};

export type CalendarEmbedResult = {
  platform: "ghl" | "calendly" | "google";
  eventTypeLabel: string;
  durationMinutes: number;
  embedUrl: string;
  /** Extra query params the host page may append for prefill */
  queryParams: Record<string, string>;
};

/**
 * Calendar platform adapter — swap GHL ↔ Calendly without touching the funnel.
 */
export interface CalendarAdapter {
  getEmbed(request: CalendarEmbedRequest): CalendarEmbedResult;
}
