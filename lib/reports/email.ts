import { createElement } from "react";
import { Resend } from "resend";
import ReportNotificationEmail from "@/emails/report-notification";
import type { Report } from "@/lib/db/schema";

type ReportEmailResult =
  | { error?: undefined; sent: true; skipped?: false }
  | { error?: string; sent: false; skipped?: boolean };

type ReportNotificationInput = Pick<
  Report,
  "category" | "createdAt" | "id" | "protocol"
>;

export async function maybeSendReportNotificationEmail(
  report: ReportNotificationInput,
): Promise<ReportEmailResult> {
  const to = parseEmailList(process.env.REPORT_NOTIFICATION_TO_EMAIL);

  if (to.length === 0) {
    return { sent: false, skipped: true };
  }

  const from = process.env.REPORT_NOTIFICATION_FROM_EMAIL;
  const apiKey = process.env.RESEND_API_KEY;

  if (!from) {
    return {
      error: "REPORT_NOTIFICATION_FROM_EMAIL is not set.",
      sent: false,
    };
  }

  if (!apiKey) {
    return {
      error: "RESEND_API_KEY is not set.",
      sent: false,
    };
  }

  const resend = new Resend(apiKey);
  const reportUrl = `${getSiteOrigin()}/portal/comite-de-etica/${report.id}`;
  const result = await resend.emails
    .send(
      {
        from,
        react: createElement(ReportNotificationEmail, {
          category: report.category,
          createdAt: report.createdAt,
          protocol: report.protocol,
          reportUrl,
        }),
        subject: `[Portal Elinsa] Nova denúncia recebida: ${report.protocol}`,
        text: buildReportNotificationText(report, reportUrl),
        to,
      },
      {
        idempotencyKey: `report-notification/${report.id}`,
      },
    )
    .catch((error: unknown) => ({ error }));
  const error = "error" in result ? result.error : null;

  if (error) {
    return {
      error: formatResendError(error),
      sent: false,
    };
  }

  return { sent: true };
}

function buildReportNotificationText(
  report: ReportNotificationInput,
  reportUrl: string,
) {
  return [
    "Nova denúncia recebida pelo canal público da Elinsa.",
    "",
    "Por segurança, este aviso não inclui o conteúdo do relato.",
    "",
    `Protocolo: ${report.protocol}`,
    `Categoria: ${report.category}`,
    `Recebida em: ${report.createdAt.toLocaleString("pt-BR")}`,
    "",
    `Acesse no portal: ${reportUrl}`,
  ].join("\n");
}

function getSiteOrigin() {
  const origin =
    process.env.NEXT_PUBLIC_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_SERVER_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    "https://elinsa-nine.vercel.app";

  return origin.replace(/\/$/, "");
}

function parseEmailList(value?: string) {
  return (value ?? "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
}

function formatResendError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }

  return "Erro desconhecido ao enviar e-mail.";
}
