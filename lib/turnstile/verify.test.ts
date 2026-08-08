import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { verifyTurnstileToken } from "./verify";

const VALID_SECRET = "1x0000000000000000000000000000000AA";

async function withTurnstileSecret(
  value: string | undefined,
  callback: () => void | Promise<void>,
) {
  const previous = process.env.TURNSTILE_SECRET;

  try {
    if (value === undefined) {
      delete process.env.TURNSTILE_SECRET;
    } else {
      process.env.TURNSTILE_SECRET = value;
    }

    await callback();
  } finally {
    if (previous === undefined) {
      delete process.env.TURNSTILE_SECRET;
    } else {
      process.env.TURNSTILE_SECRET = previous;
    }
  }
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("verifyTurnstileToken", () => {
  it("fails closed when TURNSTILE_SECRET is not configured", async (t) => {
    const fetchMock = t.mock.method(globalThis, "fetch", async () => {
      throw new Error("fetch should not be called without a secret");
    });

    let result: boolean | undefined;
    await withTurnstileSecret(undefined, async () => {
      result = await verifyTurnstileToken({
        token: "some-token",
        remoteIp: null,
      });
    });

    assert.equal(result, false);
    assert.equal(fetchMock.mock.callCount(), 0);
  });

  it("fails closed on an empty token without calling siteverify", async (t) => {
    const fetchMock = t.mock.method(globalThis, "fetch", async () => {
      throw new Error("fetch should not be called for an empty token");
    });

    let result: boolean | undefined;
    await withTurnstileSecret(VALID_SECRET, async () => {
      result = await verifyTurnstileToken({ token: "", remoteIp: null });
    });

    assert.equal(result, false);
    assert.equal(fetchMock.mock.callCount(), 0);
  });

  it("fails closed on an implausibly long token without calling siteverify", async (t) => {
    const fetchMock = t.mock.method(globalThis, "fetch", async () => {
      throw new Error("fetch should not be called for an oversized token");
    });

    let result: boolean | undefined;
    await withTurnstileSecret(VALID_SECRET, async () => {
      result = await verifyTurnstileToken({
        token: "a".repeat(2049),
        remoteIp: null,
      });
    });

    assert.equal(result, false);
    assert.equal(fetchMock.mock.callCount(), 0);
  });

  it("returns true and forwards secret/token/remoteip when siteverify approves", async (t) => {
    let capturedUrl: string | undefined;
    let capturedBody: string | undefined;
    let capturedMethod: string | undefined;

    t.mock.method(
      globalThis,
      "fetch",
      async (url: string, init?: RequestInit) => {
        capturedUrl = url;
        capturedMethod = init?.method;
        capturedBody = String(init?.body);
        return jsonResponse({ success: true });
      },
    );

    let result: boolean | undefined;
    await withTurnstileSecret(VALID_SECRET, async () => {
      result = await verifyTurnstileToken({
        token: "good-token",
        remoteIp: "203.0.113.42",
      });
    });

    assert.equal(result, true);
    assert.equal(
      capturedUrl,
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    );
    assert.equal(capturedMethod, "POST");
    const params = new URLSearchParams(capturedBody);
    assert.equal(params.get("secret"), VALID_SECRET);
    assert.equal(params.get("response"), "good-token");
    assert.equal(params.get("remoteip"), "203.0.113.42");
  });

  it("omits remoteip from the siteverify body when the IP is unavailable", async (t) => {
    let capturedBody: string | undefined;

    t.mock.method(
      globalThis,
      "fetch",
      async (_url: string, init?: RequestInit) => {
        capturedBody = String(init?.body);
        return jsonResponse({ success: true });
      },
    );

    await withTurnstileSecret(VALID_SECRET, async () => {
      await verifyTurnstileToken({ token: "good-token", remoteIp: null });
    });

    const params = new URLSearchParams(capturedBody);
    assert.equal(params.has("remoteip"), false);
  });

  it("returns false when siteverify responds with success: false", async (t) => {
    t.mock.method(globalThis, "fetch", async () =>
      jsonResponse({
        success: false,
        "error-codes": ["invalid-input-response"],
      }),
    );

    let result: boolean | undefined;
    await withTurnstileSecret(VALID_SECRET, async () => {
      result = await verifyTurnstileToken({
        token: "expired-or-invalid-token",
        remoteIp: null,
      });
    });

    assert.equal(result, false);
  });

  it("fails closed when siteverify responds with a non-2xx status", async (t) => {
    t.mock.method(globalThis, "fetch", async () =>
      jsonResponse({ success: false }, 500),
    );

    let result: boolean | undefined;
    await withTurnstileSecret(VALID_SECRET, async () => {
      result = await verifyTurnstileToken({
        token: "some-token",
        remoteIp: null,
      });
    });

    assert.equal(result, false);
  });

  it("fails closed when the siteverify request throws (network failure)", async (t) => {
    t.mock.method(globalThis, "fetch", async () => {
      throw new Error("network down");
    });

    let result: boolean | undefined;
    await withTurnstileSecret(VALID_SECRET, async () => {
      result = await verifyTurnstileToken({
        token: "some-token",
        remoteIp: null,
      });
    });

    assert.equal(result, false);
  });

  it("fails closed when siteverify returns a non-JSON body", async (t) => {
    t.mock.method(
      globalThis,
      "fetch",
      async () => new Response("not json", { status: 200 }),
    );

    let result: boolean | undefined;
    await withTurnstileSecret(VALID_SECRET, async () => {
      result = await verifyTurnstileToken({
        token: "some-token",
        remoteIp: null,
      });
    });

    assert.equal(result, false);
  });
});
