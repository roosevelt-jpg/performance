import { describe, expect, it } from "vitest";
import { DEFAULT_CMS } from "./defaults";
import { DEFAULT_FUNNEL_LAYOUT } from "@/lib/funnel/defaults";

describe("SPEC-Roosevelt-LandingPage-2026-08-14 locked copy", () => {
  it("keeps the named public CTA labels", () => {
    expect(DEFAULT_CMS.home.hero.cta.label).toBe("Apply for Pro coaching");
    expect(DEFAULT_CMS.home.hero.secondaryCta.label).toBe("Watch the video");
    expect(DEFAULT_CMS.home.finalCta.primary.label).toBe("Book Your Call");
    expect(DEFAULT_CMS.home.finalCta.secondary.label).toBe(
      "Join the Challenge",
    );
    expect(DEFAULT_CMS.home.stickyCta.label).toBe("Apply for Pro");
    expect(
      DEFAULT_CMS.chrome.nav.some((l) => l.label === "Compare programmes"),
    ).toBe(true);
    expect(
      DEFAULT_CMS.tiers.find((t) => t.id === "challenge")?.cta.label,
    ).toBe("Join the Challenge");
    expect(DEFAULT_CMS.tiers.find((t) => t.id === "pro")?.cta.label).toBe(
      "Book Your Call",
    );
    expect(DEFAULT_CMS.tiers.find((t) => t.id === "elite")?.cta.label).toBe(
      "Book Your Call",
    );
  });

  it("does not put Pro or Elite prices on public tier cards", () => {
    for (const tier of DEFAULT_CMS.tiers.filter(
      (t) => t.id === "pro" || t.id === "elite",
    )) {
      expect(tier.cta.kind).toBe("book");
      const haystack = [tier.subhead, ...tier.body, ...tier.includes].join(" ");
      expect(haystack).not.toMatch(/£\s*\d/);
    }
  });

  it("keeps four FAQ objections in spec order", () => {
    expect(DEFAULT_CMS.home.faq.items.map((item) => item.id)).toEqual([
      "f1",
      "f2",
      "f3",
      "f4",
    ]);
  });

  it("shows Kane below the CTAs, not a third hero button", () => {
    expect(DEFAULT_CMS.home.hero.portraitUrl).toBeTruthy();
    expect(DEFAULT_FUNNEL_LAYOUT.phoneMockup).toBe(false);
  });
});
