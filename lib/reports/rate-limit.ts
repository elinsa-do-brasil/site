import "server-only";

import { consumeDatabaseRateLimit } from "@/lib/database-rate-limit";
import { env } from "@/lib/env";
import { getClientIp } from "@/lib/get-client-ip";
import { createReportsPublicRateLimitDigest } from "./crypto";

type HeaderReader = {
  get(name: string): string | null;
};

const RATE_LIMIT_KEY_NAMESPACE = "reports/denuncia/ip";
const DEFAULT_RATE_LIMIT_MAX = 5;
const DEFAULT_RATE_LIMIT_WINDOW_MINUTES = 15;

export type ReportsPublicRateLimitErrorReason =
  | "client_ip_unavailable"
  | "limit_exceeded";

export class ReportsPublicRateLimitError extends Error {
  constructor(public readonly reason: ReportsPublicRateLimitErrorReason) {
    super(`Reports public rate limit: ${reason}.`);
    this.name = "ReportsPublicRateLimitError";
  }
}

export async function assertReportsPublicRateLimit(headersList: HeaderReader) {
  const clientIp = getClientIp(headersList);

  if (!clientIp) {
    throw new ReportsPublicRateLimitError("client_ip_unavailable");
  }

  const max = readPositiveInteger(
    env.reportsPublicRateLimitMax(),
    DEFAULT_RATE_LIMIT_MAX,
  );
  const windowMinutes = readPositiveInteger(
    env.reportsPublicRateLimitWindowMinutes(),
    DEFAULT_RATE_LIMIT_WINDOW_MINUTES,
  );
  const digest = createReportsPublicRateLimitDigest(clientIp);
  const allowed = await consumeDatabaseRateLimit({
    key: `${RATE_LIMIT_KEY_NAMESPACE}/${digest}`,
    max,
    windowSeconds: windowMinutes * 60,
  });

  if (!allowed) {
    throw new ReportsPublicRateLimitError("limit_exceeded");
  }
}

function readPositiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
