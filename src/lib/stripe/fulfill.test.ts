import { describe, expect, it } from "vitest";
import { challengePaidContact, paidLeadFromSession } from "./fulfill";

describe("challengePaidContact", () => {
  it("tags a paid Challenge checkout for GHL", () => {
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
  });

  it("ignores other Stripe products so Pro/Elite never auto-checkout", () => {
    expect(
      challengePaidContact({
        metadata: { product: "pro" },
        customerDetails: { email: "sam@example.com" },
      }),
    ).toBeNull();
  });

  it("still records a private Pro payment for GHL without Challenge tags", () => {
    const lead = paidLeadFromSession({
      metadata: { cmsTierId: "pro", product: "pro" },
      customerDetails: { email: "sam@example.com", name: "Sam" },
    });
    expect(lead?.tags).toContain("paid_pro");
    expect(lead?.tags).not.toContain("paid_challenge");
  });
});
