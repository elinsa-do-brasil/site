import type { AnonymousReportEncryptedEnvelope } from "./types";

export type SubmitEncryptedReportParams = {
  webhookUrl: string;
  encryptedPayload: string;
};

export async function submitEncryptedReport({
  webhookUrl,
  encryptedPayload,
}: SubmitEncryptedReportParams): Promise<void> {
  const envelope: AnonymousReportEncryptedEnvelope = {
    version: "1.0",
    formVersion: "anonymous-report-v1",
    sentAt: new Date().toISOString(),
    encryptedPayload,
  };

  const response = await fetch(webhookUrl, {
    method: "POST",
    credentials: "omit",
    cache: "no-store",
    referrerPolicy: "no-referrer",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(envelope),
  });

  if (!response.ok) {
    throw new Error("REPORT_SUBMIT_FAILED");
  }
}
