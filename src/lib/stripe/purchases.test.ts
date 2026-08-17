import { describe, expect, it } from "vitest";
import {
  formatStripeMoney,
  mapCheckoutSession,
  summarizePurchases,
} from "./purchases";

describe("purchase mapping", () => {
  it("maps a paid checkout session to a receipt row", () => {
    const row = mapCheckoutSession({
      id: "cs_test_1",
      created: 1_700_000_000,
      amount_total: 9700,
      currency: "gbp",
      payment_status: "paid",
      status: "complete",
      livemode: true,
      metadata: { cmsTierId: "challenge", product: "8-week-challenge" },
      customer_details: { email: "sam@example.com", name: "Sam Jones" },
      payment_intent: {
        id: "pi_1",
        latest_charge: {
          id: "ch_1",
          receipt_url: "https://pay.stripe.com/receipts/test",
        },
      },
      line_items: { data: [{ description: "8-Week Challenge" }] },
    });
    expect(row.customerEmail).toBe("sam@example.com");
    expect(row.amount).toBe(9700);
    expect(row.tierId).toBe("challenge");
    expect(row.receiptUrl).toContain("pay.stripe.com");
    expect(formatStripeMoney(row.amount, row.currency)).toContain("97");
  });

  it("sums paid rows for the admin snapshot", () => {
    const summary = summarizePurchases([
      mapCheckoutSession({
        id: "cs_1",
        created: 1,
        amount_total: 5000,
        currency: "gbp",
        payment_status: "paid",
        status: "complete",
        customer_details: { email: "a@example.com" },
      }),
      mapCheckoutSession({
        id: "cs_2",
        created: 2,
        amount_total: 2000,
        currency: "gbp",
        payment_status: "unpaid",
        status: "open",
        customer_details: { email: "b@example.com" },
      }),
    ]);
    expect(summary.count).toBe(1);
    expect(summary.gross).toBe(5000);
  });
});
