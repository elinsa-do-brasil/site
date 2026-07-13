"use client";

import {
  MAX_REPORT_ATTACHMENT_NAME_BYTES,
  REPORT_ATTACHMENT_KEY_ID,
} from "@/lib/reports/attachment-limits";

const AES_GCM_IV_LENGTH = 12;
const AES_GCM_AUTH_TAG_LENGTH = 16;
const ECDH_NAMED_CURVE = "P-384";
const HKDF_SALT_LENGTH = 48;
const KEY_ENCRYPTION_INFO = "elinsa.report.attachments.ecdh-p384.v1";

export type EncryptedReportAttachment = {
  ciphertext: ArrayBuffer;
  metadata: {
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
};

export async function encryptReportAttachment(
  file: File,
): Promise<EncryptedReportAttachment> {
  const originalNameBytes = new TextEncoder().encode(file.name || "arquivo");

  if (originalNameBytes.byteLength > MAX_REPORT_ATTACHMENT_NAME_BYTES) {
    throw new Error("REPORT_ATTACHMENT_NAME_TOO_LONG");
  }

  const publicKey = await importReportsPublicKey();
  const fileKey = await crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt"],
  );

  const fileIv = crypto.getRandomValues(new Uint8Array(AES_GCM_IV_LENGTH));
  const encryptedFile = splitAesGcmResult(
    await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: fileIv,
      },
      fileKey,
      await file.arrayBuffer(),
    ),
  );

  const originalNameIv = crypto.getRandomValues(
    new Uint8Array(AES_GCM_IV_LENGTH),
  );
  const encryptedOriginalName = splitAesGcmResult(
    await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: originalNameIv,
      },
      fileKey,
      originalNameBytes,
    ),
  );

  const rawFileKey = await crypto.subtle.exportKey("raw", fileKey);
  const keyEncryption = await encryptFileKeyWithEcdh({
    publicKey,
    rawFileKey,
  });

  return {
    ciphertext: encryptedFile.ciphertext,
    metadata: {
      encryptedFileKey: toBase64(keyEncryption.encryptedFileKey.ciphertext),
      encryptedFileKeyIv: toBase64(keyEncryption.iv),
      encryptedFileKeyAuthTag: toBase64(keyEncryption.encryptedFileKey.authTag),
      keyEncryptionEphemeralPublicKey: toBase64(
        keyEncryption.ephemeralPublicKey,
      ),
      keyEncryptionSalt: toBase64(keyEncryption.salt),
      fileIv: toBase64(fileIv),
      fileAuthTag: toBase64(encryptedFile.authTag),
      encryptedOriginalName: toBase64(encryptedOriginalName.ciphertext),
      originalNameIv: toBase64(originalNameIv),
      originalNameAuthTag: toBase64(encryptedOriginalName.authTag),
      mimeType: file.type || "application/octet-stream",
      sizeBytes: file.size,
      encryptedSizeBytes: encryptedFile.ciphertext.byteLength,
      ciphertextSha256: await sha256Hex(encryptedFile.ciphertext),
      keyId: REPORT_ATTACHMENT_KEY_ID,
    },
  };
}

async function importReportsPublicKey() {
  const raw = process.env.NEXT_PUBLIC_REPORTS_PUBLIC_KEY_BASE64;

  if (!raw) {
    throw new Error("NEXT_PUBLIC_REPORTS_PUBLIC_KEY_BASE64 nao configurada.");
  }

  return crypto.subtle.importKey(
    "spki",
    base64ToArrayBuffer(raw),
    {
      name: "ECDH",
      namedCurve: ECDH_NAMED_CURVE,
    },
    false,
    [],
  );
}

async function encryptFileKeyWithEcdh(input: {
  publicKey: CryptoKey;
  rawFileKey: ArrayBuffer;
}) {
  const ephemeralKeyPair = await crypto.subtle.generateKey(
    {
      name: "ECDH",
      namedCurve: ECDH_NAMED_CURVE,
    },
    true,
    ["deriveBits"],
  );
  const sharedSecret = await crypto.subtle.deriveBits(
    {
      name: "ECDH",
      public: input.publicKey,
    },
    ephemeralKeyPair.privateKey,
    384,
  );
  const salt = crypto.getRandomValues(new Uint8Array(HKDF_SALT_LENGTH));
  const keyEncryptionKey = await deriveKeyEncryptionKey({
    sharedSecret,
    salt,
    usages: ["encrypt"],
  });
  const iv = crypto.getRandomValues(new Uint8Array(AES_GCM_IV_LENGTH));
  const encryptedFileKey = splitAesGcmResult(
    await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv,
      },
      keyEncryptionKey,
      input.rawFileKey,
    ),
  );

  return {
    encryptedFileKey,
    ephemeralPublicKey: await crypto.subtle.exportKey(
      "spki",
      ephemeralKeyPair.publicKey,
    ),
    iv,
    salt,
  };
}

async function deriveKeyEncryptionKey(input: {
  sharedSecret: ArrayBuffer;
  salt: Uint8Array;
  usages: KeyUsage[];
}) {
  const hkdfKey = await crypto.subtle.importKey(
    "raw",
    input.sharedSecret,
    "HKDF",
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-384",
      salt: toArrayBuffer(input.salt),
      info: toArrayBuffer(new TextEncoder().encode(KEY_ENCRYPTION_INFO)),
    },
    hkdfKey,
    {
      name: "AES-GCM",
      length: 256,
    },
    false,
    input.usages,
  );
}

function splitAesGcmResult(buffer: ArrayBuffer) {
  if (buffer.byteLength <= AES_GCM_AUTH_TAG_LENGTH) {
    throw new Error("AES_GCM_RESULT_INVALID");
  }

  return {
    ciphertext: buffer.slice(0, buffer.byteLength - AES_GCM_AUTH_TAG_LENGTH),
    authTag: buffer.slice(buffer.byteLength - AES_GCM_AUTH_TAG_LENGTH),
  };
}

async function sha256Hex(buffer: ArrayBuffer) {
  const hash = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function base64ToArrayBuffer(value: string) {
  const binary = atob(value.replace(/\s/g, ""));
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes.buffer;
}

function toArrayBuffer(bytes: Uint8Array) {
  const output = new Uint8Array(bytes.byteLength);
  output.set(bytes);
  return output.buffer;
}

function toBase64(value: ArrayBuffer | Uint8Array) {
  const bytes = value instanceof Uint8Array ? value : new Uint8Array(value);
  let binary = "";

  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }

  return btoa(binary);
}
