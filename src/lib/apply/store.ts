import { promises as fs } from "fs";
import path from "path";
import type { ApplyLead } from "./types";

const FILE = path.join(process.cwd(), "data", "apply-leads.json");

async function readAll(): Promise<ApplyLead[]> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const parsed = JSON.parse(raw) as ApplyLead[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeAll(leads: ApplyLead[]): Promise<void> {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, `${JSON.stringify(leads, null, 2)}\n`, "utf8");
}

export async function upsertApplyLead(
  lead: ApplyLead,
): Promise<ApplyLead> {
  const leads = await readAll();
  const idx = leads.findIndex((row) => row.id === lead.id);
  const next = { ...lead, updatedAt: new Date().toISOString() };
  if (idx >= 0) leads[idx] = next;
  else leads.push(next);
  await writeAll(leads);
  return next;
}

export async function getApplyLead(id: string): Promise<ApplyLead | null> {
  const leads = await readAll();
  return leads.find((row) => row.id === id) ?? null;
}

export function newApplyId(): string {
  return `ap_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
