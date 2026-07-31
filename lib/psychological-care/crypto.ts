import crypto from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const KEY_LENGTH = 32;

export type PsychologicalCareEncryptedBlob = {
  ciphertext: string;
  iv: string;
  authTag: string;
};

export type PsychologicalCareEncryptedPayload = {
  base: string;
  city: string;
  employeeName: string;
  phone: string;
  registration: string;
  jobTitle: string | null;
  management: string;
  reason: string;
  requesterName: string;
  requesterEmail: string;
};

const PSYCHOLOGICAL_CARE_PAYLOAD_FIELDS = [
  "base",
  "city",
  "employeeName",
  "phone",
  "registration",
  "jobTitle",
  "management",
  "reason",
  "requesterName",
  "requesterEmail",
] as const satisfies readonly (keyof PsychologicalCareEncryptedPayload)[];

export function arePsychologicalCarePayloadsEqual(
  first: PsychologicalCareEncryptedPayload,
  second: PsychologicalCareEncryptedPayload,
) {
  return PSYCHOLOGICAL_CARE_PAYLOAD_FIELDS.every(
    (field) => first[field] === second[field],
  );
}

export function getPsychologicalCareMasterKey() {
  const raw = process.env.PSYCHOLOGICAL_CARE_MASTER_KEY_BASE64;

  if (!raw) {
    throw new Error("PSYCHOLOGICAL_CARE_MASTER_KEY_BASE64 nao configurada.");
  }

  const key = Buffer.from(raw, "base64");

  if (key.length !== KEY_LENGTH) {
    throw new Error(
      "PSYCHOLOGICAL_CARE_MASTER_KEY_BASE64 precisa ter 32 bytes.",
    );
  }

  return key;
}

export function encryptPsychologicalCarePayload(
  payload: PsychologicalCareEncryptedPayload,
) {
  const requestKey = crypto.randomBytes(KEY_LENGTH);
  const encryptedPayload = encryptWithAesGcm(
    Buffer.from(JSON.stringify(payload), "utf8"),
    requestKey,
  );
  const encryptedRequestKey = encryptWithAesGcm(
    requestKey,
    getPsychologicalCareMasterKey(),
  );

  return {
    encryptedPayload,
    encryptedRequestKey,
  };
}

export function decryptPsychologicalCarePayload(input: {
  encryptedPayload: PsychologicalCareEncryptedBlob;
  encryptedRequestKey: PsychologicalCareEncryptedBlob;
}): PsychologicalCareEncryptedPayload {
  const requestKey = decryptWithAesGcm(
    input.encryptedRequestKey,
    getPsychologicalCareMasterKey(),
  );
  const payload = decryptWithAesGcm(input.encryptedPayload, requestKey);

  return JSON.parse(
    payload.toString("utf8"),
  ) as PsychologicalCareEncryptedPayload;
}

function encryptWithAesGcm(
  plaintext: Buffer,
  key: Buffer,
): PsychologicalCareEncryptedBlob {
  assertAes256Key(key);

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);

  return {
    ciphertext: ciphertext.toString("base64"),
    iv: iv.toString("base64"),
    authTag: cipher.getAuthTag().toString("base64"),
  };
}

function decryptWithAesGcm(
  encrypted: PsychologicalCareEncryptedBlob,
  key: Buffer,
) {
  assertAes256Key(key);

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

function assertAes256Key(key: Buffer) {
  if (key.length !== KEY_LENGTH) {
    throw new Error("AES-256-GCM exige chave de 32 bytes.");
  }
}
