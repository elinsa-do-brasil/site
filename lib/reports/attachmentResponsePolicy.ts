const SAFE_INLINE_REPORT_ATTACHMENT_MIME_TYPES = new Set([
  "application/pdf",
  "image/apng",
  "image/avif",
  "image/bmp",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
  "audio/aac",
  "audio/flac",
  "audio/mp4",
  "audio/mpeg",
  "audio/ogg",
  "audio/wav",
  "audio/webm",
  "audio/x-wav",
  "video/mp4",
  "video/ogg",
  "video/quicktime",
  "video/webm",
]);

export const REPORT_ATTACHMENT_SANDBOX_CSP =
  "sandbox; default-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";

export function canRenderReportAttachmentInline(mimeType: string) {
  return SAFE_INLINE_REPORT_ATTACHMENT_MIME_TYPES.has(mimeType);
}
