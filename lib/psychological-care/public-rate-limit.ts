// Sem `import "server-only"` de propósito: importado por testes de
// integração (tsx --env-file=.env, Node puro, fora do pipeline do Next.js) —
// o guard lança erro incondicionalmente fora do bundler do Next.
import { consumeDatabaseRateLimit } from "@/lib/database-rate-limit";
import { env } from "@/lib/env";
import { getClientIp } from "@/lib/get-client-ip";
import { createPsychologicalCarePublicRateLimitDigest } from "./crypto";

type HeaderReader = {
  get(name: string): string | null;
};

const RATE_LIMIT_KEY_NAMESPACE = "psychological-care/ampercuida/ip";
const DEFAULT_RATE_LIMIT_MAX = 5;
const DEFAULT_RATE_LIMIT_WINDOW_MINUTES = 15;

export type PsychologicalCarePublicRateLimitErrorReason =
  | "client_ip_unavailable"
  | "limit_exceeded";

export class PsychologicalCarePublicRateLimitError extends Error {
  constructor(
    public readonly reason: PsychologicalCarePublicRateLimitErrorReason,
  ) {
    super(`Psychological care public rate limit: ${reason}.`);
    this.name = "PsychologicalCarePublicRateLimitError";
  }
}

export async function assertPsychologicalCarePublicRateLimit(
  headersList: HeaderReader,
) {
  const clientIp = getClientIp(headersList);

  if (!clientIp) {
    throw new PsychologicalCarePublicRateLimitError("client_ip_unavailable");
  }

  const max = readPositiveInteger(
    env.psychologicalCarePublicRateLimitMax(),
    DEFAULT_RATE_LIMIT_MAX,
  );
  const windowMinutes = readPositiveInteger(
    env.psychologicalCarePublicRateLimitWindowMinutes(),
    DEFAULT_RATE_LIMIT_WINDOW_MINUTES,
  );
  const digest = createPsychologicalCarePublicRateLimitDigest(clientIp);
  const allowed = await consumeDatabaseRateLimit({
    key: `${RATE_LIMIT_KEY_NAMESPACE}/${digest}`,
    max,
    windowSeconds: windowMinutes * 60,
  });

  if (!allowed) {
    throw new PsychologicalCarePublicRateLimitError("limit_exceeded");
  }
}

function readPositiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
