"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod/v4";
import { auth } from "@/lib/auth";
import { canUpdateReport } from "@/lib/comite/access";
import { updateReportStatus } from "./repository";
import { isReportStatus, type ReportStatus } from "./status";

type ActionResult = {
  error?: string;
  status?: ReportStatus;
  success?: boolean;
};

const reportIdSchema = z.uuid("Denúncia inválida.");

export async function updateReportStatusAction(
  reportId: string,
  status: unknown,
): Promise<ActionResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user.id;

  if (!userId) {
    return { error: "Sessão expirada. Entre novamente." };
  }

  const parsedReportId = reportIdSchema.safeParse(reportId);

  if (!parsedReportId.success || !isReportStatus(status)) {
    return { error: "Status de denúncia inválido." };
  }

  if (!(await canUpdateReport({ userId, reportId: parsedReportId.data }))) {
    return { error: "Você não tem permissão para alterar esta denúncia." };
  }

  const report = await updateReportStatus({
    reportId: parsedReportId.data,
    status,
    actorUserId: userId,
  });

  if (!report) {
    return { error: "Denúncia não encontrada." };
  }

  revalidatePath("/portal/comite-de-etica");
  revalidatePath(`/portal/comite-de-etica/${parsedReportId.data}`);
  revalidatePath(`/portal/comite-de-etica/${parsedReportId.data}/historico`);
  revalidatePath("/acompanhar-denuncia");

  return {
    status: status,
    success: true,
  };
}
