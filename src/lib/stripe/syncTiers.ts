import Stripe from "stripe";
import type { CmsTier } from "@/lib/cms/types";
import {
  isApplicationOnlyTier,
  normalizeTierCommerce,
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

function linePriceIds(link: Stripe.PaymentLink | null): string[] {
  const items = link?.line_items?.data ?? [];
  return items
    .map((item) => {
      const price = item.price;
      return typeof price === "string" ? price : price?.id;
    })
    .filter((id): id is string => Boolean(id));
}

async function ensureOneTimePrice(
  stripe: Stripe,
  productId: string,
  tier: CmsTier,
): Promise<Stripe.Price | null> {
  const unitAmount = unitAmountFromMajor(tier.priceAmount);
  if (unitAmount <= 0) return null;
  const currency = (tier.priceCurrency || "gbp").toLowerCase();
  if (tier.stripePriceId) {
    try {
      const existing = await stripe.prices.retrieve(tier.stripePriceId);
      if (
        existing.unit_amount === unitAmount &&
        existing.currency === currency &&
        existing.active &&
        !existing.recurring
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
    metadata: {
      ...productMetadata(tier.id, isApplicationOnlyTier(tier)),
      kind: "setup",
    },
  });
}

async function ensureRecurringPrice(
  stripe: Stripe,
  productId: string,
  tier: CmsTier,
): Promise<Stripe.Price | null> {
  const unitAmount = unitAmountFromMajor(tier.recurringAmount);
  if (unitAmount <= 0 || tier.recurringInterval === "none") return null;
  const currency = (tier.priceCurrency || "gbp").toLowerCase();
  if (tier.stripeRecurringPriceId) {
    try {
      const existing = await stripe.prices.retrieve(tier.stripeRecurringPriceId);
      if (
        existing.unit_amount === unitAmount &&
        existing.currency === currency &&
        existing.active &&
        existing.recurring?.interval === "month"
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
    recurring: { interval: "month" },
    metadata: {
      ...productMetadata(tier.id, isApplicationOnlyTier(tier)),
      kind: "recurring",
      recurringMonths: String(tier.recurringMonths || 0),
      startsAfterWeeks: String(tier.recurringStartsAfterWeeks || 0),
    },
  });
}

async function ensurePaymentLink(
  stripe: Stripe,
  lineItems: { price: string; quantity: number }[],
  tier: CmsTier,
  origin: string,
  existing: Stripe.PaymentLink | null,
): Promise<Stripe.PaymentLink> {
  const metadata = {
    ...productMetadata(tier.id, isApplicationOnlyTier(tier)),
    recurringMonths: String(tier.recurringMonths || 0),
    startsAfterWeeks: String(tier.recurringStartsAfterWeeks || 0),
  };
  const desiredIds = lineItems.map((item) => item.price).sort().join(",");
  const currentIds = linePriceIds(existing).sort().join(",");
  const trialDays =
    tier.recurringAmount > 0 && tier.recurringStartsAfterWeeks > 0
      ? tier.recurringStartsAfterWeeks * 7
      : undefined;

  const subscriptionData =
    tier.recurringAmount > 0
      ? {
          ...(trialDays ? { trial_period_days: trialDays } : {}),
          metadata,
        }
      : undefined;

  if (existing && desiredIds === currentIds && existing.active) {
    return stripe.paymentLinks.update(existing.id, {
      metadata,
      after_completion: {
        type: "redirect",
        redirect: { url: completionUrl(origin, tier) },
      },
      ...(subscriptionData ? { subscription_data: subscriptionData } : {}),
    });
  }
  if (existing?.active) {
    await stripe.paymentLinks.update(existing.id, { active: false });
  }

  return stripe.paymentLinks.create({
    line_items: lineItems,
    metadata,
    after_completion: {
      type: "redirect",
      redirect: { url: completionUrl(origin, tier) },
    },
    phone_number_collection: { enabled: true },
    ...(subscriptionData ? { subscription_data: subscriptionData } : {}),
  });
}

async function syncOneTier(
  stripe: Stripe,
  tierInput: CmsTier,
  origin: string,
): Promise<CmsTier> {
  const tier = normalizeTierCommerce(tierInput);
  const setup = parsePriceAmount(tier.priceAmount);
  const recurring = parsePriceAmount(tier.recurringAmount);
  const pasted = parsePaymentLinkRef(tier.stripePaymentLink);
  if (
    setup <= 0 &&
    recurring <= 0 &&
    !pasted.id &&
    !pasted.url &&
    !tier.stripePaymentLinkId
  ) {
    return { ...tier, stripeSyncNote: "" };
  }
  if (setup <= 0 && recurring <= 0) {
    const attached = await findPaymentLink(stripe, tier, pasted);
    return {
      ...tier,
      stripePaymentLink: attached?.url || tier.stripePaymentLink,
      stripePaymentLinkId: attached?.id || tier.stripePaymentLinkId,
      stripeSyncNote: attached
        ? "Linked an existing Stripe Payment Link."
        : "Add a setup or monthly price so Stripe can create a Payment Link, or paste a valid buy.stripe.com URL.",
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

  const oneTime = await ensureOneTimePrice(stripe, product.id, tier);
  const recurringPrice = await ensureRecurringPrice(stripe, product.id, tier);
  const lineItems: { price: string; quantity: number }[] = [];
  if (oneTime) lineItems.push({ price: oneTime.id, quantity: 1 });
  if (recurringPrice) lineItems.push({ price: recurringPrice.id, quantity: 1 });

  const existingLink = await findPaymentLink(
    stripe,
    { ...tier, stripeProductId: product.id },
    pasted,
  );
  const link = await ensurePaymentLink(
    stripe,
    lineItems,
    tier,
    origin,
    existingLink,
  );

  const parts: string[] = [];
  if (oneTime) parts.push(`setup £${setup}`);
  if (recurringPrice) {
    const delay =
      tier.recurringStartsAfterWeeks > 0
        ? ` after ${tier.recurringStartsAfterWeeks} weeks`
        : "";
    const months =
      tier.recurringMonths > 0
        ? ` for ${tier.recurringMonths} months`
        : " rolling";
    parts.push(`£${recurring}/mo${delay}${months}`);
  }

  return {
    ...tier,
    stripeProductId: product.id,
    stripePriceId: oneTime?.id || "",
    stripeRecurringPriceId: recurringPrice?.id || "",
    stripePaymentLinkId: link.id,
    stripePaymentLink: link.url,
    stripeSyncNote: isApplicationOnlyTier(tier)
      ? `Synced (${parts.join(" · ")}). Private link — never shown on public Pro/Elite cards.`
      : `Synced (${parts.join(" · ")}). Public checkout uses this Payment Link.`,
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
    const normalized = normalizeTierCommerce(tier);
    const setup = parsePriceAmount(normalized.priceAmount);
    const recurring = parsePriceAmount(normalized.recurringAmount);
    const pasted = parsePaymentLinkRef(normalized.stripePaymentLink);
    if (
      setup <= 0 &&
      recurring <= 0 &&
      !pasted.id &&
      !pasted.url &&
      !normalized.stripePaymentLinkId
    ) {
      skipped += 1;
      tiers.push({ ...normalized, stripeSyncNote: "" });
      continue;
    }
    try {
      const next = await syncOneTier(params.stripe, normalized, origin);
      synced += 1;
      tiers.push(next);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Stripe sync failed";
      errors.push(`${normalized.name || normalized.id}: ${message}`);
      tiers.push({
        ...normalized,
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
