import { spawn } from "node:child_process";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type ExpectedRouteState = "render" | "restricted";

type RouteConfig =
  | string
  | {
      path: string;
      group?: string;
      auth?: boolean;
      note?: string;
      expected?: ExpectedRouteState;
    };

type Viewport = {
  name: string;
  width: number;
  height: number;
};

type Config = {
  baseUrl: string;
  routes: RouteConfig[];
  viewports: Viewport[];
  agentBrowser: {
    command: string;
    headed?: boolean;
    waitUntil?: string;
    screenshotFullPage?: boolean;
    closeAllBeforeCrawl?: boolean;
  };
  auth?: {
    loginPath: string;
    usernameEnv: string;
    passwordEnv: string;
    usernameSelector?: string;
    passwordSelector?: string;
    submitSelector?: string;
    waitAfterSubmitMs?: number;
  };
};

type CrawlResult = {
  ok: boolean;
  route: string;
  group?: string;
  auth: boolean;
  expected: ExpectedRouteState;
  viewport: string;
  error?: string;
  failureReasons?: string[];
};

const root = process.cwd();

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
  const raw = await readFile(path.join(root, ".ai/config.json"), "utf8");
  return JSON.parse(raw) as Config;
}

function normalizeRoute(route: RouteConfig) {
  if (typeof route === "string") {
    return {
      path: route,
      group: undefined,
      auth: false,
      note: undefined,
      expected: "render" as const,
    };
  }

  return {
    path: route.path,
    group: route.group,
    auth: Boolean(route.auth),
    note: route.note,
    expected: route.expected ?? "render",
  };
}

function run(
  command: string,
  args: string[],
  allowFailure = false,
  input?: string,
) {
  return new Promise<{ stdout: string; stderr: string; code: number }>(
    (resolve, reject) => {
      const child = spawn(command, args, {
        cwd: root,
        stdio: ["pipe", "pipe", "pipe"],
      });

      let stdout = "";
      let stderr = "";

      child.stdout.on("data", (chunk) => {
        stdout += chunk.toString();
      });

      child.stderr.on("data", (chunk) => {
        stderr += chunk.toString();
      });

      child.on("error", reject);

      child.on("close", (code) => {
        const exitCode = code ?? 0;

        if (exitCode !== 0 && !allowFailure) {
          reject(
            new Error(
              `Command failed: ${command} ${args.join(" ")}\n${stderr || stdout}`,
            ),
          );
          return;
        }

        resolve({ stdout, stderr, code: exitCode });
      });

      if (input) {
        child.stdin.write(input);
      }

      child.stdin.end();
    },
  );
}

function safeRouteName(route: string): string {
  if (route === "/") return "home";
  return route.replace(/^\/+/, "").replace(/[^\w-]+/g, "-") || "route";
}

async function runAgentBrowser(
  config: Config,
  args: string[],
  allowFailure = false,
  input?: string,
) {
  return await run(config.agentBrowser.command, args, allowFailure, input);
}

function absoluteUrl(config: Config, route: string) {
  return new URL(route, config.baseUrl).toString();
}

async function exists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function routePath(url: string) {
  try {
    const pathname = new URL(url).pathname;
    return pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
  } catch {
    return "";
  }
}

function isNotFoundPage(meta: unknown, snapshot: string) {
  const headings =
    meta && typeof meta === "object" && "headings" in meta
      ? ((meta as { headings?: Array<{ text?: string }> }).headings ?? [])
      : [];
  const text = [
    snapshot,
    ...headings.map((heading) => heading.text ?? ""),
  ].join(" ");

  return /(?:^|\s)404(?:\s|$)|Esta página não está disponível|Não temos esta página/i.test(
    text,
  );
}

async function loginIfNeeded(config: Config, viewport: Viewport) {
  if (!config.auth) {
    throw new Error(
      "Rota autenticada encontrada, mas .ai/config.json não tem bloco auth.",
    );
  }

  const email = process.env[config.auth.usernameEnv];
  const password = process.env[config.auth.passwordEnv];

  if (!email || !password) {
    throw new Error(
      [
        "Credenciais de teste ausentes.",
        `Defina ${config.auth.usernameEnv} e ${config.auth.passwordEnv} em .env.agent.local.`,
        "A senha não deve ser commitada.",
      ].join("\n"),
    );
  }

  const loginUrl = absoluteUrl(config, config.auth.loginPath);

  await runAgentBrowser(config, [
    "set",
    "viewport",
    String(viewport.width),
    String(viewport.height),
  ]);
  await runAgentBrowser(config, ["console", "--clear"], true);
  await runAgentBrowser(config, ["errors", "--clear"], true);
  await runAgentBrowser(config, ["open", loginUrl]);
  await runAgentBrowser(
    config,
    ["wait", "--load", config.agentBrowser.waitUntil || "networkidle"],
    true,
  );

  const js = `
(() => {
  const email = ${JSON.stringify(email)};
  const password = ${JSON.stringify(password)};
  const usernameSelector = ${JSON.stringify(config.auth.usernameSelector || "input[type='email'], input[name='email'], input[name='username']")};
  const passwordSelector = ${JSON.stringify(config.auth.passwordSelector || "input[type='password']")};
  const submitSelector = ${JSON.stringify(config.auth.submitSelector || "button[type='submit']")};

  function pick(selector, fallback) {
    return document.querySelector(selector) || fallback();
  }

  function byHeuristic(kind) {
    const inputs = Array.from(document.querySelectorAll("input"));
    if (kind === "password") {
      return inputs.find((input) => input.type === "password");
    }

    return inputs.find((input) => {
      const haystack = [
        input.type,
        input.name,
        input.id,
        input.placeholder,
        input.getAttribute("aria-label"),
        input.autocomplete
      ].filter(Boolean).join(" ").toLowerCase();

      return haystack.includes("email") ||
        haystack.includes("e-mail") ||
        haystack.includes("user") ||
        haystack.includes("usuário") ||
        haystack.includes("usuario");
    });
  }

  function setNativeValue(input, value) {
    const proto = input instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;

    const descriptor = Object.getOwnPropertyDescriptor(proto, "value");

    if (descriptor?.set) {
      descriptor.set.call(input, value);
    } else {
      input.value = value;
    }

    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  const userInput = pick(usernameSelector, () => byHeuristic("username"));
  const passwordInput = pick(passwordSelector, () => byHeuristic("password"));

  if (!userInput || !passwordInput) {
    return JSON.stringify({
      ok: false,
      reason: "Campos de login não encontrados",
      title: document.title,
      url: location.href,
      inputs: Array.from(document.querySelectorAll("input")).map((input) => ({
        type: input.type,
        name: input.name,
        id: input.id,
        placeholder: input.placeholder,
        ariaLabel: input.getAttribute("aria-label")
      }))
    });
  }

  setNativeValue(userInput, email);
  setNativeValue(passwordInput, password);

  const form = passwordInput.closest("form") || userInput.closest("form");
  const button = document.querySelector(submitSelector) ||
    form?.querySelector("button[type='submit'], input[type='submit']") ||
    Array.from(document.querySelectorAll("button")).find((button) => {
      const text = (button.textContent || "").toLowerCase();
      return text.includes("entrar") || text.includes("login") || text.includes("acessar");
    });

  if (button) {
    button.click();
  } else if (form?.requestSubmit) {
    form.requestSubmit();
  } else if (form) {
    form.submit();
  } else {
    passwordInput.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  }

  return JSON.stringify({ ok: true, url: location.href });
})()
`.trim();

  const filled = await runAgentBrowser(config, ["eval", js], true);
  await runAgentBrowser(
    config,
    ["wait", String(config.auth.waitAfterSubmitMs ?? 2500)],
    true,
  );
  await runAgentBrowser(
    config,
    ["wait", "--load", config.agentBrowser.waitUntil || "networkidle"],
    true,
  );

  const currentUrl = await runAgentBrowser(config, ["get", "url"], true);
  const currentUrlText = currentUrl.stdout.trim();

  if (currentUrlText.includes(config.auth.loginPath)) {
    const snapshot = await runAgentBrowser(config, ["snapshot", "-i"], true);
    throw new Error(
      [
        "Login aparentemente não saiu da tela de entrada.",
        "",
        "Resultado do preenchimento:",
        filled.stdout || filled.stderr,
        "",
        "URL atual:",
        currentUrlText,
        "",
        "Snapshot:",
        snapshot.stdout || snapshot.stderr,
      ].join("\n"),
    );
  }
}

async function collectPageMeta(config: Config) {
  const js = `
(() => {
  const visible = (el) => {
    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden";
  };

  const els = Array.from(document.querySelectorAll("*")).filter(visible).slice(0, 1200);

  const compact = els.map((el) => {
    const style = getComputedStyle(el);
    const rect = el.getBoundingClientRect();

    return {
      tag: el.tagName.toLowerCase(),
      id: el.id || undefined,
      className: typeof el.className === "string" ? el.className.slice(0, 200) : undefined,
      text: (el.textContent || "").trim().replace(/\\s+/g, " ").slice(0, 100) || undefined,
      role: el.getAttribute("role") || undefined,
      ariaLabel: el.getAttribute("aria-label") || undefined,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      color: style.color,
      backgroundColor: style.backgroundColor,
      borderRadius: style.borderRadius,
      boxShadow: style.boxShadow === "none" ? undefined : style.boxShadow,
      padding: style.padding,
      margin: style.margin,
      display: style.display,
      width: Math.round(rect.width),
      height: Math.round(rect.height)
    };
  });

  const count = (items) => {
    const map = new Map();
    for (const item of items) {
      if (!item) continue;
      map.set(item, (map.get(item) || 0) + 1);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 24)
      .map(([value, count]) => ({ value, count }));
  };

  return JSON.stringify({
    url: location.href,
    title: document.title,
    lang: document.documentElement.lang || undefined,
    headings: Array.from(document.querySelectorAll("h1,h2,h3,h4,h5,h6")).map((el) => ({
      level: el.tagName.toLowerCase(),
      text: (el.textContent || "").trim().replace(/\\s+/g, " ").slice(0, 180)
    })),
    links: Array.from(document.querySelectorAll("a")).filter(visible).slice(0, 120).map((el) => ({
      text: (el.textContent || "").trim().replace(/\\s+/g, " ").slice(0, 120),
      href: el.href,
      ariaLabel: el.getAttribute("aria-label") || undefined
    })),
    buttons: Array.from(document.querySelectorAll("button,[role='button']")).filter(visible).slice(0, 120).map((el) => ({
      text: (el.textContent || "").trim().replace(/\\s+/g, " ").slice(0, 120),
      ariaLabel: el.getAttribute("aria-label") || undefined,
      className: typeof el.className === "string" ? el.className.slice(0, 200) : undefined
    })),
    images: Array.from(document.querySelectorAll("img")).filter(visible).slice(0, 120).map((img) => ({
      src: img.getAttribute("src"),
      alt: img.getAttribute("alt") || ""
    })),
    tokenSummary: {
      colors: count(compact.map((x) => x.color)),
      backgrounds: count(compact.map((x) => x.backgroundColor)),
      fontSizes: count(compact.map((x) => x.fontSize)),
      fontWeights: count(compact.map((x) => x.fontWeight)),
      radii: count(compact.map((x) => x.borderRadius)),
      shadows: count(compact.map((x) => x.boxShadow)),
      paddings: count(compact.map((x) => x.padding))
    },
    sampleStyles: compact
  });
})()
`.trim();

  const result = await runAgentBrowser(config, ["eval", js]);

  try {
    const parsed = JSON.parse(result.stdout.trim());
    if (typeof parsed === "string") return JSON.parse(parsed);
    if (parsed?.data && typeof parsed.data === "string")
      return JSON.parse(parsed.data);
    return parsed;
  } catch {
    return {
      raw: result.stdout.trim(),
      stderr: result.stderr.trim(),
      parseError: true,
    };
  }
}

async function crawlOne(
  config: Config,
  routeConfig: ReturnType<typeof normalizeRoute>,
  viewport: Viewport,
  outDir: string,
  authState: { loggedIn: boolean },
) {
  const url = absoluteUrl(config, routeConfig.path);
  const routeName = safeRouteName(routeConfig.path);
  const name = `${routeName}__${viewport.name}`;

  const screenshotPath = path.join(outDir, `${name}.png`);
  const annotatedPath = path.join(outDir, `${name}.annotated.png`);
  const snapshotPath = path.join(outDir, `${name}.snapshot.txt`);
  const snapshotJsonPath = path.join(outDir, `${name}.snapshot.json`);
  const metaPath = path.join(outDir, `${name}.meta.json`);
  const consolePath = path.join(outDir, `${name}.console.txt`);
  const errorsPath = path.join(outDir, `${name}.errors.txt`);

  if (routeConfig.auth && !authState.loggedIn) {
    await loginIfNeeded(config, viewport);
    authState.loggedIn = true;
  }

  await runAgentBrowser(config, [
    "set",
    "viewport",
    String(viewport.width),
    String(viewport.height),
  ]);
  await runAgentBrowser(config, ["console", "--clear"], true);
  await runAgentBrowser(config, ["errors", "--clear"], true);

  const openArgs = ["open", url];
  if (config.agentBrowser.headed) openArgs.push("--headed");

  await runAgentBrowser(config, openArgs);
  await runAgentBrowser(
    config,
    ["wait", "--load", config.agentBrowser.waitUntil || "networkidle"],
    true,
  );
  await runAgentBrowser(config, ["wait", "750"], true);

  const snapshot = await runAgentBrowser(config, ["snapshot", "-i"]);
  const snapshotJson = await runAgentBrowser(config, [
    "snapshot",
    "-i",
    "--json",
  ]);

  const screenshotArgs = ["screenshot"];
  if (config.agentBrowser.screenshotFullPage) screenshotArgs.push("--full");
  screenshotArgs.push(screenshotPath);

  await runAgentBrowser(config, screenshotArgs);
  await runAgentBrowser(config, ["screenshot", "--annotate", annotatedPath]);

  const meta = await collectPageMeta(config);
  const consoleResult = await runAgentBrowser(config, ["console"], true);
  const errorsResult = await runAgentBrowser(config, ["errors"], true);
  const finalUrl = await runAgentBrowser(config, ["get", "url"]);

  await writeFile(snapshotPath, snapshot.stdout || snapshot.stderr, "utf8");
  await writeFile(
    snapshotJsonPath,
    snapshotJson.stdout || snapshotJson.stderr,
    "utf8",
  );
  await writeFile(metaPath, JSON.stringify(meta, null, 2), "utf8");
  await writeFile(
    consolePath,
    consoleResult.stdout || consoleResult.stderr,
    "utf8",
  );
  await writeFile(
    errorsPath,
    errorsResult.stdout || errorsResult.stderr,
    "utf8",
  );

  const finalUrlText = finalUrl.stdout.trim();
  const failureReasons: string[] = [];
  const requestedPath = routePath(url);
  const reachedPath = routePath(finalUrlText);
  const isNotFound = isNotFoundPage(meta, snapshot.stdout);
  const requiredArtifacts = [
    screenshotPath,
    annotatedPath,
    snapshotPath,
    snapshotJsonPath,
    metaPath,
  ];
  const artifactChecks = await Promise.all(requiredArtifacts.map(exists));

  if (!finalUrlText) {
    failureReasons.push("O navegador não retornou a URL final.");
  }
  if (artifactChecks.some((artifactExists) => !artifactExists)) {
    failureReasons.push("Um ou mais artefatos obrigatórios não foram gerados.");
  }
  if (meta && typeof meta === "object" && "parseError" in meta) {
    failureReasons.push("Não foi possível ler os metadados da página.");
  }

  if (routeConfig.expected === "render") {
    if (requestedPath !== reachedPath) {
      failureReasons.push(
        `A rota esperada ${requestedPath} terminou em ${reachedPath || finalUrlText}.`,
      );
    }
    if (isNotFound) {
      failureReasons.push(
        "A rota deveria renderizar, mas exibiu um estado 404.",
      );
    }
  } else if (!isNotFound) {
    failureReasons.push(
      "A rota deveria permanecer restrita para a conta de teste, mas renderizou conteúdo.",
    );
  }

  return {
    ok: failureReasons.length === 0,
    route: routeConfig.path,
    group: routeConfig.group,
    auth: routeConfig.auth,
    expected: routeConfig.expected,
    viewport: viewport.name,
    url,
    finalUrl: finalUrlText,
    failureReasons,
    files: {
      screenshot: path.relative(root, screenshotPath),
      annotatedScreenshot: path.relative(root, annotatedPath),
      snapshot: path.relative(root, snapshotPath),
      snapshotJson: path.relative(root, snapshotJsonPath),
      meta: path.relative(root, metaPath),
      console: path.relative(root, consolePath),
      errors: path.relative(root, errorsPath),
    },
  };
}

async function main() {
  await loadLocalEnv();

  const iteration = process.argv.includes("--iteration")
    ? process.argv[process.argv.indexOf("--iteration") + 1]
    : "manual";

  const config = await readConfig();
  const outDir = path.join(
    root,
    ".ai",
    "runs",
    `iteration-${iteration}`,
    "crawl",
  );
  await mkdir(outDir, { recursive: true });

  if (config.agentBrowser.closeAllBeforeCrawl) {
    await runAgentBrowser(config, ["close", "--all"], true);
  }

  const results: CrawlResult[] = [];
  const authState = { loggedIn: false };

  try {
    for (const rawRoute of config.routes) {
      const route = normalizeRoute(rawRoute);

      for (const viewport of config.viewports) {
        try {
          const result = await crawlOne(
            config,
            route,
            viewport,
            outDir,
            authState,
          );
          results.push(result);
          const marker = result.ok ? "✓" : "✗";
          console.log(
            `${marker} ${route.path} ${viewport.name}${route.auth ? " auth" : ""}`,
          );
          if (!result.ok) {
            for (const reason of result.failureReasons) {
              console.error(`  - ${reason}`);
            }
          }
        } catch (error) {
          const failed: CrawlResult = {
            ok: false,
            route: route.path,
            group: route.group,
            auth: route.auth,
            expected: route.expected,
            viewport: viewport.name,
            error: error instanceof Error ? error.message : String(error),
          };
          results.push(failed);
          console.log(`✗ ${route.path} ${viewport.name}`);
          console.error(failed.error);
        }
      }
    }
  } finally {
    await runAgentBrowser(config, ["close"], true);
  }

  await writeFile(
    path.join(outDir, "index.json"),
    JSON.stringify(
      {
        createdAt: new Date().toISOString(),
        baseUrl: config.baseUrl,
        results,
      },
      null,
      2,
    ),
    "utf8",
  );

  console.log(`\nCrawl salvo em: ${path.relative(root, outDir)}`);

  const failedResults = results.filter((result) => !result.ok);
  if (failedResults.length > 0) {
    throw new Error(
      `${failedResults.length} captura(s) falharam. Consulte ${path.relative(root, outDir)}/index.json.`,
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
