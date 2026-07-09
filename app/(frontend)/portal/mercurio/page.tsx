import type { Metadata } from "next";
import { EmailSignatureGenerator } from "./_components/email-signature-generator";

export const metadata: Metadata = {
  title: "Gerador de assinatura de e-mail",
  description:
    "Crie uma assinatura de e-mail no padrão visual da Elinsa do Brasil.",
  alternates: {
    canonical: "/portal/mercurio",
  },
};

export default function EmailSignaturePage() {
  return (
    <div className="bg-background text-foreground">
      <section className="border-b bg-muted/25 px-4 pt-28 pb-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.18em] text-elinsa-primary uppercase">
              Identidade corporativa
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Gerador de assinatura de e-mail
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
              Preencha seus dados e copie a assinatura no padrão visual da
              Elinsa do Brasil.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-6xl">
          <EmailSignatureGenerator />
        </div>
      </section>
    </div>
  );
}
