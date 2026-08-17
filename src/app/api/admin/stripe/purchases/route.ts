import { NextResponse } from "next/server";
import { authorizeIntegrationsRequest } from "@/lib/integrations/auth";
import { getStripeClient } from "@/lib/stripe/client";
import {
  mapCheckoutSession,
  summarizePurchases,
  type CheckoutSessionLike,
} from "@/lib/stripe/purchases";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = authorizeIntegrationsRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const stripe = await getStripeClient();
  if (!stripe) {
    return NextResponse.json({
      connected: false,
      rows: [],
      summary: { count: 0, gross: 0, currency: "gbp", livemode: false },
      error: "Add a Stripe secret key in Admin → Integrations to load live payments.",
    });
  }

  const url = new URL(request.url);
  const limit = Math.min(
    100,
    Math.max(1, Number(url.searchParams.get("limit") || 40) || 40),
  );

  let sessions;
  try {
    sessions = await stripe.checkout.sessions.list({
      limit,
      expand: ["data.line_items", "data.payment_intent.latest_charge"],
    });
  } catch {
    sessions = await stripe.checkout.sessions.list({ limit });
  }

  const rows = sessions.data.map((session) =>
    mapCheckoutSession(session as unknown as CheckoutSessionLike),
  );

  try {
    const charges = await stripe.charges.list({ limit });
    const receiptByIntent = new Map<string, string>();
    for (const charge of charges.data) {
      const intent =
        typeof charge.payment_intent === "string"
          ? charge.payment_intent
          : charge.payment_intent?.id;
      if (intent && charge.receipt_url) {
        receiptByIntent.set(intent, charge.receipt_url);
      }
    }
    for (const row of rows) {
      if (!row.receiptUrl && row.paymentIntentId) {
        row.receiptUrl = receiptByIntent.get(row.paymentIntentId) || "";
      }
    }
  } catch {
    /* hosted receipts stay blank if Charges are unavailable */
  }

  return NextResponse.json({
    connected: true,
    livemode: rows.some((row) => row.livemode),
    hasMore: sessions.has_more,
    rows,
    summary: summarizePurchases(rows),
  });
}
