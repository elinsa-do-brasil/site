import "server-only";

import { isIP } from "node:net";
import { consumeDatabaseRateLimit } from "@/lib/database-rate-limit";
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
  const clientIp = getPsychologicalCarePublicClientIp(headersList);

  if (!clientIp) {
    throw new PsychologicalCarePublicRateLimitError("client_ip_unavailable");
  }

  const max = readPositiveInteger(
    process.env.PSYCHOLOGICAL_CARE_PUBLIC_RATE_LIMIT_MAX,
    DEFAULT_RATE_LIMIT_MAX,
  );
  const windowMinutes = readPositiveInteger(
    process.env.PSYCHOLOGICAL_CARE_PUBLIC_RATE_LIMIT_WINDOW_MINUTES,
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

function getPsychologicalCarePublicClientIp(headersList: HeaderReader) {
  // The deployment proxy must overwrite these headers before the request
  // reaches Next.js. The raw address is used only in memory to derive a HMAC.
  const forwardedFor = headersList.get("x-forwarded-for");
  const forwardedClient = forwardedFor?.split(",")[0]?.trim();
  const realIp = headersList.get("x-real-ip")?.trim();

  return [forwardedClient, realIp]
    .map(normalizeIpAddress)
    .find((candidate): candidate is string => Boolean(candidate));
}

function normalizeIpAddress(value: string | undefined) {
  if (!value) return null;

  const unquoted = value.replace(/^"|"$/g, "");

  if (isIP(unquoted)) return unquoted.toLowerCase();

  const bracketedIpv6 = unquoted.match(/^\[([^\]]+)](?::\d+)?$/)?.[1];

  if (bracketedIpv6 && isIP(bracketedIpv6) === 6) {
    return bracketedIpv6.toLowerCase();
  }

  const ipv4WithPort = unquoted.match(/^(\d{1,3}(?:\.\d{1,3}){3}):\d+$/)?.[1];

  if (ipv4WithPort && isIP(ipv4WithPort) === 4) {
    return ipv4WithPort;
  }

  return null;
}

function readPositiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
