export const PSYCHOLOGICAL_CARE_STATUS_VALUES = [
  "new",
  "triage",
  "contact_in_progress",
  "scheduled",
  "completed",
  "cancelled",
] as const;

export type PsychologicalCareStatus =
  (typeof PSYCHOLOGICAL_CARE_STATUS_VALUES)[number];

export const psychologicalCareStatusLabels: Record<
  PsychologicalCareStatus,
  string
> = {
  new: "Nova",
  triage: "Em triagem",
  contact_in_progress: "Contato em andamento",
  scheduled: "Atendimento agendado",
  completed: "Concluída",
  cancelled: "Cancelada",
};

export const psychologicalCareStatusEventTypes: Record<
  PsychologicalCareStatus,
  string
> = {
  new: "psychological_care.status.new",
  triage: "psychological_care.status.triage",
  contact_in_progress: "psychological_care.status.contact_in_progress",
  scheduled: "psychological_care.status.scheduled",
  completed: "psychological_care.status.completed",
  cancelled: "psychological_care.status.cancelled",
};

export const PSYCHOLOGICAL_CARE_SUMMARY_STATUS_FILTERS = [
  "new",
  "in_progress",
  "finished",
] as const;

export type PsychologicalCareSummaryStatusFilter =
  (typeof PSYCHOLOGICAL_CARE_SUMMARY_STATUS_FILTERS)[number];

export const psychologicalCareSummaryStatusFilterLabels: Record<
  PsychologicalCareSummaryStatusFilter,
  string
> = {
  new: "Novas",
  in_progress: "Em andamento",
  finished: "Finalizadas",
};

export const PSYCHOLOGICAL_CARE_STATUS_GROUPS: Record<
  PsychologicalCareSummaryStatusFilter,
  readonly PsychologicalCareStatus[]
> = {
  new: ["new"],
  in_progress: ["triage", "contact_in_progress", "scheduled"],
  finished: ["completed", "cancelled"],
};

export const psychologicalCareEventLabels: Record<string, string> = {
  "psychological_care.created": "Solicitação recebida",
  "psychological_care.viewed": "Solicitação consultada",
  "psychological_care.status.new": "Solicitação marcada como nova",
  "psychological_care.status.triage": "Triagem iniciada",
  "psychological_care.status.contact_in_progress": "Contato iniciado",
  "psychological_care.status.scheduled": "Atendimento agendado",
  "psychological_care.status.completed": "Solicitação concluída",
  "psychological_care.status.cancelled": "Solicitação cancelada",
};

export function isPsychologicalCareStatus(
  value: unknown,
): value is PsychologicalCareStatus {
  return (
    typeof value === "string" &&
    PSYCHOLOGICAL_CARE_STATUS_VALUES.includes(value as PsychologicalCareStatus)
  );
}

export function isPsychologicalCareSummaryStatusFilter(
  value: unknown,
): value is PsychologicalCareSummaryStatusFilter {
  return (
    typeof value === "string" &&
    PSYCHOLOGICAL_CARE_SUMMARY_STATUS_FILTERS.includes(
      value as PsychologicalCareSummaryStatusFilter,
    )
  );
}

export function getPsychologicalCareStatusLabel(status: string) {
  return psychologicalCareStatusLabels[
    normalizePsychologicalCareStatus(status)
  ];
}

export function normalizePsychologicalCareStatus(
  status: string,
): PsychologicalCareStatus {
  return isPsychologicalCareStatus(status) ? status : "new";
}

export function getPsychologicalCareStatusEventType(
  status: PsychologicalCareStatus,
) {
  return psychologicalCareStatusEventTypes[status];
}

export function getPsychologicalCareEventLabel(type: string) {
  return psychologicalCareEventLabels[type] ?? "Atualização registrada";
}
