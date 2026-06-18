import {
  AuthEmailCard,
  type EmailDetailItem,
  EmailShell,
} from "./components/transactional-email";

type ContactNotificationEmailProps = {
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  subject?: string | null;
  message: string;
  createdAt: Date;
};

export default function ContactNotificationEmail({
  name,
  email,
  phone,
  company,
  subject,
  message,
  createdAt,
}: ContactNotificationEmailProps) {
  const details: EmailDetailItem[] = [
    { label: "Nome", value: name },
    { label: "E-mail", value: email },
    { label: "Telefone", value: phone || "-" },
    { label: "Empresa", value: company || "-" },
    { label: "Assunto", value: subject || "-" },
    { label: "Mensagem", value: message },
    { label: "Recebido em", value: createdAt.toLocaleString("pt-BR") },
  ];

  return (
    <EmailShell
      headerLabel="Formulário de contato"
      preview="Novo contato recebido pelo site da Elinsa."
    >
      <AuthEmailCard
        actionHref={`mailto:${email}`}
        actionLabel="Responder por e-mail"
        description="Uma nova mensagem foi enviada pelo site da Elinsa."
        details={details}
        title="Novo contato recebido"
      />
    </EmailShell>
  );
}

ContactNotificationEmail.PreviewProps = {
  company: "Elinsa Industrial e Naval do Brasil",
  createdAt: new Date("2026-06-17T12:00:00-03:00"),
  email: "maria@example.com",
  message: "Gostaria de conversar com a equipe comercial sobre um projeto.",
  name: "Maria Souza",
  phone: "(21) 99999-0000",
  subject: "Orçamento",
} satisfies ContactNotificationEmailProps;
