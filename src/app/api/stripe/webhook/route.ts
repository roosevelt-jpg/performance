import { NextResponse } from "next/server";
import Stripe from "stripe";
import { loadIntegrations } from "@/lib/integrations/store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const config = await loadIntegrations();
  const secret = config.stripe.secretKey;
  const webhookSecret = config.stripe.webhookSecret;
  if (!secret || !webhookSecret) {
    return NextResponse.json({ error: "Stripe webhook is not configured" }, { status: 503 });
  }

  const stripe = new Stripe(secret);
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const raw = await request.text();
  try {
    stripe.webhooks.constructEvent(raw, signature, webhookSecret);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid signature" },
      { status: 400 },
    );
  }

  return NextResponse.json({ received: true });
}
