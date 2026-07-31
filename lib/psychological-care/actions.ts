"use server";

import "server-only";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod/v4";
import { auth } from "@/lib/auth";
import { requirePsychologicalCarePanelAccess } from "@/lib/psychological-care/access";
import { updatePsychologicalCareRequestStatus } from "./repository";
import {
  isPsychologicalCareStatus,
  type PsychologicalCareStatus,
} from "./status";

export type PsychologicalCareStatusActionResult = {
  error?: string;
  status?: PsychologicalCareStatus;
  success?: boolean;
};

const psychologicalCareRequestIdSchema = z.uuid("Solicitação inválida.");

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
