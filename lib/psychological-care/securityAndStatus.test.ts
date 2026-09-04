import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  arePsychologicalCarePayloadsEqual,
  createPsychologicalCarePublicRateLimitDigest,
  decryptPsychologicalCarePayload,
  encryptPsychologicalCarePayload,
  getPsychologicalCareMasterKey,
  type PsychologicalCareEncryptedPayload,
} from "./crypto";
import { createPsychologicalCareProtocol } from "./protocol";
import {
  getPsychologicalCareStatusEventType,
  isPsychologicalCareStatus,
  normalizePsychologicalCareStatus,
  PSYCHOLOGICAL_CARE_STATUS_GROUPS,
} from "./status";

const payload: PsychologicalCareEncryptedPayload = {
  base: "Base Rio",
  city: "Rio de Janeiro",
  employeeName: "Maria da Silva",
  phone: "(21) 99999-1234",
  registration: "12345",
  jobTitle: null,
  management: "Operações",
  reason: "Necessidade de acolhimento e orientação breve.",
  requesterName: "Liderança Elinsa",
  requesterEmail: "lideranca@example.com",
};

describe("psychological care encryption", () => {
  it("round-trips the encrypted envelope without exposing plaintext", () => {
    withMasterKey(Buffer.alloc(32, 7), () => {
      const first = encryptPsychologicalCarePayload(payload);
      const second = encryptPsychologicalCarePayload(payload);

      assert.deepEqual(decryptPsychologicalCarePayload(first), payload);
      assert.notEqual(
        first.encryptedPayload.ciphertext,
        second.encryptedPayload.ciphertext,
      );
      assert.equal(
        first.encryptedPayload.ciphertext.includes(payload.employeeName),
        false,
      );
    });
  });

  it("rejects a tampered authentication tag", () => {
    withMasterKey(Buffer.alloc(32, 9), () => {
      const encrypted = encryptPsychologicalCarePayload(payload);

      assert.throws(() =>
        decryptPsychologicalCarePayload({
          ...encrypted,
          encryptedPayload: {
            ...encrypted.encryptedPayload,
            authTag: Buffer.alloc(16).toString("base64"),
          },
        }),
      );
    });
  });

  it("requires a dedicated 32-byte master key", () => {
    withRawMasterKey(undefined, () => {
      assert.throws(getPsychologicalCareMasterKey, /nao configurada/);
    });
    withRawMasterKey(Buffer.alloc(16).toString("base64"), () => {
      assert.throws(getPsychologicalCareMasterKey, /32 bytes/);
    });
  });

  it("distinguishes idempotent retries from changed payloads", () => {
    assert.equal(
      arePsychologicalCarePayloadsEqual(payload, { ...payload }),
      true,
    );
    assert.equal(
      arePsychologicalCarePayloadsEqual(payload, {
        ...payload,
        reason: "Motivo alterado depois da primeira tentativa.",
      }),
      false,
    );
  });

  it("round-trips public submissions without requester identity", () => {
    withMasterKey(Buffer.alloc(32, 11), () => {
      const publicPayload: PsychologicalCareEncryptedPayload = {
        ...payload,
        requesterName: null,
        requesterEmail: null,
      };
      const encrypted = encryptPsychologicalCarePayload(publicPayload);

      assert.deepEqual(
        decryptPsychologicalCarePayload(encrypted),
        publicPayload,
      );
    });
  });

  it("derives a stable keyed digest without exposing the source IP", () => {
    const ip = "203.0.113.10";

    withMasterKey(Buffer.alloc(32, 13), () => {
      const first = createPsychologicalCarePublicRateLimitDigest(ip);
      const second = createPsychologicalCarePublicRateLimitDigest(ip);
      const otherIp =
        createPsychologicalCarePublicRateLimitDigest("203.0.113.11");

      assert.match(first, /^[0-9a-f]{64}$/);
      assert.equal(first, second);
      assert.notEqual(first, otherIp);
      assert.equal(first.includes(ip), false);
    });
  });
});

describe("psychological care protocol and statuses", () => {
  it("creates a dated, non-identifying protocol", () => {
    const protocol = createPsychologicalCareProtocol(
      new Date("2026-07-31T23:59:59.000Z"),
    );

    assert.match(protocol, /^PSI-20260731-[0-9A-F]{8}$/);
  });

  it("recognizes statuses, groups and event names", () => {
    assert.equal(isPsychologicalCareStatus("scheduled"), true);
    assert.equal(isPsychologicalCareStatus("unknown"), false);
    assert.equal(normalizePsychologicalCareStatus("unknown"), "new");
    assert.deepEqual(PSYCHOLOGICAL_CARE_STATUS_GROUPS.in_progress, [
      "triage",
      "contact_in_progress",
      "scheduled",
    ]);
    assert.equal(
      getPsychologicalCareStatusEventType("completed"),
      "psychological_care.status.completed",
    );
  });
});

function withMasterKey(key: Buffer, callback: () => void) {
  withRawMasterKey(key.toString("base64"), callback);
}

function withRawMasterKey(value: string | undefined, callback: () => void) {
  const previous = process.env.PSYCHOLOGICAL_CARE_MASTER_KEY_BASE64;

  if (value === undefined) {
    delete process.env.PSYCHOLOGICAL_CARE_MASTER_KEY_BASE64;
  } else {
    process.env.PSYCHOLOGICAL_CARE_MASTER_KEY_BASE64 = value;
  }

  try {
    callback();
  } finally {
    if (previous === undefined) {
      delete process.env.PSYCHOLOGICAL_CARE_MASTER_KEY_BASE64;
    } else {
      process.env.PSYCHOLOGICAL_CARE_MASTER_KEY_BASE64 = previous;
    }
  }
}
