import { spawn } from "node:child_process";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

type Config = {
  baseUrl: string;
  startCommand?: string;
  serverReadyTimeoutMs?: number;
  allowDirtyGit?: boolean;
  maxIterations: number;
  targetScore: number;
  validationCommands: string[];
  forbiddenPaths: string[];
  allowedImplementationFocus: string[];
  codex: {
    command: string;
    reviewSandbox: "read-only" | "workspace-write" | "danger-full-access";
    writeSandbox: "read-only" | "workspace-write" | "danger-full-access";
    extraArgs?: string[];
  };
};

type RunOptions = {
  input?: string;
  allowFailure?: boolean;
  silent?: boolean;
};

const root = process.cwd();

const prompts = {
  shared: ".ai/prompts/00-shared-rules.md",
  ui: ".ai/prompts/01-ui-review.md",
  ux: ".ai/prompts/02-ux-review.md",
  accessibility: ".ai/prompts/03-accessibility-review.md",
  content: ".ai/prompts/04-content-review.md",
  consistency: ".ai/prompts/05-consistency-review.md",
  architect: ".ai/prompts/06-architect.md",
  css: ".ai/prompts/07-implement-css-tokens.md",
  components: ".ai/prompts/08-implement-components.md",
  layout: ".ai/prompts/09-implement-layout.md",
  critic: ".ai/prompts/10-critic.md",
};

async function exists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function parseEnvFile(content: string) {
  const result: Record<string, string> = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) continue;

    const match = line.match(/^([\w.-]+)\s*=\s*(.*)$/);
    if (!match) continue;

    const key = match[1];
    let value = match[2] ?? "";

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    result[key] = value;
  }

  return result;
}

async function loadLocalEnv() {
  for (const file of [".env.agent.local", ".env.local"]) {
    try {
      const content = await readFile(path.join(root, file), "utf8");
      const parsed = parseEnvFile(content);

      for (const [key, value] of Object.entries(parsed)) {
        if (process.env[key] === undefined) {
          process.env[key] = value;
        }
      }
    } catch {
      // arquivo opcional
    }
  }
}

async function readConfig(): Promise<Config> {
  return JSON.parse(await readFile(path.join(root, ".ai/config.json"), "utf8"));
}

async function readProjectFile(rel: string) {
  return await readFile(path.join(root, rel), "utf8");
}

async function save(rel: string, content: string) {
  const abs = path.join(root, rel);
  await mkdir(path.dirname(abs), { recursive: true });
  await writeFile(abs, content.trim() + "\n", "utf8");
}

function run(command: string, args: string[], options: RunOptions = {}) {
  return new Promise<{ stdout: string; stderr: string; code: number }>((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      stdio: ["pipe", "pipe", "pipe"],
      env: process.env,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      const text = chunk.toString();
      stdout += text;
      if (!options.silent) process.stdout.write(text);
    });

    child.stderr.on("data", (chunk) => {
      const text = chunk.toString();
      stderr += text;
      if (!options.silent) process.stderr.write(text);
    });

    child.on("error", reject);

    child.on("close", (code) => {
      const exitCode = code ?? 0;
      if (exitCode !== 0 && !options.allowFailure) {
        reject(new Error(`Command failed: ${command} ${args.join(" ")}\n${stderr || stdout}`));
        return;
      }
      resolve({ stdout, stderr, code: exitCode });
    });

    if (options.input) child.stdin.write(options.input);
    child.stdin.end();
  });
}

async function runShell(command: string, options: RunOptions = {}) {
  return await run("bash", ["-lc", command], options);
}

async function waitForUrl(url: string, timeoutMs: number) {
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2500);
      const response = await fetch(url, { signal: controller.signal }).catch(() => null);
      clearTimeout(timeout);

      if (response && response.status < 500) return;
    } catch {
      // servidor ainda subindo
    }

    await new Promise((resolve) => setTimeout(resolve, 1500));
  }

  throw new Error(`Servidor não respondeu em ${timeoutMs}ms: ${url}`);
}

async function ensureGitIsClean(config: Config) {
  if (!(await exists(path.join(root, ".git")))) return;

  const result = await runShell("git status --porcelain", { allowFailure: true, silent: true });

  if (result.stdout.trim() && !config.allowDirtyGit) {
    throw new Error(
      [
        "Git está sujo. Esse fluxo é melhor em branch limpa.",
        "",
        "Faça commit/stash ou marque allowDirtyGit=true em .ai/config.json.",
        "",
        result.stdout,
      ].join("\n")
    );
  }
}

async function gitDiff() {
  if (!(await exists(path.join(root, ".git")))) return "Sem repositório git.";
  const result = await runShell("git diff -- . ':!package-lock.json' ':!pnpm-lock.yaml' ':!yarn.lock'", {
    allowFailure: true,
    silent: true,
  });
  return result.stdout || "Sem diff.";
}

async function runCodex(params: {
  config: Config;
  title: string;
  promptRel: string;
  context: string;
  sandbox: Config["codex"]["reviewSandbox"];
  outputRel: string;
  imagePaths?: string[];
}) {
  const shared = await readProjectFile(prompts.shared);
  const prompt = await readProjectFile(params.promptRel);

  const fullPrompt = [
    shared,
    "",
    prompt,
    "",
    "## Contexto fornecido pelo orquestrador",
    "",
    params.context,
    "",
    "Siga o formato de saída obrigatório do prompt.",
  ].join("\n");

  console.log(`\n\n==============================`);
  console.log(`Codex: ${params.title}`);
  console.log(`Sandbox: ${params.sandbox}`);
  console.log(`==============================\n`);

  const outputAbs = path.join(root, params.outputRel);
  await mkdir(path.dirname(outputAbs), { recursive: true });

  const args = [
    "exec",
    "--cd",
    root,
    "--sandbox",
    params.sandbox,
    "--output-last-message",
    outputAbs,
    ...(params.imagePaths ?? []).flatMap((img) => ["--image", path.join(root, img)]),
    ...(params.config.codex.extraArgs ?? []),
    "-",
  ];

  const result = await run(params.config.codex.command, args, {
    input: fullPrompt,
    allowFailure: true,
  });

  if (!(await exists(outputAbs))) {
    await writeFile(outputAbs, result.stdout || result.stderr || "Sem saída do Codex.", "utf8");
  }

  return await readFile(outputAbs, "utf8");
}

function crawlContext(iteration: number) {
  return [
    `Crawl atual: .ai/runs/iteration-${iteration}/crawl/index.json`,
    "",
    "Arquivos por rota/view:",
    "- *.png: screenshot",
    "- *.annotated.png: screenshot com refs visuais",
    "- *.snapshot.txt: árvore/snapshot acessível em texto",
    "- *.snapshot.json: snapshot em JSON",
    "- *.meta.json: metadados visuais, headings, links, botões, imagens e tokens detectados",
    "- *.console.txt: console",
    "- *.errors.txt: erros de página",
    "",
    "Leia esses arquivos antes de concluir.",
  ].join("\n");
}

async function collectImagesFromIndex(iteration: number, limit = 18) {
  const indexPath = path.join(root, ".ai", "runs", `iteration-${iteration}`, "crawl", "index.json");
  if (!(await exists(indexPath))) return [];

  const index = JSON.parse(await readFile(indexPath, "utf8"));
  const images: string[] = [];

  for (const result of index.results ?? []) {
    if (!result.ok) continue;
    if (result.files?.screenshot) images.push(result.files.screenshot);
    if (result.files?.annotatedScreenshot) images.push(result.files.annotatedScreenshot);
    if (images.length >= limit) break;
  }

  return images;
}

async function runCrawl(iteration: number) {
  await run("tsx", ["scripts/ai/agent-browser-crawl.ts", "--iteration", String(iteration)]);
}

async function runValidation(config: Config, iteration: number) {
  const lines: string[] = [];

  for (const command of config.validationCommands) {
    console.log(`\nValidação: ${command}\n`);
    const result = await runShell(command, { allowFailure: true });
    lines.push([
      `# ${command}`,
      "",
      `Exit code: ${result.code}`,
      "",
      "## stdout",
      "```txt",
      result.stdout.trim(),
      "```",
      "",
      "## stderr",
      "```txt",
      result.stderr.trim(),
      "```",
      "",
    ].join("\n"));
  }

  await save(`.ai/runs/iteration-${iteration}/validation.md`, lines.join("\n\n"));
  return lines.join("\n\n");
}

function safetyContext(config: Config) {
  return [
    "## Escopo permitido",
    ...config.allowedImplementationFocus.map((x) => `- ${x}`),
    "",
    "## Arquivos/caminhos proibidos",
    ...config.forbiddenPaths.map((x) => `- ${x}`),
    "",
    "Se uma mudança exigir tocar nesses caminhos, pare e marque como revisão humana.",
  ].join("\n");
}

function extractScore(markdown: string) {
  const match = markdown.match(/Nota geral\s*\n\s*([0-9]+(?:[.,][0-9]+)?)/i)
    ?? markdown.match(/Nota geral[^0-9]*([0-9]+(?:[.,][0-9]+)?)/i);

  if (!match) return null;
  return Number(match[1].replace(",", "."));
}

async function main() {
  await loadLocalEnv();

  const config = await readConfig();
  await ensureGitIsClean(config);

  let serverProcess: ReturnType<typeof spawn> | null = null;

  try {
    if (config.startCommand) {
      console.log(`Subindo servidor: ${config.startCommand}`);
      serverProcess = spawn("bash", ["-lc", config.startCommand], {
        cwd: root,
        stdio: "inherit",
        detached: false,
        env: process.env,
      });

      await waitForUrl(config.baseUrl, config.serverReadyTimeoutMs ?? 90000);
    }

    for (let iteration = 1; iteration <= config.maxIterations; iteration++) {
      console.log(`\n\n################################`);
      console.log(`Iteração ${iteration}/${config.maxIterations}`);
      console.log(`################################\n`);

      await runCrawl(iteration);

      const images = await collectImagesFromIndex(iteration);

      const reviewBaseContext = [
        crawlContext(iteration),
        "",
        safetyContext(config),
      ].join("\n");

      const ui = await runCodex({
        config,
        title: "UI Review",
        promptRel: prompts.ui,
        sandbox: config.codex.reviewSandbox,
        context: reviewBaseContext,
        outputRel: `.ai/runs/iteration-${iteration}/reviews/ui.md`,
        imagePaths: images,
      });

      const ux = await runCodex({
        config,
        title: "UX Review",
        promptRel: prompts.ux,
        sandbox: config.codex.reviewSandbox,
        context: reviewBaseContext,
        outputRel: `.ai/runs/iteration-${iteration}/reviews/ux.md`,
        imagePaths: images,
      });

      const accessibility = await runCodex({
        config,
        title: "Accessibility Review",
        promptRel: prompts.accessibility,
        sandbox: config.codex.reviewSandbox,
        context: reviewBaseContext,
        outputRel: `.ai/runs/iteration-${iteration}/reviews/accessibility.md`,
        imagePaths: images,
      });

      const content = await runCodex({
        config,
        title: "Content Review",
        promptRel: prompts.content,
        sandbox: config.codex.reviewSandbox,
        context: reviewBaseContext,
        outputRel: `.ai/runs/iteration-${iteration}/reviews/content.md`,
      });

      const consistency = await runCodex({
        config,
        title: "Consistency Review",
        promptRel: prompts.consistency,
        sandbox: config.codex.reviewSandbox,
        context: reviewBaseContext,
        outputRel: `.ai/runs/iteration-${iteration}/reviews/consistency.md`,
        imagePaths: images,
      });

      const architectContext = [
        "Consolide os relatórios abaixo em um plano de implementação seguro.",
        "",
        safetyContext(config),
        "",
        "## UI Review",
        ui,
        "",
        "## UX Review",
        ux,
        "",
        "## Accessibility Review",
        accessibility,
        "",
        "## Content Review",
        content,
        "",
        "## Consistency Review",
        consistency,
      ].join("\n");

      const plan = await runCodex({
        config,
        title: "Architect",
        promptRel: prompts.architect,
        sandbox: config.codex.reviewSandbox,
        context: architectContext,
        outputRel: `.ai/runs/iteration-${iteration}/implementation-plan.md`,
      });

      const implementationContext = [
        "Implemente somente o que estiver no seu escopo.",
        "",
        safetyContext(config),
        "",
        "## Plano de implementação",
        plan,
        "",
        "## Crawl",
        crawlContext(iteration),
      ].join("\n");

      await runCodex({
        config,
        title: "CSS/Tokens Implementer",
        promptRel: prompts.css,
        sandbox: config.codex.writeSandbox,
        context: implementationContext,
        outputRel: `.ai/runs/iteration-${iteration}/implementation-css.md`,
      });

      await runCodex({
        config,
        title: "Components Implementer",
        promptRel: prompts.components,
        sandbox: config.codex.writeSandbox,
        context: implementationContext,
        outputRel: `.ai/runs/iteration-${iteration}/implementation-components.md`,
      });

      await runCodex({
        config,
        title: "Layout Implementer",
        promptRel: prompts.layout,
        sandbox: config.codex.writeSandbox,
        context: implementationContext,
        outputRel: `.ai/runs/iteration-${iteration}/implementation-layout.md`,
      });

      const validation = await runValidation(config, iteration);

      await runCrawl(iteration + 100);

      const diff = await gitDiff();
      await save(`.ai/runs/iteration-${iteration}/git-diff.patch`, diff);

      const afterImages = await collectImagesFromIndex(iteration + 100);

      const criticContext = [
        `Alvo de nota: ${config.targetScore}`,
        "",
        safetyContext(config),
        "",
        "## Plano",
        plan,
        "",
        "## Validação",
        validation,
        "",
        "## Git diff",
        "```diff",
        diff.slice(0, 80000),
        "```",
        "",
        "## Crawl antes",
        crawlContext(iteration),
        "",
        "## Crawl depois",
        crawlContext(iteration + 100),
      ].join("\n");

      const critic = await runCodex({
        config,
        title: "Critic",
        promptRel: prompts.critic,
        sandbox: config.codex.reviewSandbox,
        context: criticContext,
        outputRel: `.ai/runs/iteration-${iteration}/critic.md`,
        imagePaths: afterImages,
      });

      const score = extractScore(critic);
      console.log(`\nNota detectada: ${score ?? "não encontrada"} / alvo ${config.targetScore}`);

      if (score !== null && score >= config.targetScore) {
        console.log("\nAprovado pelo Critic. Encerrando.");
        break;
      }

      if (/Requer revisão humana/i.test(critic)) {
        console.log("\nCritic pediu revisão humana. Encerrando para evitar fazer besteira com confiança.");
        break;
      }

      if (iteration === config.maxIterations) {
        console.log("\nMáximo de iterações atingido.");
      }
    }

    console.log("\nPronto. Revise com:");
    console.log("git diff");
    console.log("ls .ai/runs");
  } finally {
    if (serverProcess && !serverProcess.killed) {
      serverProcess.kill("SIGTERM");
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
