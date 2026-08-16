const GRAPH = "https://graph.facebook.com";

export function whatsappReady(
  phoneNumberId: string,
  accessToken: string,
): boolean {
  return Boolean(phoneNumberId.trim() && accessToken.trim());
}

export function whatsappDigits(mobile: string): string {
  return mobile
    .replace(/^whatsapp:/i, "")
    .replace(/[^\d]/g, "")
    .replace(/^00/, "");
}

type GraphError = {
  error?: { message?: string; code?: number };
};

async function postMessage(params: {
  phoneNumberId: string;
  accessToken: string;
  version: string;
  payload: Record<string, unknown>;
}): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch(
    `${GRAPH}/${params.version}/${params.phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${params.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        ...params.payload,
      }),
    },
  );
  const json = (await res.json().catch(() => ({}))) as GraphError & {
    messages?: unknown[];
  };
  if (!res.ok) {
    const code = json.error?.code;
    if (code === 131047) {
      return {
        ok: false,
        error:
          "Outside the 24-hour window. Add an approved utility template in Integrations.",
      };
    }
    return {
      ok: false,
      error: "WhatsApp Cloud API rejected the message.",
    };
  }
  return { ok: true };
}

export async function sendWhatsAppCloud(params: {
  phoneNumberId: string;
  accessToken: string;
  graphVersion?: string;
  to: string;
  text: string;
  pdfUrl?: string;
  pdfFilename?: string;
  templateName?: string;
  templateLanguage?: string;
  templateParams?: string[];
}): Promise<{ ok: boolean; error?: string }> {
  const to = whatsappDigits(params.to);
  if (to.length < 8) {
    return { ok: false, error: "WhatsApp skipped — mobile needs a country code." };
  }

  const version = params.graphVersion?.trim() || "v21.0";
  const base = {
    phoneNumberId: params.phoneNumberId.trim(),
    accessToken: params.accessToken.trim(),
    version,
  };

  if (params.templateName?.trim()) {
    const template = await postMessage({
      ...base,
      payload: {
        to,
        type: "template",
        template: {
          name: params.templateName.trim(),
          language: { code: params.templateLanguage?.trim() || "en" },
          components: params.templateParams?.length
            ? [
                {
                  type: "body",
                  parameters: params.templateParams.map((text) => ({
                    type: "text",
                    text: text.slice(0, 1024),
                  })),
                },
              ]
            : undefined,
        },
      },
    });
    if (!template.ok) return template;
  }

  if (params.pdfUrl?.startsWith("https://")) {
    const doc = await postMessage({
      ...base,
      payload: {
        to,
        type: "document",
        document: {
          link: params.pdfUrl,
          filename: params.pdfFilename || "performance-dna.pdf",
          caption: params.text.slice(0, 1024),
        },
      },
    });
    if (doc.ok) return doc;
    if (params.templateName?.trim()) return { ok: true };
    return doc;
  }

  if (params.templateName?.trim()) return { ok: true };

  return postMessage({
    ...base,
    payload: {
      to,
      type: "text",
      text: { body: params.text.slice(0, 4096), preview_url: true },
    },
  });
}
