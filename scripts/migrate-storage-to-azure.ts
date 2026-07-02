import crypto from "node:crypto";
import {
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";
import {
  BlobServiceClient,
  type BlockBlobClient,
  type ContainerClient,
  RestError,
} from "@azure/storage-blob";

type CliOptions = {
  createContainers: boolean;
  dryRun: boolean;
  overwrite: boolean;
};

type S3SourceConfig = {
  accessKeyId: string;
  bucket: string;
  endpoint: string;
  forcePathStyle: boolean;
  prefix: string;
  region: string;
  secretAccessKey: string;
};

type MigrationJob = {
  containerClient: ContainerClient;
  label: string;
  reportHashes?: Map<string, string>;
  source: S3SourceConfig;
};

type MigrationStats = {
  bytes: number;
  copied: number;
  failed: number;
  listed: number;
  mismatched: number;
  skipped: number;
};

const statsInitialValue: MigrationStats = {
  bytes: 0,
  copied: 0,
  failed: 0,
  listed: 0,
  mismatched: 0,
  skipped: 0,
};

let dbPoolToClose: { end: () => Promise<unknown> } | null = null;

async function main() {
  const options = parseCliOptions(process.argv.slice(2));
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

  if (!connectionString) {
    throw new Error("AZURE_STORAGE_CONNECTION_STRING is required.");
  }

  const blobServiceClient =
    BlobServiceClient.fromConnectionString(connectionString);
  const reportContainerName =
    process.env.AZURE_REPORTS_CONTAINER_NAME ||
    process.env.AZURE_STORAGE_CONTAINER_NAME ||
    "denuncias";
  const payloadContainerName =
    process.env.AZURE_PAYLOAD_CONTAINER_NAME || "galeria";
  const reportHashes = await loadReportAttachmentHashes();
  const jobs = [
    createMigrationJob({
      blobServiceClient,
      containerName: payloadContainerName,
      label: "payload-gallery",
      source: getPayloadS3Source(),
    }),
    createMigrationJob({
      blobServiceClient,
      containerName: reportContainerName,
      label: "report-proof",
      reportHashes,
      source: getReportsS3Source(),
    }),
  ];

  console.log(options.dryRun ? "Mode: dry-run" : "Mode: write");
  console.log(`Overwrite: ${options.overwrite ? "yes" : "no"}`);
  console.log(`Create containers: ${options.createContainers ? "yes" : "no"}`);

  for (const job of jobs) {
    await runMigrationJob(job, options);
  }
}

function parseCliOptions(args: string[]): CliOptions {
  const options: CliOptions = {
    createContainers: false,
    dryRun: true,
    overwrite: false,
  };

  for (const arg of args) {
    if (arg === "--dry-run") {
      if (!options.dryRun) {
        throw new Error("Use either --dry-run or --write, not both.");
      }
      options.dryRun = true;
    } else if (arg === "--write") {
      if (args.includes("--dry-run")) {
        throw new Error("Use either --dry-run or --write, not both.");
      }
      options.dryRun = false;
    } else if (arg === "--create-containers") {
      options.createContainers = true;
    } else if (arg === "--overwrite") {
      options.overwrite = true;
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function printHelp() {
  console.log(`
Usage:
  tsx --env-file=.env scripts/migrate-storage-to-azure.ts [options]

Options:
  --dry-run             List source objects without copying. Default.
  --write               Copy source objects to Azure Blob Storage.
  --create-containers   Create destination containers if missing.
  --overwrite           Replace destination blobs and validate again.
`);
}

function createMigrationJob(input: {
  blobServiceClient: BlobServiceClient;
  containerName: string;
  label: string;
  reportHashes?: Map<string, string>;
  source: S3SourceConfig;
}): MigrationJob {
  return {
    containerClient: input.blobServiceClient.getContainerClient(
      input.containerName,
    ),
    label: input.label,
    reportHashes: input.reportHashes,
    source: input.source,
  };
}

function getPayloadS3Source(): S3SourceConfig {
  return getS3SourceConfig({
    accessKeyIdEnv: "S3_ACCESS_KEY_ID",
    bucketEnv: "S3_BUCKET",
    endpointEnv: "S3_ENDPOINT",
    forcePathStyleEnv: "S3_FORCE_PATH_STYLE",
    prefix: normalizeListPrefix(process.env.S3_PREFIX || "galeria"),
    regionEnv: "S3_REGION",
    secretAccessKeyEnv: "S3_SECRET_ACCESS_KEY",
  });
}

function getReportsS3Source(): S3SourceConfig {
  return getS3SourceConfig({
    accessKeyIdEnv: "PROOF_S3_ACCESS_KEY_ID",
    bucketEnv: "PROOF_S3_BUCKET",
    endpointEnv: "PROOF_S3_ENDPOINT",
    forcePathStyleEnv: "PROOF_S3_FORCE_PATH_STYLE",
    prefix: "denuncias/",
    regionEnv: "PROOF_S3_REGION",
    secretAccessKeyEnv: "PROOF_S3_SECRET_ACCESS_KEY",
  });
}

function getS3SourceConfig(input: {
  accessKeyIdEnv: string;
  bucketEnv: string;
  endpointEnv: string;
  forcePathStyleEnv: string;
  prefix: string;
  regionEnv: string;
  secretAccessKeyEnv: string;
}): S3SourceConfig {
  const bucket = process.env[input.bucketEnv];
  const endpoint = process.env[input.endpointEnv];
  const region = process.env[input.regionEnv];
  const accessKeyId = process.env[input.accessKeyIdEnv];
  const secretAccessKey = process.env[input.secretAccessKeyEnv];

  if (!bucket || !endpoint || !region || !accessKeyId || !secretAccessKey) {
    throw new Error(
      `Missing S3 migration env: ${[
        input.bucketEnv,
        input.endpointEnv,
        input.regionEnv,
        input.accessKeyIdEnv,
        input.secretAccessKeyEnv,
      ].join(", ")}`,
    );
  }

  return {
    accessKeyId,
    bucket,
    endpoint,
    forcePathStyle: process.env[input.forcePathStyleEnv] !== "false",
    prefix: input.prefix,
    region,
    secretAccessKey,
  };
}

function normalizeListPrefix(prefix: string) {
  const normalized = prefix.replace(/^\/+|\/+$/g, "");

  return normalized ? `${normalized}/` : "";
}

async function loadReportAttachmentHashes() {
  try {
    const [{ db, dbPool }, { reportAttachments }] = await Promise.all([
      import("../lib/db"),
      import("../lib/db/schema"),
    ]);
    const rows = await db
      .select({
        ciphertextSha256: reportAttachments.ciphertextSha256,
        storageKey: reportAttachments.storageKey,
      })
      .from(reportAttachments);

    dbPoolToClose = dbPool;

    return new Map(rows.map((row) => [row.storageKey, row.ciphertextSha256]));
  } catch (error) {
    console.warn(
      "Warning: could not load report attachment hashes from database.",
    );
    console.warn(error instanceof Error ? error.message : String(error));
    return new Map<string, string>();
  }
}

async function runMigrationJob(job: MigrationJob, options: CliOptions) {
  const stats = { ...statsInitialValue };
  const s3Client = new S3Client({
    credentials: {
      accessKeyId: job.source.accessKeyId,
      secretAccessKey: job.source.secretAccessKey,
    },
    endpoint: job.source.endpoint,
    forcePathStyle: job.source.forcePathStyle,
    region: job.source.region,
  });

  console.log("");
  console.log(`== ${job.label} ==`);
  console.log(`S3 bucket: ${job.source.bucket}`);
  console.log(`S3 prefix: ${job.source.prefix || "(none)"}`);
  console.log(`Azure container: ${job.containerClient.containerName}`);

  if (options.createContainers) {
    if (options.dryRun) {
      console.log("Would create container if missing.");
    } else {
      await job.containerClient.createIfNotExists();
    }
  }

  let continuationToken: string | undefined;

  do {
    const response = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: job.source.bucket,
        ContinuationToken: continuationToken,
        Prefix: job.source.prefix,
      }),
    );

    for (const item of response.Contents || []) {
      if (!item.Key) continue;

      stats.listed += 1;
      stats.bytes += item.Size || 0;

      if (options.dryRun) {
        continue;
      }

      await migrateObject({
        job,
        key: item.Key,
        options,
        s3Client,
        stats,
      });
    }

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  console.log(
    JSON.stringify(
      {
        bytes: stats.bytes,
        copied: stats.copied,
        failed: stats.failed,
        listed: stats.listed,
        mismatched: stats.mismatched,
        skipped: stats.skipped,
      },
      null,
      2,
    ),
  );
}

async function migrateObject(input: {
  job: MigrationJob;
  key: string;
  options: CliOptions;
  s3Client: S3Client;
  stats: MigrationStats;
}) {
  const blobClient = input.job.containerClient.getBlockBlobClient(input.key);
  const existing = await getBlobPropertiesOrNull(blobClient);

  try {
    const sourceBuffer = await getS3ObjectBuffer({
      bucket: input.job.source.bucket,
      key: input.key,
      s3Client: input.s3Client,
    });
    const sourceHash = sha256(sourceBuffer);
    const expectedReportHash = input.job.reportHashes?.get(input.key);

    if (expectedReportHash && expectedReportHash !== sourceHash) {
      input.stats.failed += 1;
      input.stats.mismatched += 1;
      console.error(
        `Hash mismatch against report_attachments for ${input.key}.`,
      );
      return;
    }

    if (existing && !input.options.overwrite) {
      const destinationBuffer = await blobClient.downloadToBuffer();
      const valid = validateDestination({
        destinationBuffer,
        expectedHash: sourceHash,
        key: input.key,
        sourceBuffer,
      });

      if (valid) {
        input.stats.skipped += 1;
      } else {
        input.stats.failed += 1;
        input.stats.mismatched += 1;
      }

      return;
    }

    await blobClient.uploadData(sourceBuffer, {
      blobHTTPHeaders: {
        blobContentType: getContentType(input.key),
      },
    });

    const destinationBuffer = await blobClient.downloadToBuffer();
    const valid = validateDestination({
      destinationBuffer,
      expectedHash: sourceHash,
      key: input.key,
      sourceBuffer,
    });

    if (valid) {
      input.stats.copied += 1;
    } else {
      input.stats.failed += 1;
      input.stats.mismatched += 1;
    }
  } catch (error) {
    input.stats.failed += 1;
    console.error(`Failed to migrate ${input.key}.`);
    console.error(error instanceof Error ? error.message : String(error));
  }
}

async function getBlobPropertiesOrNull(blobClient: BlockBlobClient) {
  try {
    return await blobClient.getProperties();
  } catch (error) {
    if (error instanceof RestError && error.statusCode === 404) {
      return null;
    }

    throw error;
  }
}

async function getS3ObjectBuffer(input: {
  bucket: string;
  key: string;
  s3Client: S3Client;
}) {
  const response = await input.s3Client.send(
    new GetObjectCommand({
      Bucket: input.bucket,
      Key: input.key,
    }),
  );

  if (!response.Body) {
    throw new Error(`S3 object has no body: ${input.key}`);
  }

  if ("transformToByteArray" in response.Body) {
    const bytes = await response.Body.transformToByteArray();

    return Buffer.from(bytes);
  }

  const chunks: Buffer[] = [];

  for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
    chunks.push(Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
}

function validateDestination(input: {
  destinationBuffer: Buffer;
  expectedHash: string;
  key: string;
  sourceBuffer: Buffer;
}) {
  if (input.destinationBuffer.length !== input.sourceBuffer.length) {
    console.error(`Size mismatch for ${input.key}.`);
    return false;
  }

  if (sha256(input.destinationBuffer) !== input.expectedHash) {
    console.error(`SHA-256 mismatch for ${input.key}.`);
    return false;
  }

  return true;
}

function sha256(buffer: Buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function getContentType(key: string) {
  if (key.endsWith(".enc")) return "application/octet-stream";
  if (key.endsWith(".avif")) return "image/avif";
  if (key.endsWith(".gif")) return "image/gif";
  if (key.endsWith(".jpg") || key.endsWith(".jpeg")) return "image/jpeg";
  if (key.endsWith(".mp4")) return "video/mp4";
  if (key.endsWith(".png")) return "image/png";
  if (key.endsWith(".webm")) return "video/webm";
  if (key.endsWith(".webp")) return "image/webp";

  return "application/octet-stream";
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  })
  .finally(async () => {
    await dbPoolToClose?.end().catch(() => {});
  });
