import { NextResponse } from "next/server";
import { buildDnaPdf } from "@/lib/dna/pdf";
import { getDnaReportByToken } from "@/lib/dna/store";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") || "";
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }
  const record = await getDnaReportByToken(token);
  if (!record) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const pdf = await buildDnaPdf(record);
  return new NextResponse(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="performance-dna-${record.result.overall}.pdf"`,
    },
  });
}
