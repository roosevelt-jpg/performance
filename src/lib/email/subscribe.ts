import { upsertEmailSignup } from "@/lib/crm/ghl";
import { loadIntegrations } from "@/lib/integrations/store";
import { toPlainText } from "@/lib/text/plain";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function subscribeEmail(
  rawEmail: string,
): Promise<{ ok: true; mocked?: boolean } | { ok: false; error: string }> {
  const email = toPlainText(rawEmail).toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: "Enter a valid email." };
  }

  const config = await loadIntegrations();
  const provider = config.email.provider;

  if (provider === "none") {
    return { ok: false, error: "Email signup is not connected yet." };
  }

  if (provider === "ghl") {
    const result = await upsertEmailSignup({
      email,
      source: "marketing_popup",
    });
    return { ok: true, mocked: result.mocked };
  }

  if (provider === "mailchimp") {
    if (!config.email.apiKey || !config.email.listId || !config.email.serverPrefix) {
      return {
        ok: false,
        error: "Mailchimp API key, list ID, and server prefix are required.",
      };
    }
    const res = await fetch(
      `https://${config.email.serverPrefix}.api.mailchimp.com/3.0/lists/${config.email.listId}/members`,
      {
        method: "POST",
        headers: {
          Authorization: `apikey ${config.email.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email_address: email,
          status: "pending",
          tags: ["marketing_popup"],
        }),
      },
    );
    if (!res.ok && res.status !== 400) {
      const text = await res.text();
      throw new Error(`Mailchimp failed (${res.status}): ${text}`);
    }
    return { ok: true };
  }

  if (provider === "klaviyo") {
    if (!config.email.apiKey || !config.email.listId) {
      return { ok: false, error: "Klaviyo API key and list ID are required." };
    }
    const res = await fetch(
      `https://a.klaviyo.com/api/profile-import/`,
      {
        method: "POST",
        headers: {
          Authorization: `Klaviyo-API-Key ${config.email.apiKey}`,
          revision: "2024-10-15",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: {
            type: "profile",
            attributes: { email },
          },
        }),
      },
    );
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Klaviyo failed (${res.status}): ${text}`);
    }
    return { ok: true };
  }

  return { ok: false, error: "Unknown email provider." };
}
