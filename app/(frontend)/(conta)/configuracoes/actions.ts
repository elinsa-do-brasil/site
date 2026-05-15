"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { passkey, session as sessionTable, user } from "@/lib/db/schema";

type ActionResult<T = undefined> = T extends undefined
  ? { error?: string; success?: boolean }
  : { data?: T; error?: string; success?: boolean };

const profileSchema = z.object({
  name: z.string().trim().min(1, "Informe seu nome.").max(120),
  image: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || null)
    .refine(
      (value) => {
        if (!value) return true;

        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      },
      { message: "Informe uma URL válida para a foto." },
    ),
});

async function requireCurrentAccount() {
  const currentSession = await auth.api.getSession({
    headers: await headers(),
  });

  if (!currentSession?.user.id) {
    throw new Error("UNAUTHORIZED");
  }

  return {
    userId: currentSession.user.id,
    sessionToken:
      (currentSession as { session?: { token?: string | null } }).session
        ?.token ?? null,
  };
}

function getActionError(error: unknown) {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? "Dados inválidos.";
  }

  if (error instanceof Error && error.message === "UNAUTHORIZED") {
    return "Faça login novamente para continuar.";
  }

  return "Não foi possível concluir a ação agora.";
}

export async function updateAccountProfileAction(input: {
  name: string;
  image?: string | null;
}): Promise<ActionResult> {
  try {
    const { userId } = await requireCurrentAccount();
    const values = profileSchema.parse(input);

    await db
      .update(user)
      .set({
        name: values.name,
        image: values.image,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId));

    revalidatePath("/configuracoes");
    return { success: true };
  } catch (error) {
    return { error: getActionError(error) };
  }
}

export async function deletePasskeyAction(id: string): Promise<ActionResult> {
  try {
    const { userId } = await requireCurrentAccount();

    await db
      .delete(passkey)
      .where(and(eq(passkey.id, id), eq(passkey.userId, userId)));

    revalidatePath("/configuracoes");
    return { success: true };
  } catch (error) {
    return { error: getActionError(error) };
  }
}

export async function revokeSessionAction(
  token: string,
): Promise<ActionResult> {
  try {
    const { userId, sessionToken } = await requireCurrentAccount();

    if (!sessionToken || token === sessionToken) {
      return { error: "A sessão atual não pode ser revogada por aqui." };
    }

    await db
      .delete(sessionTable)
      .where(
        and(eq(sessionTable.userId, userId), eq(sessionTable.token, token)),
      );

    revalidatePath("/configuracoes");
    return { success: true };
  } catch (error) {
    return { error: getActionError(error) };
  }
}

export async function revokeOtherSessionsAction(): Promise<ActionResult> {
  try {
    const { userId, sessionToken } = await requireCurrentAccount();

    if (!sessionToken) {
      return { error: "Não foi possível identificar a sessão atual." };
    }

    await db
      .delete(sessionTable)
      .where(
        and(
          eq(sessionTable.userId, userId),
          ne(sessionTable.token, sessionToken),
        ),
      );

    revalidatePath("/configuracoes");
    return { success: true };
  } catch (error) {
    return { error: getActionError(error) };
  }
}
