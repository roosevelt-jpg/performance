import { NextResponse } from "next/server";
import Stripe from "stripe";
import { loadIntegrations } from "@/lib/integrations/store";
import { siteOrigin } from "@/lib/seo/site";
import { loadCms } from "@/lib/cms/store";

export const runtime = "nodejs";

export async function POST() {
  const config = await loadIntegrations();
  const secret = config.stripe.secretKey;
  const priceId = config.stripe.challengePriceId;
  if (!secret || !priceId) {
    return NextResponse.json(
      { error: "Stripe is not connected. Add keys in Admin → Integrations." },
      { status: 503 },
    );
  }

  const cms = await loadCms();
  const origin = siteOrigin(cms.site.brand.siteUrl);
  const stripe = new Stripe(secret);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/challenge?checkout=success`,
    cancel_url: `${origin}/challenge#checkout`,
    allow_promotion_codes: true,
    metadata: {
      product: "8-week-challenge",
    },
  });

  if (!session.url) {
    return NextResponse.json({ error: "Could not start Stripe checkout" }, { status: 502 });
  }
  return NextResponse.json({ url: session.url });
}
