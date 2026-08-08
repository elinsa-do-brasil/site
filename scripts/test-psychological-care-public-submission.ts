import assert from "node:assert/strict";
import { eq, sql } from "drizzle-orm";
import { db, dbPool } from "../lib/db/index.ts";
import { rateLimit } from "../lib/db/schema/auth.ts";
import {
  psychologicalCareRequestEvents,
  psychologicalCareRequests,
} from "../lib/db/schema/psychological-care.ts";
import { createPsychologicalCarePublicRateLimitDigest } from "../lib/psychological-care/crypto.ts";
import { processPublicPsychologicalCareRequestSubmission } from "../lib/psychological-care/process-public-submission.ts";
import { decryptPsychologicalCareRequestRow } from "../lib/psychological-care/repository.ts";

const RATE_LIMIT_KEY_NAMESPACE = "psychological-care/ampercuida/ip";
const runID = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const createdRequestIds: string[] = [];
const usedFakeIps: string[] = [];

function remember(requestId: string) {
  createdRequestIds.push(requestId);
}

function headersFor(ip: string | null): { get(name: string): string | null } {
  return {
    get: (name) => (name.toLowerCase() === "x-forwarded-for" && ip ? ip : null),
  };
}

let fakeIpCounter = 0;
function nextFakeIp() {
  fakeIpCounter += 1;
  // Octetos dentro de 0-255, derivados do runID + contador para não colidir
  // entre execuções concorrentes do script nem entre cenários no mesmo run.
  const seed = Math.abs(hashCode(`${runID}-${fakeIpCounter}`));
  const ip = `10.${seed % 200}.${(seed >> 8) % 200}.${(seed >> 16) % 200}`;
  usedFakeIps.push(ip);
  return ip;
}

function hashCode(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

function validInput(overrides: Record<string, unknown> = {}) {
  return {
    submissionId: crypto.randomUUID(),
    base: "Base Teste",
    city: "Cidade Teste",
    employeeName: "Fulano de Tal",
    phone: "(91) 99999-1234",
    registration: "12345",
    jobTitle: "Eletricista",
    management: "Operações",
    reason: "Motivo de teste de integração com pelo menos dez caracteres.",
    website: "",
    turnstileToken: "test-token",
    ...overrides,
  };
}

async function withMockedSiteverify<T>(
  responder: () => { success: boolean } | Promise<{ success: boolean }>,
  callback: () => Promise<T>,
): Promise<T> {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = (async (url: string | URL) => {
    if (String(url).includes("challenges.cloudflare.com")) {
      const body = await responder();
      return new Response(JSON.stringify(body), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    throw new Error(`Chamada de rede inesperada em teste: ${url}`);
  }) as typeof fetch;

  try {
    return await callback();
  } finally {
    globalThis.fetch = originalFetch;
  }
}

async function cleanup() {
  for (const id of createdRequestIds) {
    await db
      .delete(psychologicalCareRequestEvents)
      .where(eq(psychologicalCareRequestEvents.requestId, id));
    await db
      .delete(psychologicalCareRequests)
      .where(eq(psychologicalCareRequests.id, id));
  }

  for (const ip of usedFakeIps) {
    const digest = createPsychologicalCarePublicRateLimitDigest(ip);
    await db
      .delete(rateLimit)
      .where(eq(rateLimit.key, `${RATE_LIMIT_KEY_NAMESPACE}/${digest}`));
  }
}

async function main() {
  try {
    // 1. Honeypot preenchido: sucesso falso, nada é persistido.
    await withMockedSiteverify(
      () => {
        throw new Error(
          "siteverify não deveria ser chamado com honeypot preenchido",
        );
      },
      async () => {
        const result = await processPublicPsychologicalCareRequestSubmission(
          validInput({ website: "https://spam.example" }),
          headersFor(nextFakeIp()),
        );
        assert.equal(result.success, true);
        if (result.success) {
          const [row] = await db
            .select()
            .from(psychologicalCareRequests)
            .where(
              sql`${psychologicalCareRequests.protocol} = ${result.protocol}`,
            );
          assert.equal(row, undefined);
        }
      },
    );

    // 2. Sem turnstileToken: bloqueado na validação Zod, sem chamar siteverify.
    await withMockedSiteverify(
      () => {
        throw new Error("siteverify não deveria ser chamado sem token");
      },
      async () => {
        const { turnstileToken: _drop, ...withoutToken } = validInput();
        const result = await processPublicPsychologicalCareRequestSubmission(
          withoutToken,
          headersFor(nextFakeIp()),
        );
        assert.equal(result.success, false);
        if (!result.success) {
          assert.ok(result.fieldErrors);
          assert.equal(
            Object.hasOwn(result.fieldErrors ?? {}, "turnstileToken"),
            false,
          );
        }
      },
    );

    // 3. Token Turnstile inválido/expirado (siteverify success: false): bloqueado, nada persistido.
    await withMockedSiteverify(
      () => ({ success: false }),
      async () => {
        const input = validInput();
        const result = await processPublicPsychologicalCareRequestSubmission(
          input,
          headersFor(nextFakeIp()),
        );
        assert.equal(result.success, false);
        if (!result.success) {
          assert.match(result.message, /verificação de segurança/);
        }
        const [row] = await db
          .select()
          .from(psychologicalCareRequests)
          .where(
            eq(psychologicalCareRequests.submissionId, input.submissionId),
          );
        assert.equal(row, undefined);
      },
    );

    // 4. Falha do siteverify (erro de rede): fail-closed, nada persistido.
    await withMockedSiteverify(
      () => {
        throw new Error("network down (simulado)");
      },
      async () => {
        const input = validInput();
        const result = await processPublicPsychologicalCareRequestSubmission(
          input,
          headersFor(nextFakeIp()),
        );
        assert.equal(result.success, false);
        const [row] = await db
          .select()
          .from(psychologicalCareRequests)
          .where(
            eq(psychologicalCareRequests.submissionId, input.submissionId),
          );
        assert.equal(row, undefined);
      },
    );

    // 5. Submissão válida: persiste, payload correto, turnstileToken descartado.
    await withMockedSiteverify(
      () => ({ success: true }),
      async () => {
        const input = validInput({
          employeeName: "Maria da Integração",
          registration: "99999",
          reason:
            "Motivo real de teste de integração, com detalhes suficientes.",
        });
        const result = await processPublicPsychologicalCareRequestSubmission(
          input,
          headersFor(nextFakeIp()),
        );
        assert.equal(result.success, true);
        if (!result.success) return;

        const [row] = await db
          .select()
          .from(psychologicalCareRequests)
          .where(
            eq(psychologicalCareRequests.submissionId, input.submissionId),
          );
        assert.ok(row);
        remember(row.id);

        const decrypted = decryptPsychologicalCareRequestRow(row);
        assert.ok(decrypted);
        assert.equal(decrypted?.employeeName, input.employeeName);
        assert.equal(decrypted?.registration, input.registration);
        assert.equal(decrypted?.reason, input.reason);
        assert.equal(Object.hasOwn(decrypted ?? {}, "turnstileToken"), false);
      },
    );

    // 6. Rate limit: a 6ª tentativa do mesmo IP é bloqueada antes do Turnstile
    // (o mock de siteverify sempre nega, então nada persiste independente do
    // rate limit — isolando exatamente o comportamento do rate limit).
    await withMockedSiteverify(
      () => ({ success: false }),
      async () => {
        const sharedIp = nextFakeIp();
        const results = [];

        for (let attempt = 0; attempt < 6; attempt += 1) {
          results.push(
            await processPublicPsychologicalCareRequestSubmission(
              validInput(),
              headersFor(sharedIp),
            ),
          );
        }

        for (let i = 0; i < 5; i += 1) {
          assert.equal(results[i]?.success, false);
          if (!results[i]?.success) {
            assert.match(
              (results[i] as { message: string }).message,
              /verificação de segurança/,
            );
          }
        }

        const sixth = results[5];
        assert.equal(sixth?.success, false);
        if (!sixth?.success) {
          assert.match(sixth.message, /Limite de envios/);
        }
      },
    );

    console.log(
      "Psychological care public submission integration checks passed.",
    );
  } finally {
    await cleanup();
    await dbPool.end();
  }
}

await main();
process.exit(0);
