import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { DnaReportRecord } from "./store";

const RED = rgb(0.847, 0.137, 0.11);
const INK = rgb(0.08, 0.08, 0.08);
const MUTED = rgb(0.35, 0.32, 0.3);

export async function buildDnaPdf(record: DnaReportRecord): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]);
  const heading = await doc.embedFont(StandardFonts.TimesRomanBold);
  const body = await doc.embedFont(StandardFonts.Helvetica);
  const { result, name, email } = record;

  let y = 790;
  page.drawText("THE FORMULA PERFORMANCE", {
    x: 48,
    y,
    size: 11,
    font: body,
    color: RED,
  });
  y -= 28;
  page.drawText("Performance DNA report", {
    x: 48,
    y,
    size: 26,
    font: heading,
    color: INK,
  });
  y -= 22;
  page.drawText(`${name || "Athlete"}  ·  ${email}`, {
    x: 48,
    y,
    size: 11,
    font: body,
    color: MUTED,
  });
  y -= 36;

  page.drawText(`Overall score  ${result.overall} / 100`, {
    x: 48,
    y,
    size: 18,
    font: heading,
    color: INK,
  });
  y -= 18;
  page.drawText(`Assigned coach: ${result.coach.name} — ${result.coach.role}`, {
    x: 48,
    y,
    size: 11,
    font: body,
    color: MUTED,
  });
  if (result.primaryLeak) {
    y -= 16;
    page.drawText(
      `Primary leak: ${result.primaryLeak.label}  ${result.primaryLeak.score}/100`,
      {
        x: 48,
        y,
        size: 11,
        font: body,
        color: RED,
      },
    );
  }
  y -= 32;

  for (const cat of result.categories) {
    page.drawText(`${cat.label}`, { x: 48, y, size: 11, font: body, color: INK });
    page.drawRectangle({
      x: 160,
      y: y - 2,
      width: 280,
      height: 10,
      color: rgb(0.93, 0.93, 0.92),
    });
    page.drawRectangle({
      x: 160,
      y: y - 2,
      width: Math.max(4, (cat.score / 100) * 280),
      height: 10,
      color: RED,
    });
    page.drawText(`${cat.score}`, {
      x: 452,
      y,
      size: 11,
      font: body,
      color: INK,
    });
    y -= 22;
  }

  y -= 12;
  const summary = wrap(result.summary, 86);
  for (const line of summary) {
    page.drawText(line, { x: 48, y, size: 11, font: body, color: INK });
    y -= 16;
  }

  y -= 8;
  for (const cat of result.categories) {
    if (y < 120) break;
    const note = wrap(`${cat.label}: ${cat.insight || ""}`, 86);
    for (const line of note) {
      page.drawText(line, { x: 48, y, size: 10, font: body, color: MUTED });
      y -= 14;
    }
    y -= 6;
  }

  y -= 10;
  const next = wrap(`Next: ${result.nextStep}`, 86);
  for (const line of next) {
    page.drawText(line, { x: 48, y, size: 11, font: body, color: MUTED });
    y -= 16;
  }

  y -= 24;
  page.drawText("Pro and Elite stay application-only. No public prices.", {
    x: 48,
    y,
    size: 9,
    font: body,
    color: MUTED,
  });

  return doc.save();
}

function wrap(text: string, width: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const word of words) {
    const next = cur ? `${cur} ${word}` : word;
    if (next.length > width) {
      if (cur) lines.push(cur);
      cur = word;
    } else {
      cur = next;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}
