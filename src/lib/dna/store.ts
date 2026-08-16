import { randomBytes } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import type { DnaAnswers, DnaResult } from "./types";

export type DnaReportRecord = {
  id: string;
  token: string;
  createdAt: string;
  name: string;
  email: string;
  mobile: string;
  answers: DnaAnswers;
  result: DnaResult;
};

const DIR = path.join(process.cwd(), "data", "dna-reports");

export function newReportId(): string {
  return `dna_${Date.now().toString(36)}_${randomBytes(4).toString("hex")}`;
}

export async function saveDnaReport(
  record: DnaReportRecord,
): Promise<DnaReportRecord> {
  await fs.mkdir(DIR, { recursive: true });
  await fs.writeFile(
    path.join(DIR, `${record.id}.json`),
    `${JSON.stringify(record, null, 2)}\n`,
    "utf8",
  );
  return record;
}

export async function getDnaReport(
  id: string,
): Promise<DnaReportRecord | null> {
  try {
    const raw = await fs.readFile(path.join(DIR, `${id}.json`), "utf8");
    return JSON.parse(raw) as DnaReportRecord;
  } catch {
    return null;
  }
}

export async function getDnaReportByToken(
  token: string,
): Promise<DnaReportRecord | null> {
  try {
    const files = await fs.readdir(DIR);
    for (const file of files) {
      if (!file.endsWith(".json")) continue;
      const raw = await fs.readFile(path.join(DIR, file), "utf8");
      const row = JSON.parse(raw) as DnaReportRecord;
      if (row.token === token) return row;
    }
  } catch {
    return null;
  }
  return null;
}
