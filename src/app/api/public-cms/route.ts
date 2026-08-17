import { NextResponse } from "next/server";
import { loadCms, loadPublicCmsView } from "@/lib/cms/store";

export const runtime = "nodejs";

/** Public CMS payload for the live site (no secrets). */
export async function GET() {
  const content = loadPublicCmsView(await loadCms());
  return NextResponse.json(content, {
    headers: {
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
    },
  });
}
