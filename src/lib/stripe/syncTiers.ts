import Stripe from "stripe";
import type { CmsTier } from "@/lib/cms/types";
import {
  isApplicationOnlyTier,
  parsePriceAmount,
  unitAmountFromMajor,
} from "@/lib/cms/tierCommerce";
import { siteOrigin } from "@/lib/seo/site";
import {
  parsePaymentLinkRef,
  paymentLinkMatches,
  productMetadata,
} from "./links";

export type StripeTierSyncSummary = {
  connected: boolean;
  synced: number;
  skipped: number;
  errors: string[];
};

async function findProduct(
  stripe: Stripe,
  tier: CmsTier,
): Promise<Stripe.Product | null> {
  if (tier.stripeProductId) {
    try {
      const existing = await stripe.products.retrieve(tier.stripeProductId);
      if (!existing.deleted) return existing;
    } catch {
      /* fall through to search */
    }
  }
  const listed = await stripe.products.list({ limit: 100, active: true });
  return (
    listed.data.find((product) => product.metadata?.cmsTierId === tier.id) ??
    null
  );
}

async function findPaymentLink(
  stripe: Stripe,
  tier: CmsTier,
  pasted: ReturnType<typeof parsePaymentLinkRef>,
): Promise<Stripe.PaymentLink | null> {
  if (tier.stripePaymentLinkId || pasted.id) {
    const id = pasted.id || tier.stripePaymentLinkId;
    try {
      return await stripe.paymentLinks.retrieve(id, {
        expand: ["line_items"],
      });
    } catch {
      /* list by URL */
    }
  }
  if (!pasted.url && !tier.stripePaymentLink) return null;
  const target = parsePaymentLinkRef(pasted.url || tier.stripePaymentLink);
  let startingAfter: string | undefined;
  for (let page = 0; page < 5; page += 1) {
    const listed = await stripe.paymentLinks.list({
      limit: 100,
      starting_after: startingAfter,
    });
    const match = listed.data.find((link) =>
      paymentLinkMatches({ id: link.id, url: link.url }, target),
    );
    if (match) return match;
    if (!listed.has_more) break;
    startingAfter = listed.data[listed.data.length - 1]?.id;
  }
  return null;
}

function completionUrl(origin: string, tier: CmsTier): string {
  if (tier.id === "challenge" || tier.cta.kind === "checkout") {
    return `${origin}/challenge?checkout=success`;
  }
  return `${origin}/?paid=${encodeURIComponent(tier.id)}`;
}

async function ensurePrice(
  stripe: Stripe,
  productId: string,
  tier: CmsTier,
): Promise<Stripe.Price> {
  const unitAmount = unitAmountFromMajor(tier.priceAmount);
  const currency = (tier.priceCurrency || "gbp").toLowerCase();
  if (tier.stripePriceId) {
    try {
      const existing = await stripe.prices.retrieve(tier.stripePriceId);
      if (
        existing.unit_amount === unitAmount &&
        existing.currency === currency &&
        existing.active
      ) {
        return existing;
      }
    } catch {
      /* create a fresh price */
    }
  }
  return stripe.prices.create({
    product: productId,
    currency,
    unit_amount: unitAmount,
    metadata: productMetadata(tier.id, isApplicationOnlyTier(tier)),
  });
}

async function ensurePaymentLink(
  stripe: Stripe,
  priceId: string,
  tier: CmsTier,
  origin: string,
  existing: Stripe.PaymentLink | null,
): Promise<Stripe.PaymentLink> {
  const metadata = productMetadata(tier.id, isApplicationOnlyTier(tier));
  if (existing) {
    const currentPrice = existing.line_items?.data?.[0]?.price;
    const currentPriceId =
      typeof currentPrice === "string" ? currentPrice : currentPrice?.id;
    const samePrice =
      currentPriceId === priceId ||
      (!currentPriceId &&
        existing.id === tier.stripePaymentLinkId &&
        tier.stripePriceId === priceId);
    if (samePrice && existing.active) {
      return stripe.paymentLinks.update(existing.id, {
        metadata,
        after_completion: {
          type: "redirect",
          redirect: { url: completionUrl(origin, tier) },
        },
      });
    }
    if (existing.active) {
      await stripe.paymentLinks.update(existing.id, { active: false });
    }
  }
  return stripe.paymentLinks.create({
    line_items: [{ price: priceId, quantity: 1 }],
    metadata,
    after_completion: {
      type: "redirect",
      redirect: { url: completionUrl(origin, tier) },
    },
    phone_number_collection: { enabled: true },
  });
}

async function syncOneTier(
  stripe: Stripe,
  tier: CmsTier,
  origin: string,
): Promise<CmsTier> {
  const amount = parsePriceAmount(tier.priceAmount);
  const pasted = parsePaymentLinkRef(tier.stripePaymentLink);
  if (amount <= 0 && !pasted.id && !pasted.url && !tier.stripePaymentLinkId) {
    return {
      ...tier,
      stripeSyncNote: "",
    };
  }
  if (amount <= 0) {
    const attached = await findPaymentLink(stripe, tier, pasted);
    return {
      ...tier,
      stripePaymentLink: attached?.url || tier.stripePaymentLink,
      stripePaymentLinkId: attached?.id || tier.stripePaymentLinkId,
      stripeSyncNote: attached
        ? "Linked an existing Stripe Payment Link."
        : "Add a price so Stripe can create a Payment Link, or paste a valid buy.stripe.com URL.",
    };
  }

  let product = await findProduct(stripe, tier);
  const metadata = productMetadata(tier.id, isApplicationOnlyTier(tier));
  if (!product) {
    product = await stripe.products.create({
      name: tier.name || `Programme ${tier.id}`,
      metadata,
    });
  } else if (product.name !== tier.name || product.metadata?.cmsTierId !== tier.id) {
    product = await stripe.products.update(product.id, {
      name: tier.name || product.name,
      metadata: { ...product.metadata, ...metadata },
    });
  }

  const price = await ensurePrice(stripe, product.id, tier);
  const existingLink = await findPaymentLink(stripe, { ...tier, stripeProductId: product.id }, pasted);
  const link = await ensurePaymentLink(stripe, price.id, tier, origin, existingLink);

  return {
    ...tier,
    stripeProductId: product.id,
    stripePriceId: price.id,
    stripePaymentLinkId: link.id,
    stripePaymentLink: link.url,
    stripeSyncNote: isApplicationOnlyTier(tier)
      ? "Synced to Stripe. This link is private — never shown on public Pro/Elite cards."
      : "Synced to Stripe. Public checkout uses this price.",
  };
}

export async function syncTiersToStripe(params: {
  stripe: Stripe;
  tiers: CmsTier[];
  siteUrl: string;
}): Promise<{ tiers: CmsTier[]; summary: StripeTierSyncSummary }> {
  const origin = siteOrigin(params.siteUrl);
  const errors: string[] = [];
  let synced = 0;
  let skipped = 0;
  const tiers: CmsTier[] = [];

  for (const tier of params.tiers) {
    const amount = parsePriceAmount(tier.priceAmount);
    const pasted = parsePaymentLinkRef(tier.stripePaymentLink);
    if (amount <= 0 && !pasted.id && !pasted.url && !tier.stripePaymentLinkId) {
      skipped += 1;
      tiers.push({ ...tier, stripeSyncNote: "" });
      continue;
    }
    try {
      const next = await syncOneTier(params.stripe, tier, origin);
      synced += 1;
      tiers.push(next);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Stripe sync failed";
      errors.push(`${tier.name || tier.id}: ${message}`);
      tiers.push({
        ...tier,
        stripeSyncNote: message,
      });
    }
  }

  return {
    tiers,
    summary: {
      connected: true,
      synced,
      skipped,
      errors,
    },
  };
}
