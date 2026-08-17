import { describe, expect, it } from "vitest";
import { DEFAULT_CMS } from "./defaults";
import {
  duplicateTierCard,
  isApplicationOnlyTier,
  isSystemTierId,
  newCustomTierId,
  parsePriceAmount,
  publicTierHref,
  slugifyTierId,
  stripPrivateCommerce,
  unitAmountFromMajor,
} from "./tierCommerce";

describe("tier commerce", () => {
  it("keeps Pro and Elite application-only", () => {
    const pro = DEFAULT_CMS.tiers.find((t) => t.id === "pro");
    const elite = DEFAULT_CMS.tiers.find((t) => t.id === "elite");
    expect(pro && isApplicationOnlyTier(pro)).toBe(true);
    expect(elite && isApplicationOnlyTier(elite)).toBe(true);
  });

  it("strips Pro and Elite prices from the public CMS payload", () => {
    const tiers = stripPrivateCommerce(
      DEFAULT_CMS.tiers.map((tier) =>
        tier.id === "pro"
          ? {
              ...tier,
              priceAmount: 297,
              stripePaymentLink: "https://buy.stripe.com/pro-secret",
              stripePriceId: "price_pro",
            }
          : tier.id === "challenge"
            ? {
                ...tier,
                priceAmount: 97,
                stripePaymentLink: "https://buy.stripe.com/challenge",
                stripePriceId: "price_challenge",
              }
            : tier,
      ),
    );
    const pro = tiers.find((t) => t.id === "pro");
    const challenge = tiers.find((t) => t.id === "challenge");
    expect(pro?.priceAmount).toBe(0);
    expect(pro?.stripePaymentLink).toBe("");
    expect(challenge?.priceAmount).toBe(97);
    expect(challenge?.stripePaymentLink).toContain("buy.stripe.com");
  });

  it("parses pound strings into major units and Stripe unit amounts", () => {
    expect(parsePriceAmount("£197.50")).toBe(197.5);
    expect(unitAmountFromMajor(197.5)).toBe(19750);
  });

  it("lets extra programmes keep unique ids without stealing Pro or Challenge", () => {
    expect(slugifyTierId("Gold 1:1")).toBe("gold-1-1");
    expect(
      newCustomTierId("Pro", ["challenge", "pro", "elite"]),
    ).toBe("pro-2");
    const copy = duplicateTierCard(DEFAULT_CMS.tiers[2], [
      "challenge",
      "pro",
      "elite",
    ]);
    expect(copy.id).not.toBe("pro");
    expect(copy.name).toBe("Pro copy");
    expect(copy.stripePriceId).toBe("");
  });

  it("sends custom checkout cards to their Stripe link, not /challenge", () => {
    const custom: (typeof DEFAULT_CMS.tiers)[number] = {
      ...DEFAULT_CMS.tiers[1],
      id: "nutrition",
      cta: { kind: "checkout", label: "Buy", href: "" },
      stripePaymentLink: "https://buy.stripe.com/nutrition",
    };
    expect(publicTierHref(custom)).toBe("https://buy.stripe.com/nutrition");
    expect(publicTierHref(DEFAULT_CMS.tiers[1])).toBe("/challenge#checkout");
    expect(isSystemTierId("pro")).toBe(true);
    expect(isSystemTierId("nutrition")).toBe(false);
  });
});
