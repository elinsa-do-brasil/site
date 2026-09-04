import { isIP } from "node:net";

type HeaderReader = {
  get(name: string): string | null;
};

/**
 * Sem `import "server-only"` de propósito: importado por testes (`tsx
 * --test`, Node puro, fora do pipeline do Next.js) — o guard lança erro
 * incondicionalmente fora do bundler do Next. Todos os call sites reais já
 * são server-only por natureza (Server Actions, API routes).
 *
 * Extrai o IP do cliente a partir de x-forwarded-for (primeiro salto) com
 * fallback para x-real-ip. O proxy de deployment precisa sobrescrever esses
 * headers antes da requisição chegar ao Next.js — o endereço bruto retornado
 * aqui deve ser usado só em memória (ex.: para derivar um digest HMAC ou um
 * parâmetro efêmero de verificação), nunca persistido diretamente.
 */
export function getClientIp(headers: HeaderReader): string | null {
  const forwardedFor = headers.get("x-forwarded-for");
  const forwardedClient = forwardedFor?.split(",")[0]?.trim();
  const realIp = headers.get("x-real-ip")?.trim();

  return (
    [forwardedClient, realIp]
      .map(normalizeIpAddress)
      .find((candidate): candidate is string => Boolean(candidate)) ?? null
  );
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
