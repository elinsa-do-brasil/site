import path from "node:path";
import { withPayload } from "@payloadcms/next/withPayload";
import { withSentryConfig } from "@sentry/nextjs";
import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";
import { getAzureStorageAccountBaseURL } from "./lib/azure-storage";

function createRemotePattern(value: string | undefined) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);

    return {
      protocol: url.protocol.replace(":", "") as "http" | "https",
      hostname: url.hostname,
      pathname: "/**",
    };
  } catch {
    return null;
  }
}

const azureStorageBaseURL = getAzureStorageAccountBaseURL({
  connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
  explicitBaseURL: process.env.AZURE_STORAGE_ACCOUNT_BASEURL,
});
const azureRemotePatterns = [createRemotePattern(azureStorageBaseURL)].filter(
  (pattern) => pattern !== null,
);
const payloadDevRemotePatterns =
  process.env.NODE_ENV === "development"
    ? ([
        {
          protocol: "http",
          hostname: "localhost",
          port: "3000",
          pathname: "/api/galeria/file/**",
        },
        {
          protocol: "http",
          hostname: "127.0.0.1",
          port: "3000",
          pathname: "/api/galeria/file/**",
        },
      ] as const)
    : [];
const payloadStoragePrefix = process.env.AZURE_PAYLOAD_PREFIX || "galeria";
const noIndexHeaders = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/maps/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/denunciar",
        headers: [
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
      {
        source: "/denunciar/:path*",
        headers: [
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
      {
        source: "/portal/:path*",
        headers: noIndexHeaders,
      },
      {
        source: "/entrar",
        headers: noIndexHeaders,
      },
      {
        source: "/criar",
        headers: noIndexHeaders,
      },
      {
        source: "/convite/:path*",
        headers: noIndexHeaders,
      },
      {
        source: "/recuperar-senha",
        headers: noIndexHeaders,
      },
      {
        source: "/redefinir-senha",
        headers: noIndexHeaders,
      },
      {
        source: "/verificar-email",
        headers: noIndexHeaders,
      },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    localPatterns: [
      {
        pathname: "/api/galeria/file/**",
        search: `?prefix=${payloadStoragePrefix}`,
      },
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      ...azureRemotePatterns,
      ...payloadDevRemotePatterns,
    ],
  },
  reactCompiler: true,
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  sassOptions: {
    loadPaths: [path.resolve("node_modules/@payloadcms/ui/dist/scss")],
  },
  experimental: {
    globalNotFound: true,
  },
};

const withMDX = createMDX();

export default withSentryConfig(withPayload(withMDX(nextConfig)), {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "elinsa-do-brasil",

  project: "elinsa-cms",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
