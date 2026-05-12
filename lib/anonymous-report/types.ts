export type AnonymousReportFormValues = {
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
};

export type SubmitReportResult = {
  protocol: string;
};
