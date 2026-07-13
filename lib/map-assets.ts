// This value is read by a client component as well as server-rendered links.
// Next only exposes NEXT_PUBLIC_* variables to the browser bundle, so keep the
// fallback here rather than producing different query strings during hydration.
const MAP_ASSET_VERSION = process.env.NEXT_PUBLIC_ASSETS_VERSION ?? "1.2";

export function mapAsset(path: string) {
  return `/maps/${path}?v=${MAP_ASSET_VERSION}`;
}
