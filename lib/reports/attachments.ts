import { and, count, desc, eq, sum } from "drizzle-orm";
import { db } from "@/lib/db";
import { reportAttachmentAccessLogs, reportAttachments } from "@/lib/db/schema";
import {
  MAX_REPORT_ATTACHMENTS,
  MAX_REPORT_ATTACHMENTS_TOTAL_BYTES,
} from "./attachment-limits";

export type CreateReportAttachmentInput = {
  id: string;
  reportId: string;
  storageKey: string;
  encryptedFileKey: string;
  encryptedFileKeyIv: string;
  encryptedFileKeyAuthTag: string;
  keyEncryptionEphemeralPublicKey: string;
  keyEncryptionSalt: string;
  fileIv: string;
  fileAuthTag: string;
  encryptedOriginalName: string;
  originalNameIv: string;
  originalNameAuthTag: string;
  mimeType: string;
  sizeBytes: number;
  encryptedSizeBytes: number;
  ciphertextSha256: string;
  keyId: string;
};

export async function getReportAttachmentUsage(reportId: string) {
  const [usage] = await db
    .select({
      total: count(),
      totalBytes: sum(reportAttachments.sizeBytes),
    })
    .from(reportAttachments)
    .where(
      and(
        eq(reportAttachments.reportId, reportId),
        eq(reportAttachments.uploadStatus, "completed"),
      ),
    );

  return {
    total: Number(usage?.total ?? 0),
    totalBytes: Number(usage?.totalBytes ?? 0),
  };
}

export async function canAddReportAttachment(input: {
  reportId: string;
  sizeBytes: number;
}) {
  const usage = await getReportAttachmentUsage(input.reportId);

  return (
    usage.total < MAX_REPORT_ATTACHMENTS &&
    usage.totalBytes + input.sizeBytes <= MAX_REPORT_ATTACHMENTS_TOTAL_BYTES
  );
}

export async function createReportAttachment(
  input: CreateReportAttachmentInput,
) {
  const [attachment] = await db
    .insert(reportAttachments)
    .values({
      id: input.id,
      reportId: input.reportId,
      storageKey: input.storageKey,
      encryptedFileKey: input.encryptedFileKey,
      encryptedFileKeyIv: input.encryptedFileKeyIv,
      encryptedFileKeyAuthTag: input.encryptedFileKeyAuthTag,
      keyEncryptionEphemeralPublicKey: input.keyEncryptionEphemeralPublicKey,
      keyEncryptionSalt: input.keyEncryptionSalt,
      fileIv: input.fileIv,
      fileAuthTag: input.fileAuthTag,
      encryptedOriginalName: input.encryptedOriginalName,
      originalNameIv: input.originalNameIv,
      originalNameAuthTag: input.originalNameAuthTag,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      encryptedSizeBytes: input.encryptedSizeBytes,
      ciphertextSha256: input.ciphertextSha256,
      keyId: input.keyId,
      uploadStatus: "completed",
    })
    .returning();

  if (!attachment) {
    throw new Error("REPORT_ATTACHMENT_NOT_CREATED");
  }

  return attachment;
}

export async function listReportAttachments(reportId: string) {
  return db
    .select()
    .from(reportAttachments)
    .where(
      and(
        eq(reportAttachments.reportId, reportId),
        eq(reportAttachments.uploadStatus, "completed"),
      ),
    )
    .orderBy(desc(reportAttachments.createdAt));
}

export async function getReportAttachmentById(id: string) {
  const [attachment] = await db
    .select()
    .from(reportAttachments)
    .where(
      and(
        eq(reportAttachments.id, id),
        eq(reportAttachments.uploadStatus, "completed"),
      ),
    );

  return attachment ?? null;
}

export async function recordReportAttachmentAccess(input: {
  reportId: string;
  attachmentId: string;
  userId: string;
  action: "view" | "download";
}) {
  await db.insert(reportAttachmentAccessLogs).values({
    reportId: input.reportId,
    attachmentId: input.attachmentId,
    userId: input.userId,
    action: input.action,
  });
}
