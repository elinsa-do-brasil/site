import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { PageHeader, PageHeaderNavigation } from "@/components/page-header";
import { PsychologicalCareStatusBadge } from "@/components/psychological-care/psychological-care-status-badge";
import { PsychologicalCareStatusSelect } from "@/components/psychological-care/psychological-care-status-select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageTransition } from "@/components/ui/page-transition";
import { requirePsychologicalCarePanelAccess } from "@/lib/psychological-care/access";
import {
  decryptPsychologicalCareRequestRow,
  getPsychologicalCareRequestById,
  recordPsychologicalCareRequestView,
} from "@/lib/psychological-care/repository";

export const dynamic = "force-dynamic";

type PsychologicalCareDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PsychologicalCareDetailPage({
  params,
}: PsychologicalCareDetailPageProps) {
  const access = await requirePsychologicalCarePanelAccess();
  const { id } = await params;
  const request = await getPsychologicalCareRequestById(id);

  if (!request) {
    notFound();
  }

  const viewEvent = await recordPsychologicalCareRequestView({
    requestId: request.id,
    actorUserId: access.userId,
  });

  if (!viewEvent) {
    notFound();
  }

  const payload = decryptPsychologicalCareRequestRow(request);

  if (!payload) {
    notFound();
  }

  const receivedAt = formatDate(request.createdAt);
  const isPublicSubmission = request.submissionSource === "ampercuida";

  return (
    <PageTransition>
      <div className="mx-auto w-full max-w-6xl px-4 pb-12">
        <PageHeader
          actions={
            <PsychologicalCareStatusSelect
              requestId={request.id}
              status={request.status}
            />
          }
          description="Dados confidenciais para acolhimento e encaminhamento pela equipe responsável."
          eyebrow="Atendimento psicológico"
          meta={
            <>
              <PsychologicalCareStatusBadge status={request.status} />
              <span className="font-mono text-xs text-muted-foreground">
                {request.protocol}
              </span>
            </>
          }
          navigation={
            <PageHeaderNavigation label="Navegação da solicitação">
              <Button className="shrink-0" size="sm" variant="outline" asChild>
                <Link
                  href={`/portal/atendimento-psicologico/${request.id}/historico`}
                  transitionTypes={["nav-forward"]}
                >
                  Histórico
                </Link>
              </Button>
              <Button className="shrink-0" size="sm" variant="outline" asChild>
                <Link
                  href="/portal/atendimento-psicologico"
                  transitionTypes={["nav-back"]}
                >
                  Voltar
                </Link>
              </Button>
            </PageHeaderNavigation>
          }
          title={payload.employeeName}
        >
          <PageHeaderNavigation label="Seções da solicitação">
            <Button className="shrink-0" size="sm" variant="outline" asChild>
              <a href="#motivo">Motivo</a>
            </Button>
            <Button className="shrink-0" size="sm" variant="outline" asChild>
              <a href="#colaborador">Colaborador</a>
            </Button>
            <Button className="shrink-0" size="sm" variant="outline" asChild>
              <a href="#lotacao">Lotação</a>
            </Button>
            <Button className="shrink-0" size="sm" variant="outline" asChild>
              <a href="#solicitante">Origem</a>
            </Button>
          </PageHeaderNavigation>
        </PageHeader>

        <section
          aria-label="Resumo operacional"
          className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          <SummaryItem
            label="Status"
            value={<PsychologicalCareStatusBadge status={request.status} />}
          />
          <SummaryItem label="Recebida em" value={receivedAt} />
          <SummaryItem label="Base" value={payload.base} />
          <SummaryItem label="Cidade" value={payload.city} />
        </section>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Card
            className="scroll-mt-28 rounded-md border-border/80 py-0 shadow-sm"
            id="motivo"
          >
            <CardHeader className="border-b py-4">
              <CardTitle className="text-base">
                Motivo principal da solicitação
              </CardTitle>
            </CardHeader>
            <CardContent className="py-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {payload.reason}
              </p>
            </CardContent>
          </Card>

          <Card
            className="scroll-mt-28 rounded-md border-border/80 py-0 shadow-sm lg:row-span-2"
            id="colaborador"
          >
            <CardHeader className="border-b py-4">
              <CardTitle className="text-base">Dados do colaborador</CardTitle>
            </CardHeader>
            <CardContent className="py-4">
              <dl className="flex flex-col gap-3 text-sm">
                <DetailItem
                  label="Nome completo"
                  value={payload.employeeName}
                />
                <DetailItem
                  label="Telefone ou WhatsApp"
                  value={payload.phone}
                />
                <DetailItem label="Matrícula" value={payload.registration} />
                <DetailItem label="Função" value={payload.jobTitle} />
              </dl>
            </CardContent>
          </Card>

          <Card
            className="scroll-mt-28 rounded-md border-border/80 py-0 shadow-sm"
            id="lotacao"
          >
            <CardHeader className="border-b py-4">
              <CardTitle className="text-base">Lotação</CardTitle>
            </CardHeader>
            <CardContent className="py-4">
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <DetailItem label="Base" value={payload.base} />
                <DetailItem label="Cidade de lotação" value={payload.city} />
                <DetailItem label="Gerência" value={payload.management} />
              </dl>
            </CardContent>
          </Card>

          <Card
            className="scroll-mt-28 rounded-md border-border/80 py-0 shadow-sm lg:col-span-2"
            id="solicitante"
          >
            <CardHeader className="border-b py-4">
              <CardTitle className="text-base">Origem da solicitação</CardTitle>
            </CardHeader>
            <CardContent className="py-4">
              {isPublicSubmission ? (
                <>
                  <dl className="text-sm">
                    <DetailItem
                      label="Canal"
                      value="Formulário público AmperCuida"
                    />
                  </dl>
                  <p className="mt-4 border-t pt-3 text-xs leading-relaxed text-muted-foreground">
                    A identidade de quem enviou não foi verificada.
                  </p>
                </>
              ) : (
                <>
                  <dl className="grid gap-3 text-sm sm:grid-cols-2">
                    <DetailItem label="Nome" value={payload.requesterName} />
                    <DetailItem label="E-mail" value={payload.requesterEmail} />
                  </dl>
                  <p className="mt-4 border-t pt-3 text-xs leading-relaxed text-muted-foreground">
                    Solicitação registrada por usuário autenticado do portal.
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}

function DetailItem({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words">{value || "Não informado."}</dd>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-2 rounded-md border border-border/80 bg-card px-4 py-3 shadow-sm">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="min-w-0 break-words text-sm font-semibold">{value}</div>
    </div>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}
