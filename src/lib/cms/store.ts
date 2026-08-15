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
  if (!out.home.whatsappCoach) {
    out.home.whatsappCoach = structuredClone(base.home.whatsappCoach);
  }
  if (!out.home.credentials) {
    out.home.credentials = structuredClone(base.home.credentials);
  }
  if (!out.home.benchmarks) {
    out.home.benchmarks = structuredClone(base.home.benchmarks);
  }
  if (!out.home.tiersSection.offer) {
    out.home.tiersSection.offer = structuredClone(base.home.tiersSection.offer);
  }
  if (!out.home.tiersSection.guarantee) {
    out.home.tiersSection.guarantee = structuredClone(
      base.home.tiersSection.guarantee,
    );
  }
  if (!out.site.brand.logoUrl || out.site.brand.logoUrl === "/logo.svg") {
    out.site.brand.logoUrl = base.site.brand.logoUrl;
  }
  if (!out.home.hero.portraitUrl) {
    out.home.hero.portraitUrl = base.home.hero.portraitUrl;
  }
  if (!out.home.hero.portraitAlt) {
    out.home.hero.portraitAlt = base.home.hero.portraitAlt;
  }
  out.home.credentials = {
    ...base.home.credentials,
    ...out.home.credentials,
    items: Array.isArray(out.home.credentials.items)
      ? out.home.credentials.items
      : base.home.credentials.items,
  };
  if (!out.home.credentials.imageUrl) {
    out.home.credentials.imageUrl = base.home.credentials.imageUrl;
  }
  out.home.whatsappCoach = {
    ...base.home.whatsappCoach,
    ...out.home.whatsappCoach,
    steps: Array.isArray(out.home.whatsappCoach.steps)
      ? out.home.whatsappCoach.steps
      : base.home.whatsappCoach.steps,
  };
  if (!out.home.whatsappCoach.avatarUrl) {
    out.home.whatsappCoach.avatarUrl = base.home.whatsappCoach.avatarUrl;
  }
  const defaultById = new Map(
    base.home.testimonials.items.map((item) => [item.id, item]),
  );
  out.home.testimonials.items = out.home.testimonials.items.map((item) => {
    const fallback = defaultById.get(item.id);
    return {
      ...item,
      beforeImageUrl: item.beforeImageUrl ?? "",
      imageUrl: item.imageUrl || fallback?.imageUrl || "",
      imageAlt: item.imageAlt || fallback?.imageAlt || item.name,
      result: item.result || fallback?.result || "",
    };
  });
  if (out.home.hero.eyebrow === undefined) {
    out.home.hero.eyebrow = base.home.hero.eyebrow;
  }
  if (out.home.hero.ctaNote === undefined) {
    out.home.hero.ctaNote = base.home.hero.ctaNote;
  }
  if (!out.funnel) {
    out.funnel = structuredClone(base.funnel);
  } else {
    out.funnel = {
      ...base.funnel,
      ...out.funnel,
      layout: { ...base.funnel.layout, ...out.funnel.layout },
      steps: Array.isArray(out.funnel.steps)
        ? out.funnel.steps
        : structuredClone(base.funnel.steps),
    };
  }
  if (out.home.tiersSection.enabled === undefined) {
    out.home.tiersSection.enabled = base.home.tiersSection.enabled;
  }
  out.site.seo = { ...base.site.seo, ...out.site.seo };

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
