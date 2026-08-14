import { promises as fs } from "fs";
import path from "path";
import { DEFAULT_CMS } from "./defaults";
import type { CmsContent } from "./types";

export const CMS_FILE = path.join(process.cwd(), "data", "cms.local.json");

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/** Deep-merge CMS overlays onto defaults (arrays replace, objects merge). */
export function mergeCms(
  base: CmsContent,
  overlay: Partial<CmsContent> | null | undefined,
): CmsContent {
  if (!overlay) return structuredClone(base);

  const out = structuredClone(base);

  (Object.keys(overlay) as Array<keyof CmsContent>).forEach((key) => {
    const value = overlay[key];
    if (value === undefined) return;
    if (Array.isArray(value)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (out as any)[key] = value;
      return;
    }
    if (isObject(value) && isObject(out[key])) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (out as any)[key] = { ...(out[key] as object), ...value };
      // nested one more level for site/home/questionnaire-style objects
      Object.entries(value).forEach(([k, v]) => {
        if (isObject(v) && isObject((out[key] as Record<string, unknown>)[k])) {
          (out[key] as Record<string, unknown>)[k] = {
            ...((out[key] as Record<string, unknown>)[k] as object),
            ...v,
          };
        }
      });
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (out as any)[key] = value;
  });

  // Ensure marketing media arrays always exist (legacy CMS files).
  if (!Array.isArray(out.home.imageSections)) {
    out.home.imageSections = structuredClone(base.home.imageSections);
  }
  if (!Array.isArray(out.home.videoSections)) {
    out.home.videoSections = structuredClone(base.home.videoSections);
  }
  if (!out.home.vsl) {
    out.home.vsl = structuredClone(base.home.vsl);
  }
  if (!out.home.testimonials?.items) {
    out.home.testimonials = structuredClone(base.home.testimonials);
  }
  if (!out.home.disclaimer) {
    out.home.disclaimer = structuredClone(base.home.disclaimer);
  }
  if (!out.home.popups) {
    out.home.popups = structuredClone(base.home.popups);
  }
  if (!out.home.stickyCta) {
    out.home.stickyCta = structuredClone(base.home.stickyCta);
  }
  if (out.home.hero.eyebrow === undefined) {
    out.home.hero.eyebrow = base.home.hero.eyebrow;
  }
  if (out.home.hero.ctaNote === undefined) {
    out.home.hero.ctaNote = base.home.hero.ctaNote;
  }

  return out;
}

async function readFileCms(): Promise<Partial<CmsContent> | null> {
  try {
    const raw = await fs.readFile(CMS_FILE, "utf8");
    return JSON.parse(raw) as Partial<CmsContent>;
  } catch {
    return null;
  }
}

export async function loadCms(): Promise<CmsContent> {
  const file = await readFileCms();
  return mergeCms(DEFAULT_CMS, file);
}

export async function saveCms(next: CmsContent): Promise<void> {
  await fs.mkdir(path.dirname(CMS_FILE), { recursive: true });
  await fs.writeFile(CMS_FILE, `${JSON.stringify(next, null, 2)}\n`, "utf8");
}

export async function getCmsStorageMeta(): Promise<{
  fileExists: boolean;
  path: string;
  writable: boolean;
}> {
  let fileExists = false;
  try {
    await fs.access(CMS_FILE);
    fileExists = true;
  } catch {
    fileExists = false;
  }

  let writable = true;
  try {
    await fs.mkdir(path.dirname(CMS_FILE), { recursive: true });
    const probe = path.join(path.dirname(CMS_FILE), ".cms-write-probe");
    await fs.writeFile(probe, "ok");
    await fs.unlink(probe);
  } catch {
    writable = false;
  }

  return {
    fileExists,
    path: "data/cms.local.json",
    writable,
  };
}
