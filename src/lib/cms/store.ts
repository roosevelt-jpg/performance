import { DEFAULT_CMS } from "./defaults";
import type { CmsContent } from "./types";
import { getFirebaseFirestore, isFirebaseConfigured } from "@/lib/firebase/admin";

const CMS_DOCUMENT = "configuration/cms";

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

  if (!Array.isArray(out.home.imageSections)) out.home.imageSections = structuredClone(base.home.imageSections);
  if (!Array.isArray(out.home.videoSections)) out.home.videoSections = structuredClone(base.home.videoSections);
  if (!out.home.vsl) out.home.vsl = structuredClone(base.home.vsl);
  if (!out.home.testimonials?.items) out.home.testimonials = structuredClone(base.home.testimonials);
  if (!out.home.disclaimer) out.home.disclaimer = structuredClone(base.home.disclaimer);
  if (!out.home.popups) out.home.popups = structuredClone(base.home.popups);
  if (!out.home.stickyCta) out.home.stickyCta = structuredClone(base.home.stickyCta);
  if (out.home.hero.eyebrow === undefined) out.home.hero.eyebrow = base.home.hero.eyebrow;
  if (out.home.hero.ctaNote === undefined) out.home.hero.ctaNote = base.home.hero.ctaNote;
  return out;
}

export async function loadCms(): Promise<CmsContent> {
  if (!isFirebaseConfigured()) return structuredClone(DEFAULT_CMS);
  const snapshot = await getFirebaseFirestore().doc(CMS_DOCUMENT).get();
  return mergeCms(DEFAULT_CMS, snapshot.exists ? (snapshot.data() as Partial<CmsContent>) : null);
}

export async function saveCms(next: CmsContent): Promise<void> {
  await getFirebaseFirestore().doc(CMS_DOCUMENT).set(next);
}

export async function getCmsStorageMeta(): Promise<{
  fileExists: boolean;
  path: string;
  writable: boolean;
}> {
  return {
    fileExists: isFirebaseConfigured(),
    path: "Firestore: configuration/cms",
    writable: isFirebaseConfigured(),
  };
}
