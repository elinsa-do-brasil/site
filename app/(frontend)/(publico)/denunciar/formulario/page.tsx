import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AnonymousReportForm } from "@/components/reports/anonymous-report-form";
import { ReportAnonymizationInfo } from "@/components/reports/report-anonymization-info";
import { ReportFlowSteps } from "@/components/reports/report-flow-steps";
import { ReportPrivacyNotice } from "@/components/reports/report-privacy-notice";
import { ReportWritingHelp } from "@/components/reports/report-writing-help";

export const metadata: Metadata = {
  title: "Formulário de denúncia",
  description:
    "Formulário seguro para enviar uma denúncia ao Comitê de Ética da Elinsa.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ReportFormPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 pt-28 pb-16">
      <ReportFlowSteps currentStep={2} />

      <div className="mt-6 grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-8">
          <header className="flex flex-col gap-3 border-l-2 border-elinsa-primary pl-4 sm:pl-5">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Formulário de denúncia
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
              Conte o que aconteceu com os detalhes que considerar importantes
              para a análise do Comitê de Ética.
            </p>
            <Link
              href="/denunciar"
              className="mt-1 flex w-fit items-center gap-1.5 text-sm font-medium text-elinsa-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
              Rever as orientações
            </Link>
          </header>

          <div className="lg:hidden">
            <ReportWritingHelp />
          </div>

          <AnonymousReportForm />

          <div className="flex flex-col gap-5 lg:hidden">
            <ReportPrivacyNotice />
            <ReportAnonymizationInfo />
          </div>
        </div>

        <aside className="hidden lg:sticky lg:top-28 lg:flex lg:flex-col lg:gap-5">
          <ReportPrivacyNotice />
          <ReportAnonymizationInfo />
          <ReportWritingHelp />
        </aside>
      </div>
    </main>
  );
}
