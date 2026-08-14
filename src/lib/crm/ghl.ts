import type { LeadSubmissionPayload } from "@/types/lead";
import { loadIntegrations } from "@/lib/integrations/store";

function tierTag(tier: "pro" | "elite"): string {
  return tier === "pro" ? "tier_pro" : "tier_elite";
}

function flagTags(flags: LeadSubmissionPayload["evaluation"]["flags"]): string[] {
  const map: Record<string, string> = {
    pricing_discussion: "flag_pricing_discussion",
    medical_review: "flag_medical_review",
    low_commitment: "flag_low_commitment",
    investment_no: "flag_investment_no",
  };
  return flags.map((f) => map[f]).filter(Boolean);
}

/**
 * Thin GoHighLevel contact upsert. Server-only.
 * Credentials come from integrations store (UI + env).
 */
export async function upsertLeadInGhl(
  payload: LeadSubmissionPayload,
): Promise<{ id: string; mocked: boolean }> {
  const { ghl } = await loadIntegrations();
  const { apiKey, locationId, apiBaseUrl } = ghl;

  const tags = [
    tierTag(payload.answers.tier),
    ...flagTags(payload.evaluation.flags),
  ];

  const customFields = [
    { key: "tier", field_value: payload.answers.tier },
    { key: "instagram", field_value: payload.answers.instagram },
    { key: "main_goal", field_value: payload.answers.mainGoal },
    { key: "training_now", field_value: payload.answers.trainingNow },
    { key: "days_commit", field_value: payload.answers.daysCommit },
    { key: "medical", field_value: payload.answers.medical },
    {
      key: "stopped_results",
      field_value: payload.answers.stoppedResults,
    },
    { key: "why_now", field_value: payload.answers.whyNow },
    {
      key: "structured_programme",
      field_value: payload.answers.structuredProgramme,
    },
    { key: "investment", field_value: payload.answers.investment },
    { key: "consent_source", field_value: payload.consent.source },
    { key: "consent_timestamp", field_value: payload.consent.timestamp },
    {
      key: "lead_outcome",
      field_value: payload.evaluation.outcome,
    },
  ];

  const body = {
    locationId,
    firstName: payload.answers.name.split(" ")[0] ?? payload.answers.name,
    lastName: payload.answers.name.split(" ").slice(1).join(" ") || undefined,
    name: payload.answers.name,
    email: payload.answers.email,
    phone: payload.answers.mobile,
    tags,
    source: payload.consent.source,
    customFields,
  };

  if (!apiKey || !locationId) {
    console.warn(
      "[ghl] Missing API key or location ID — returning mock contact id",
    );
    return {
      id: `mock_${payload.answers.tier}_${Date.now()}`,
      mocked: true,
    };
  }

  const res = await fetch(`${apiBaseUrl}/contacts/upsert`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Version: "2021-07-28",
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GHL upsert failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as {
    contact?: { id?: string };
    id?: string;
  };

  return {
    id: data.contact?.id ?? data.id ?? `ghl_${Date.now()}`,
    mocked: false,
  };
}

export async function updateWhatsAppOptIn(params: {
  contactId: string;
  optedIn: boolean;
  source: string;
  timestamp: string;
}): Promise<{ mocked: boolean }> {
  const { ghl } = await loadIntegrations();
  const { apiKey, locationId, apiBaseUrl } = ghl;

  if (!apiKey || !locationId || params.contactId.startsWith("mock_")) {
    return { mocked: true };
  }

  const tags = params.optedIn ? ["whatsapp_opt_in"] : ["whatsapp_opt_out"];

  const res = await fetch(`${apiBaseUrl}/contacts/${params.contactId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Version: "2021-07-28",
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      tags,
      customFields: [
        { key: "whatsapp_opt_in", field_value: String(params.optedIn) },
        { key: "whatsapp_opt_in_source", field_value: params.source },
        { key: "whatsapp_opt_in_timestamp", field_value: params.timestamp },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GHL WhatsApp update failed (${res.status}): ${text}`);
  }

  return { mocked: false };
}

export async function upsertEmailSignup(params: {
  email: string;
  source: string;
}): Promise<{ mocked: boolean; id?: string }> {
  const { ghl } = await loadIntegrations();
  const { apiKey, locationId, apiBaseUrl } = ghl;

  if (!apiKey || !locationId) {
    return { mocked: true };
  }

  const res = await fetch(`${apiBaseUrl}/contacts/upsert`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Version: "2021-07-28",
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      locationId,
      email: params.email,
      tags: ["email_signup", "marketing_popup"],
      source: params.source,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GHL email signup failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as {
    contact?: { id?: string };
    id?: string;
  };

  return {
    mocked: false,
    id: data.contact?.id ?? data.id,
  };
}
