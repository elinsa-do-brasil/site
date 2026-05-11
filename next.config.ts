import createMDX from "@next/mdx";
import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

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

const s3RemotePatterns = [
  createRemotePattern(process.env.S3_PUBLIC_URL),
  createRemotePattern(process.env.S3_ENDPOINT),
  createRemotePattern(process.env.AWS_ENDPOINT_URL_S3),
].filter((pattern) => pattern !== null);
const s3Prefix = process.env.S3_PREFIX || "galeria";

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
    ];
  },
  images: {
    localPatterns: [
      {
        pathname: "/api/galeria/file/**",
        search: `?prefix=${s3Prefix}`,
      },
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      ...s3RemotePatterns,
    ],
  },
  reactCompiler: true,
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
};

const withMDX = createMDX({
  extension: /\.(md|mdx)$/,
});

export default withPayload(withMDX(nextConfig));
