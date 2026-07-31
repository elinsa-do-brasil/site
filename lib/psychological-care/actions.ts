"use server";

import "server-only";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod/v4";
import { auth } from "@/lib/auth";
import {
  requirePsychologicalCarePanelAccess,
  requirePsychologicalCareSubmissionAccess,
} from "@/lib/psychological-care/access";
import { maybeSendPsychologicalCareNotificationEmail } from "./email";
import {
  createPsychologicalCareRequest,
  PSYCHOLOGICAL_CARE_SUBMISSION_PAYLOAD_CONFLICT,
  updatePsychologicalCareRequestStatus,
} from "./repository";
import {
  isPsychologicalCareStatus,
  type PsychologicalCareStatus,
} from "./status";
import {
  type PsychologicalCareRequestFormField,
  psychologicalCareRequestFormSchema,
} from "./validation";

export type PsychologicalCareSubmissionActionResult =
  | { success: true; protocol: string }
  | {
      success: false;
      message: string;
      fieldErrors?: Partial<
        Record<PsychologicalCareRequestFormField, string[]>
      >;
    };

export type PsychologicalCareStatusActionResult = {
  error?: string;
  status?: PsychologicalCareStatus;
  success?: boolean;
};

const psychologicalCareRequestIdSchema = z.uuid("Solicitação inválida.");

export async function submitPsychologicalCareRequestAction(
  input: unknown,
): Promise<PsychologicalCareSubmissionActionResult> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user.id) {
    return {
      success: false,
      message: "Sessão expirada. Entre novamente.",
    };
  }

  await requirePsychologicalCareSubmissionAccess(session.user.id);

  const parsed = psychologicalCareRequestFormSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Verifique os campos e tente novamente.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const request = await createPsychologicalCareRequest({
      ...parsed.data,
      requesterUserId: session.user.id,
      requesterName: session.user.name,
      requesterEmail: session.user.email,
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
    revalidatePath("/portal/atendimento-psicologico/solicitar");

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

export async function updatePsychologicalCareRequestStatusAction(
  requestId: string,
  status: unknown,
): Promise<PsychologicalCareStatusActionResult> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user.id) {
    return { error: "Sessão expirada. Entre novamente." };
  }

  await requirePsychologicalCarePanelAccess(session.user.id);

  const parsedRequestId = psychologicalCareRequestIdSchema.safeParse(requestId);

  if (!parsedRequestId.success || !isPsychologicalCareStatus(status)) {
    return { error: "Status de solicitação inválido." };
  }

  const request = await updatePsychologicalCareRequestStatus({
    requestId: parsedRequestId.data,
    status,
    actorUserId: session.user.id,
  });

  if (!request) {
    return { error: "Solicitação não encontrada." };
  }

  revalidatePath("/portal/atendimento-psicologico");
  revalidatePath(`/portal/atendimento-psicologico/${parsedRequestId.data}`);
  revalidatePath(
    `/portal/atendimento-psicologico/${parsedRequestId.data}/historico`,
  );

  return {
    status,
    success: true,
  };
}
