import { z } from "zod/v4";

const REQUIRED_MESSAGE = "Campo obrigatório.";
const INVALID_PHONE_MESSAGE = "Informe um telefone brasileiro válido.";

export const psychologicalCareRequestFormSchema = z
  .object({
    submissionId: z.uuid("Identificador de envio inválido."),
    base: requiredText(2, 120),
    city: requiredText(2, 120),
    employeeName: requiredText(3, 200),
    phone: z
      .string()
      .trim()
      .min(1, REQUIRED_MESSAGE)
      .refine(isValidBrazilianPhone, INVALID_PHONE_MESSAGE)
      .transform(formatBrazilianPhone),
    registration: requiredText(1, 80),
    jobTitle: z
      .string()
      .trim()
      .max(160, "Informe no máximo 160 caracteres.")
      .optional(),
    management: requiredText(2, 160),
    reason: requiredText(10, 5_000),
  })
  .strict();

export const publicPsychologicalCareRequestFormSchema =
  psychologicalCareRequestFormSchema
    .extend({
      website: z
        .string()
        .trim()
        .max(200, "Campo inválido.")
        .optional()
        .default(""),
      turnstileToken: z.string().min(1, "Confirme que você não é um robô."),
    })
    .strict();

export type PsychologicalCareRequestFormInput = z.infer<
  typeof psychologicalCareRequestFormSchema
>;
export type PsychologicalCareRequestFormData =
  PsychologicalCareRequestFormInput;
export type PsychologicalCareRequestFormField =
  keyof PsychologicalCareRequestFormInput;
export type PublicPsychologicalCareRequestFormInput = z.infer<
  typeof publicPsychologicalCareRequestFormSchema
>;

export function isPsychologicalCareHoneypotFilled(input: unknown) {
  if (!input || typeof input !== "object" || !("website" in input)) {
    return false;
  }

  const value = input.website;

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  return value !== undefined && value !== null;
}

function requiredText(min: number, max: number) {
  return z
    .string()
    .trim()
    .min(1, REQUIRED_MESSAGE)
    .min(min, `Informe pelo menos ${min} caracteres.`)
    .max(max, `Informe no máximo ${max} caracteres.`);
}

export function normalizeBrazilianPhoneDigits(value: string) {
  const digits = value.replace(/\D/g, "");

  if (
    (digits.length === 12 || digits.length === 13) &&
    digits.startsWith("55")
  ) {
    return digits.slice(2);
  }

  return digits;
}

export function isValidBrazilianPhone(value: string) {
  const digits = normalizeBrazilianPhoneDigits(value);

  return /^[1-9]{2}(?:[2-9]\d{7}|9\d{8})$/.test(digits);
}

export function formatBrazilianPhone(value: string) {
  const digits = normalizeBrazilianPhoneDigits(value);
  const ddd = digits.slice(0, 2);

  if (digits.length === 11) {
    return `(${ddd}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  return `(${ddd}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
}
