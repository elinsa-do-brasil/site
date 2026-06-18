import { AuthEmailCard, EmailShell } from "./components/transactional-email";

export type InviteEmailProps = {
  inviteLink: string;
  inviteeEmail?: string | null;
  inviterEmail?: string | null;
  organizationName: string;
  role?: string | null;
};

export const InviteEmail = ({
  inviteLink,
  inviteeEmail,
  inviterEmail,
  organizationName,
  role,
}: InviteEmailProps) => (
  <EmailShell preview={`Convite para acessar ${organizationName}.`}>
    <AuthEmailCard
      actionHref={inviteLink}
      actionLabel="Aceitar convite"
      description={
        <>
          Você recebeu um convite para acessar o Portal Interno da Elinsa.
          <br />O link abaixo abre o aceite do convite e, se necessário, a
          criação da sua conta.
        </>
      }
      details={[
        { label: "Organização", value: organizationName },
        { label: "Convidado", value: inviteeEmail },
        { label: "Convite por", value: inviterEmail || "Administrador" },
        { label: "Função", value: role ? formatInvitationRole(role) : null },
      ]}
      note={
        <>
          Este convite é pessoal.
          <br />
          Se você não esperava esse acesso, ignore este e-mail.
        </>
      }
      title="Você recebeu um convite"
    />
  </EmailShell>
);

function formatInvitationRole(role: string) {
  const labels: Record<string, string> = {
    admin: "Administrador",
    member: "Membro",
    owner: "Proprietário",
  };

  return role
    .split(",")
    .map((value) => {
      const normalized = value.trim();
      return labels[normalized] ?? normalized.replaceAll("_", " ");
    })
    .filter(Boolean)
    .join(", ");
}

InviteEmail.PreviewProps = {
  inviteLink: "https://elinsa.com.br/convite/inv_preview",
  inviteeEmail: "novo.usuario@example.com",
  inviterEmail: "admin@elinsa.com.br",
  organizationName: "Elinsa",
  role: "member",
} satisfies InviteEmailProps;

export default InviteEmail;
