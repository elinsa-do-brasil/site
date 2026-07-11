import type { ReactNode } from "react";
import { type CreateEmailOptions, Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type SendAuthEmailOptions = {
  to: string;
  subject: string;
  text: string;
  idempotencyKey?: string;
  react?: ReactNode;
};

export async function sendInternalAuthEmail({
  to,
  subject,
  text,
  idempotencyKey,
  react,
}: SendAuthEmailOptions) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY não configurada. E-mail simulado no console:");
    console.log(`Para: ${to}\nAssunto: ${subject}\nTexto:\n${text}`);
    return { success: true };
  }

  const key =
    idempotencyKey ||
    `auth-email/${to}/${Buffer.from(subject).toString("base64url").slice(0, 16)}`;
  const email: CreateEmailOptions = {
    from: "Portal Elinsa <portal@elinsadobrasil.com.br>",
    to: [to],
    subject,
    text,
    ...(react ? { react } : {}),
  };

  const { data, error } = await resend.emails.send(email, {
    idempotencyKey: key,
  });

  if (error) {
    console.error("Erro ao enviar e-mail via Resend:", error.message);
    return { success: false, error: error.message };
  }

  console.log("E-mail enviado com sucesso, ID:", data?.id);
  return { success: true, id: data?.id };
}
