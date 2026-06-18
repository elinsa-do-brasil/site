import { AuthEmailCard, EmailShell } from "./components/transactional-email";

export type ConfirmEmailProps = {
  url: string;
};

export const ConfirmEmail = ({ url }: ConfirmEmailProps) => (
  <EmailShell preview="Confirme seu e-mail no Portal Elinsa.">
    <AuthEmailCard
      actionHref={url}
      actionLabel="Confirmar e-mail"
      description={
        <>
          Este endereço de e-mail foi usado para criar uma conta no Portal da
          Elinsa.
          <br />
          Para verificar sua conta, precisamos confirmar que foi você quem usou
          este endereço de e-mail.
        </>
      }
      note={
        <>
          Se não foi você quem criou esta conta,
          <br />
          por favor ignore este e-mail.
        </>
      }
      title="Quase lá, só mais um passo!"
    />
  </EmailShell>
);

ConfirmEmail.PreviewProps = {
  url: "https://elinsa.com.br/verificar-email?token=preview",
} satisfies ConfirmEmailProps;

export default ConfirmEmail;
