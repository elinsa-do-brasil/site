import { z } from "zod";

export const anonymousReportSchema = z
  .object({
    identify: z.enum(["yes", "no"]),
    reporterName: z
      .string()
      .trim()
      .max(500, "O nome deve ter no máximo 500 caracteres.")
      .optional(),
    category: z.string().min(1, "Selecione uma categoria."),
    title: z
      .string()
      .trim()
      .min(5, "Informe um título com pelo menos 5 caracteres.")
      .max(160, "O título deve ter no máximo 160 caracteres."),
    description: z
      .string()
      .trim()
      .min(30, "Descreva a situação com pelo menos 30 caracteres.")
      .max(10000, "A descrição deve ter no máximo 10.000 caracteres."),
    occurredAt: z.string().optional(),
    location: z
      .string()
      .trim()
      .max(500, "O local deve ter no máximo 500 caracteres.")
      .optional(),
    involvedPeople: z
      .string()
      .trim()
      .max(
        2000,
        "O campo de pessoas envolvidas deve ter no máximo 2.000 caracteres.",
      )
      .optional(),
    witnesses: z
      .string()
      .trim()
      .max(2000, "O campo de testemunhas deve ter no máximo 2.000 caracteres.")
      .optional(),
    previousAttempts: z
      .string()
      .trim()
      .max(
        2000,
        "O campo de tentativas anteriores deve ter no máximo 2.000 caracteres.",
      )
      .optional(),
    contactPreference: z.enum([
      "no_contact",
      "email",
      "phone",
      "whatsapp",
      "other",
    ]),
    contactInfo: z
      .string()
      .trim()
      .max(1000, "O contato deve ter no máximo 1.000 caracteres.")
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.identify === "yes") {
      if (!data.reporterName || data.reporterName.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Informe seu nome para se identificar.",
          path: ["reporterName"],
        });
      }
      if (!data.contactInfo || data.contactInfo.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Informe um meio de contato.",
          path: ["contactInfo"],
        });
      }
    }
  });

export type AnonymousReportSchema = z.infer<typeof anonymousReportSchema>;
