/**
 * Ponto único de leitura das variáveis `NEXT_PUBLIC_*` do projeto — seguras
 * para importar em componentes client. Cada entrada precisa continuar sendo
 * uma expressão estática e literal (`process.env.NEXT_PUBLIC_X`), nunca
 * acesso dinâmico via `process.env[name]`: o bundler do Next.js só consegue
 * substituir o valor em build time quando o padrão aparece assim, ao pé da
 * letra, no arquivo. Não colocar `import "server-only"` aqui.
 */
export const publicEnv = {
  siteUrl: process.env.NEXT_PUBLIC_URL,
  publicSiteUrl: process.env.NEXT_PUBLIC_SITE_URL,
  assetsVersion: process.env.NEXT_PUBLIC_ASSETS_VERSION,
  reportsPublicKeyBase64: process.env.NEXT_PUBLIC_REPORTS_PUBLIC_KEY_BASE64,
  sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  youtubeTutorialLink: process.env.NEXT_PUBLIC_YT_LINK,
  turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
};
