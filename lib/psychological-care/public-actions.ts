"use server";

import "server-only";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import {
  type PublicPsychologicalCareSubmissionActionResult,
  processPublicPsychologicalCareRequestSubmission,
} from "./process-public-submission";

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
