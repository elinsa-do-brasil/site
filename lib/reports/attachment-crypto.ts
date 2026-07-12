import crypto from "node:crypto";
import type { ReportAttachment } from "@/lib/db/schema";
import { MAX_REPORT_ATTACHMENT_ENCRYPTED_NAME_BASE64_LENGTH } from "./attachment-limits";

const AES_GCM_ALGORITHM = "aes-256-gcm";
const KEY_ENCRYPTION_INFO = "elinsa.report.attachments.ecdh-p384.v1";

export function decryptAttachmentBuffer(
  attachment: ReportAttachment,
  encryptedFileBuffer: Buffer,
) {
  const fileKey = decryptAttachmentFileKey(attachment);

  return decryptWithAesGcm({
    ciphertext: encryptedFileBuffer,
    key: fileKey,
    iv: attachment.fileIv,
    authTag: attachment.fileAuthTag,
  });
}

export function decryptAttachmentOriginalName(attachment: ReportAttachment) {
  const fileKey = decryptAttachmentFileKey(attachment);
  const plaintext = decryptWithAesGcm({
    ciphertext: Buffer.from(attachment.encryptedOriginalName, "base64"),
    key: fileKey,
    iv: attachment.originalNameIv,
    authTag: attachment.originalNameAuthTag,
  });

  return plaintext.toString("utf8");
}

export function decryptAttachmentOriginalNameSafely(
  attachment: ReportAttachment,
) {
  if (
    attachment.encryptedOriginalName.length >
    MAX_REPORT_ATTACHMENT_ENCRYPTED_NAME_BASE64_LENGTH
  ) {
    return null;
  }

  try {
    return decryptAttachmentOriginalName(attachment);
  } catch {
    return null;
  }
}

function decryptAttachmentFileKey(attachment: ReportAttachment) {
  const sharedSecret = crypto.diffieHellman({
    privateKey: getReportsPrivateKey(),
    publicKey: crypto.createPublicKey({
      key: Buffer.from(attachment.keyEncryptionEphemeralPublicKey, "base64"),
      format: "der",
      type: "spki",
    }),
  });
  const keyEncryptionKey = Buffer.from(
    crypto.hkdfSync(
      "sha384",
      sharedSecret,
      Buffer.from(attachment.keyEncryptionSalt, "base64"),
      Buffer.from(KEY_ENCRYPTION_INFO, "utf8"),
      32,
    ),
  );

  return decryptWithAesGcm({
    ciphertext: Buffer.from(attachment.encryptedFileKey, "base64"),
    key: keyEncryptionKey,
    iv: attachment.encryptedFileKeyIv,
    authTag: attachment.encryptedFileKeyAuthTag,
  });
}

function decryptWithAesGcm(input: {
  ciphertext: Buffer;
  key: Buffer;
  iv: string;
  authTag: string;
}) {
  const decipher = crypto.createDecipheriv(
    AES_GCM_ALGORITHM,
    input.key,
    Buffer.from(input.iv, "base64"),
  );

  decipher.setAuthTag(Buffer.from(input.authTag, "base64"));

  return Buffer.concat([decipher.update(input.ciphertext), decipher.final()]);
}

function getReportsPrivateKey() {
  const raw = process.env.REPORTS_PRIVATE_KEY_BASE64;

  if (!raw) {
    throw new Error("REPORTS_PRIVATE_KEY_BASE64 nao configurada.");
  }

  return crypto.createPrivateKey({
    key: Buffer.from(raw.replace(/\s/g, ""), "base64"),
    format: "der",
    type: "pkcs8",
  });
}
