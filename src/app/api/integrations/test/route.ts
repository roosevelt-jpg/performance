import { NextResponse } from "next/server";
import { authorizeIntegrationsRequest } from "@/lib/integrations/auth";
import { loadIntegrations } from "@/lib/integrations/store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = authorizeIntegrationsRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: { target?: string } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const target = body.target ?? "ghl";
  const config = await loadIntegrations();

  if (target === "ghl") {
    if (!config.ghl.apiKey || !config.ghl.locationId) {
      return NextResponse.json(
        {
          ok: false,
          target,
          error: "GHL API key and location ID are required before testing.",
        },
        { status: 400 },
      );
    }

    try {
      const res = await fetch(
        `${config.ghl.apiBaseUrl}/locations/${config.ghl.locationId}`,
        {
          headers: {
            Authorization: `Bearer ${config.ghl.apiKey}`,
            Version: "2021-07-28",
            Accept: "application/json",
          },
        },
      );

      if (!res.ok) {
        const text = await res.text();
        return NextResponse.json({
          ok: false,
          target,
          status: res.status,
          error: text.slice(0, 400) || `HTTP ${res.status}`,
        });
      }

      const data = (await res.json()) as {
        location?: { name?: string; id?: string };
      };

      return NextResponse.json({
        ok: true,
        target,
        locationName: data.location?.name,
        locationId: data.location?.id ?? config.ghl.locationId,
      });
    } catch (error) {
      return NextResponse.json({
        ok: false,
        target,
        error: error instanceof Error ? error.message : "Request failed",
      });
    }
  }

  if (target === "calendar") {
    const platform = config.calendar.platform;
    try {
      if (platform === "google") {
        const { googlePing } = await import("@/lib/calendar/providers/google");
        const name = await googlePing(config);
        return NextResponse.json({
          ok: true,
          target,
          platform,
          message: `Google Calendar connected — ${name}`,
        });
      }
      if (platform === "calendly") {
        const { calendlyPing } = await import(
          "@/lib/calendar/providers/calendly"
        );
        const name = await calendlyPing(config);
        return NextResponse.json({
          ok: true,
          target,
          platform,
          message: `Calendly connected — ${name}`,
        });
      }

      if (config.calendar.ghlCalendarIdPro || config.calendar.ghlCalendarIdElite) {
        const calendarId =
          config.calendar.ghlCalendarIdPro ||
          config.calendar.ghlCalendarIdElite;
        const res = await fetch(
          `${config.ghl.apiBaseUrl}/calendars/${encodeURIComponent(calendarId)}`,
          {
            headers: {
              Authorization: `Bearer ${config.ghl.apiKey}`,
              Version: "2021-07-28",
              Accept: "application/json",
            },
          },
        );
        if (!res.ok) {
          const text = await res.text();
          return NextResponse.json({
            ok: false,
            target,
            error: text.slice(0, 400) || `GHL calendar HTTP ${res.status}`,
          });
        }
        return NextResponse.json({
          ok: true,
          target,
          platform,
          message: "GHL calendar ID is reachable.",
        });
      }

      const urls = [config.calendar.ghlEmbedPro, config.calendar.ghlEmbedElite];
      const missing = urls.filter((u) => !u.trim()).length;
      if (missing > 0) {
        return NextResponse.json({
          ok: false,
          target,
          error: `${missing} embed URL(s) missing for GHL. Add calendar IDs or embed URLs.`,
        });
      }
      return NextResponse.json({
        ok: true,
        target,
        platform,
        message: "Both Pro and Elite embed URLs are set.",
      });
    } catch (error) {
      return NextResponse.json({
        ok: false,
        target,
        error: error instanceof Error ? error.message : "Calendar test failed",
      });
    }
  }

  if (target === "youtube") {
    if (!config.youtube.apiKey) {
      return NextResponse.json(
        {
          ok: false,
          target,
          error: "YouTube API key is required before testing.",
        },
        { status: 400 },
      );
    }
    try {
      const params = new URLSearchParams({
        part: "snippet",
        key: config.youtube.apiKey,
        maxResults: "1",
      });
      if (config.youtube.channelId) {
        params.set("id", config.youtube.channelId);
      } else {
        params.set("mine", "false");
        params.set("forUsername", "GoogleDevelopers");
      }
      const url = config.youtube.channelId
        ? `https://www.googleapis.com/youtube/v3/channels?${params.toString()}`
        : `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=dQw4w9WgXcQ&key=${encodeURIComponent(config.youtube.apiKey)}`;
      const res = await fetch(url);
      const data = (await res.json()) as {
        error?: { message?: string };
        items?: { snippet?: { title?: string } }[];
      };
      if (!res.ok || data.error) {
        return NextResponse.json({
          ok: false,
          target,
          error: data.error?.message ?? `HTTP ${res.status}`,
        });
      }
      return NextResponse.json({
        ok: true,
        target,
        message: data.items?.[0]?.snippet?.title
          ? `YouTube OK — ${data.items[0].snippet.title}`
          : "YouTube API key is valid.",
      });
    } catch (error) {
      return NextResponse.json({
        ok: false,
        target,
        error: error instanceof Error ? error.message : "Request failed",
      });
    }
  }

  if (target === "stripe") {
    const secret = config.stripe?.secretKey?.trim();
    if (!secret) {
      return NextResponse.json(
        {
          ok: false,
          target,
          error: "Stripe secret key is required before testing.",
        },
        { status: 400 },
      );
    }
    try {
      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(secret);
      await stripe.balance.retrieve();
      const webhookReady = Boolean(config.stripe?.webhookSecret?.trim());
      return NextResponse.json({
        ok: true,
        target,
        message: webhookReady
          ? "Stripe connected · webhook secret set"
          : "Stripe connected · webhook secret missing",
        webhookReady,
      });
    } catch (error) {
      return NextResponse.json({
        ok: false,
        target,
        error: error instanceof Error ? error.message : "Stripe test failed",
      });
    }
  }

  if (target === "storage") {
    try {
      const { persistMeta, writePersistedJson, readPersistedJson } =
        await import("@/lib/persist/jsonFile");
      const probeName = "status-probe.json";
      const payload = { ok: true, at: new Date().toISOString() };
      const written = await writePersistedJson(probeName, payload);
      const readBack = await readPersistedJson<{ ok?: boolean }>(probeName);
      const meta = await persistMeta("integrations.local.json");
      if (!written.writable || !readBack?.ok) {
        return NextResponse.json({
          ok: false,
          target,
          error: "Could not write and read back admin storage.",
          durable: written.durable,
          path: written.path,
        });
      }
      return NextResponse.json({
        ok: written.durable,
        target,
        durable: written.durable,
        path: written.path,
        message: written.durable
          ? `Durable storage OK — ${written.path}`
          : `Writable but not durable — ${written.path}. Add Blob token and redeploy.`,
        integrationsFile: meta,
      });
    } catch (error) {
      return NextResponse.json({
        ok: false,
        target,
        error: error instanceof Error ? error.message : "Storage test failed",
      });
    }
  }

  if (target === "gmail") {
    const from = config.email?.fromEmail?.trim();
    const password = config.email?.gmailAppPassword?.trim();
    if (!from || !password) {
      return NextResponse.json(
        {
          ok: false,
          target,
          error: "Gmail from address and app password are required before testing.",
        },
        { status: 400 },
      );
    }
    try {
      const nodemailer = (await import("nodemailer")).default;
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: { user: from, pass: password.replace(/\s+/g, "") },
      });
      await transporter.verify();
      return NextResponse.json({
        ok: true,
        target,
        message: `Gmail SMTP connected — ${from}`,
      });
    } catch (error) {
      return NextResponse.json({
        ok: false,
        target,
        error: error instanceof Error ? error.message : "Gmail test failed",
      });
    }
  }

  return NextResponse.json({ error: "Unknown target" }, { status: 400 });
}
