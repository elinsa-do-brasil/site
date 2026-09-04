// Acrescenta o query param de cache-busting NEXT_PUBLIC_ASSETS_VERSION (lib/envPublic.ts) aos caminhos de assets estáticos.
import { publicEnv } from "@/lib/envPublic";

const ASSET_VERSION = publicEnv.assetsVersion;

// Sufixa `?v=<versao>` para forçar o navegador/CDN a buscar de novo quando o asset é trocado sem mudar de nome.
export function downloadAsset(path: string) {
  return `${path}?v=${ASSET_VERSION}`;
}
