import { publicEnv } from "@/lib/envPublic";

const ASSET_VERSION = publicEnv.assetsVersion;

export function downloadAsset(path: string) {
  return `${path}?v=${ASSET_VERSION}`;
}
