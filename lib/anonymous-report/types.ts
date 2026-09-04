// Tipos compartilhados pelo fluxo client-side de denúncia anônima (formulário → criptografia → envio → upload); o lado servidor/comitê fica em lib/reports/.
export type AnonymousReportFormValues = {
  identify: "yes" | "no";
  reporterName?: string;
  category: string;
  title: string;
  description: string;
  occurredAt?: string;
  location?: string;
  involvedPeople?: string;
  witnesses?: string;
  previousAttempts?: string;
  contactPreference: "no_contact" | "email" | "phone" | "whatsapp" | "other";
  contactInfo?: string;
};

// Versão normalizada de AnonymousReportFormValues (campos opcionais viram `string | null`, gerada por buildReportPayload.ts) — é o que de fato é criptografado e enviado.
export type AnonymousReportContent = {
  category: string;
  title: string;
  description: string;
  occurredAt: string | null;
  location: string | null;
  involvedPeople: string | null;
  witnesses: string | null;
  previousAttempts: string | null;
  contactPreference: "no_contact" | "email" | "phone" | "whatsapp" | "other";
  contactInfo: string | null;
  reporterName: string | null;
};

export type SubmitReportResult = {
  reportId: string;
  protocol: string;
  uploadToken: string;
};
