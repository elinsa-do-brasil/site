export const REPORT_STATUS_VALUES = [
  "new",
  "opened",
  "triage",
  "review",
  "investigation",
  "waiting_information",
  "completed",
  "archived",
] as const;

export type ReportStatus = (typeof REPORT_STATUS_VALUES)[number];

export const reportStatusLabels: Record<ReportStatus, string> = {
  new: "Nova",
  opened: "Aberta",
  triage: "Em triagem",
  review: "Em análise",
  investigation: "Em investigação",
  waiting_information: "Aguardando informações",
  completed: "Concluída",
  archived: "Arquivada",
};

export const reportStatusPublicDescriptions: Record<ReportStatus, string> = {
  new: "A denúncia foi recebida e aguarda abertura pelo Comitê de Ética.",
  opened: "A denúncia foi aberta por pessoa autorizada do Comitê de Ética.",
  triage: "O Comitê está fazendo a triagem inicial do relato.",
  review: "O relato começou a ser analisado pelo Comitê de Ética.",
  investigation: "O caso avançou para investigação.",
  waiting_information:
    "O caso aguarda informações ou providências antes da próxima etapa.",
  completed: "A análise foi concluída pelo Comitê de Ética.",
  archived: "O caso foi arquivado pelo Comitê de Ética.",
};

export const reportStatusEventTypes: Record<ReportStatus, string> = {
  new: "report.status.new",
  opened: "report.status.opened",
  triage: "report.status.triage",
  review: "report.status.review",
  investigation: "report.status.investigation",
  waiting_information: "report.status.waiting_information",
  completed: "report.status.completed",
  archived: "report.status.archived",
};

export const reportPublicEventLabels: Record<string, string> = {
  "report.created": "Denúncia recebida",
  "report.status.new": "Denúncia marcada como nova",
  "report.status.opened": "Denúncia aberta",
  "report.status.triage": "Triagem iniciada",
  "report.status.review": "Análise iniciada",
  "report.status.investigation": "Investigação iniciada",
  "report.status.waiting_information": "Aguardando informações",
  "report.status.completed": "Denúncia concluída",
  "report.status.archived": "Denúncia arquivada",
};

export const REPORT_PUBLIC_EVENT_TYPES = [
  "report.created",
  ...REPORT_STATUS_VALUES.map((status) => reportStatusEventTypes[status]),
] as const;

export function isReportStatus(value: unknown): value is ReportStatus {
  return (
    typeof value === "string" &&
    REPORT_STATUS_VALUES.includes(value as ReportStatus)
  );
}

export function normalizeReportStatus(value: string): ReportStatus {
  if (value === "in_review") return "review";
  if (value === "closed") return "completed";

  return isReportStatus(value) ? value : "new";
}

export function getReportStatusLabel(status: string) {
  return reportStatusLabels[normalizeReportStatus(status)];
}

export function getReportStatusEventType(status: ReportStatus) {
  return reportStatusEventTypes[status];
}

export function getPublicReportEventLabel(type: string) {
  return reportPublicEventLabels[type] ?? "Atualização registrada";
}
