import * as openpgp from "openpgp";

export type EncryptReportParams = {
  publicKeyArmored: string;
  payload: unknown;
};

export async function encryptReport({
  publicKeyArmored,
  payload,
}: EncryptReportParams): Promise<string> {
  const publicKey = await openpgp.readKey({
    armoredKey: publicKeyArmored,
  });

  const message = await openpgp.createMessage({
    text: JSON.stringify(payload),
  });

  const encrypted = await openpgp.encrypt({
    message,
    encryptionKeys: publicKey,
    format: "armored",
  });

  if (typeof encrypted !== "string") {
    throw new Error("INVALID_ENCRYPTED_PAYLOAD");
  }

  return encrypted;
}
