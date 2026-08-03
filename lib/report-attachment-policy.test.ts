import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canRenderReportAttachmentInline,
  REPORT_ATTACHMENT_SANDBOX_CSP,
} from "./reports/attachment-response-policy";

describe("report attachment response policy", () => {
  it("allows only explicitly selected document and media types inline", () => {
    for (const mimeType of [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/webp",
      "audio/mpeg",
      "video/mp4",
    ]) {
      assert.equal(canRenderReportAttachmentInline(mimeType), true, mimeType);
    }
  });

  it("forces active, ambiguous and non-canonical MIME types to download", () => {
    for (const mimeType of [
      "image/svg+xml",
      "Image/PNG",
      "image/png; charset=utf-8",
      "text/html",
      "application/xhtml+xml",
      "application/xml",
      "application/octet-stream",
      "image/example+xml",
    ]) {
      assert.equal(canRenderReportAttachmentInline(mimeType), false, mimeType);
    }
  });

  it("sandboxes attachment responses", () => {
    assert.equal(
      REPORT_ATTACHMENT_SANDBOX_CSP,
      "sandbox; default-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
    );
  });
});
