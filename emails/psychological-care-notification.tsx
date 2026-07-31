import {
  AuthEmailCard,
  type EmailDetailItem,
  EmailShell,
} from "./components/transactional-email";

export type PsychologicalCareNotificationEmailProps = {
  createdAt: Date;
  protocol: string;
  requestUrl: string;
};

export default function PsychologicalCareNotificationEmail({
  createdAt,
  protocol,
  requestUrl,
}: PsychologicalCareNotificationEmailProps) {
  const details: EmailDetailItem[] = [
    { label: "Protocolo", value: protocol },
    { label: "Recebida em", value: createdAt.toLocaleString("pt-BR") },
  ];

  return (
    <EmailShell
      headerLabel="Atendimento psicológico"
      preview={`Nova solicitação recebida: ${protocol}.`}
    >
      <AuthEmailCard
        actionHref={requestUrl}
        actionLabel="Abrir no portal"
        description={
          <>
            Uma nova solicitação de atendimento psicológico foi registrada.
            <br />
            Por segurança, este aviso não inclui dados pessoais nem o motivo da
            solicitação.
          </>
        }
        details={details}
        note="Acesse a área interna autorizada para consultar e tratar a solicitação."
        title="Nova solicitação recebida"
      />
    </EmailShell>
  );
}

PsychologicalCareNotificationEmail.PreviewProps = {
  createdAt: new Date("2026-07-31T09:30:00-03:00"),
  protocol: "PSI-20260731-AB12CD34",
  requestUrl:
    "https://elinsadobrasil.com.br/portal/atendimento-psicologico/request_preview",
} satisfies PsychologicalCareNotificationEmailProps;
