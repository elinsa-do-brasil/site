import type {
  AnonymousReportContent,
  AnonymousReportFormValues,
} from "./types";

function nullableText(value: string | undefined): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

export function buildReportPayload(
  values: AnonymousReportFormValues,
): AnonymousReportContent {
  const isIdentified = values.identify === "yes";

  return {
    category: values.category,
    title: values.title.trim(),
    description: values.description.trim(),
    occurredAt: nullableText(values.occurredAt),
    location: nullableText(values.location),
    involvedPeople: nullableText(values.involvedPeople),
    witnesses: nullableText(values.witnesses),
    previousAttempts: nullableText(values.previousAttempts),
    contactPreference: isIdentified ? values.contactPreference : "no_contact",
    contactInfo: isIdentified ? nullableText(values.contactInfo) : null,
    reporterName: isIdentified ? nullableText(values.reporterName) : null,
  };
}
