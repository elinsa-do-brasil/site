// Envia o corpo da denúncia para app/api/reports/route.ts, que criptografa/armazena no servidor; retorna o protocolo/uploadToken que uploadEncryptedAttachment.ts usa em seguida.
import type { AnonymousReportContent, SubmitReportResult } from "./types";

export type SubmitEncryptedReportParams = {
  report: AnonymousReportContent;
  turnstileToken: string;
  website: string;
};

export async function submitEncryptedReport({
  report,
  turnstileToken,
  website,
}: SubmitEncryptedReportParams): Promise<SubmitReportResult> {
  // credentials "omit" + referrerPolicy "no-referrer": a denúncia não deve carregar cookies de sessão nem vazar a URL de origem — reforça o anonimato mesmo para quem estiver logado em outra aba.
  const response = await fetch("/api/reports", {
    method: "POST",
    credentials: "omit",
    cache: "no-store",
    referrerPolicy: "no-referrer",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ report, turnstileToken, website }),
  });

  if (!response.ok) {
    throw new Error("REPORT_SUBMIT_FAILED");
  }

  const result = (await response.json()) as Partial<SubmitReportResult>;

  if (!result.protocol || !result.reportId || !result.uploadToken) {
    throw new Error("REPORT_PROTOCOL_MISSING");
  }

  return {
    protocol: result.protocol,
    reportId: result.reportId,
    uploadToken: result.uploadToken,
  };
}
