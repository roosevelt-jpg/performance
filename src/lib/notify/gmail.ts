import nodemailer from "nodemailer";

export function gmailReady(fromEmail: string, appPassword: string): boolean {
  return Boolean(fromEmail.trim() && appPassword.trim());
}

function stripAppPassword(value: string): string {
  return value.replace(/\s+/g, "");
}

export async function sendGmailSmtp(params: {
  fromEmail: string;
  fromName: string;
  appPassword: string;
  to: string;
  subject: string;
  text: string;
  pdfBytes?: Uint8Array;
  pdfFilename?: string;
}): Promise<void> {
  const user = params.fromEmail.trim();
  const pass = stripAppPassword(params.appPassword);
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: `"${params.fromName || "The Formula Performance"}" <${user}>`,
    to: params.to,
    subject: params.subject,
    text: params.text,
    attachments: params.pdfBytes
      ? [
          {
            filename: params.pdfFilename || "performance-dna.pdf",
            content: Buffer.from(params.pdfBytes),
            contentType: "application/pdf",
          },
        ]
      : undefined,
  });
}
