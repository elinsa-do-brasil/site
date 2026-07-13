const ASSET_VERSION = process.env.NEXT_PUBLIC_ASSETS_VERSION

export function downloadAsset(path: string) {
  return `${path}?v=${ASSET_VERSION}`;
}
