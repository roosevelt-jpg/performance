import { loadIntegrations } from "@/lib/integrations/store";
import { gmailReady, sendGmailSmtp } from "@/lib/notify/gmail";
import { sendWhatsAppCloud, whatsappReady } from "@/lib/notify/whatsapp";
import type { DnaReportRecord } from "@/lib/dna/store";

export type ReportDelivery = {
  emailSent: boolean;
  whatsappSent: boolean;
  mocked: boolean;
  detail: string[];
};

function originFrom(siteUrl?: string): string {
  try {
    return new URL(siteUrl || "https://marketing.theformulaperformance.com").origin;
  } catch {
    return "https://marketing.theformulaperformance.com";
  }
}

export async function deliverDnaReport(params: {
  record: DnaReportRecord;
  pdfUrl: string;
  pdfBytes?: Uint8Array;
  siteUrl?: string;
}): Promise<ReportDelivery> {
  const config = await loadIntegrations();
  const detail: string[] = [];
  let emailSent = false;
  let whatsappSent = false;

  const text =
    `${params.record.name || "You"}, your Performance DNA score is ${params.record.result.overall}/100. ` +
    `${params.record.result.coach.name} is assigned. ${params.record.result.nextStep} Report: ${params.pdfUrl}`;

  if (gmailReady(config.email.fromEmail, config.email.gmailAppPassword) && params.record.email) {
    try {
      await sendGmailSmtp({
        fromEmail: config.email.fromEmail,
        fromName: config.email.fromName || "The Formula Performance",
        appPassword: config.email.gmailAppPassword,
        to: params.record.email,
        subject: `Your Performance DNA — ${params.record.result.overall}/100`,
        text: `${text}\n\n${params.record.result.summary}`,
        pdfBytes: params.pdfBytes,
        pdfFilename: `performance-dna-${params.record.result.overall}.pdf`,
      });
      emailSent = true;
    } catch (error) {
      console.warn("[gmail-smtp]", error);
      detail.push(
        "Email not sent — Gmail SMTP rejected the message. Check the App Password in Integrations.",
      );
    }
  } else if (config.ghl.apiKey && config.ghl.locationId && params.record.email) {
    try {
      const res = await fetch(
        `${config.ghl.apiBaseUrl}/contacts/upsert`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.ghl.apiKey}`,
            Version: "2021-07-28",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            locationId: config.ghl.locationId,
            firstName: params.record.name.split(" ")[0] || params.record.name,
            email: params.record.email,
            phone: params.record.mobile || undefined,
            tags: ["dna_report", `dna_${params.record.result.path}`],
            source: "performance_dna",
            customFields: [
              { key: "dna_score", field_value: String(params.record.result.overall) },
              { key: "dna_path", field_value: params.record.result.path },
              { key: "dna_coach", field_value: params.record.result.coach.name },
              { key: "dna_report_url", field_value: params.pdfUrl },
            ],
          }),
        },
      );
      emailSent = res.ok;
      if (!res.ok) detail.push(`GHL contact failed (${res.status})`);
      else detail.push("GHL contact updated with report link (workflow can email/WhatsApp).");
    } catch (error) {
      detail.push(`GHL error: ${error instanceof Error ? error.message : "failed"}`);
    }
  } else {
    detail.push("Email not sent — add Gmail SMTP or GoHighLevel in Integrations.");
  }

  if (
    whatsappReady(
      config.whatsapp?.phoneNumberId ?? "",
      config.whatsapp?.accessToken ?? "",
    ) &&
    params.record.mobile
  ) {
    try {
      const sent = await sendWhatsAppCloud({
        phoneNumberId: config.whatsapp.phoneNumberId,
        accessToken: config.whatsapp.accessToken,
        graphVersion: config.whatsapp.graphVersion,
        to: params.record.mobile,
        text,
        pdfUrl: params.pdfUrl,
        pdfFilename: `performance-dna-${params.record.result.overall}.pdf`,
        templateName: config.whatsapp.templateName,
        templateLanguage: config.whatsapp.templateLanguage,
        templateParams: [
          params.record.name.split(" ")[0] || params.record.name || "there",
          String(params.record.result.overall),
          params.pdfUrl,
        ],
      });
      whatsappSent = sent.ok;
      if (!sent.ok && sent.error) detail.push(sent.error);
    } catch (error) {
      console.warn("[whatsapp-cloud]", error);
      detail.push("WhatsApp not sent — Cloud API request failed.");
    }
  } else if (!params.record.mobile) {
    detail.push("WhatsApp skipped — no mobile number.");
  } else {
    detail.push("WhatsApp not sent — add Meta Cloud API credentials in Integrations.");
  }

  return {
    emailSent,
    whatsappSent,
    mocked: !emailSent && !whatsappSent,
    detail,
  };
}

export function reportPublicUrl(token: string, siteUrl?: string): string {
  return `${originFrom(siteUrl)}/api/dna/report?token=${encodeURIComponent(token)}`;
}
