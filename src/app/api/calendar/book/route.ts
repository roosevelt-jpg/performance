import { NextResponse } from "next/server";
import { bookSlot } from "@/lib/calendar/booking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: {
    tier?: string;
    start?: string;
    end?: string;
    name?: string;
    email?: string;
    phone?: string;
    timezone?: string;
    contactId?: string;
    notes?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const tier = body.tier;
  if (tier !== "pro" && tier !== "elite") {
    return NextResponse.json(
      { error: "tier must be pro or elite" },
      { status: 400 },
    );
  }
  if (!body.start || !body.name?.trim() || !body.email?.trim()) {
    return NextResponse.json(
      { error: "start, name, and email are required" },
      { status: 400 },
    );
  }

  try {
    const result = await bookSlot({
      tier,
      start: body.start,
      end: body.end || "",
      name: body.name.trim(),
      email: body.email.trim(),
      phone: body.phone,
      timezone: body.timezone,
      contactId: body.contactId,
      notes: body.notes,
    });
    return NextResponse.json(result);
  } catch (error) {
    const status =
      error && typeof error === "object" && "status" in error
        ? Number((error as { status: number }).status) || 502
        : 502;
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Booking failed",
      },
      { status },
    );
  }
}
