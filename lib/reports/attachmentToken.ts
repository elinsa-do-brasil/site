// Token de upload autocontido (payload + assinatura HMAC), sem estado no servidor: qualquer instância consegue validar sem consultar banco, só reconstruindo a assinatura com a mesma chave mestra.
import crypto from "node:crypto";
import { getReportsMasterKey } from "./crypto";

const UPLOAD_TOKEN_TTL_MS = 30 * 60 * 1000;

type UploadTokenPayload = {
  reportId: string;
  expiresAt: number;
};

export function createReportUploadToken(reportId: string) {
  const payload = Buffer.from(
    JSON.stringify({
      reportId,
      expiresAt: Date.now() + UPLOAD_TOKEN_TTL_MS,
    } satisfies UploadTokenPayload),
    "utf8",
  ).toString("base64url");

  return `${payload}.${signUploadTokenPayload(payload)}`;
}

export function verifyReportUploadToken(token: string, reportId: string) {
  const [payload, signature] = token.split(".");

  if (!payload || !signature) return false;

  const expectedSignature = signUploadTokenPayload(payload);

  if (!constantTimeEqual(signature, expectedSignature)) {
    return false;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as Partial<UploadTokenPayload>;

    return (
      parsed.reportId === reportId &&
      typeof parsed.expiresAt === "number" &&
      parsed.expiresAt > Date.now()
    );
  } catch {
    return false;
  }
}

function signUploadTokenPayload(payload: string) {
  return crypto
    .createHmac("sha256", getReportsMasterKey())
    .update(payload)
    .digest("base64url");
}

// Comparação em tempo constante (crypto.timingSafeEqual) em vez de `===` — evita um ataque de timing revelar a assinatura correta byte a byte pela diferença de tempo de resposta.
function constantTimeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return (
    leftBuffer.length === rightBuffer.length &&
    crypto.timingSafeEqual(leftBuffer, rightBuffer)
  );
}
