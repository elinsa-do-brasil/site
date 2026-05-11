export type AnonymousReportFormValues = {
  category: string;
  title: string;
  description: string;
  occurredAt?: string;
  location?: string;
  involvedPeople?: string;
  witnesses?: string;
  previousAttempts?: string;
  contactPreference: "no_contact" | "anonymous_contact";
  contactInfo?: string;
};

export type AnonymousReportEncryptedEnvelope = {
  version: "1.0";
  formVersion: "anonymous-report-v1";
  sentAt: string;
  encryptedPayload: string;
};

export type AnonymousReportEncryptedContent = {
  category: string;
  title: string;
  description: string;
  occurredAt: string | null;
  location: string | null;
  involvedPeople: string | null;
  witnesses: string | null;
  previousAttempts: string | null;
  contactPreference: "no_contact" | "anonymous_contact";
  contactInfo: string | null;
  createdAt: string;
};
