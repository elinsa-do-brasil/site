import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatBrazilianPhone,
  isValidBrazilianPhone,
  psychologicalCareRequestFormSchema,
} from "./validation";

const validInput = {
  submissionId: "de305d54-75b4-431b-adb2-eb6b9e546014",
  base: "Base Rio",
  city: "Rio de Janeiro",
  employeeName: "Maria da Silva",
  phone: "(21) 99999-1234",
  registration: "12345",
  jobTitle: "Eletricista",
  management: "Operações",
  reason: "Necessidade de acolhimento e orientação breve.",
};

describe("psychological care request validation", () => {
  it("normalizes a valid single-page form submission", () => {
    const parsed = psychologicalCareRequestFormSchema.parse({
      ...validInput,
      base: "  Base Rio  ",
      phone: "+55 (21) 99999-1234",
    });

    assert.equal(parsed.base, "Base Rio");
    assert.equal(parsed.phone, "(21) 99999-1234");
  });

  it("accepts an omitted or blank optional job title", () => {
    const { jobTitle: _jobTitle, ...withoutJobTitle } = validInput;
    const omitted = psychologicalCareRequestFormSchema.parse(withoutJobTitle);
    const blank = psychologicalCareRequestFormSchema.parse({
      ...validInput,
      jobTitle: "   ",
    });

    assert.equal(omitted.jobTitle, undefined);
    assert.equal(blank.jobTitle, "");
  });

  it("rejects malformed phones and missing required fields", () => {
    const invalid = psychologicalCareRequestFormSchema.safeParse({
      ...validInput,
      base: "",
      phone: "(00) 1234-5678",
      reason: "curto",
    });

    assert.equal(invalid.success, false);

    if (!invalid.success) {
      const errors = invalid.error.flatten().fieldErrors;
      assert.ok(errors.base?.length);
      assert.ok(errors.phone?.length);
      assert.ok(errors.reason?.length);
    }
  });

  it("rejects unknown properties", () => {
    assert.equal(
      psychologicalCareRequestFormSchema.safeParse({
        ...validInput,
        requesterEmail: "nao-confiar@example.com",
      }).success,
      false,
    );
  });
});

describe("Brazilian phone helpers", () => {
  it("accepts and formats Brazilian landline and mobile numbers", () => {
    assert.equal(isValidBrazilianPhone("21 3333-4444"), true);
    assert.equal(isValidBrazilianPhone("+55 21 99999-4444"), true);
    assert.equal(formatBrazilianPhone("2133334444"), "(21) 3333-4444");
    assert.equal(formatBrazilianPhone("21999994444"), "(21) 99999-4444");
  });

  it("rejects invalid lengths and area codes", () => {
    assert.equal(isValidBrazilianPhone("9999-4444"), false);
    assert.equal(isValidBrazilianPhone("00 99999-4444"), false);
  });
});
