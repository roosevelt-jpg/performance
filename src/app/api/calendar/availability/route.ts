import { NextResponse } from "next/server";
import { listAvailability } from "@/lib/calendar/booking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tier = searchParams.get("tier");
  if (tier !== "pro" && tier !== "elite") {
    return NextResponse.json(
      { error: "tier must be pro or elite" },
      { status: 400 },
    );
  }

  try {
    const result = await listAvailability(tier);
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    const status =
      error && typeof error === "object" && "status" in error
        ? Number((error as { status: number }).status) || 502
        : 502;
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Availability failed",
      },
      { status },
    );
  }
}
