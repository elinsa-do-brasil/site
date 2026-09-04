"use server";

import "server-only";

// Casca fina em volta de processPublicSubmission.ts: só resolve headers()/revalidatePath, que exigem um request real do Next.js e por isso não podem viver no núcleo testável.
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import {
  type PublicPsychologicalCareSubmissionActionResult,
  processPublicPsychologicalCareRequestSubmission,
} from "./processPublicSubmission";

export type { PublicPsychologicalCareSubmissionActionResult };

export async function submitPublicPsychologicalCareRequestAction(
  input: unknown,
): Promise<PublicPsychologicalCareSubmissionActionResult> {
  const result = await processPublicPsychologicalCareRequestSubmission(
    input,
    await headers(),
  );

  if (result.success) {
    revalidatePath("/portal/atendimento-psicologico");
  }

  return result;
}
