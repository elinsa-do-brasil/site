import type { z } from "zod/v4";
import type { contactFormSchema } from "@/lib/contacts/validators";

export type ContactFormState = {
  errors?: Partial<Record<keyof z.infer<typeof contactFormSchema>, string[]>>;
  message: string;
  success: boolean;
};

export const INITIAL_CONTACT_FORM_STATE: ContactFormState = {
  message: "",
  success: false,
};
