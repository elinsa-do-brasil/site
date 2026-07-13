import crypto from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  MAX_REPORT_ATTACHMENT_ENCRYPTED_NAME_BASE64_LENGTH,
  MAX_REPORT_ATTACHMENT_NAME_BYTES,
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
const BASE64_PATTERN =
  /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
const base64Field = (min: number, max: number) =>
  z.string().min(min).max(max).regex(BASE64_PATTERN);

const attachmentMetadataSchema = z.object({
  uploadToken: z.string().min(20).max(2048),
  encryptedFileKey: base64Field(20, 128),
  encryptedFileKeyIv: base64Field(12, 64),
  encryptedFileKeyAuthTag: base64Field(12, 64),
  keyEncryptionEphemeralPublicKey: base64Field(80, 500),
  keyEncryptionSalt: base64Field(20, 200),
  fileIv: base64Field(12, 64),
  fileAuthTag: base64Field(12, 64),
  encryptedOriginalName: base64Field(
    1,
    MAX_REPORT_ATTACHMENT_ENCRYPTED_NAME_BASE64_LENGTH,
  ),
  originalNameIv: base64Field(12, 64),
  originalNameAuthTag: base64Field(12, 64),
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

    if (
      Buffer.from(metadata.data.encryptedOriginalName, "base64").length >
      MAX_REPORT_ATTACHMENT_NAME_BYTES
    ) {
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
