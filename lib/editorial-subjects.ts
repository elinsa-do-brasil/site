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
