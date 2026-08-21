import { describe, expect, it } from "vitest";
import {
  challengePaidContact,
  paidLeadFromSession,
  programmePurchaseFromSession,
} from "./fulfill";

describe("challengePaidContact", () => {
  it("tags a paid Challenge checkout for GHL cutover", () => {
    const contact = challengePaidContact({
      metadata: { product: "8-week-challenge" },
      customerDetails: {
        email: "sam@example.com",
        name: "Sam",
        phone: "+447700900123",
      },
    });
    expect(contact?.email).toBe("sam@example.com");
    expect(contact?.tags).toContain("paid_challenge");
    expect(contact?.tags).toContain("track-b");
    expect(contact?.tags).toContain("tier-programme");
  });

  it("ignores other Stripe products for the Challenge-only helper", () => {
    expect(
      challengePaidContact({
        metadata: { product: "pro" },
        customerDetails: { email: "sam@example.com" },
      }),
    ).toBeNull();
  });

  it("still records a private Pro payment for GHL without Challenge-only tags", () => {
    const lead = paidLeadFromSession({
      metadata: { cmsTierId: "pro", product: "pro" },
      customerDetails: { email: "sam@example.com", name: "Sam" },
    });
    expect(lead?.tags).toContain("paid_pro");
    expect(lead?.tags).toContain("track-b");
    expect(lead?.tags).not.toContain("paid_challenge");
  });
});

describe("programmePurchaseFromSession", () => {
  it("carries Stripe customer + subscription ids into the cutover write", () => {
    const write = programmePurchaseFromSession({
      metadata: { cmsTierId: "challenge", product: "8-week-challenge" },
      customer: "cus_abc",
      subscription: "sub_abc",
      customerDetails: { email: "sam@example.com", name: "Sam" },
    });
    expect(write?.stripeCustomerId).toBe("cus_abc");
    expect(write?.stripeSubscriptionId).toBe("sub_abc");
    expect(write?.tagsRemove).toEqual(
      expect.arrayContaining(["track-a", "waitlist"]),
    );
  });
});
