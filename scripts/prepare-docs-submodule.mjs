import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";

const token = process.env.GITHUB_SUBMODULE_TOKEN;
const legacyDocsReady =
  existsSync("docs/index.mdx") && existsSync("docs/meta.json");
// O submodulo atual separa docs publicos e internos; quando ambos existem,
// o build local nao precisa de token para inicializar o checkout.
const splitDocsReady =
  existsSync("docs/public/index.mdx") &&
  existsSync("docs/public/meta.json") &&
  existsSync("docs/internal/index.mdx") &&
  existsSync("docs/internal/meta.json");
const docsReady = legacyDocsReady || splitDocsReady;

function run(command, args) {
  execFileSync(command, args, {
    stdio: "inherit",
  });
}

if (!docsReady && !token) {
  console.error("docs/ is not initialized. Set GITHUB_SUBMODULE_TOKEN.");
  process.exit(1);
}

if (token) {
  run("git", [
    "config",
    "--global",
    `url.https://x-access-token:${token}@github.com/.insteadOf`,
    "https://github.com/",
  ]);
}

run("git", ["submodule", "sync", "--recursive"]);
run("git", ["submodule", "update", "--init", "--recursive"]);
