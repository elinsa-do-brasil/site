import crypto from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  MAX_REPORT_ATTACHMENT_SIZE_BYTES,
  REPORT_ATTACHMENT_KEY_ID,
} from "@/lib/reports/attachment-limits";
import {
  deleteEncryptedAttachmentFromStorage,
  uploadEncryptedAttachmentToStorage,
} from "@/lib/reports/attachment-storage";
import { verifyReportUploadToken } from "@/lib/reports/attachment-token";
import {
  canAddReportAttachment,
  createReportAttachment,
} from "@/lib/reports/attachments";
import { getReportById, recordReportEvent } from "@/lib/reports/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_MULTIPART_CONTENT_LENGTH =
  MAX_REPORT_ATTACHMENT_SIZE_BYTES + 1024 * 1024;

const attachmentMetadataSchema = z.object({
  uploadToken: z.string().min(20),
  encryptedFileKey: z.string().min(20),
  encryptedFileKeyIv: z.string().min(12),
  encryptedFileKeyAuthTag: z.string().min(12),
  keyEncryptionEphemeralPublicKey: z.string().min(80).max(500),
  keyEncryptionSalt: z.string().min(20).max(200),
  fileIv: z.string().min(12),
  fileAuthTag: z.string().min(12),
  encryptedOriginalName: z.string().min(1),
  originalNameIv: z.string().min(12),
  originalNameAuthTag: z.string().min(12),
  mimeType: z.string().trim().min(1).max(255),
  sizeBytes: z.coerce
    .number()
    .int()
    .min(1)
    .max(MAX_REPORT_ATTACHMENT_SIZE_BYTES),
  encryptedSizeBytes: z.coerce
    .number()
    .int()
    .min(1)
    .max(MAX_REPORT_ATTACHMENT_SIZE_BYTES),
  ciphertextSha256: z.string().regex(/^[a-f0-9]{64}$/),
  keyId: z.literal(REPORT_ATTACHMENT_KEY_ID),
});

type ReportAttachmentRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  request: NextRequest,
  { params }: ReportAttachmentRouteContext,
) {
  const { id: reportId } = await params;

  try {
    const contentLength = request.headers.get("content-length");

    if (contentLength && Number(contentLength) > MAX_MULTIPART_CONTENT_LENGTH) {
      return attachmentResponse(413);
    }

    const formData = await request.formData();
    const metadataRaw = formData.get("metadata");
    const encryptedFile = formData.get("file");

    if (typeof metadataRaw !== "string" || !isFormDataFile(encryptedFile)) {
      return attachmentResponse(400);
    }

    let metadataJson: unknown;

    try {
      metadataJson = JSON.parse(metadataRaw);
    } catch {
      return attachmentResponse(400);
    }

    const metadata = attachmentMetadataSchema.safeParse(metadataJson);

    if (!metadata.success) {
      return attachmentResponse(400);
    }

    if (!verifyReportUploadToken(metadata.data.uploadToken, reportId)) {
      return attachmentResponse(403);
    }

    if (!(await getReportById(reportId))) {
      return attachmentResponse(404);
    }

    const encryptedFileBuffer = Buffer.from(await encryptedFile.arrayBuffer());

    if (
      encryptedFileBuffer.length !== metadata.data.encryptedSizeBytes ||
      encryptedFileBuffer.length > MAX_REPORT_ATTACHMENT_SIZE_BYTES
    ) {
      return attachmentResponse(400);
    }

    const ciphertextSha256 = crypto
      .createHash("sha256")
      .update(encryptedFileBuffer)
      .digest("hex");

    if (ciphertextSha256 !== metadata.data.ciphertextSha256) {
      return attachmentResponse(400);
    }

    if (
      !(await canAddReportAttachment({
        reportId,
        sizeBytes: metadata.data.sizeBytes,
      }))
    ) {
      return attachmentResponse(413);
    }

    const attachmentId = crypto.randomUUID();
    const storageKey = `denuncias/${reportId}/${attachmentId}.enc`;
    let uploaded = false;

    try {
      await uploadEncryptedAttachmentToStorage({
        key: storageKey,
        body: encryptedFileBuffer,
      });
      uploaded = true;

      const attachment = await createReportAttachment({
        id: attachmentId,
        reportId,
        storageKey,
        encryptedFileKey: metadata.data.encryptedFileKey,
        encryptedFileKeyIv: metadata.data.encryptedFileKeyIv,
        encryptedFileKeyAuthTag: metadata.data.encryptedFileKeyAuthTag,
        keyEncryptionEphemeralPublicKey:
          metadata.data.keyEncryptionEphemeralPublicKey,
        keyEncryptionSalt: metadata.data.keyEncryptionSalt,
        fileIv: metadata.data.fileIv,
        fileAuthTag: metadata.data.fileAuthTag,
        encryptedOriginalName: metadata.data.encryptedOriginalName,
        originalNameIv: metadata.data.originalNameIv,
        originalNameAuthTag: metadata.data.originalNameAuthTag,
        mimeType: metadata.data.mimeType,
        sizeBytes: metadata.data.sizeBytes,
        encryptedSizeBytes: metadata.data.encryptedSizeBytes,
        ciphertextSha256: metadata.data.ciphertextSha256,
        keyId: metadata.data.keyId,
      });

      await recordReportEvent({
        reportId,
        type: "report.attachment_uploaded",
        message: "Anexo criptografado recebido pelo canal publico.",
      });

      return attachmentResponse(201, {
        attachmentId: attachment.id,
      });
    } catch {
      if (uploaded) {
        await deleteEncryptedAttachmentFromStorage(storageKey).catch(() => {});
      }

      return attachmentResponse(500);
    }
  } catch {
    return attachmentResponse(500);
  }
}

function attachmentResponse(
  status: number,
  body: { attachmentId?: string } = {},
) {
  return NextResponse.json(
    {
      ok: status >= 200 && status < 300,
      message:
        status >= 200 && status < 300
          ? undefined
          : "Nao foi possivel enviar o anexo.",
      ...body,
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

function isFormDataFile(value: FormDataEntryValue | null): value is File {
  return (
    typeof value === "object" &&
    value !== null &&
    "arrayBuffer" in value &&
    "size" in value
  );
}
