import { Heading, Section, Text } from "react-email";
import { EmailShell } from "./components/transactional-email";

export type SignInOtpEmailProps = {
  expiresInMinutes?: number;
  otp: string;
  type?: "change-email" | "email-verification" | "sign-in";
};

const copyByType = {
  "change-email": {
    description: "Use este código para confirmar seu novo endereço de e-mail.",
    preview: "Confirme seu novo e-mail no Portal Elinsa.",
    title: "Confirmar novo e-mail",
  },
  "email-verification": {
    description: "Use este código para confirmar seu endereço de e-mail atual.",
    preview: "Confirme seu e-mail no Portal Elinsa.",
    title: "Confirmar e-mail",
  },
  "sign-in": {
    description: "Use este código para entrar no Portal Interno Elinsa.",
    preview: "Seu código de acesso ao Portal Elinsa.",
    title: "Código de acesso",
  },
} as const;

export const SignInOtpEmail = ({
  expiresInMinutes = 10,
  otp,
  type = "sign-in",
}: SignInOtpEmailProps) => {
  const copy = copyByType[type];

  return (
    <EmailShell preview={copy.preview}>
      <Section className="bg-bg-2 mobile:px-6 mobile:py-12 rounded-[8px] px-[40px] py-[64px] text-center">
        <Heading as="h1" className="font-18 m-0 font-sans text-fg">
          {copy.title}
        </Heading>
        <Text className="font-16 mx-auto mt-4 mb-7 max-w-[380px] text-center font-sans text-fg-2">
          {copy.description}
        </Text>
        <Section className="mx-auto mb-7 max-w-[320px] rounded-[8px] bg-bg px-6 py-5 text-center">
          <Text className="m-0 font-mono text-[30px] font-semibold tracking-[8px] text-fg">
            {otp}
          </Text>
        </Section>
        <Text className="font-13 mx-auto mt-0 mb-2 max-w-[400px] text-center font-sans text-fg-3">
          O código expira em {expiresInMinutes} minutos e só pode ser usado uma
          vez.
        </Text>
        <Text className="font-13 mx-auto mt-0 mb-0 max-w-[400px] text-center font-sans text-fg-3">
          Se você não solicitou este código, ignore este e-mail.
        </Text>
      </Section>
    </EmailShell>
  );
};

SignInOtpEmail.PreviewProps = {
  expiresInMinutes: 10,
  otp: "123456",
  type: "sign-in",
} satisfies SignInOtpEmailProps;

export default SignInOtpEmail;
