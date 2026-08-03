import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isSensitiveTelemetryPath,
  SENSITIVE_TELEMETRY_PATHS,
  SENTRY_DATA_COLLECTION,
  shouldDiscardSensitiveSentryBreadcrumb,
  shouldDiscardSensitiveSentryEvent,
} from "./telemetry-privacy";

describe("telemetry privacy", () => {
  it("recognizes sensitive paths, URLs and transaction names", () => {
    for (const path of SENSITIVE_TELEMETRY_PATHS) {
      assert.equal(isSensitiveTelemetryPath(path), true, path);
      assert.equal(isSensitiveTelemetryPath(`${path}/detalhes`), true, path);
      assert.equal(
        isSensitiveTelemetryPath(`https://elinsadobrasil.com.br${path}?a=1`),
        true,
        path,
      );
      assert.equal(isSensitiveTelemetryPath(`POST ${path}/[id]`), true, path);
    }
  });

  it("requires a path boundary and ignores sensitive values in a query", () => {
    assert.equal(isSensitiveTelemetryPath("/denunciar-empresa"), false);
    assert.equal(isSensitiveTelemetryPath("/api/reports-publicos"), false);
    assert.equal(
      isSensitiveTelemetryPath(
        "https://example.com/publica?destino=/denunciar/formulario",
      ),
      false,
    );
  });

  it("discards Sentry events identified by current path, request or transaction", () => {
    assert.equal(
      shouldDiscardSensitiveSentryEvent({}, "/denunciar/formulario"),
      true,
    );
    assert.equal(
      shouldDiscardSensitiveSentryEvent({
        request: { url: "https://example.com/api/reports" },
      }),
      true,
    );
    assert.equal(
      shouldDiscardSensitiveSentryEvent({
        transaction: "POST /api/reports/[id]/attachments",
      }),
      true,
    );
    assert.equal(
      shouldDiscardSensitiveSentryEvent({
        request: { url: "https://example.com/imprensa" },
        transaction: "GET /imprensa",
      }),
      false,
    );
  });

  it("discards sensitive breadcrumbs and preserves public ones", () => {
    assert.equal(
      shouldDiscardSensitiveSentryBreadcrumb({
        category: "navigation",
        data: { from: "/", to: "/acompanhar-denuncia" },
      }),
      true,
    );
    assert.equal(
      shouldDiscardSensitiveSentryBreadcrumb({
        category: "fetch",
        data: { url: "https://example.com/api/committee/reports" },
      }),
      true,
    );
    assert.equal(
      shouldDiscardSensitiveSentryBreadcrumb({
        category: "navigation",
        data: { from: "/", to: "/imprensa" },
      }),
      false,
    );
  });

  it("disables every Sentry data collection category", () => {
    assert.deepEqual(SENTRY_DATA_COLLECTION, {
      userInfo: false,
      cookies: false,
      httpHeaders: { request: false, response: false },
      httpBodies: [],
      queryParams: false,
      genAI: { inputs: false, outputs: false },
      stackFrameVariables: false,
      frameContextLines: 0,
    });
  });
});
