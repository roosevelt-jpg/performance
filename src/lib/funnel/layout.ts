import type { CmsContent, CmsFunnelLayout } from "@/lib/cms/types";

const LAYOUT_TO_HOME: Record<
  keyof CmsFunnelLayout,
  (cms: CmsContent) => boolean
> = {
  phoneMockup: () => true,
  vsl: (cms) => cms.home.vsl.enabled,
  proof: (cms) => cms.home.proof.enabled,
  testimonials: (cms) => cms.home.testimonials.enabled,
  credentials: (cms) => cms.home.credentials.enabled,
  problem: (cms) => cms.home.problem.enabled,
  whatsappCoach: (cms) => cms.home.whatsappCoach.enabled,
  benchmarks: (cms) => cms.home.benchmarks.enabled,
  howItWorks: (cms) => cms.home.howItWorks.enabled,
  tiers: (cms) => cms.home.tiersSection.enabled !== false,
  faq: (cms) => cms.home.faq.enabled,
  finalCta: (cms) => cms.home.finalCta.enabled,
};

/** Chat engine on → Funnel layout is the page. Engine off → Content CMS flags. */
export function isFunnelSectionOn(
  cms: CmsContent,
  key: keyof CmsFunnelLayout,
): boolean {
  if (cms.funnel?.enabled) return Boolean(cms.funnel.layout?.[key]);
  return LAYOUT_TO_HOME[key](cms);
}
