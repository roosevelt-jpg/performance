import { NextResponse } from "next/server";
import { updateWhatsAppOptIn } from "@/lib/crm/ghl";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { contactId?: string; optedIn?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.contactId || typeof body.optedIn !== "boolean") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const timestamp = new Date().toISOString();

  try {
    const result = await updateWhatsAppOptIn({
      contactId: body.contactId,
      optedIn: body.optedIn,
      source: "pro_elite_confirmation",
      timestamp,
    });

    return NextResponse.json({
      ok: true,
      mocked: result.mocked,
      timestamp,
    });
  } catch (error) {
    console.error("[api/whatsapp-optin]", error);
    return NextResponse.json(
      { error: "Failed to update WhatsApp preference" },
      { status: 502 },
    );
  }
}
