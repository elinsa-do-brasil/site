"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod/v4";
import type { ContactFormState } from "@/lib/contacts/action-state";
import { maybeSendContactEmail } from "@/lib/contacts/email";
import { assertCanAccessContacts } from "@/lib/contacts/permissions";
import {
  createContact,
  updateContactEmailNotification,
  updateContactStatus,
} from "@/lib/contacts/queries";
import {
  assertContactRateLimit,
  ContactRateLimitError,
} from "@/lib/contacts/rate-limit";
import {
  contactFormSchema,
  contactStatusSchema,
} from "@/lib/contacts/validators";
import { getClientIp } from "@/lib/get-client-ip";
import { verifyTurnstileToken } from "@/lib/turnstile/verify";

type ActionResult = {
  error?: string;
  success?: boolean;
};

const contactIdSchema = z.uuid("Contato inválido.");

export async function submitContactForm(
  _previousState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  if (readFormValue(formData, "website")) {
    return {
      message: "Mensagem enviada com sucesso.",
      success: true,
    };
  }

  const parsed = contactFormSchema.safeParse({
    company: readFormValue(formData, "company"),
    email: readFormValue(formData, "email"),
    message: readFormValue(formData, "message"),
    name: readFormValue(formData, "name"),
    phone: readFormValue(formData, "phone"),
    subject: readFormValue(formData, "subject"),
    website: readFormValue(formData, "website"),
    turnstileToken: readFormValue(formData, "turnstileToken"),
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "Verifique os campos e tente novamente.",
      success: false,
    };
  }

  try {
    const headersList = await headers();
    const { ipHash } = await assertContactRateLimit(headersList);

    const verified = await verifyTurnstileToken({
      token: parsed.data.turnstileToken,
      remoteIp: getClientIp(headersList),
    });

    if (!verified) {
      return {
        message:
          "Não foi possível confirmar a verificação de segurança. Tente novamente.",
        success: false,
      };
    }

    const contact = await createContact(parsed.data, {
      ipHash,
      userAgent: headersList.get("user-agent"),
    });
    const emailResult = await maybeSendContactEmail(contact);

    if (emailResult.sent || emailResult.error) {
      await updateContactEmailNotification(contact.id, {
        error: emailResult.error ?? null,
        sent: emailResult.sent,
      });
    }

    return {
      message: "Mensagem enviada com sucesso.",
      success: true,
    };
  } catch (error) {
    if (error instanceof ContactRateLimitError) {
      return {
        message: "Muitas tentativas de envio. Tente novamente mais tarde.",
        success: false,
      };
    }

    console.error("Failed to submit contact form.", error);

    return {
      message:
        "Não foi possível enviar sua mensagem agora. Tente novamente em alguns minutos.",
      success: false,
    };
  }
}

export async function updateContactStatusAction(
  contactId: string,
  status: unknown,
): Promise<ActionResult> {
  await assertCanAccessContacts();

  const parsedContactId = contactIdSchema.safeParse(contactId);
  const parsedStatus = contactStatusSchema.safeParse(status);

  if (!parsedContactId.success || !parsedStatus.success) {
    return { error: "Status de contato inválido." };
  }

  const contact = await updateContactStatus(
    parsedContactId.data,
    parsedStatus.data,
  );

  if (!contact) {
    return { error: "Contato não encontrado." };
  }

  revalidatePath("/portal/contatos");
  return { success: true };
}

function readFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}
