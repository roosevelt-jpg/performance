import { NextResponse } from "next/server";
import { authorizeIntegrationsRequest } from "@/lib/integrations/auth";
import { DEFAULT_CMS } from "@/lib/cms/defaults";
import {
  getCmsStorageMeta,
  loadCms,
  mergeCms,
  saveCms,
} from "@/lib/cms/store";
import { sanitizePlainDeep } from "@/lib/text/plain";
import type { CmsContent } from "@/lib/cms/types";
import {
  loadIntegrations,
  saveIntegrations,
} from "@/lib/integrations/store";
import { getStripeClient } from "@/lib/stripe/client";
import { syncTiersToStripe } from "@/lib/stripe/syncTiers";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = authorizeIntegrationsRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const content = await loadCms();
  const storage = await getCmsStorageMeta();
  return NextResponse.json({ content, storage, defaults: DEFAULT_CMS });
}

export async function PUT(request: Request) {
  const auth = authorizeIntegrationsRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: { content?: CmsContent };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.content) {
    return NextResponse.json({ error: "Missing content" }, { status: 400 });
  }

  const next = sanitizePlainDeep(mergeCms(DEFAULT_CMS, body.content));
  const stripe = await getStripeClient();
  let stripeSync = {
    connected: false,
    synced: 0,
    skipped: next.tiers.length,
    errors: [] as string[],
  };

  if (stripe) {
    const result = await syncTiersToStripe({
      stripe,
      tiers: next.tiers,
      siteUrl: next.site.brand.siteUrl,
    });
    next.tiers = result.tiers;
    stripeSync = result.summary;
    const challenge = result.tiers.find((tier) => tier.id === "challenge");
    if (challenge?.stripePriceId) {
      const integrations = await loadIntegrations();
      if (integrations.stripe.challengePriceId !== challenge.stripePriceId) {
        await saveIntegrations({
          ...integrations,
          stripe: {
            ...integrations.stripe,
            challengePriceId: challenge.stripePriceId,
          },
        });
      }
    }
  } else {
    next.tiers = next.tiers.map((tier) =>
      tier.priceAmount > 0
        ? {
            ...tier,
            stripeSyncNote:
              "Stripe credentials missing. Add the secret key in Admin → Integrations, then save again.",
          }
        : tier,
    );
  }

  await saveCms(next);

  return NextResponse.json({
    ok: true,
    content: next,
    stripeSync,
    storage: await getCmsStorageMeta(),
  });
}
