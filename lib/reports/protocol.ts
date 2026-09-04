import crypto from "node:crypto";

// Formato DEN-AAAAMMDD-XXXXXXXX — mesmo esquema de lib/psychological-care/protocol.ts, só com prefixo diferente (DEN de "denúncia").
export function createReportProtocol(date = new Date()) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const suffix = crypto.randomBytes(4).toString("hex").toUpperCase();

  return `DEN-${year}${month}${day}-${suffix}`;
}
