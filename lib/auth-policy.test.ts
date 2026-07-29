import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  decideOtpAccess,
  isCorporateEmail,
  MicrosoftProfileValidationError,
  mapMicrosoftProfileToUser,
  normalizeEmail,
} from "./auth-policy";

describe("auth policy", () => {
  it("normalizes email addresses and matches only the exact corporate domain", () => {
    assert.equal(normalizeEmail(" User@Example.COM "), "user@example.com");
    assert.equal(isCorporateEmail("a@grupoamperelinsa.com"), true);
    assert.equal(isCorporateEmail("a@sub.grupoamperelinsa.com"), false);
    assert.equal(isCorporateEmail("a@grupoamperelinsa.com.example.org"), false);
  });

  it("allows OTP for every existing user", () => {
    assert.equal(
      decideOtpAccess({
        email: "colaborador@grupoamperelinsa.com",
        existingUser: true,
      }),
      "existing-user",
    );
  });

  it("requires Microsoft for a new corporate address, even with an invite", () => {
    assert.equal(
      decideOtpAccess({
        email: "novo@grupoamperelinsa.com",
        existingUser: false,
        invitation: {
          email: "novo@grupoamperelinsa.com",
          expiresAt: new Date("2030-01-02T00:00:00Z"),
          status: "pending",
        },
        now: new Date("2030-01-01T00:00:00Z"),
      }),
      "denied",
    );
  });

  it("allows a new external address only with a matching valid invite", () => {
    const now = new Date("2030-01-01T00:00:00Z");
    const validInvitation = {
      email: "external@example.com",
      expiresAt: new Date("2030-01-02T00:00:00Z"),
      status: "pending",
    };

    assert.equal(
      decideOtpAccess({
        email: "external@example.com",
        existingUser: false,
        invitation: validInvitation,
        now,
      }),
      "invited-external",
    );
    assert.equal(
      decideOtpAccess({
        email: "other@example.com",
        existingUser: false,
        invitation: validInvitation,
        now,
      }),
      "denied",
    );
    assert.equal(
      decideOtpAccess({
        email: "external@example.com",
        existingUser: false,
        invitation: { ...validInvitation, expiresAt: now },
        now,
      }),
      "denied",
    );
  });

  it("maps a valid Microsoft tenant profile to a verified normalized email", () => {
    assert.deepEqual(
      mapMicrosoftProfileToUser(
        {
          acct: 0,
          name: "Pessoa Elinsa",
          preferred_username: "Pessoa@GrupoAmpereLinsa.com",
          tid: "tenant-id",
        },
        { tenantId: "TENANT-ID" },
      ),
      {
        email: "pessoa@grupoamperelinsa.com",
        emailVerified: true,
        name: "Pessoa Elinsa",
      },
    );
  });

  it("rejects another tenant, guests and non-corporate Microsoft profiles", () => {
    const cases = [
      {
        code: "MICROSOFT_INVALID_TENANT",
        profile: {
          email: "a@grupoamperelinsa.com",
          tid: "other-tenant",
        },
      },
      {
        code: "MICROSOFT_GUEST_NOT_ALLOWED",
        profile: {
          acct: 1,
          email: "a@grupoamperelinsa.com",
          tid: "tenant-id",
        },
      },
      {
        code: "MICROSOFT_INVALID_EMAIL",
        profile: { email: "a@example.com", tid: "tenant-id" },
      },
    ] as const;

    for (const testCase of cases) {
      assert.throws(
        () =>
          mapMicrosoftProfileToUser(testCase.profile, {
            tenantId: "tenant-id",
          }),
        (error) =>
          error instanceof MicrosoftProfileValidationError &&
          error.code === testCase.code,
      );
    }
  });
});
