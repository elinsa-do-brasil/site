export const MAX_REPORT_ATTACHMENTS = 10;
export const MAX_REPORT_ATTACHMENT_SIZE_BYTES = 20 * 1024 * 1024;
export const MAX_REPORT_ATTACHMENTS_TOTAL_BYTES = 100 * 1024 * 1024;
export const REPORT_ATTACHMENT_KEY_ID = "reports-ecdh-p384-v1";

export function formatAttachmentSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
