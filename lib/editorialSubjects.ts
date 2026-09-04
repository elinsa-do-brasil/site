// Taxonomia de assuntos compartilhada pelas collections Blog/Imprensa — usada por collections/Editorial.ts (config do Payload) e lib/editorial.ts (leituras no frontend).
export const editorialSubjects = [
  { label: "Institucional", value: "institucional" },
  { label: "Operação", value: "operacao" },
  { label: "Segurança", value: "seguranca" },
  { label: "Pessoas", value: "pessoas" },
  { label: "Recrutamento", value: "recrutamento" },
  { label: "Eventos", value: "eventos" },
  { label: "Comunicados", value: "comunicados" },
] as const;

export type EditorialSubjectValue = (typeof editorialSubjects)[number]["value"];

export const defaultEditorialSubject: EditorialSubjectValue = "comunicados";

export function getEditorialSubjectLabel(
  value: EditorialSubjectValue | null | string | undefined,
) {
  return (
    editorialSubjects.find((subject) => subject.value === value)?.label ??
    "Sem assunto"
  );
}
