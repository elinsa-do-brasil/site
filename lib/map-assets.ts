const MAP_ASSET_VERSION = process.env.ASSETS_VERSION;;

export function mapAsset(path: string) {
  return `/maps/${path}?v=${MAP_ASSET_VERSION}`;
}
