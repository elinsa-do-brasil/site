import { publicEnv } from "@/lib/env.public";

const ASSET_VERSION = publicEnv.assetsVersion;

export function downloadAsset(path: string) {
  return `${path}?v=${ASSET_VERSION}`;
}
