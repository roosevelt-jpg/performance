import { describe, expect, it } from "vitest";
import { DEFAULT_CMS } from "@/lib/cms/defaults";
import { DEFAULT_FUNNEL } from "./defaults";
import { isFunnelSectionOn } from "./layout";

describe("isFunnelSectionOn", () => {
  it("uses funnel layout while the engine is on", () => {
    const cms = {
      ...DEFAULT_CMS,
      funnel: {
        ...DEFAULT_FUNNEL,
        enabled: true,
        layout: {
          ...DEFAULT_FUNNEL.layout,
          proof: false,
          vsl: true,
          credentials: false,
        },
      },
    };
    expect(isFunnelSectionOn(cms, "vsl")).toBe(true);
    expect(isFunnelSectionOn(cms, "proof")).toBe(false);
    expect(isFunnelSectionOn(cms, "credentials")).toBe(false);
  });

  it("falls back to CMS flags when the engine is off", () => {
    const cms = {
      ...DEFAULT_CMS,
      funnel: { ...DEFAULT_FUNNEL, enabled: false },
    };
    expect(isFunnelSectionOn(cms, "vsl")).toBe(cms.home.vsl.enabled);
    expect(isFunnelSectionOn(cms, "proof")).toBe(cms.home.proof.enabled);
  });

  it("shows spec landing sections when the engine uses default layout", () => {
    expect(isFunnelSectionOn(DEFAULT_CMS, "vsl")).toBe(true);
    expect(isFunnelSectionOn(DEFAULT_CMS, "testimonials")).toBe(true);
    expect(isFunnelSectionOn(DEFAULT_CMS, "credentials")).toBe(true);
    expect(isFunnelSectionOn(DEFAULT_CMS, "problem")).toBe(true);
    expect(isFunnelSectionOn(DEFAULT_CMS, "whatsappCoach")).toBe(true);
    expect(isFunnelSectionOn(DEFAULT_CMS, "benchmarks")).toBe(true);
    expect(isFunnelSectionOn(DEFAULT_CMS, "howItWorks")).toBe(false);
    expect(isFunnelSectionOn(DEFAULT_CMS, "tiers")).toBe(false);
    expect(isFunnelSectionOn(DEFAULT_CMS, "faq")).toBe(true);
    expect(isFunnelSectionOn(DEFAULT_CMS, "finalCta")).toBe(true);
    expect(isFunnelSectionOn(DEFAULT_CMS, "phoneMockup")).toBe(false);
  });
});
