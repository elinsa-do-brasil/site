import { createElement } from "react";
import { Resend } from "resend";
import ContactNotificationEmail from "@/emails/contact-notification";
import type { Contact } from "@/lib/db/schema";

type ContactEmailResult =
  | { error?: undefined; sent: true; skipped?: false }
  | { error?: string; sent: false; skipped?: boolean };

export async function maybeSendContactEmail(
  contact: Contact,
): Promise<ContactEmailResult> {
  const to = process.env.CONTACT_FORM_TO_EMAIL;

  if (!to) {
    return { sent: false, skipped: true };
  }

  const from = process.env.CONTACT_FORM_FROM_EMAIL;
  const apiKey = process.env.RESEND_API_KEY;

  if (!from) {
    return {
      error: "CONTACT_FORM_FROM_EMAIL is not set.",
      sent: false,
    };
  }

  if (!apiKey) {
    return {
      error: "RESEND_API_KEY is not set.",
      sent: false,
    };
  }

  const resend = new Resend(apiKey);
  const result = await resend.emails.send({
    from,
    subject: "[Site Elinsa] Novo contato recebido",
    text: buildContactEmailText(contact),
    react: createElement(ContactNotificationEmail, {
      company: contact.company,
      createdAt: contact.createdAt,
      email: contact.email,
      message: contact.message,
      name: contact.name,
      phone: contact.phone,
      subject: contact.subject,
    }),
    to,
  });
  const error = "error" in result ? result.error : null;

  if (error) {
    return {
      error: formatResendError(error),
      sent: false,
    };
  }

  return { sent: true };
}

function buildContactEmailText(contact: Contact) {
  return [
    "Novo contato recebido pelo site.",
    "",
    `Nome: ${contact.name}`,
    `E-mail: ${contact.email}`,
    `Telefone: ${contact.phone ?? "-"}`,
    `Empresa: ${contact.company ?? "-"}`,
    `Assunto: ${contact.subject ?? "-"}`,
    "",
    "Mensagem:",
    contact.message,
    "",
    `Recebido em: ${contact.createdAt.toLocaleString("pt-BR")}`,
  ].join("\n");
}

function formatResendError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }

  return "Erro desconhecido ao enviar e-mail.";
}
