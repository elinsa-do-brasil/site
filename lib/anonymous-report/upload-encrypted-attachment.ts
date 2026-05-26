"use client";

import type { EncryptedReportAttachment } from "./file-encryption";

export type UploadEncryptedReportAttachmentParams = {
  reportId: string;
  uploadToken: string;
  attachment: EncryptedReportAttachment;
};

export async function uploadEncryptedReportAttachment({
  reportId,
  uploadToken,
  attachment,
}: UploadEncryptedReportAttachmentParams) {
  const formData = new FormData();

  formData.append(
    "metadata",
    JSON.stringify({
      uploadToken,
      ...attachment.metadata,
    }),
  );
  formData.append(
    "file",
    new Blob([attachment.ciphertext], {
      type: "application/octet-stream",
    }),
    "attachment.enc",
  );

  const response = await fetch(
    `/api/reports/${encodeURIComponent(reportId)}/attachments`,
    {
      method: "POST",
      credentials: "omit",
      cache: "no-store",
      referrerPolicy: "no-referrer",
      body: formData,
    },
  );

  if (!response.ok) {
    throw new Error("REPORT_ATTACHMENT_UPLOAD_FAILED");
  }

  return (await response.json()) as { attachmentId: string; ok: true };
}
