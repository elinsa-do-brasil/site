const MAP_ASSET_VERSION = "1.2";

export function mapAsset(path: string) {
  return `/maps/${path}?v=${MAP_ASSET_VERSION}`;
}
