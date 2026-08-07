import "server-only";

import { env } from "@/lib/env";

const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const MAX_TOKEN_LENGTH = 2048;
const SITEVERIFY_TIMEOUT_MS = 5_000;

/**
 * Valida um token do widget Turnstile contra o siteverify da Cloudflare.
 * Fail-closed: qualquer ausência de configuração, erro de rede, timeout ou
 * resposta inesperada resulta em `false`, nunca em liberar a requisição.
 */
export async function verifyTurnstileToken(input: {
  token: string;
  remoteIp: string | null;
}): Promise<boolean> {
  const secret = env.turnstileSecret();

  if (!secret) {
    console.error("TURNSTILE_SECRET nao configurada.");
    return false;
  }

  if (!input.token || input.token.length > MAX_TOKEN_LENGTH) {
    return false;
  }

  const params = new URLSearchParams({
    secret,
    response: input.token,
    ...(input.remoteIp ? { remoteip: input.remoteIp } : {}),
  });

  try {
    const response = await fetch(SITEVERIFY_URL, {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
      signal: AbortSignal.timeout(SITEVERIFY_TIMEOUT_MS),
    });

    if (!response.ok) return false;

    const data = await response.json();

    return data?.success === true;
  } catch {
    return false;
  }
}
