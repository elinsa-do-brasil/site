import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

type ProofStorageConfig = {
  bucket: string;
  client: S3Client;
};

let storageConfig: ProofStorageConfig | null = null;

export async function uploadEncryptedAttachmentToProof(input: {
  key: string;
  body: Buffer;
}) {
  const { bucket, client } = getProofStorageConfig();

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: input.key,
      Body: input.body,
      ContentType: "application/octet-stream",
    }),
  );
}

export async function downloadEncryptedAttachmentFromProof(key: string) {
  const { bucket, client } = getProofStorageConfig();
  const response = await client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );

  if (!response.Body) {
    throw new Error("REPORT_ATTACHMENT_EMPTY_OBJECT");
  }

  const bytes = await response.Body.transformToByteArray();
  return Buffer.from(bytes);
}

export async function deleteEncryptedAttachmentFromProof(key: string) {
  const { bucket, client } = getProofStorageConfig();

  await client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );
}

function getProofStorageConfig() {
  if (storageConfig) return storageConfig;

  const endpoint = process.env.PROOF_S3_ENDPOINT;
  const region = process.env.PROOF_S3_REGION;
  const accessKeyId = process.env.PROOF_S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.PROOF_S3_SECRET_ACCESS_KEY;

  if (!endpoint || !region || !accessKeyId || !secretAccessKey) {
    throw new Error("Variaveis PROOF_S3_* nao configuradas.");
  }

  storageConfig = {
    bucket: process.env.PROOF_S3_BUCKET || "proof",
    client: new S3Client({
      endpoint,
      region,
      forcePathStyle: process.env.PROOF_S3_FORCE_PATH_STYLE !== "false",
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    }),
  };

  return storageConfig;
}
