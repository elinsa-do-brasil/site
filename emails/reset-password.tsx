import { AuthEmailCard, EmailShell } from "./components/transactional-email";

export type ResetPasswordEmailProps = {
  url: string;
  userEmail?: string;
};

export const ResetPasswordEmail = ({
  url,
  userEmail,
}: ResetPasswordEmailProps) => (
  <EmailShell preview="Redefina sua senha no Portal Elinsa.">
    <AuthEmailCard
      actionHref={url}
      actionLabel="Redefinir senha"
      description={
        <>
          Recebemos uma solicitação para redefinir a senha
          {userEmail ? ` da conta ${userEmail}` : " da sua conta"} no Portal
          Elinsa.
          <br />
          Use o botão abaixo para criar uma nova senha com segurança.
        </>
      }
      note={
        <>
          Se você não solicitou essa alteração,
          <br />
          pode ignorar este e-mail.
        </>
      }
      title="Redefina sua senha"
    />
  </EmailShell>
);

ResetPasswordEmail.PreviewProps = {
  url: "https://elinsa.com.br/redefinir-senha?token=preview",
  userEmail: "usuario@example.com",
} satisfies ResetPasswordEmailProps;

export default ResetPasswordEmail;
