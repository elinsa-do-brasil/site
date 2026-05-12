import { z } from "zod";
import type { ReportEncryptedPayload } from "./crypto";

const optionalNullableText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((value) => {
      if (!value) return null;
      return value.trim() || null;
    });

export const createReportSchema = z
  .object({
    category: z.string().trim().min(2).max(100),
    title: z.string().trim().min(3).max(200),
    description: z.string().trim().min(10).max(10_000),
    occurredAt: optionalNullableText(40),
    location: optionalNullableText(500),
    involvedPeople: optionalNullableText(1000),
    witnesses: optionalNullableText(1000),
    previousAttempts: optionalNullableText(2000),
    contactPreference: z.enum([
      "no_contact",
      "email",
      "phone",
      "whatsapp",
      "other",
    ]),
    contactInfo: optionalNullableText(500),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.contactPreference !== "no_contact" && !value.contactInfo) {
      ctx.addIssue({
        code: "custom",
        message: "Informe um contato ou selecione a opcao sem contato.",
        path: ["contactInfo"],
      });
    }
  });

export type CreateReportInput = z.infer<typeof createReportSchema>;

export function toEncryptedPayload(
  input: CreateReportInput,
): ReportEncryptedPayload {
  return {
    title: input.title,
    description: input.description,
    occurredAt: input.occurredAt,
    location: input.location,
    involvedPeople: input.involvedPeople,
    witnesses: input.witnesses,
    previousAttempts: input.previousAttempts,
    contactPreference: input.contactPreference,
    contactInfo:
      input.contactPreference === "no_contact" ? null : input.contactInfo,
  };
}
