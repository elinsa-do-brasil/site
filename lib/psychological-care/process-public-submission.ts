import { getClientIp } from "@/lib/get-client-ip";
import { verifyTurnstileToken } from "@/lib/turnstile/verify";
import { maybeSendPsychologicalCareNotificationEmail } from "./email";
import { createPsychologicalCareProtocol } from "./protocol";
import {
  assertPsychologicalCarePublicRateLimit,
  PsychologicalCarePublicRateLimitError,
} from "./public-rate-limit";
import {
  createPsychologicalCareRequest,
  PSYCHOLOGICAL_CARE_SUBMISSION_PAYLOAD_CONFLICT,
} from "./repository";
import {
  isPsychologicalCareHoneypotFilled,
  type PsychologicalCareRequestFormField,
  publicPsychologicalCareRequestFormSchema,
} from "./validation";

export type PublicPsychologicalCareSubmissionActionResult =
  | { success: true; protocol: string }
  | {
      success: false;
      message: string;
      fieldErrors?: Partial<
        Record<PsychologicalCareRequestFormField, string[]>
      >;
    };

type HeaderReader = {
  get(name: string): string | null;
};

/**
 * Núcleo testável da submissão pública: recebe o `HeaderReader` já resolvido
 * em vez de chamar `headers()` diretamente, para poder ser exercitado por
 * testes fora do runtime de requisição do Next.js — `headers()` lança erro
 * fora desse contexto. Por esse mesmo motivo, a invalidação de cache
 * (`revalidatePath`) fica de fora daqui e é responsabilidade de quem chama
 * esta função (`submitPublicPsychologicalCareRequestAction`, em
 * public-actions.ts), já que também só funciona dentro de uma requisição
 * real do Next.js.
 */
export async function processPublicPsychologicalCareRequestSubmission(
  input: unknown,
  headersList: HeaderReader,
): Promise<PublicPsychologicalCareSubmissionActionResult> {
  if (isPsychologicalCareHoneypotFilled(input)) {
    return { success: true, protocol: createPsychologicalCareProtocol() };
  }

  const parsed = publicPsychologicalCareRequestFormSchema.safeParse(input);

  if (!parsed.success) {
    const {
      website: _websiteErrors,
      turnstileToken: _turnstileErrors,
      ...fieldErrors
    } = parsed.error.flatten().fieldErrors;

    return {
      success: false,
      message: "Revise os campos destacados.",
      fieldErrors,
    };
  }

  try {
    await assertPsychologicalCarePublicRateLimit(headersList);
  } catch (error) {
    if (
      error instanceof PsychologicalCarePublicRateLimitError &&
      error.reason === "limit_exceeded"
    ) {
      return {
        success: false,
        message: "Limite de envios atingido. Tente novamente mais tarde.",
      };
    }

    return {
      success: false,
      message:
        "Não foi possível enviar agora. Tente novamente em alguns minutos.",
    };
  }

  const verified = await verifyTurnstileToken({
    token: parsed.data.turnstileToken,
    remoteIp: getClientIp(headersList),
  });

  if (!verified) {
    return {
      success: false,
      message:
        "Não foi possível confirmar a verificação de segurança. Tente novamente.",
    };
  }

  const {
    website: _website,
    turnstileToken: _turnstileToken,
    ...formData
  } = parsed.data;

  try {
    const request = await createPsychologicalCareRequest({
      ...formData,
      submissionSource: "ampercuida",
      requesterUserId: null,
      requesterName: null,
      requesterEmail: null,
    });

    if (request.wasCreated) {
      const notification =
        await maybeSendPsychologicalCareNotificationEmail(request);

      if (!notification.sent && !notification.skipped) {
        console.error(
          "Nao foi possivel enviar o aviso de atendimento psicologico.",
          notification.error,
        );
      }
    }

    return {
      success: true,
      protocol: request.protocol,
    };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === PSYCHOLOGICAL_CARE_SUBMISSION_PAYLOAD_CONFLICT
    ) {
      return {
        success: false,
        message:
          "Não foi possível concluir este envio. Limpe o formulário e tente novamente.",
      };
    }

    return {
      success: false,
      message:
        "Não foi possível enviar agora. Tente novamente em alguns minutos.",
    };
  }
}
