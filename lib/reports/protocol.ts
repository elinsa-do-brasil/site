import crypto from "node:crypto";

export function createReportProtocol(date = new Date()) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const suffix = crypto.randomBytes(4).toString("hex").toUpperCase();

  return `DEN-${year}${month}${day}-${suffix}`;
}
