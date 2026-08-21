import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  applySubscriptionLifecycle,
  upsertProgrammePurchase,
} from "@/lib/crm/ghl";
import { loadIntegrations } from "@/lib/integrations/store";
import { programmePurchaseFromSession } from "@/lib/stripe/fulfill";

export const runtime = "nodejs";

function customerIdOf(
  value: string | Stripe.Customer | Stripe.DeletedCustomer | null | undefined,
): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if ("deleted" in value && value.deleted) return value.id;
  return value.id;
}

function subscriptionIdOf(
  value: string | Stripe.Subscription | null | undefined,
): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.id;
}

async function emailForCustomer(
  stripe: Stripe,
  customerId: string,
): Promise<string> {
  if (!customerId) return "";
  try {
    const customer = await stripe.customers.retrieve(customerId);
    if ("deleted" in customer && customer.deleted) return "";
    return (customer.email || "").trim();
  } catch {
    return "";
  }
}

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

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const details = session.customer_details;
      const write = programmePurchaseFromSession({
        email: details?.email,
        name: details?.name,
        phone: details?.phone,
        customer: customerIdOf(session.customer),
        subscription: subscriptionIdOf(session.subscription),
        customerDetails: {
          email: details?.email,
          name: details?.name,
          phone: details?.phone,
        },
        metadata: session.metadata as Record<string, string> | null,
      });
      if (write) {
        await upsertProgrammePurchase(write);
      }
    }

    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = customerIdOf(invoice.customer);
      const email =
        (invoice.customer_email || "").trim() ||
        (await emailForCustomer(stripe, customerId));
      await applySubscriptionLifecycle({
        email,
        stripeCustomerId: customerId,
        event: "payment_failed",
      });
    }

    if (event.type === "invoice.paid") {
      const invoice = event.data.object as Stripe.Invoice;
      // Skip the first invoice on checkout — checkout.session.completed owns that write.
      if (invoice.billing_reason === "subscription_create") {
        return NextResponse.json({ received: true });
      }
      const customerId = customerIdOf(invoice.customer);
      const email =
        (invoice.customer_email || "").trim() ||
        (await emailForCustomer(stripe, customerId));
      await applySubscriptionLifecycle({
        email,
        stripeCustomerId: customerId,
        event: "payment_recovered",
      });
    }

    if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = customerIdOf(sub.customer);
      const email = await emailForCustomer(stripe, customerId);
      await applySubscriptionLifecycle({
        email,
        stripeCustomerId: customerId,
        event: "cancelled",
      });
    }

    if (event.type === "customer.subscription.updated") {
      const sub = event.data.object as Stripe.Subscription;
      if (sub.status === "past_due" || sub.status === "unpaid") {
        const customerId = customerIdOf(sub.customer);
        const email = await emailForCustomer(stripe, customerId);
        await applySubscriptionLifecycle({
          email,
          stripeCustomerId: customerId,
          event: "payment_failed",
        });
      }
    }
  } catch (error) {
    console.warn("[stripe-webhook] GHL sync failed", error);
  }

  return NextResponse.json({ received: true });
}
