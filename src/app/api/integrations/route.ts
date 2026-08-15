import { getAdminCredentials } from "@/lib/admin/session";
import { NextResponse } from "next/server";
import { authorizeIntegrationsRequest } from "@/lib/integrations/auth";
import {
  buildChecks,
  getStorageMeta,
  isReadyForLive,
  listSecretsSet,
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
        body.calendar?.platform === "ghl" ||
        body.calendar?.platform === "google"
          ? body.calendar.platform
          : current.calendar.platform,
      bookingMode:
        body.calendar?.bookingMode === "native" ||
        body.calendar?.bookingMode === "embed" ||
        body.calendar?.bookingMode === "auto"
          ? body.calendar.bookingMode
          : current.calendar.bookingMode,
      timezone:
        body.calendar?.timezone?.trim() || current.calendar.timezone,
      workingHoursStart:
        body.calendar?.workingHoursStart?.trim() ||
        current.calendar.workingHoursStart,
      workingHoursEnd:
        body.calendar?.workingHoursEnd?.trim() ||
        current.calendar.workingHoursEnd,
      workingDays: Array.isArray(body.calendar?.workingDays)
        ? body.calendar.workingDays.filter((n) => n >= 1 && n <= 7)
        : current.calendar.workingDays,
      bufferMinutes: Number(
        body.calendar?.bufferMinutes ?? current.calendar.bufferMinutes,
      ),
      minNoticeHours: Number(
        body.calendar?.minNoticeHours ?? current.calendar.minNoticeHours,
      ),
      daysAhead: Number(
        body.calendar?.daysAhead ?? current.calendar.daysAhead,
      ),
      ghlEmbedPro:
        body.calendar?.ghlEmbedPro ?? current.calendar.ghlEmbedPro,
      ghlEmbedElite:
        body.calendar?.ghlEmbedElite ?? current.calendar.ghlEmbedElite,
      ghlCalendarIdPro:
        body.calendar?.ghlCalendarIdPro ?? current.calendar.ghlCalendarIdPro,
      ghlCalendarIdElite:
        body.calendar?.ghlCalendarIdElite ??
        current.calendar.ghlCalendarIdElite,
      calendlyEmbedPro:
        body.calendar?.calendlyEmbedPro ?? current.calendar.calendlyEmbedPro,
      calendlyEmbedElite:
        body.calendar?.calendlyEmbedElite ??
        current.calendar.calendlyEmbedElite,
      calendlyApiToken: keepSecret(
        body.calendar?.calendlyApiToken,
        current.calendar.calendlyApiToken,
      ),
      calendlyEventTypePro:
        body.calendar?.calendlyEventTypePro ??
        current.calendar.calendlyEventTypePro,
      calendlyEventTypeElite:
        body.calendar?.calendlyEventTypeElite ??
        current.calendar.calendlyEventTypeElite,
      calendlyLocationKind:
        body.calendar?.calendlyLocationKind ??
        current.calendar.calendlyLocationKind,
      googleCalendarId:
        body.calendar?.googleCalendarId?.trim() ||
        current.calendar.googleCalendarId,
      googleClientId:
        body.calendar?.googleClientId ?? current.calendar.googleClientId,
      googleClientSecret: keepSecret(
        body.calendar?.googleClientSecret,
        current.calendar.googleClientSecret,
      ),
      googleRefreshToken: keepSecret(
        body.calendar?.googleRefreshToken,
        current.calendar.googleRefreshToken,
      ),
      googleServiceAccountJson:
        body.calendar?.googleServiceAccountJson?.includes("••••")
          ? current.calendar.googleServiceAccountJson
          : keepSecret(
              body.calendar?.googleServiceAccountJson,
              current.calendar.googleServiceAccountJson,
            ),
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
      ...listSecretsSet(config),
      adminCredentials: Boolean(getAdminCredentials()),
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
          "Filesystem is not writable (common on serverless). Export as .env and set secrets on the host instead.",
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
      ...listSecretsSet(next),
      adminCredentials: Boolean(getAdminCredentials()),
    },
    checks,
    readyForLive: isReadyForLive(checks),
    storage: await getStorageMeta(),
    envSnippet: toEnvSnippet(next),
  });
}
