import type { Metadata } from "next";
import { AnonymousReportForm } from "@/components/anonymous-report/AnonymousReportForm";
import { ReportAnonymizationInfo } from "@/components/anonymous-report/ReportAnonymizationInfo";
import { ReportPrivacyNotice } from "@/components/anonymous-report/ReportPrivacyNotice";
import { ReportWritingHelp } from "@/components/anonymous-report/ReportWritingHelp";

export const metadata: Metadata = {
  title: "Canal de Denúncias — Elinsa do Brasil",
  description: "Canal de denúncias com envio criptografado",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DenunciarPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-28 pb-16">
      {/* ── Grid geral: conteúdo + sidebar ── */}
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_320px]">
        {/* ── Coluna esquerda ── */}
        <div className="flex flex-col gap-8">
          {/* Heading */}
          <section className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Canal de Denúncias
            </h1>
            <p className="text-base leading-relaxed text-muted-foreground">
              Use este formulário para enviar uma denúncia ao Comitê de Ética.
              Não solicitamos nome, matrícula, CPF ou e-mail. Suas informações
              sensíveis são criptografadas antes de serem armazenadas.
            </p>
          </section>

          {/* Formulário */}
          <AnonymousReportForm />

          {/* Cards mobile (abaixo do form) */}
          <div className="flex flex-col gap-5 lg:hidden">
            <ReportPrivacyNotice />
            <ReportAnonymizationInfo />
            <ReportWritingHelp />
          </div>
        </div>

        {/* ── Coluna direita — sidebar sticky ── */}
        <aside className="hidden lg:flex lg:flex-col lg:gap-5 lg:sticky lg:top-28">
          <ReportPrivacyNotice />
          <ReportAnonymizationInfo />
          <ReportWritingHelp />
        </aside>
      </div>
    </div>
  );
}
