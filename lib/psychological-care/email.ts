import "server-only";

import { createElement } from "react";
import { Resend } from "resend";
import PsychologicalCareNotificationEmail from "@/emails/psychological-care-notification";
import { env } from "@/lib/env";
import { publicEnv } from "@/lib/env.public";

export type PsychologicalCareEmailResult =
  | { error?: undefined; sent: true; skipped?: false }
  | { error?: string; sent: false; skipped?: boolean };

export type PsychologicalCareNotificationInput = {
  createdAt: Date;
  id: string;
  protocol: string;
};

export async function maybeSendPsychologicalCareNotificationEmail(
  request: PsychologicalCareNotificationInput,
): Promise<PsychologicalCareEmailResult> {
  const to = parseEmailList(env.psychologicalCareNotificationToEmail());

  if (to.length === 0) {
    return { sent: false, skipped: true };
  }

  const from = env.psychologicalCareNotificationFromEmail();
  const apiKey = env.resendApiKey();

  if (!from) {
    return {
      error: "PSYCHOLOGICAL_CARE_NOTIFICATION_FROM_EMAIL is not set.",
      sent: false,
    };
  }

  if (!apiKey) {
    return {
      error: "RESEND_API_KEY is not set.",
      sent: false,
    };
  }

  const requestUrl = `${getSiteOrigin()}/portal/atendimento-psicologico/${request.id}`;
  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.emails.send(
      {
        from,
        react: createElement(PsychologicalCareNotificationEmail, {
          createdAt: request.createdAt,
          protocol: request.protocol,
          requestUrl,
        }),
        subject: `[Portal Elinsa] Nova solicitação de atendimento psicológico: ${request.protocol}`,
        text: buildPsychologicalCareNotificationText(request, requestUrl),
        to,
      },
      {
        idempotencyKey: `psychological-care-notification/${request.id}`,
      },
    );

    if (error) {
      return {
        error: formatResendError(error),
        sent: false,
      };
    }

    return { sent: true };
  } catch (error) {
    return {
      error: formatResendError(error),
      sent: false,
    };
  }
}

function buildPsychologicalCareNotificationText(
  request: PsychologicalCareNotificationInput,
  requestUrl: string,
) {
  return [
    "Nova solicitação de atendimento psicológico recebida.",
    "",
    "Por segurança, este aviso não inclui dados pessoais nem o motivo da solicitação.",
    "",
    `Protocolo: ${request.protocol}`,
    `Recebida em: ${request.createdAt.toLocaleString("pt-BR")}`,
    "",
    `Acesse no portal: ${requestUrl}`,
  ].join("\n");
}

function getSiteOrigin() {
  const origin =
    publicEnv.siteUrl ||
    publicEnv.publicSiteUrl ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    "https://elinsa-nine.vercel.app";

  return origin.replace(/\/$/, "");
}

function parseEmailList(value?: string) {
  return (value ?? "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
}

function formatResendError(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;

  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }

  return "Erro desconhecido ao enviar e-mail.";
}
