import { describe, expect, it } from "vitest";
import { challengePaidContact } from "./fulfill";

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
});
