// Anexos criptografados de denúncias vivem no Azure Blob Storage (container "denuncias-anexos"), separado do storage de mídia do CMS (payload.config.ts usa outro container/conexão).
import { BlobServiceClient, type ContainerClient } from "@azure/storage-blob";
import { shouldCreateAzureContainers } from "@/lib/azureStorage";
import { env } from "@/lib/env";

type AttachmentStorageConfig = {
  allowContainerCreate: boolean;
  containerClient: ContainerClient;
};

// Cacheados no módulo (nível de processo): o client Azure e a criação do container só precisam acontecer uma vez por instância, não a cada upload/download.
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

  const connectionString = env.denunciasStorageConnectionString();
  const containerName = env.denunciasStorageContainer() || "denuncias-anexos";

  if (!connectionString) {
    throw new Error(
      "Variavel DENUNCIAS_STORAGE_CONNECTION_STRING nao configurada.",
    );
  }

  storageConfig = {
    allowContainerCreate: shouldCreateAzureContainers(),
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
