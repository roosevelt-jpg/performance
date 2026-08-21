import { describe, expect, it } from "vitest";
import {
  buildCheckoutWrite,
  buildPaymentFailedTags,
  buildCancelledTags,
  buildWhatsAppConsentTags,
  CUTOVER_TAGS,
  ghlTierLabel,
} from "./programmeCutover";

describe("programme cutover", () => {
  it("writes Track B + Programme tags and fields on Challenge checkout", () => {
    const write = buildCheckoutWrite({
      email: "sam@example.com",
      name: "Sam Lee",
      tierId: "challenge",
      stripeCustomerId: "cus_123",
      stripeSubscriptionId: "sub_123",
    });
    expect(write?.tagsAdd).toEqual(
      expect.arrayContaining([
        CUTOVER_TAGS.trackB,
        CUTOVER_TAGS.tierProgramme,
        "paid_challenge",
      ]),
    );
    expect(write?.tagsRemove).toEqual(
      expect.arrayContaining(["track-a", "waitlist"]),
    );
    expect(write?.customFields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "track",
          field_value: "B - Programme",
        }),
        expect.objectContaining({
          key: "tier",
          field_value: "Programme",
        }),
        expect.objectContaining({
          key: "subscription_status",
          field_value: "Active",
        }),
        expect.objectContaining({
          key: "stripe_customer_id",
          field_value: "cus_123",
        }),
      ]),
    );
    expect(
      write?.customFields.some((f) => f.key === "block_start_date"),
    ).toBe(true);
    expect(write?.customFields.some((f) => f.key === "block_end_date")).toBe(
      true,
    );
  });

  it("maps Analysis / Pro / Elite tier labels without putting them on public cards", () => {
    expect(ghlTierLabel("performance-analysis")).toBe("Analysis");
    expect(ghlTierLabel("pro")).toBe("Pro");
    expect(ghlTierLabel("elite")).toBe("Elite");
  });

  it("sets overdue + payment-recovery on failed payment", () => {
    const failed = buildPaymentFailedTags();
    expect(failed.tagsAdd).toContain(CUTOVER_TAGS.overdue);
    expect(failed.tagsAdd).toContain(CUTOVER_TAGS.paymentRecovery);
    expect(failed.customFields[0]?.field_value).toBe("Overdue");
  });

  it("sets cancelled and clears programme-active on cancel", () => {
    const cancelled = buildCancelledTags();
    expect(cancelled.tagsAdd).toContain(CUTOVER_TAGS.cancelled);
    expect(cancelled.tagsRemove).toContain("programme-active");
  });

  it("uses consent-whatsapp / no-wa-optin for PECR gate", () => {
    expect(buildWhatsAppConsentTags(true).tagsAdd).toContain(
      CUTOVER_TAGS.consentWhatsapp,
    );
    expect(buildWhatsAppConsentTags(false).tagsAdd).toContain(
      CUTOVER_TAGS.noWaOptin,
    );
  });
});
