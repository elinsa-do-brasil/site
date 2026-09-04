// Regras de redação para o Sentry, ligadas em sentry.server.config.ts, sentry.edge.config.ts e instrumentation-client.ts (erros do navegador passam por components/frontend-telemetry.tsx).
// Rotas de denúncia/atendimento psicológico: nenhum evento de erro cujo caminho bata com um destes prefixos deve chegar ao Sentry — ver isSensitiveTelemetryPath abaixo.
export const SENSITIVE_TELEMETRY_PATHS = [
  "/denunciar",
  "/acompanhar-denuncia",
  "/acolhimento/hjvx6e",
  "/portal/comite-de-etica",
  "/portal/atendimento-psicologico",
  "/api/reports",
  "/api/denuncias",
  "/api/committee",
] as const;

export const SENTRY_DATA_COLLECTION = {
  userInfo: false,
  cookies: false,
  httpHeaders: {
    request: false,
    response: false,
  },
  httpBodies: [],
  queryParams: false,
  genAI: {
    inputs: false,
    outputs: false,
  },
  stackFrameVariables: false,
  frameContextLines: 0,
};

type SentryEventLike = {
  contexts?: unknown;
  request?: {
    url?: unknown;
  };
  tags?: unknown;
  transaction?: unknown;
};

type SentryBreadcrumbLike = {
  category?: unknown;
  data?: unknown;
  message?: unknown;
};

export function isSensitiveTelemetryPath(value: unknown): boolean {
  if (typeof value !== "string" || value.trim() === "") {
    return false;
  }

  return extractPathCandidates(value).some((path) =>
    SENSITIVE_TELEMETRY_PATHS.some(
      (prefix) => path === prefix || path.startsWith(`${prefix}/`),
    ),
  );
}

// Checa a URL/rota do evento em vários lugares onde o Sentry pode tê-la guardado (contexts.trace.data, tags, request.url, transaction) — beforeSend descarta o evento inteiro se qualquer um bater.
export function shouldDiscardSensitiveSentryEvent(
  event: SentryEventLike,
  currentPath?: unknown,
): boolean {
  const traceData = nestedRecord(event.contexts, "trace", "data");
  const tags = asRecord(event.tags);

  return [
    currentPath,
    event.request?.url,
    event.transaction,
    traceData?.["http.route"],
    traceData?.["http.target"],
    traceData?.["url.full"],
    traceData?.["url.path"],
    tags?.["http.route"],
    tags?.["url.path"],
  ].some(isSensitiveTelemetryPath);
}

export function shouldDiscardSensitiveSentryBreadcrumb(
  breadcrumb: SentryBreadcrumbLike,
  currentPath?: unknown,
): boolean {
  const data = asRecord(breadcrumb.data);

  return [
    currentPath,
    breadcrumb.message,
    data?.from,
    data?.to,
    data?.url,
    data?.href,
    data?.["navigation.from"],
    data?.["navigation.to"],
  ].some(isSensitiveTelemetryPath);
}

// Varre uma string qualquer (mensagem de erro, breadcrumb, stack) atrás de URLs absolutas e caminhos relativos tipo "/algo" — o Sentry nem sempre expõe a rota em um campo estruturado.
function extractPathCandidates(value: string): string[] {
  const candidates: string[] = [];
  const withoutAbsoluteUrls = value.replace(
    /https?:\/\/[^\s)"']+/gi,
    (absoluteUrl) => {
      try {
        candidates.push(new URL(absoluteUrl).pathname);
      } catch {
        // Ignore malformed URLs and continue with path-like tokens.
      }

      return " ";
    },
  );

  for (const match of withoutAbsoluteUrls.matchAll(
    /(?:^|[\s(='"])(\/(?!\/)[^\s?#)"']*)/g,
  )) {
    const path = match[1];

    if (path) {
      candidates.push(path);
    }
  }

  return candidates;
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === "object"
    ? (value as Record<string, unknown>)
    : undefined;
}

function nestedRecord(
  value: unknown,
  ...keys: string[]
): Record<string, unknown> | undefined {
  let current = asRecord(value);

  for (const key of keys) {
    current = asRecord(current?.[key]);
  }

  return current;
}
