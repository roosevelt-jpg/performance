import { NextResponse } from "next/server";
import Stripe from "stripe";
import { loadIntegrations } from "@/lib/integrations/store";
import { challengePaidContact } from "@/lib/stripe/fulfill";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const config = await loadIntegrations();
  const secret = config.stripe.secretKey;
  const webhookSecret = config.stripe.webhookSecret;
  if (!secret || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured" },
      { status: 503 },
    );
  }

  const stripe = new Stripe(secret);
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const raw = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, signature, webhookSecret);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid signature" },
      { status: 400 },
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const details = session.customer_details;
    const contact = challengePaidContact({
      email: details?.email,
      name: details?.name,
      phone: details?.phone,
      customerDetails: {
        email: details?.email,
        name: details?.name,
        phone: details?.phone,
      },
      metadata: session.metadata,
    });
    if (contact && config.ghl.apiKey && config.ghl.locationId) {
      try {
        await fetch(`${config.ghl.apiBaseUrl}/contacts/upsert`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.ghl.apiKey}`,
            Version: "2021-07-28",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            locationId: config.ghl.locationId,
            email: contact.email,
            firstName: contact.name.split(" ")[0] || contact.name,
            name: contact.name || undefined,
            phone: contact.phone || undefined,
            source: "stripe_challenge",
            tags: contact.tags,
          }),
        });
      } catch (error) {
        console.warn("[stripe-webhook] GHL paid Challenge upsert failed", error);
      }
    }
  }

  return NextResponse.json({ received: true });
}
