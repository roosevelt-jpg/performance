import { getAdminCredentials } from "@/lib/admin/session";
import { NextResponse } from "next/server";
import { authorizeIntegrationsRequest } from "@/lib/integrations/auth";
import {
  buildChecks,
  getStorageMeta,
  isReadyForLive,
  loadIntegrations,
  maskConfig,
  saveIntegrations,
  toEnvSnippet,
} from "@/lib/integrations/store";
import {
  DEFAULT_INTEGRATIONS,
  type IntegrationsConfig,
} from "@/lib/integrations/types";

export const runtime = "nodejs";

function keepSecret(incoming: string | undefined, current: string): string {
  const value = incoming ?? current;
  if (!value || value.includes("••••")) return current;
  return value;
}

function normalizeIncoming(
  body: Partial<IntegrationsConfig>,
  current: IntegrationsConfig,
): IntegrationsConfig {
  const next: IntegrationsConfig = {
    admin: {
      notes: body.admin?.notes ?? current.admin.notes,
    },
    pricing: {
      pro: Number(body.pricing?.pro ?? current.pricing.pro),
      elite: Number(body.pricing?.elite ?? current.pricing.elite),
    },
    product: {
      showEntryTier: Boolean(
        body.product?.showEntryTier ?? current.product.showEntryTier,
      ),
      challengeCheckoutUrl:
        body.product?.challengeCheckoutUrl?.trim() ||
        current.product.challengeCheckoutUrl,
      challengeCheckoutEmbedUrl:
        body.product?.challengeCheckoutEmbedUrl?.trim() ??
        current.product.challengeCheckoutEmbedUrl,
      challengeCheckoutOpenInNewTab: Boolean(
        body.product?.challengeCheckoutOpenInNewTab ??
          current.product.challengeCheckoutOpenInNewTab,
      ),
    },
    calendar: {
      platform:
        body.calendar?.platform === "calendly" ||
        body.calendar?.platform === "ghl"
          ? body.calendar.platform
          : current.calendar.platform,
      ghlEmbedPro:
        body.calendar?.ghlEmbedPro ?? current.calendar.ghlEmbedPro,
      ghlEmbedElite:
        body.calendar?.ghlEmbedElite ?? current.calendar.ghlEmbedElite,
      calendlyEmbedPro:
        body.calendar?.calendlyEmbedPro ?? current.calendar.calendlyEmbedPro,
      calendlyEmbedElite:
        body.calendar?.calendlyEmbedElite ??
        current.calendar.calendlyEmbedElite,
    },
    ghl: {
      apiKey: keepSecret(body.ghl?.apiKey, current.ghl.apiKey),
      locationId: body.ghl?.locationId ?? current.ghl.locationId,
      apiBaseUrl:
        body.ghl?.apiBaseUrl?.trim() ||
        current.ghl.apiBaseUrl ||
        DEFAULT_INTEGRATIONS.ghl.apiBaseUrl,
    },
    youtube: {
      apiKey: keepSecret(body.youtube?.apiKey, current.youtube.apiKey),
      channelId: body.youtube?.channelId ?? current.youtube.channelId,
    },
    email: {
      provider:
        body.email?.provider === "mailchimp" ||
        body.email?.provider === "klaviyo" ||
        body.email?.provider === "none" ||
        body.email?.provider === "ghl"
          ? body.email.provider
          : current.email.provider,
      apiKey: keepSecret(body.email?.apiKey, current.email.apiKey),
      listId: body.email?.listId ?? current.email.listId,
      serverPrefix: body.email?.serverPrefix ?? current.email.serverPrefix,
    },
    shopify: {
      storeDomain: body.shopify?.storeDomain ?? current.shopify.storeDomain,
      storefrontToken: keepSecret(
        body.shopify?.storefrontToken,
        current.shopify.storefrontToken,
      ),
    },
    reviews: {
      provider:
        body.reviews?.provider === "judgeme" ||
        body.reviews?.provider === "internal"
          ? body.reviews.provider
          : current.reviews.provider,
      judgemeApiToken: keepSecret(
        body.reviews?.judgemeApiToken,
        current.reviews.judgemeApiToken,
      ),
      judgemeShopDomain:
        body.reviews?.judgemeShopDomain ?? current.reviews.judgemeShopDomain,
    },
  };

  return next;
}

export async function GET(request: Request) {
  const auth = authorizeIntegrationsRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const config = await loadIntegrations();
  const checks = buildChecks(config);
  const storage = await getStorageMeta();

  return NextResponse.json({
    config: maskConfig(config),
    secretsSet: {
      ghlApiKey: Boolean(config.ghl.apiKey),
      adminCredentials: Boolean(getAdminCredentials()),
      youtubeApiKey: Boolean(config.youtube.apiKey),
      emailApiKey: Boolean(config.email.apiKey),
      shopifyToken: Boolean(config.shopify.storefrontToken),
      judgemeToken: Boolean(config.reviews.judgemeApiToken),
    },
    checks,
    readyForLive: isReadyForLive(checks),
    storage,
    envSnippet: toEnvSnippet(config),
  });
}

export async function PUT(request: Request) {
  const auth = authorizeIntegrationsRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const storage = await getStorageMeta();
  if (!storage.writable) {
    return NextResponse.json(
      {
        error:
          "Firestore is not configured. Set the Firebase Admin environment variables.",
      },
      { status: 503 },
    );
  }

  let body: Partial<IntegrationsConfig>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const current = await loadIntegrations();
  const next = normalizeIncoming(body, current);
  await saveIntegrations(next);

  const checks = buildChecks(next);
  return NextResponse.json({
    ok: true,
    config: maskConfig(next),
    secretsSet: {
      ghlApiKey: Boolean(next.ghl.apiKey),
      adminCredentials: Boolean(getAdminCredentials()),
      youtubeApiKey: Boolean(next.youtube.apiKey),
      emailApiKey: Boolean(next.email.apiKey),
      shopifyToken: Boolean(next.shopify.storefrontToken),
      judgemeToken: Boolean(next.reviews.judgemeApiToken),
    },
    checks,
    readyForLive: isReadyForLive(checks),
    storage: await getStorageMeta(),
    envSnippet: toEnvSnippet(next),
  });
}
