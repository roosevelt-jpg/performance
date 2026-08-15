import { NextResponse } from "next/server";
import { CONSENT_SOURCE } from "@/lib/content/copy";
import { upsertLeadInGhl } from "@/lib/crm/ghl";
import { evaluateLead } from "@/lib/qualify/evaluateLead";
import type { QuestionnaireAnswers } from "@/types/lead";

export const runtime = "nodejs";

function isValidAnswers(body: unknown): body is QuestionnaireAnswers & {
  intakeSource?: string;
} {
  if (!body || typeof body !== "object") return false;
  const a = body as QuestionnaireAnswers;
  return (
    (a.tier === "pro" || a.tier === "elite") &&
    typeof a.name === "string" &&
    typeof a.email === "string" &&
    typeof a.mobile === "string" &&
    typeof a.instagram === "string" &&
    typeof a.medical === "string" &&
    a.privacyConsent === true
  );
}

function intakeSource(body: QuestionnaireAnswers & { intakeSource?: string }): string {
  return body.intakeSource === "funnel_chat"
    ? "funnel_chat"
    : CONSENT_SOURCE;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isValidAnswers(body)) {
    return NextResponse.json(
      { error: "Invalid questionnaire payload" },
      { status: 400 },
    );
  }

  const evaluation = evaluateLead(body);
  const consentTimestamp = new Date().toISOString();
  const { intakeSource: _source, ...answers } = body;

  try {
    const contact = await upsertLeadInGhl({
      answers,
      consent: {
        privacy: true,
        source: intakeSource(body),
        timestamp: consentTimestamp,
      },
      evaluation,
    });

    return NextResponse.json({
      outcome: evaluation.outcome,
      flags: evaluation.flags,
      disqualifyReasons: evaluation.disqualifyReasons,
      contactId: contact.id,
      mocked: contact.mocked,
      consentTimestamp,
    });
  } catch (error) {
    console.error("[api/leads]", error);
    return NextResponse.json(
      { error: "Failed to save lead" },
      { status: 502 },
    );
  }
}
