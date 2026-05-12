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
  return {
    category: values.category,
    title: values.title.trim(),
    description: values.description.trim(),
    occurredAt: nullableText(values.occurredAt),
    location: nullableText(values.location),
    involvedPeople: nullableText(values.involvedPeople),
    witnesses: nullableText(values.witnesses),
    previousAttempts: nullableText(values.previousAttempts),
    contactPreference: values.contactPreference,
    contactInfo:
      values.contactPreference !== "no_contact"
        ? nullableText(values.contactInfo)
        : null,
  };
}
