import { NextResponse } from "next/server";
import { updateWhatsAppOptIn } from "@/lib/crm/ghl";
import { loadIntegrations } from "@/lib/integrations/store";
import { sendWhatsAppCloud, whatsappReady } from "@/lib/notify/whatsapp";

export const runtime = "nodejs";

function bookingMessage(name: string | undefined, start: string, timeZone: string): string {
  const label = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(start));
  return `Hey${name ? ` ${name.split(" ")[0]}` : ""}, this confirms your call with Kane is booked for ${label}. Reply here if you need to reschedule.`;
}

/**
 * Sent directly, alongside the GHL tag update below — a booking confirmation is
 * time-sensitive, so it shouldn't depend on a separate CRM workflow existing.
 * Best-effort: WhatsApp requires either an open 24h window or an approved
 * template for a business-initiated message, so this can silently no-op.
 */
async function sendDirectWhatsAppConfirmation(params: {
  mobile?: string;
  name?: string;
  bookingStart?: string;
  bookingTimeZone?: string;
}) {
  if (!params.mobile || !params.bookingStart) return;
  try {
    const { whatsapp } = await loadIntegrations();
    if (!whatsappReady(whatsapp.phoneNumberId, whatsapp.accessToken)) return;
    const result = await sendWhatsAppCloud({
      phoneNumberId: whatsapp.phoneNumberId,
      accessToken: whatsapp.accessToken,
      graphVersion: whatsapp.graphVersion,
      to: params.mobile,
      text: bookingMessage(
        params.name,
        params.bookingStart,
        params.bookingTimeZone || "Europe/London",
      ),
    });
    if (!result.ok) {
      console.warn("[whatsapp-optin] direct send skipped:", result.error);
    }
  } catch (error) {
    console.warn("[whatsapp-optin] direct send failed", error);
  }
}

export async function POST(request: Request) {
  let body: {
    contactId?: string;
    optedIn?: boolean;
    mobile?: string;
    name?: string;
    bookingStart?: string;
    bookingTimeZone?: string;
  };
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

    if (body.optedIn) {
      await sendDirectWhatsAppConfirmation({
        mobile: body.mobile,
        name: body.name,
        bookingStart: body.bookingStart,
        bookingTimeZone: body.bookingTimeZone,
      });
    }

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
