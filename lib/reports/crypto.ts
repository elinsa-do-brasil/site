import crypto from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const KEY_LENGTH = 32;

export type EncryptedBlob = {
  ciphertext: string;
  iv: string;
  authTag: string;
};

export type ReportEncryptedPayload = {
  title: string;
  description: string;
  occurredAt: string | null;
  location: string | null;
  involvedPeople: string | null;
  witnesses: string | null;
  previousAttempts: string | null;
  contactPreference: "no_contact" | "email" | "phone" | "whatsapp" | "other";
  contactInfo: string | null;
  reporterName?: string | null;
};

export function getReportsMasterKey(): Buffer {
  const raw = process.env.REPORTS_MASTER_KEY_BASE64;

  if (!raw) {
    throw new Error("REPORTS_MASTER_KEY_BASE64 nao configurada.");
  }

  const key = Buffer.from(raw, "base64");

  if (key.length !== KEY_LENGTH) {
    throw new Error("REPORTS_MASTER_KEY_BASE64 precisa ter 32 bytes.");
  }

  return key;
}

export function encryptWithAesGcm(
  plaintext: Buffer,
  key: Buffer,
): EncryptedBlob {
  if (key.length !== KEY_LENGTH) {
    throw new Error("AES-256-GCM exige chave de 32 bytes.");
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    ciphertext: ciphertext.toString("base64"),
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
  };
}

export function decryptWithAesGcm(
  encrypted: EncryptedBlob,
  key: Buffer,
): Buffer {
  if (key.length !== KEY_LENGTH) {
    throw new Error("AES-256-GCM exige chave de 32 bytes.");
  }

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(encrypted.iv, "base64"),
  );

  decipher.setAuthTag(Buffer.from(encrypted.authTag, "base64"));

  return Buffer.concat([
    decipher.update(Buffer.from(encrypted.ciphertext, "base64")),
    decipher.final(),
  ]);
}

export function encryptReportPayload(payload: ReportEncryptedPayload) {
  const masterKey = getReportsMasterKey();
  const reportKey = crypto.randomBytes(KEY_LENGTH);

  const encryptedPayload = encryptWithAesGcm(
    Buffer.from(JSON.stringify(payload), "utf8"),
    reportKey,
  );

  const encryptedReportKey = encryptWithAesGcm(reportKey, masterKey);

  return {
    encryptedPayload,
    encryptedReportKey,
  };
}

export function decryptReportKey(encryptedReportKey: EncryptedBlob): Buffer {
  return decryptWithAesGcm(encryptedReportKey, getReportsMasterKey());
}

export function decryptReportPayload(input: {
  encryptedPayload: EncryptedBlob;
  encryptedReportKey: EncryptedBlob;
}): ReportEncryptedPayload {
  const reportKey = decryptReportKey(input.encryptedReportKey);
  const payloadBuffer = decryptWithAesGcm(input.encryptedPayload, reportKey);

  return JSON.parse(payloadBuffer.toString("utf8")) as ReportEncryptedPayload;
}

export function encryptReportComment(comment: string, reportKey: Buffer) {
  return encryptWithAesGcm(Buffer.from(comment, "utf8"), reportKey);
}

export function decryptReportComment(
  encryptedComment: EncryptedBlob,
  reportKey: Buffer,
) {
  return decryptWithAesGcm(encryptedComment, reportKey).toString("utf8");
}
