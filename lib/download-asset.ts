const ASSET_VERSION = process.env.ASSETS_VERSION

export function downloadAsset(path: string) {
  return `${path}?v=${ASSET_VERSION}`;
}
