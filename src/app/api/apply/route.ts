import { NextResponse } from "next/server";
import { newApplyId, upsertApplyLead, getApplyLead } from "@/lib/apply/store";
import { applyTierFromRoute, routeApplyLead } from "@/lib/apply/routeLead";
import type { ApplyAnswers, ApplyLead } from "@/lib/apply/types";
import { loadIntegrations } from "@/lib/integrations/store";
import { sanitizePlainDeep } from "@/lib/text/plain";

export const runtime = "nodejs";

function parseUtm(url: string | undefined): Record<string, string> {
  if (!url) return {};
  try {
    const u = new URL(url);
    const utm: Record<string, string> = {};
    u.searchParams.forEach((value, key) => {
      if (key.startsWith("utm_")) utm[key] = value;
    });
    return utm;
  } catch {
    return {};
  }
}

export async function POST(request: Request) {
  let body: {
    id?: string;
    step?: ApplyLead["step"];
    droppedAt?: string;
    vslWatchPct?: number;
    answers?: Partial<ApplyAnswers>;
    referer?: string;
    finish?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const existing = body.id ? await getApplyLead(body.id) : null;
  const now = new Date().toISOString();
  const answers: ApplyAnswers = sanitizePlainDeep({
    name: "",
    email: "",
    mobile: "",
    goal: "",
    startingPoint: "",
    days: "",
    obstacles: [],
    timeline: "",
    coachHistory: "",
    investment: "",
    ...existing?.answers,
    ...body.answers,
  });

  const finish = Boolean(body.finish);
  const route = finish ? routeApplyLead(answers) : existing?.route || "";
  const lead: ApplyLead = {
    id: existing?.id || body.id || newApplyId(),
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    step: body.step || existing?.step || "gate",
    droppedAt: body.droppedAt || existing?.droppedAt || body.step || "gate",
    vslWatchPct: Math.max(existing?.vslWatchPct ?? 0, body.vslWatchPct ?? 0),
    route,
    utm: existing?.utm || parseUtm(body.referer || request.headers.get("referer") || ""),
    answers,
  };

  await upsertApplyLead(lead);

  if (lead.answers.email) {
    try {
      const { ghl } = await loadIntegrations();
      if (ghl.apiKey && ghl.locationId) {
        const tier = applyTierFromRoute(route || "nurture");
        await fetch(`${ghl.apiBaseUrl}/contacts/upsert`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ghl.apiKey}`,
            Version: "2021-07-28",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            locationId: ghl.locationId,
            firstName: answers.name.split(" ")[0] || answers.name,
            name: answers.name,
            email: answers.email,
            phone: answers.mobile || undefined,
            source: "gated_apply",
            tags: [
              "funnel_apply",
              "source_gated_vsl",
              route ? `route_${route}` : "route_pending",
              ...(tier ? [`tier_${tier}`] : []),
            ],
            customFields: [
              { key: "goal", field_value: answers.goal },
              { key: "starting_point", field_value: answers.startingPoint },
              { key: "days_per_week", field_value: answers.days },
              { key: "obstacles", field_value: answers.obstacles.join(", ") },
              { key: "timeline", field_value: answers.timeline },
              { key: "coach_history", field_value: answers.coachHistory },
              { key: "investment_band", field_value: answers.investment },
              { key: "route", field_value: route },
              { key: "vsl_watch_pct", field_value: String(lead.vslWatchPct) },
              { key: "dropped_at", field_value: lead.droppedAt },
            ],
          }),
        });
      }
    } catch (error) {
      console.warn("[api/apply] CRM upsert failed", error);
    }
  }

  const tier = applyTierFromRoute(route || "nurture");
  return NextResponse.json({
    id: lead.id,
    route: lead.route || undefined,
    calendarHref: tier ? `/book/calendar?tier=${tier}` : undefined,
  });
}
