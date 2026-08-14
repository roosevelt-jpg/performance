import { NextResponse } from "next/server";
import { getPublicRuntimeConfig } from "@/lib/integrations/runtime";

export const runtime = "nodejs";

/** Public, non-secret config for the booking funnel. */
export async function GET() {
  const config = await getPublicRuntimeConfig();
  return NextResponse.json(config);
}
