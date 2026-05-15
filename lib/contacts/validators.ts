import { z } from "zod/v4";

export const CONTACT_STATUS_VALUES = [
  "new",
  "read",
  "in_progress",
  "answered",
  "archived",
  "spam",
] as const;

export const contactStatusSchema = z.enum(CONTACT_STATUS_VALUES);

const optionalText = (max: number, message: string) =>
  z.string().trim().max(max, message).optional().or(z.literal(""));

export const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe seu nome.")
    .max(160, "O nome deve ter no máximo 160 caracteres."),
  email: z
    .email("Informe um e-mail válido.")
    .trim()
    .max(255, "O e-mail deve ter no máximo 255 caracteres."),
  phone: optionalText(40, "O telefone deve ter no máximo 40 caracteres."),
  company: optionalText(180, "A empresa deve ter no máximo 180 caracteres."),
  subject: optionalText(180, "O assunto deve ter no máximo 180 caracteres."),
  message: z
    .string()
    .trim()
    .min(10, "Escreva uma mensagem com pelo menos 10 caracteres.")
    .max(5000, "A mensagem deve ter no máximo 5.000 caracteres."),
  website: optionalText(500, "Campo inválido."),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
export type ContactStatus = z.infer<typeof contactStatusSchema>;

export const contactStatusLabels: Record<ContactStatus, string> = {
  new: "Novo",
  read: "Lido",
  in_progress: "Em andamento",
  answered: "Respondido",
  archived: "Arquivado",
  spam: "Spam",
};
