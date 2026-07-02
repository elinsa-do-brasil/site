import { BlobServiceClient, type ContainerClient } from "@azure/storage-blob";
import { shouldCreateAzureContainers } from "@/lib/azure-storage";

type AttachmentStorageConfig = {
  allowContainerCreate: boolean;
  containerClient: ContainerClient;
};

let storageConfig: AttachmentStorageConfig | null = null;
let createContainerPromise: Promise<void> | null = null;

export async function uploadEncryptedAttachmentToStorage(input: {
  key: string;
  body: Buffer;
}) {
  const { allowContainerCreate, containerClient } =
    getAttachmentStorageConfig();

  if (allowContainerCreate) {
    await ensureContainerExists(containerClient);
  }

  await containerClient.getBlockBlobClient(input.key).uploadData(input.body, {
    blobHTTPHeaders: {
      blobContentType: "application/octet-stream",
    },
  });
}

export async function downloadEncryptedAttachmentFromStorage(key: string) {
  const { containerClient } = getAttachmentStorageConfig();
  const buffer = await containerClient
    .getBlockBlobClient(key)
    .downloadToBuffer();

  return Buffer.from(buffer);
}

export async function deleteEncryptedAttachmentFromStorage(key: string) {
  const { containerClient } = getAttachmentStorageConfig();

  await containerClient.getBlockBlobClient(key).deleteIfExists();
}

function getAttachmentStorageConfig() {
  if (storageConfig) return storageConfig;

  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  const containerName =
    process.env.AZURE_REPORTS_CONTAINER_NAME ||
    process.env.AZURE_STORAGE_CONTAINER_NAME ||
    "denuncias";

  if (!connectionString) {
    throw new Error(
      "Variavel AZURE_STORAGE_CONNECTION_STRING nao configurada.",
    );
  }

  storageConfig = {
    allowContainerCreate: shouldCreateAzureContainers(
      process.env.AZURE_STORAGE_ALLOW_CONTAINER_CREATE,
    ),
    containerClient:
      BlobServiceClient.fromConnectionString(
        connectionString,
      ).getContainerClient(containerName),
  };

  return storageConfig;
}

async function ensureContainerExists(containerClient: ContainerClient) {
  createContainerPromise ??= containerClient
    .createIfNotExists()
    .then(() => undefined);

  await createContainerPromise;
}
