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
  await saveCms(next);

  return NextResponse.json({
    ok: true,
    content: next,
    storage: await getCmsStorageMeta(),
  });
}
