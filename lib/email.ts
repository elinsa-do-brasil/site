import type { ReactNode } from "react";
import { type CreateEmailOptions, type ErrorResponse, Resend } from "resend";

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
    if (process.env.NODE_ENV === "production") {
      throw new Error("RESEND_API_KEY não configurada em produção.");
    }

    console.warn(
      "RESEND_API_KEY não configurada. O e-mail transacional foi simulado sem registrar destinatário ou conteúdo.",
    );
    return { simulated: true, success: true };
  }

  const key = idempotencyKey || `auth-email/${crypto.randomUUID()}`;
  const email: CreateEmailOptions = {
    from:
      process.env.AUTH_EMAIL_FROM ||
      "Portal Elinsa <portal@elinsadobrasil.com.br>",
    ...(process.env.AUTH_EMAIL_REPLY_TO
      ? { replyTo: process.env.AUTH_EMAIL_REPLY_TO }
      : {}),
    to: [to],
    subject,
    text,
    ...(react ? { react } : {}),
  };

  let lastError: ErrorResponse | null = null;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const { data, error } = await resend.emails.send(email, {
      idempotencyKey: key,
    });

    if (!error) {
      return { id: data?.id, success: true };
    }

    lastError = error;
    const isRetryable =
      error.statusCode === null ||
      error.statusCode === 429 ||
      error.statusCode >= 500;

    if (!isRetryable || attempt === 2) {
      break;
    }

    await wait(250 * 2 ** attempt + Math.floor(Math.random() * 150));
  }

  console.error("Falha no envio de e-mail transacional pelo Resend.", {
    errorType: lastError?.name ?? "unknown",
    statusCode: lastError?.statusCode ?? null,
  });
  throw new Error("Não foi possível enviar o e-mail transacional.");
}

function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
