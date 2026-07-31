"use server";

import "server-only";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
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

export async function submitPublicPsychologicalCareRequestAction(
  input: unknown,
): Promise<PublicPsychologicalCareSubmissionActionResult> {
  if (isPsychologicalCareHoneypotFilled(input)) {
    return { success: true, protocol: createPsychologicalCareProtocol() };
  }

  const parsed = publicPsychologicalCareRequestFormSchema.safeParse(input);

  if (!parsed.success) {
    const { website: _websiteErrors, ...fieldErrors } =
      parsed.error.flatten().fieldErrors;

    return {
      success: false,
      message: "Verifique os campos e tente novamente.",
      fieldErrors,
    };
  }

  try {
    await assertPsychologicalCarePublicRateLimit(await headers());
  } catch (error) {
    if (
      error instanceof PsychologicalCarePublicRateLimitError &&
      error.reason === "limit_exceeded"
    ) {
      return {
        success: false,
        message: "Muitas tentativas de envio. Tente novamente mais tarde.",
      };
    }

    return {
      success: false,
      message:
        "Não foi possível enviar a solicitação agora. Tente novamente em alguns minutos.",
    };
  }

  const { website: _website, ...formData } = parsed.data;

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

    revalidatePath("/portal/atendimento-psicologico");

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
          "Este envio já foi processado com outros dados. Limpe o formulário e faça uma nova solicitação.",
      };
    }

    return {
      success: false,
      message:
        "Não foi possível enviar a solicitação agora. Tente novamente em alguns minutos.",
    };
  }
}
