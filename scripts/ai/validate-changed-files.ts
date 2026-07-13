import { spawn } from "node:child_process";
import { access } from "node:fs/promises";

const root = process.cwd();
const supportedExtensions = /\.(?:css|json|ts|tsx)$/;

async function fileExists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function run(command: string, args: string[]) {
  return new Promise<{ code: number; stdout: string }>((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      stdio: ["ignore", "pipe", "inherit"],
    });
    let stdout = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => resolve({ code: code ?? 1, stdout }));
  });
}

async function main() {
  const [diff, untracked] = await Promise.all([
    run("git", ["diff", "--name-only", "--diff-filter=ACMRT"]),
    run("git", ["ls-files", "--others", "--exclude-standard"]),
  ]);

  if (diff.code !== 0 || untracked.code !== 0) {
    throw new Error("Não foi possível listar os arquivos alterados pelo Git.");
  }

  const candidates = [
    ...diff.stdout.split("\n"),
    ...untracked.stdout.split("\n"),
  ]
    .map((file) => file.trim())
    .filter((file) => supportedExtensions.test(file));
  const uniqueFiles = [...new Set(candidates)];
  const existingFiles: string[] = [];

  for (const file of uniqueFiles) {
    if (await fileExists(file)) existingFiles.push(file);
  }

  if (existingFiles.length === 0) {
    console.log("Nenhum arquivo de código alterado para validar com Biome.");
    return;
  }

  console.log(
    `Validando ${existingFiles.length} arquivo(s) alterado(s) com Biome.`,
  );
  const result = await run("pnpm", [
    "exec",
    "biome",
    "check",
    ...existingFiles,
  ]);
  if (result.stdout) process.stdout.write(result.stdout);

  if (result.code !== 0) {
    process.exitCode = result.code;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
