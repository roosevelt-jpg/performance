import Stripe from "stripe";
import { loadIntegrations } from "@/lib/integrations/store";

export async function getStripeClient(): Promise<Stripe | null> {
  const config = await loadIntegrations();
  const secret = config.stripe?.secretKey?.trim();
  if (!secret) return null;
  return new Stripe(secret);
}
