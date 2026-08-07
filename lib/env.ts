/**
 * Ponto único de leitura das variáveis de ambiente server-only do projeto.
 * Cada entrada só encapsula o `process.env.X` correspondente — validação,
 * parsing e fallback específicos de cada domínio continuam nos arquivos que
 * já os implementavam, agora operando sobre o valor bruto retornado aqui.
 *
 * Sem `import "server-only"` de propósito: este módulo é importado por
 * lib/psychological-care/crypto.ts e lib/reports/crypto.ts, que por sua vez
 * são importados diretamente pelos testes (`tsx --test`, Node puro, fora do
 * pipeline do Next.js) — o guard `server-only` lança erro incondicionalmente
 * fora do bundler do Next. Nenhuma entrada aqui expõe segredo em bundle de
 * client: variáveis `NEXT_PUBLIC_*` vivem à parte em lib/env.public.ts.
 *
 * Exceções documentadas que NÃO passam por este arquivo: next.config.ts e
 * drizzle.config.ts (rodam fora do runtime normal do Next.js, sem garantia
 * de resolver o alias @/lib/env), e o bloco de compatibilidade de chaves de
 * imagem legadas em payload.config.ts (leitura E escrita de process.env,
 * incompatível com o formato somente-leitura deste módulo).
 */
export const env = {
  // Autenticação / SSO Microsoft
  microsoftAllowedDomain: () => process.env.MICROSOFT_ALLOWED_DOMAIN,
  microsoftTenantId: () => process.env.MICROSOFT_TENANT_ID,
  microsoftClientId: () => process.env.MICROSOFT_CLIENT_ID,
  microsoftClientSecret: () => process.env.MICROSOFT_CLIENT_SECRET,
  betterAuthSecret: () => process.env.BETTER_AUTH_SECRET,
  betterAuthTrustedOrigins: () => process.env.BETTER_AUTH_TRUSTED_ORIGINS,
  betterAuthUrl: () => process.env.BETTER_AUTH_URL,

  // E-mail transacional (auth)
  resendApiKey: () => process.env.RESEND_API_KEY,
  authEmailFrom: () => process.env.AUTH_EMAIL_FROM,
  authEmailReplyTo: () => process.env.AUTH_EMAIL_REPLY_TO,

  // Banco de dados
  siteDatabaseUrl: () => process.env.SITE_DATABASE_URL,

  // CMS (Payload) / Azure Storage
  cmsStorageConnectionString: () => process.env.CMS_STORAGE_CONNECTION_STRING,
  cmsStorageContainer: () => process.env.CMS_STORAGE_CONTAINER,
  cmsDatabaseUrl: () => process.env.CMS_DATABASE_URL,
  payloadSecret: () => process.env.PAYLOAD_SECRET,
  payloadDbPush: () => process.env.PAYLOAD_DB_PUSH,
  sentryDsn: () => process.env.SENTRY_DSN,

  // Formulário de contato
  contactRateLimitMax: () => process.env.CONTACT_RATE_LIMIT_MAX,
  contactRateLimitWindowMinutes: () =>
    process.env.CONTACT_RATE_LIMIT_WINDOW_MINUTES,
  contactFormToEmail: () => process.env.CONTACT_FORM_TO_EMAIL,
  contactFormFromEmail: () => process.env.CONTACT_FORM_FROM_EMAIL,
  contactIpHashSecretBase64: () => process.env.CONTACT_IP_HASH_SECRET_BASE64,

  // Atendimento psicológico (Amper Cuida)
  psychologicalCareMasterKeyBase64: () =>
    process.env.PSYCHOLOGICAL_CARE_MASTER_KEY_BASE64,
  psychologicalCareNotificationToEmail: () =>
    process.env.PSYCHOLOGICAL_CARE_NOTIFICATION_TO_EMAIL,
  psychologicalCareNotificationFromEmail: () =>
    process.env.PSYCHOLOGICAL_CARE_NOTIFICATION_FROM_EMAIL,
  psychologicalCarePublicRateLimitMax: () =>
    process.env.PSYCHOLOGICAL_CARE_PUBLIC_RATE_LIMIT_MAX,
  psychologicalCarePublicRateLimitWindowMinutes: () =>
    process.env.PSYCHOLOGICAL_CARE_PUBLIC_RATE_LIMIT_WINDOW_MINUTES,

  // Denúncias (Comitê de Ética)
  reportsPrivateKeyBase64: () => process.env.REPORTS_PRIVATE_KEY_BASE64,
  reportsMasterKeyBase64: () => process.env.REPORTS_MASTER_KEY_BASE64,
  reportNotificationToEmail: () => process.env.REPORT_NOTIFICATION_TO_EMAIL,
  reportNotificationFromEmail: () => process.env.REPORT_NOTIFICATION_FROM_EMAIL,
  denunciasStorageConnectionString: () =>
    process.env.DENUNCIAS_STORAGE_CONNECTION_STRING,
  denunciasStorageContainer: () => process.env.DENUNCIAS_STORAGE_CONTAINER,
  reportsPublicRateLimitMax: () => process.env.REPORTS_PUBLIC_RATE_LIMIT_MAX,
  reportsPublicRateLimitWindowMinutes: () =>
    process.env.REPORTS_PUBLIC_RATE_LIMIT_WINDOW_MINUTES,

  // Cloudflare Turnstile
  turnstileSecret: () => process.env.TURNSTILE_SECRET,

  // Diversos
  googleSiteVerification: () => process.env.GOOGLE_SITE_VERIFICATION,
  elinsaLastAccidentDate: () => process.env.ELINSA_LAST_ACCIDENT_DATE,
};
