import { describe, expect, it } from "vitest";
import { DEFAULT_CMS } from "./defaults";
import { DEFAULT_FUNNEL_LAYOUT } from "@/lib/funnel/defaults";

describe("Brand-voice landing defaults", () => {
  it("uses one public apply CTA without changing the watch or challenge paths", () => {
    expect(DEFAULT_CMS.home.hero.cta.label).toBe("See If You're a Fit");
    expect(DEFAULT_CMS.home.hero.secondaryCta.label).toBe("Watch the video");
    expect(DEFAULT_CMS.home.vsl.applyCta.label).toBe("See If You're a Fit");
    expect(DEFAULT_CMS.home.finalCta.primary.label).toBe("See If You're a Fit");
    expect(DEFAULT_CMS.home.finalCta.secondary.label).toBe(
      "Join the Challenge",
    );
    expect(DEFAULT_CMS.home.stickyCta.label).toBe("See If You're a Fit");
    expect(
      DEFAULT_CMS.chrome.nav.some((l) => l.label === "Compare programmes"),
    ).toBe(true);
    expect(
      DEFAULT_CMS.tiers.find((t) => t.id === "challenge")?.cta.label,
    ).toBe("Join the Challenge");
    expect(DEFAULT_CMS.tiers.find((t) => t.id === "pro")?.cta.label).toBe(
      "See If You're a Fit",
    );
    expect(DEFAULT_CMS.tiers.find((t) => t.id === "elite")?.cta.label).toBe(
      "See If You're a Fit",
    );
  });

  it("does not put Pro or Elite prices on public tier cards", () => {
    for (const tier of DEFAULT_CMS.tiers.filter(
      (t) => t.id === "pro" || t.id === "elite",
    )) {
      expect(tier.cta.kind).toBe("book");
      const haystack = [tier.subhead, ...tier.body, ...tier.includes].join(" ");
      expect(haystack).not.toMatch(/£\s*\d/);
      expect(tier.priceAmount).toBe(0);
      expect(tier.stripePaymentLink).toBe("");
    }
  });

  it("seeds buying-objection FAQs so admin can edit rather than start blank", () => {
    expect(DEFAULT_CMS.home.faq.items.map((item) => item.id)).toEqual([
      "f1",
      "f2",
      "f3",
      "f4",
      "f5",
      "f6",
    ]);
  });

  it("shows Kane below the CTAs, not a third hero button", () => {
    expect(DEFAULT_CMS.home.hero.portraitUrl).toBeTruthy();
    expect(DEFAULT_FUNNEL_LAYOUT.phoneMockup).toBe(false);
  });

  it("keeps How it works and programme cards off until admin turns them on", () => {
    expect(DEFAULT_FUNNEL_LAYOUT.howItWorks).toBe(false);
    expect(DEFAULT_FUNNEL_LAYOUT.tiers).toBe(false);
    expect(DEFAULT_CMS.home.howItWorks.steps).toHaveLength(3);
  });
});
