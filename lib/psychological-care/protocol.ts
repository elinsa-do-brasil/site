import crypto from "node:crypto";

// Formato PSI-AAAAMMDD-XXXXXXXX (sufixo hex aleatório de 4 bytes) — visível ao solicitante como número de protocolo, e é a chave de busca em lib/psychological-care/repository.ts.
export function createPsychologicalCareProtocol(date = new Date()) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const suffix = crypto.randomBytes(4).toString("hex").toUpperCase();

  return `PSI-${year}${month}${day}-${suffix}`;
}
