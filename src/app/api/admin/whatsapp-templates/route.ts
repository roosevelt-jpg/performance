import { NextResponse } from "next/server";
import { authorizeIntegrationsRequest } from "@/lib/integrations/auth";
import { loadIntegrations } from "@/lib/integrations/store";
import {
  createWhatsAppTemplate,
  listWhatsAppTemplates,
} from "@/lib/notify/whatsapp";

export const runtime = "nodejs";

function requireWhatsAppCreds(config: Awaited<ReturnType<typeof loadIntegrations>>) {
  const { businessAccountId, accessToken, graphVersion } = config.whatsapp;
  if (!businessAccountId.trim() || !accessToken.trim()) {
    return {
      ok: false as const,
      error:
        "Add a WhatsApp Business Account ID and access token in Integrations first.",
    };
  }
  return { ok: true as const, businessAccountId, accessToken, graphVersion };
}

/** List templates straight from Meta — this list itself is the "sync": there's
 * nothing to persist since Meta is always the source of truth for status. */
export async function GET(request: Request) {
  const auth = authorizeIntegrationsRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const config = await loadIntegrations();
  const creds = requireWhatsAppCreds(config);
  if (!creds.ok) {
    return NextResponse.json({ error: creds.error }, { status: 409 });
  }

  const result = await listWhatsAppTemplates(creds);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }
  return NextResponse.json({ templates: result.templates });
}

const NAME_PATTERN = /^[a-z0-9_]{1,512}$/;
const CATEGORIES = new Set(["MARKETING", "UTILITY", "AUTHENTICATION"]);

export async function POST(request: Request) {
  const auth = authorizeIntegrationsRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: {
    name?: string;
    category?: string;
    language?: string;
    bodyText?: string;
    bodyExampleParams?: string[];
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = body.name?.trim().toLowerCase() ?? "";
  const category = body.category ?? "";
  const language = body.language?.trim() || "en";
  const bodyText = body.bodyText?.trim() ?? "";

  if (!NAME_PATTERN.test(name)) {
    return NextResponse.json(
      { error: "Template name must be lowercase letters, numbers, and underscores only." },
      { status: 400 },
    );
  }
  if (!CATEGORIES.has(category)) {
    return NextResponse.json(
      { error: "Category must be MARKETING, UTILITY, or AUTHENTICATION." },
      { status: 400 },
    );
  }
  if (!bodyText) {
    return NextResponse.json({ error: "Body text is required." }, { status: 400 });
  }

  const config = await loadIntegrations();
  const creds = requireWhatsAppCreds(config);
  if (!creds.ok) {
    return NextResponse.json({ error: creds.error }, { status: 409 });
  }

  const result = await createWhatsAppTemplate({
    ...creds,
    name,
    category: category as "MARKETING" | "UTILITY" | "AUTHENTICATION",
    language,
    bodyText,
    bodyExampleParams: body.bodyExampleParams?.filter(Boolean),
  });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }
  return NextResponse.json({ ok: true, id: result.id, status: result.status });
}
