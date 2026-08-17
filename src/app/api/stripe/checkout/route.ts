import { NextResponse } from "next/server";
import Stripe from "stripe";
import { loadIntegrations } from "@/lib/integrations/store";
import { siteOrigin } from "@/lib/seo/site";
import { loadCms } from "@/lib/cms/store";
import { productMetadata } from "@/lib/stripe/links";

export const runtime = "nodejs";

export async function POST() {
  const config = await loadIntegrations();
  const secret = config.stripe.secretKey?.trim();
  if (!secret) {
    return NextResponse.json(
      { error: "Stripe is not connected. Add keys in Admin → Integrations." },
      { status: 503 },
    );
  }

  const cms = await loadCms();
  const challenge = cms.tiers.find((tier) => tier.id === "challenge");
  const priceId =
    challenge?.stripePriceId?.trim() || config.stripe.challengePriceId?.trim();
  const paymentLink = challenge?.stripePaymentLink?.trim();

  if (!priceId && paymentLink) {
    return NextResponse.json({ url: paymentLink });
  }
  if (!priceId) {
    return NextResponse.json(
      {
        error:
          "No Challenge Stripe price yet. Add a price and save the Challenge tier in Admin → Content.",
      },
      { status: 503 },
    );
  }

  const origin = siteOrigin(cms.site.brand.siteUrl);
  const stripe = new Stripe(secret);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/challenge?checkout=success`,
    cancel_url: `${origin}/challenge#checkout`,
    allow_promotion_codes: true,
    metadata: productMetadata("challenge", false),
  });

  if (!session.url) {
    return NextResponse.json({ error: "Could not start Stripe checkout" }, { status: 502 });
  }
  return NextResponse.json({ url: session.url });
}
