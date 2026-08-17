import { describe, expect, it } from "vitest";
import { parsePaymentLinkRef, paymentLinkMatches } from "./links";

describe("Stripe payment link refs", () => {
  it("reads a dashboard plink_ id from a pasted URL", () => {
    const ref = parsePaymentLinkRef(
      "https://dashboard.stripe.com/test/payment-links/plink_123abc",
    );
    expect(ref.id).toBe("plink_123abc");
  });

  it("keeps a buy.stripe.com URL when there is no plink_ id", () => {
    const ref = parsePaymentLinkRef("https://buy.stripe.com/test_liveOffer");
    expect(ref.id).toBe("");
    expect(ref.url).toContain("buy.stripe.com");
  });

  it("matches listed links by URL path", () => {
    expect(
      paymentLinkMatches(
        { id: "plink_1", url: "https://buy.stripe.com/test_liveOffer" },
        parsePaymentLinkRef("https://buy.stripe.com/test_liveOffer?x=1"),
      ),
    ).toBe(true);
  });
});
