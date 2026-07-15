import {
  AuthEmailCard,
  type EmailDetailItem,
  EmailShell,
} from "./components/transactional-email";

export type ReportNotificationEmailProps = {
  category: string;
  createdAt: Date;
  protocol: string;
  reportUrl: string;
};

export default function ReportNotificationEmail({
  category,
  createdAt,
  protocol,
  reportUrl,
}: ReportNotificationEmailProps) {
  const details: EmailDetailItem[] = [
    { label: "Protocolo", value: protocol },
    { label: "Categoria", value: category },
    { label: "Recebida em", value: createdAt.toLocaleString("pt-BR") },
  ];

  return (
    <EmailShell
      headerLabel="Comitê de Ética"
      preview={`Nova denúncia recebida: ${protocol}.`}
    >
      <AuthEmailCard
        actionHref={reportUrl}
        actionLabel="Abrir no portal"
        description={
          <>
            Uma nova denúncia foi registrada pelo canal público da Elinsa.
            <br />
            Por segurança, este aviso não inclui o conteúdo do relato.
          </>
        }
        details={details}
        note={
          <>
            Acesse a área interna do Comitê de Ética para consultar e tratar a
            denúncia.
          </>
        }
        title="Nova denúncia recebida"
      />
    </EmailShell>
  );
}

ReportNotificationEmail.PreviewProps = {
  category: "Conduta inadequada",
  createdAt: new Date("2026-07-15T09:30:00-03:00"),
  protocol: "DEN-20260715-AB12CD34",
  reportUrl: "https://elinsa.com.br/portal/comite-de-etica/report_preview",
} satisfies ReportNotificationEmailProps;
