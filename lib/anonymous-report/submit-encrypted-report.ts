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
