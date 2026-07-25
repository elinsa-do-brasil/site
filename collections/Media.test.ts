import assert from "node:assert/strict";
import test from "node:test";
import type { PayloadRequest } from "payload";

import { clearProcessedUploadEdits } from "./Media.ts";

test("clears processed upload edits without changing other query parameters", () => {
  const query = {
    depth: "0",
    fallbackLocale: "null",
    uploadEdits: {
      crop: {
        height: "100",
        unit: "%",
        width: "43.12200956937799",
        x: "0",
        y: "0",
      },
      heightInPixels: "941",
      widthInPixels: "721",
    },
  } as unknown as PayloadRequest["query"];

  clearProcessedUploadEdits(query);

  assert.equal(query.uploadEdits, undefined);
  assert.equal(query.depth, "0");
  assert.equal(query.fallbackLocale, "null");
});
