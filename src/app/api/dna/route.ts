import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { DNA_QUESTIONS } from "@/lib/dna/questions";
import { buildDnaPdf } from "@/lib/dna/pdf";
import { scoreDna } from "@/lib/dna/score";
import { narrateDnaReport } from "@/lib/dna/narrate";
import { newReportId, saveDnaReport } from "@/lib/dna/store";
import { loadCms } from "@/lib/cms/store";
import { deliverDnaReport, reportPublicUrl } from "@/lib/notify/report";
import { sanitizePlainDeep } from "@/lib/text/plain";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: {
    name?: string;
    email?: string;
    mobile?: string;
    answers?: Record<string, string>;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const mobile = String(body.mobile || "").trim();
  const answers = body.answers && typeof body.answers === "object" ? body.answers : {};

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const cms = await loadCms();
  const questions = cms.dna.questions?.length
    ? cms.dna.questions
    : DNA_QUESTIONS;
  const unanswered = questions.filter((q) => !answers[q.id]);
  if (unanswered.length) {
    return NextResponse.json(
      { error: "Finish every question to get a score." },
      { status: 400 },
    );
  }

  const locked = scoreDna(sanitizePlainDeep(answers), cms.dna);
  const result = await narrateDnaReport({
    result: locked,
    answers: sanitizePlainDeep(answers),
    name,
    questions,
  });
  const token = randomBytes(18).toString("hex");
  const record = await saveDnaReport({
    id: newReportId(),
    token,
    createdAt: new Date().toISOString(),
    name,
    email,
    mobile,
    answers: sanitizePlainDeep(answers),
    result,
  });

  const pdfBytes = await buildDnaPdf(record);
  const pdfUrl = reportPublicUrl(token, cms.site.brand.siteUrl);
  const delivery = await deliverDnaReport({
    record,
    pdfUrl,
    pdfBytes,
    siteUrl: cms.site.brand.siteUrl,
  });

  const nextHref =
    result.path === "call"
      ? "/apply"
      : result.path === "challenge"
        ? "/challenge"
        : cms.applyFunnel.nurtureUrl || "/apply";

  return NextResponse.json({
    id: record.id,
    result,
    pdfUrl,
    nextHref,
    delivery,
  });
}
