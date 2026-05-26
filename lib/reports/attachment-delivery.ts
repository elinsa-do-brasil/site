import crypto from "node:crypto";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { canReadReport } from "@/lib/comite/access";
import {
  decryptAttachmentBuffer,
  decryptAttachmentOriginalName,
} from "./attachment-crypto";
import { downloadEncryptedAttachmentFromProof } from "./attachment-storage";
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
    const encryptedFileBuffer = await downloadEncryptedAttachmentFromProof(
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
      decryptAttachmentOriginalName(attachment),
    );
    const dispositionType =
      input.action === "download" || !canRenderInline(attachment.mimeType)
        ? "attachment"
        : "inline";

    await recordReportAttachmentAccess({
      reportId: attachment.reportId,
      attachmentId: attachment.id,
      userId,
      action: input.action,
    });

    return new Response(new Uint8Array(fileBuffer), {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": contentDisposition(
          dispositionType,
          originalName,
        ),
        "Content-Length": String(fileBuffer.length),
        "Content-Type": attachment.mimeType,
        "X-Content-Type-Options": "nosniff",
      },
    });
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

function canRenderInline(mimeType: string) {
  return (
    mimeType === "application/pdf" ||
    mimeType.startsWith("image/") ||
    mimeType.startsWith("audio/") ||
    mimeType.startsWith("video/")
  );
}

function sanitizeFileName(value: string) {
  const normalized = value.split(/[\\/]/).pop()?.trim();
  return normalized || "anexo";
}

function contentDisposition(type: "attachment" | "inline", fileName: string) {
  const fallback = fileName.replace(/[^\x20-\x7E]|["\\;]/g, "_");

  return `${type}; filename="${fallback}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}
