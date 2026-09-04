export function parseAzureConnectionString(connectionString: string) {
  return Object.fromEntries(
    connectionString
      .split(";")
      .filter(Boolean)
      .map((part) => {
        const separatorIndex = part.indexOf("=");

        return [
          separatorIndex === -1 ? part : part.slice(0, separatorIndex),
          separatorIndex === -1 ? "" : part.slice(separatorIndex + 1),
        ];
      }),
  );
}

export function getAzureStorageAccountBaseURL(input: {
  connectionString?: string;
  explicitBaseURL?: string;
}) {
  if (input.explicitBaseURL) {
    return input.explicitBaseURL.replace(/\/$/, "");
  }

  if (!input.connectionString) {
    return "";
  }

  const parts = parseAzureConnectionString(input.connectionString);
  const blobEndpoint = parts.BlobEndpoint;

  if (blobEndpoint) {
    return blobEndpoint.replace(/\/$/, "");
  }

  const protocol = parts.DefaultEndpointsProtocol || "https";
  const accountName = parts.AccountName;
  const endpointSuffix = parts.EndpointSuffix || "core.windows.net";

  if (!accountName) {
    return "";
  }

  return `${protocol}://${accountName}.blob.${endpointSuffix}`;
}

export function shouldCreateAzureContainers(value?: string) {
  if (value) {
    return value === "true";
  }

  return process.env.NODE_ENV !== "production";
}
