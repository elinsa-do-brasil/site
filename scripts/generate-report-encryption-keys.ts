import crypto from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const outputDir = path.join(process.cwd(), "secrets");
const publicKeyPath = path.join(outputDir, "reports-public-key.base64.txt");
const privateKeyPath = path.join(outputDir, "reports-private-key.base64.txt");

const { publicKey, privateKey } = crypto.generateKeyPairSync("ec", {
  namedCurve: "secp384r1",
  publicKeyEncoding: {
    type: "spki",
    format: "der",
  },
  privateKeyEncoding: {
    type: "pkcs8",
    format: "der",
  },
});

mkdirSync(outputDir, { recursive: true });
writeFileSync(publicKeyPath, publicKey.toString("base64"), { mode: 0o600 });
writeFileSync(privateKeyPath, privateKey.toString("base64"), { mode: 0o600 });

console.log("Chaves ECC P-384 geradas em base64:");
console.log(`- ${publicKeyPath}`);
console.log(`- ${privateKeyPath}`);
console.log("");
console.log(
  "Configure NEXT_PUBLIC_REPORTS_PUBLIC_KEY_BASE64 com o conteudo da chave publica.",
);
console.log(
  "Configure REPORTS_PRIVATE_KEY_BASE64 com o conteudo da chave privada.",
);
console.log("Nao commite os arquivos em secrets/.");
