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

function constantTimeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return (
    leftBuffer.length === rightBuffer.length &&
    crypto.timingSafeEqual(leftBuffer, rightBuffer)
  );
}
