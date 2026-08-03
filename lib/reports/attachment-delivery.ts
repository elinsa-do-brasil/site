import crypto from "node:crypto";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { canReadReport } from "@/lib/comite/access";
import {
  decryptAttachmentBuffer,
  decryptAttachmentOriginalNameSafely,
} from "./attachment-crypto";
import {
  canRenderReportAttachmentInline,
  REPORT_ATTACHMENT_SANDBOX_CSP,
} from "./attachment-response-policy";
import { downloadEncryptedAttachmentFromStorage } from "./attachment-storage";
import {
  getReportAttachmentById,
  recordReportAttachmentAccess,
} from "./attachments";

export async function createCommitteeAttachmentResponse(input: {
  request: NextRequest;
  attachmentId: string;
  action: "view" | "download";
}) {
  const session = await auth.api.getSession({
    headers: input.request.headers,
  });
  const userId = session?.user.id;

  if (!userId) {
    return plainResponse(401);
  }

  const attachment = await getReportAttachmentById(input.attachmentId);

  if (
    !attachment ||
    !(await canReadReport({ userId, reportId: attachment.reportId }))
  ) {
    return plainResponse(404);
  }

  try {
    const encryptedFileBuffer = await downloadEncryptedAttachmentFromStorage(
      attachment.storageKey,
    );
    const ciphertextSha256 = crypto
      .createHash("sha256")
      .update(encryptedFileBuffer)
      .digest("hex");

    if (ciphertextSha256 !== attachment.ciphertextSha256) {
      return plainResponse(500);
    }

    const fileBuffer = decryptAttachmentBuffer(attachment, encryptedFileBuffer);
    const originalName = sanitizeFileName(
      decryptAttachmentOriginalNameSafely(attachment) ?? "anexo",
    );
    const dispositionType =
      input.action === "download" ||
      !canRenderReportAttachmentInline(attachment.mimeType)
        ? "attachment"
        : "inline";

    await recordReportAttachmentAccess({
      reportId: attachment.reportId,
      attachmentId: attachment.id,
      userId,
      action: input.action,
    });

    const headers = new Headers({
      "Cache-Control": "private, no-store",
      "Content-Disposition": contentDisposition(dispositionType, originalName),
      "Content-Length": String(fileBuffer.length),
      "Content-Type": attachment.mimeType,
      "X-Content-Type-Options": "nosniff",
    });

    if (dispositionType === "attachment") {
      headers.set("Content-Security-Policy", REPORT_ATTACHMENT_SANDBOX_CSP);
    }

    return new Response(new Uint8Array(fileBuffer), { headers });
  } catch {
    return plainResponse(500);
  }
}

function plainResponse(status: number) {
  return new Response(null, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function sanitizeFileName(value: string) {
  const normalized = value.split(/[\\/]/).pop()?.trim();
  return normalized || "anexo";
}

function contentDisposition(type: "attachment" | "inline", fileName: string) {
  const fallback = fileName.replace(/[^\x20-\x7E]|["\\;]/g, "_");

  return `${type}; filename="${fallback}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}
